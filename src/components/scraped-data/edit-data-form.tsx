"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { ScrapedDataItem } from "@/types";
import { Loader2 } from "lucide-react";
import { useState } from "react";

const formSchema = z.object({
  rawData: z.string().refine((val) => {
    try { JSON.parse(val); return true; } catch { return false; }
  }, { message: "Raw data must be a valid JSON string." }),
  processedData: z.string().optional().refine((val) => {
    if (!val) return true; // Optional, so empty is fine
    try { JSON.parse(val); return true; } catch { return false; }
  }, { message: "Processed data must be a valid JSON string if provided." }),
});

type EditDataFormProps = {
  item: ScrapedDataItem;
  onSave: () => void; // Callback to refresh data and close dialog
  onCancel: () => void;
};

export function EditDataForm({ item, onSave, onCancel }: EditDataFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rawData: item.rawData || "{}",
      processedData: item.processedData || "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/scraped-items/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update item");
      }

      toast({
        title: "Success!",
        description: "Item updated successfully.",
      });
      onSave();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="rawData"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Raw Data (JSON)</FormLabel>
              <FormControl>
                <Textarea placeholder='{"key": "value"}' {...field} rows={8} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="processedData"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Processed Data (JSON, optional)</FormLabel>
              <FormControl>
                <Textarea placeholder='{"processedKey": "processedValue"}' {...field} rows={5} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </form>
    </Form>
  );
}
