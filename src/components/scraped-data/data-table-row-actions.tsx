
"use client";

import { MoreHorizontal, Pencil, Trash2, Sparkles, Loader2 } from "lucide-react";
import type { Row } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ScrapedDataItem } from "@/types";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
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


interface DataTableRowActionsProps<TData extends ScrapedDataItem> {
  row: Row<TData>;
}

export function DataTableRowActions<TData extends ScrapedDataItem>({
  row,
}: DataTableRowActionsProps<TData>) {
  const item = row.original;
  const { toast } = useToast();
  const [isEnriching, setIsEnriching] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Safely access actions from table.meta
  const meta = row?.table?.options?.meta;

  if (!meta) {
    console.error("Table meta information is not available for row actions.", { rowId: row.id });
    // Return null or a disabled placeholder if meta is not available
    return (
      <Button variant="ghost" className="flex h-8 w-8 p-0" disabled>
        <MoreHorizontal className="h-4 w-4" />
        <span className="sr-only">Open menu (unavailable)</span>
      </Button>
    );
  }

  const { editItem, deleteItem, enrichItem } = meta as {
    editItem: (id: string) => void;
    deleteItem: (id: string) => void;
    enrichItem: (id: string) => void;
  };


  const handleEnrich = async () => {
    setIsEnriching(true);
    try {
      await enrichItem(item.id); 
      toast({ title: "Success", description: "Article enrichment process started." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to enrich article.", variant: "destructive" });
    } finally {
      setIsEnriching(false);
    }
  };

  return (
    <AlertDialog>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
          >
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuItem onClick={() => editItem(item.id)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleEnrich} disabled={isEnriching || item.isEnriched}>
            {isEnriching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            {item.isEnriched ? 'Enriched' : 'Enrich'}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <AlertDialogTrigger asChild>
            <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
            </DropdownMenuItem>
          </AlertDialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the news article.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={async () => {
              setIsDeleting(true);
              try {
                await deleteItem(item.id); 
                toast({ title: "Success", description: "Article deleted." });
              } catch (error) {
                toast({ title: "Error", description: "Failed to delete article.", variant: "destructive" });
              } finally {
                setIsDeleting(false);
              }
            }}
            disabled={isDeleting}
            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
          >
            {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
