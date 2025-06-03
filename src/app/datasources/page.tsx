
import { DataSourcesManager } from '@/components/data-sources/data-sources-manager';
import type { DataSource } from '@/types';

async function getDataSources(): Promise<DataSource[]> {
  // For server-side fetches to own API routes, relative paths are preferred.
  // Next.js will automatically use the correct internal host and port.
  const res = await fetch('/api/datasources', { cache: 'no-store' });
  
  if (!res.ok) {
    console.error('Failed to fetch data sources initial data:', await res.text());
    // Return empty array or throw error, depending on desired UX for SSR failure
    return []; 
  }
  try {
    return await res.json();
  } catch (e) {
    console.error('Failed to parse data sources JSON:', e);
    return [];
  }
}

export default async function DataSourcesPage() {
  const initialDataSources = await getDataSources();

  return (
    <div className="container mx-auto py-8 px-4">
      <header className="mb-8">
        <h1 className="text-4xl font-headline font-bold text-primary">News Sources</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Manage your news APIs and websites. Add new sources or trigger fetching for existing ones.
        </p>
      </header>
      <DataSourcesManager initialDataSources={initialDataSources} />
    </div>
  );
}

// Force dynamic rendering to ensure fresh data on each request during development
// or if data changes frequently and SSR needs to reflect it.
// For production, consider caching strategies or client-side fetching for updates.
export const dynamic = 'force-dynamic';
