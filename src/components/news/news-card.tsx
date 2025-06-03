
"use client";

import type { NewsArticle } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { ExternalLink, Tag, CalendarDays, Building } from "lucide-react";
import { format, parseISO } from 'date-fns';

type NewsCardProps = {
  article: NewsArticle;
};

export function NewsCard({ article }: NewsCardProps) {
  const MAX_DESCRIPTION_LENGTH = 150;
  const displayDescription = article.description 
    ? (article.description.length > MAX_DESCRIPTION_LENGTH ? article.description.substring(0, MAX_DESCRIPTION_LENGTH) + "..." : article.description)
    : "No description available.";

  return (
    <Card className="flex flex-col h-full shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg overflow-hidden">
      {article.imageUrl && (
        <div className="relative w-full h-48">
          <Image
            src={article.imageUrl}
            alt={article.title}
            fill
            style={{ objectFit: 'cover' }}
            data-ai-hint={`${article.category} news`}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={(e) => (e.currentTarget.src = 'https://placehold.co/600x400.png?text=Image+Error')}
          />
        </div>
      )}
      <CardHeader className="p-4">
        <CardTitle className="font-headline text-lg leading-tight mb-1">{article.title}</CardTitle>
        <div className="flex items-center text-xs text-muted-foreground gap-2 mb-2">
          <Building className="h-3 w-3" />
          <span>{article.sourceName || 'Unknown Source'}</span>
          <span className="mx-1">|</span>
          <CalendarDays className="h-3 w-3" />
          <span>{format(parseISO(article.publishedAt), "MMM d, yyyy")}</span>
        </div>
         <Badge variant="secondary" className="capitalize w-fit text-xs py-0.5 px-1.5">
            <Tag className="h-3 w-3 mr-1" />
            {article.category}
        </Badge>
      </CardHeader>
      <CardContent className="p-4 pt-0 flex-grow">
        <CardDescription className="text-sm">{displayDescription}</CardDescription>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button asChild variant="outline" size="sm" className="w-full">
          <a href={article.url} target="_blank" rel="noopener noreferrer">
            Read More <ExternalLink className="ml-2 h-4 w-4" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}
