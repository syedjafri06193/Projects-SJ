'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Overview } from '@/components/pages/Overview';
import { Services } from '@/components/pages/Services';
import { Deployments } from '@/components/pages/Deployments';
import { HealthPage } from '@/components/pages/Health';

export type Page = 'overview' | 'services' | 'deployments' | 'health';

export default function App() {
  const [page, setPage] = useState<Page>('overview');

  return (
    <div className="flex h-screen overflow-hidden bg-grid">
      <Sidebar current={page} onChange={setPage} />
      <main className="flex-1 overflow-y-auto">
        {page === 'overview' && <Overview />}
        {page === 'services' && <Services />}
        {page === 'deployments' && <Deployments />}
        {page === 'health' && <HealthPage />}
      </main>
    </div>
  );
}
