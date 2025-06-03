"use client";

import { useState, useEffect, useCallback } from "react";
import type { DataSource } from "@/types";
import { AddSourceForm } from "./add-source-form";
import { SourcesList } from "./sources-list";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

type DataSourcesManagerProps = {
  initialDataSources: DataSource[];
};

export function DataSourcesManager({ initialDataSources }: DataSourcesManagerProps) {
  const [dataSources, setDataSources] = useState<DataSource[]>(initialDataSources);
  const [isLoading, setIsLoading] = useState(false); // Initially false as data is passed
  const [error, setError] = useState<string | null>(null);

  const fetchDataSources = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/datasources", { cache: 'no-store' });
      if (!response.ok) {
        throw new Error("Failed to fetch data sources");
      }
      const data = await response.json();
      setDataSources(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      setDataSources([]); // Clear data on error or show stale
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // No need for initial useEffect if initialDataSources is always up-to-date via SSR
  // useEffect(() => { fetchDataSources(); }, [fetchDataSources]);

  const handleSourceAdded = () => {
    fetchDataSources(); // Refresh list after adding
  };

  const handleSourceDeleted = () => {
    fetchDataSources(); // Refresh list after deleting
  };
  
  const handleScrapeComplete = () => {
    fetchDataSources(); // Refresh to update status and potentially related scraped data list on another page
  };


  return (
    <div className="grid md:grid-cols-3 gap-8">
      <div className="md:col-span-1">
        <h2 className="text-2xl font-headline font-semibold mb-4">Add New Source</h2>
        <AddSourceForm onSourceAdded={handleSourceAdded} />
      </div>
      <div className="md:col-span-2">
        <h2 className="text-2xl font-headline font-semibold mb-4">Existing Sources</h2>
        {isLoading && (
          <div className="space-y-4">
            {[1, 2].map(i => <Skeleton key={i} className="h-32 w-full rounded-lg" />)}
          </div>
        )}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {!isLoading && !error && (
          <SourcesList 
            dataSources={dataSources} 
            onSourceDeleted={handleSourceDeleted}
            onScrapeComplete={handleScrapeComplete}
          />
        )}
      </div>
    </div>
  );
}
