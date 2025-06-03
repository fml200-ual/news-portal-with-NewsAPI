"use client";

import type { DataSource } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe, Waypoints, Trash2, DownloadCloud, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { format, parseISO } from 'date-fns';

type SourcesListProps = {
  dataSources: DataSource[];
  onSourceDeleted: () => void;
  onScrapeComplete: () => void; // To refresh scraped data list potentially
};

export function SourcesList({ dataSources, onSourceDeleted, onScrapeComplete }: SourcesListProps) {
  const { toast } = useToast();
  const [scrapingId, setScrapingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleScrape = async (sourceId: string) => {
    setScrapingId(sourceId);
    try {
      const response = await fetch(`/api/datasources/${sourceId}/scrape`, {
        method: "POST",
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Failed to initiate scraping");
      }
      toast({
        title: "Scraping Initiated",
        description: result.message,
      });
      onScrapeComplete(); // Refresh data sources list to show status update and potentially scraped data list
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      toast({
        title: "Scraping Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setScrapingId(null);
    }
  };

  const handleDelete = async (sourceId: string) => {
    setDeletingId(sourceId);
    try {
      const response = await fetch(`/api/datasources/${sourceId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete data source");
      }
      toast({
        title: "Success",
        description: "Data source deleted successfully.",
      });
      onSourceDeleted();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  if (dataSources.length === 0) {
    return <p className="text-muted-foreground text-center py-8">No data sources added yet. Add one to get started!</p>;
  }

  return (
    <div className="space-y-4">
      {dataSources.map((source) => (
        <Card key={source.id} className="shadow-sm">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="font-headline text-xl flex items-center">
                  {source.type === "url" ? <Globe className="mr-2 h-5 w-5 text-primary" /> : <Waypoints className="mr-2 h-5 w-5 text-primary" />}
                  {source.name}
                </CardTitle>
                <CardDescription className="truncate max-w-md">{source.value}</CardDescription>
              </div>
              <Badge variant={source.status === 'error' ? 'destructive' : source.status === 'success' ? 'default' : 'secondary'} className="capitalize">
                {source.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Created: {format(parseISO(source.createdAt), "MMM d, yyyy HH:mm")}
            </p>
            {source.lastScrapedAt && (
              <p className="text-xs text-muted-foreground">
                Last Scraped: {format(parseISO(source.lastScrapedAt), "MMM d, yyyy HH:mm")}
              </p>
            )}
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleScrape(source.id)}
              disabled={scrapingId === source.id || source.status === 'scraping'}
            >
              {scrapingId === source.id ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <DownloadCloud className="mr-2 h-4 w-4" />
              )}
              Scrape
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" disabled={deletingId === source.id}>
                  {deletingId === source.id ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="mr-2 h-4 w-4" />
                  )}
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the data source
                    and all associated scraped data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleDelete(source.id)}>
                    Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
