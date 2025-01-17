'use client';

import { DataTable } from '@/components/data-table';
import { FullPageEmptyState } from '@/components/full-page-empty-state';
import { GanttChartIcon } from 'lucide-react';

import type { IServiceMember, IServiceProject } from '@openpanel/db';

import { useColumns } from './columns';

type CommonProps = {
  projects: IServiceProject[];
  data: IServiceMember[];
};

type Props = CommonProps;

export const MembersTable = ({ projects, data }: Props) => {
  const columns = useColumns(projects);

  if (!data) {
    return (
      <div className="flex flex-col gap-2">
        <div className="card h-[74px] w-full animate-pulse items-center justify-between rounded-lg p-4"></div>
        <div className="card h-[74px] w-full animate-pulse items-center justify-between rounded-lg p-4"></div>
        <div className="card h-[74px] w-full animate-pulse items-center justify-between rounded-lg p-4"></div>
        <div className="card h-[74px] w-full animate-pulse items-center justify-between rounded-lg p-4"></div>
        <div className="card h-[74px] w-full animate-pulse items-center justify-between rounded-lg p-4"></div>
      </div>
    );
  }

  if (data?.length === 0) {
    return (
      <FullPageEmptyState title="No members here" icon={GanttChartIcon}>
        <p>Could not find any members</p>
      </FullPageEmptyState>
    );
  }

  return (
    <>
      <DataTable data={data ?? []} columns={columns} />
    </>
  );
};
