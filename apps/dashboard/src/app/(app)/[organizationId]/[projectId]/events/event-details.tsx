'use client';

import type { Dispatch, SetStateAction } from 'react';
import { ChartSwitchShortcut } from '@/components/report/chart';
import { KeyValue } from '@/components/ui/key-value';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  useEventQueryFilters,
  useEventQueryNamesFilter,
} from '@/hooks/useEventQueryFilters';
import { round } from 'mathjs';

import type { IServiceCreateEventPayload } from '@openpanel/db';

interface Props {
  event: IServiceCreateEventPayload;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}
export function EventDetails({ event, open, setOpen }: Props) {
  const { name } = event;
  const [, setFilter] = useEventQueryFilters({ shallow: false });
  const [, setEvents] = useEventQueryNamesFilter({ shallow: false });

  const common = [
    {
      name: 'Duration',
      value: event.duration ? round(event.duration / 1000, 1) : undefined,
    },
    {
      name: 'Referrer',
      value: event.referrer,
      onClick() {
        setFilter('referrer', event.referrer ?? '');
      },
    },
    {
      name: 'Referrer name',
      value: event.referrerName,
      onClick() {
        setFilter('referrer_name', event.referrerName ?? '');
      },
    },
    {
      name: 'Referrer type',
      value: event.referrerType,
      onClick() {
        setFilter('referrer_type', event.referrerType ?? '');
      },
    },
    {
      name: 'Brand',
      value: event.brand,
      onClick() {
        setFilter('brand', event.brand ?? '');
      },
    },
    {
      name: 'Model',
      value: event.model,
      onClick() {
        setFilter('model', event.model ?? '');
      },
    },
    {
      name: 'Browser',
      value: event.browser,
      onClick() {
        setFilter('browser', event.browser ?? '');
      },
    },
    {
      name: 'Browser version',
      value: event.browserVersion,
      onClick() {
        setFilter('browser_version', event.browserVersion ?? '');
      },
    },
    {
      name: 'OS',
      value: event.os,
      onClick() {
        setFilter('os', event.os ?? '');
      },
    },
    {
      name: 'OS version',
      value: event.osVersion,
      onClick() {
        setFilter('os_version', event.osVersion ?? '');
      },
    },
    {
      name: 'City',
      value: event.city,
      onClick() {
        setFilter('city', event.city ?? '');
      },
    },
    {
      name: 'Region',
      value: event.region,
      onClick() {
        setFilter('region', event.region ?? '');
      },
    },
    {
      name: 'Country',
      value: event.country,
      onClick() {
        setFilter('country', event.country ?? '');
      },
    },
    {
      name: 'Continent',
      value: event.continent,
      onClick() {
        setFilter('continent', event.continent ?? '');
      },
    },
    {
      name: 'Device',
      value: event.device,
      onClick() {
        setFilter('device', event.device ?? '');
      },
    },
  ].filter((item) => typeof item.value === 'string' && item.value);

  const properties = Object.entries(event.properties)
    .map(([name, value]) => ({
      name,
      value: value as string | number | undefined,
    }))
    .filter((item) => typeof item.value === 'string' && item.value);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent>
        <div>
          <div className="flex flex-col gap-8">
            <SheetHeader>
              <SheetTitle>{name.replace('_', ' ')}</SheetTitle>
            </SheetHeader>

            {properties.length > 0 && (
              <div>
                <div className="text-sm font-medium mb-2">Params</div>
                <div className="flex gap-2 flex-wrap">
                  {properties.map((item) => (
                    <KeyValue
                      key={item.name}
                      name={item.name}
                      value={item.value}
                      onClick={() => {
                        setFilter(
                          `properties.${item.name}`,
                          item.value ? String(item.value) : '',
                          'is'
                        );
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div>
              <div className="text-sm font-medium mb-2">Common</div>
              <div className="flex gap-2 flex-wrap">
                {common.map((item) => (
                  <KeyValue
                    key={item.name}
                    name={item.name}
                    value={item.value}
                    onClick={item.onClick}
                  />
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm font-medium mb-2">
                <div>Similar events</div>
                <button
                  className="hover:underline text-muted-foreground"
                  onClick={() => {
                    setEvents([event.name]);
                    setOpen(false);
                  }}
                >
                  Show all
                </button>
              </div>
              <ChartSwitchShortcut
                projectId={event.projectId}
                chartType="histogram"
                events={[
                  {
                    id: 'A',
                    name: event.name,
                    displayName: 'Similar events',
                    segment: 'event',
                    filters: [],
                  },
                ]}
              />
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}