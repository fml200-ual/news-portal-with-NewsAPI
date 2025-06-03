"use client";

import { useState, useEffect, useCallback } from "react";
import type { ScrapedDataItem } from "@/types";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { EditDataForm } from "./edit-data-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

type ScrapedDataManagerProps = {
  initialScrapedData: ScrapedDataItem[];
};

export function ScrapedDataManager({ initialScrapedData }: ScrapedDataManagerProps) {
  const [scrapedData, setScrapedData] = useState<ScrapedDataItem[]>(initialScrapedData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<ScrapedDataItem | null>(null);
  const { toast } = useToast();

  const fetchScrapedData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/scraped-items", { cache: 'no-store' });
      if (!response.ok) throw new Error("Failed to fetch scraped data");
      const data = await response.json();
      setScrapedData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      setScrapedData([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // useEffect(() => { fetchScrapedData(); }, [fetchScrapedData]); // Initial fetch if not relying on SSR data only

  const handleEdit = (item: ScrapedDataItem) => {
    setEditingItem(item);
  };

  const handleDelete = async (item: ScrapedDataItem) => {
    try {
      const response = await fetch(`/api/scraped-items/${item.id}`, { method: "DELETE" });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete item");
      }
      toast({ title: "Success", description: "Item deleted." });
      fetchScrapedData(); // Refresh
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
    }
  };
  
  const handleEnrich = async (item: ScrapedDataItem) => {
     try {
      const response = await fetch(`/api/scraped-items/${item.id}/enrich`, { method: "POST" });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to enrich item");
      }
      toast({ title: "Success", description: `Item ${item.id} enrichment process successful.` });
      fetchScrapedData(); // Refresh
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
    }
  };

  const handleSaveEdit = () => {
    setEditingItem(null);
    fetchScrapedData(); // Refresh after saving
  };

  if (isLoading && scrapedData.length === 0) { // Show skeleton only on initial full load
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full rounded-lg" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (error) {
    return (
       <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error Fetching Data</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div>
      <DataTable
        columns={columns}
        data={scrapedData}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onEnrich={handleEnrich}
      />
      {editingItem && (
        <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle className="font-headline">Edit Scraped Item</DialogTitle>
              <DialogDescription>
                Modify the details of the scraped item. Make sure raw data is valid JSON.
              </DialogDescription>
            </DialogHeader>
            <EditDataForm
              item={editingItem}
              onSave={handleSaveEdit}
              onCancel={() => setEditingItem(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
