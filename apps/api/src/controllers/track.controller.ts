import type { GeoLocation } from '@/utils/parseIp';
import { getClientIp, parseIp } from '@/utils/parseIp';
import { parseUserAgent } from '@/utils/parseUserAgent';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { assocPath, path, pathOr, pick } from 'ramda';

import { generateDeviceId } from '@openpanel/common';
import {
  createProfileAlias,
  getProfileById,
  getProfileIdCached,
  getSalts,
  upsertProfile,
} from '@openpanel/db';
import { eventsQueue } from '@openpanel/queue';
import { getRedisCache } from '@openpanel/redis';
import type {
  AliasPayload,
  DecrementPayload,
  IdentifyPayload,
  IncrementPayload,
  TrackHandlerPayload,
} from '@openpanel/sdk';

export function getStringHeaders(headers: FastifyRequest['headers']) {
  return Object.entries(
    pick(
      [
        'user-agent',
        'openpanel-sdk-name',
        'openpanel-sdk-version',
        'openpanel-client-id',
      ],
      headers
    )
  ).reduce(
    (acc, [key, value]) => ({
      ...acc,
      [key]: value ? String(value) : undefined,
    }),
    {}
  );
}

function getIdentity(body: TrackHandlerPayload): IdentifyPayload | undefined {
  const identity = path<IdentifyPayload>(
    ['properties', '__identify'],
    body.payload
  );

  return (
    identity ||
    (body.payload.profileId
      ? {
          profileId: body.payload.profileId,
        }
      : undefined)
  );
}

export async function handler(
  request: FastifyRequest<{
    Body: TrackHandlerPayload;
  }>,
  reply: FastifyReply
) {
  const ip =
    path<string>(['properties', '__ip'], request.body.payload) ||
    getClientIp(request)!;
  const ua = request.headers['user-agent']!;
  const projectId = request.client?.projectId;

  if (!projectId) {
    reply.status(400).send('missing origin');
    return;
  }

  const identity = getIdentity(request.body);
  const profileId = identity?.profileId
    ? await getProfileIdCached({
        projectId,
        profileId: identity?.profileId,
      })
    : undefined;

  // We might get a profileId from the alias table
  // If we do, we should use that instead of the one from the payload
  if (profileId) {
    request.body.payload.profileId = profileId;
  }

  switch (request.body.type) {
    case 'track': {
      const [salts, geo] = await Promise.all([getSalts(), parseIp(ip)]);
      const currentDeviceId = ua
        ? generateDeviceId({
            salt: salts.current,
            origin: projectId,
            ip,
            ua,
          })
        : '';
      const previousDeviceId = ua
        ? generateDeviceId({
            salt: salts.previous,
            origin: projectId,
            ip,
            ua,
          })
        : '';

      const promises = [
        track({
          payload: request.body.payload,
          currentDeviceId,
          previousDeviceId,
          projectId,
          geo,
          headers: getStringHeaders(request.headers),
        }),
      ];

      // If we have more than one property in the identity object, we should identify the user
      // Otherwise its only a profileId and we should not identify the user
      if (identity && Object.keys(identity).length > 1) {
        promises.push(
          identify({
            payload: identity,
            projectId,
            geo,
            ua,
          })
        );
      }

      await Promise.all(promises);
      break;
    }
    case 'identify': {
      const geo = await parseIp(ip);
      await identify({
        payload: request.body.payload,
        projectId,
        geo,
        ua,
      });
      break;
    }
    case 'alias': {
      await alias({
        payload: request.body.payload,
        projectId,
      });
      break;
    }
    case 'increment': {
      await increment({
        payload: request.body.payload,
        projectId,
      });
      break;
    }
    case 'decrement': {
      await decrement({
        payload: request.body.payload,
        projectId,
      });
      break;
    }
  }
}

type TrackPayload = {
  name: string;
  properties?: Record<string, any>;
};

async function track({
  payload,
  currentDeviceId,
  previousDeviceId,
  projectId,
  geo,
  headers,
}: {
  payload: TrackPayload;
  currentDeviceId: string;
  previousDeviceId: string;
  projectId: string;
  geo: GeoLocation;
  headers: Record<string, string | undefined>;
}) {
  // this will ensure that we don't have multiple events creating sessions
  const locked = await getRedisCache().set(
    `request:priority:${currentDeviceId}-${previousDeviceId}`,
    'locked',
    'EX',
    10,
    'NX'
  );

  eventsQueue.add('event', {
    type: 'incomingEvent',
    payload: {
      projectId,
      headers,
      event: {
        ...payload,
        // Dont rely on the client for the timestamp
        timestamp: new Date().toISOString(),
      },
      geo,
      currentDeviceId,
      previousDeviceId,
      priority: locked === 'OK',
    },
  });
}

async function identify({
  payload,
  projectId,
  geo,
  ua,
}: {
  payload: IdentifyPayload;
  projectId: string;
  geo: GeoLocation;
  ua?: string;
}) {
  const uaInfo = parseUserAgent(ua);
  await upsertProfile({
    id: payload.profileId,
    isExternal: true,
    projectId,
    properties: {
      ...(payload.properties ?? {}),
      ...(geo ?? {}),
      ...uaInfo,
    },
    ...payload,
  });
}

async function alias({
  payload,
  projectId,
}: {
  payload: AliasPayload;
  projectId: string;
}) {
  await createProfileAlias({
    alias: payload.alias,
    profileId: payload.profileId,
    projectId,
  });
}

async function increment({
  payload,
  projectId,
}: {
  payload: IncrementPayload;
  projectId: string;
}) {
  const { profileId, property, value } = payload;
  const profile = await getProfileById(profileId, projectId);
  if (!profile) {
    throw new Error('Not found');
  }

  const parsed = parseInt(
    pathOr<string>('0', property.split('.'), profile.properties),
    10
  );

  if (isNaN(parsed)) {
    throw new Error('Not number');
  }

  profile.properties = assocPath(
    property.split('.'),
    parsed + (value || 1),
    profile.properties
  );

  await upsertProfile({
    id: profile.id,
    projectId,
    properties: profile.properties,
    isExternal: true,
  });
}

async function decrement({
  payload,
  projectId,
}: {
  payload: DecrementPayload;
  projectId: string;
}) {
  const { profileId, property, value } = payload;
  const profile = await getProfileById(profileId, projectId);
  if (!profile) {
    throw new Error('Not found');
  }

  const parsed = parseInt(
    pathOr<string>('0', property.split('.'), profile.properties),
    10
  );

  if (isNaN(parsed)) {
    throw new Error('Not number');
  }

  profile.properties = assocPath(
    property.split('.'),
    parsed - (value || 1),
    profile.properties
  );

  await upsertProfile({
    id: profile.id,
    projectId,
    properties: profile.properties,
    isExternal: true,
  });
}
