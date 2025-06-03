
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Info, Rss } from 'lucide-react';

// This page is simplified as we focus on one primary news source (e.g., News API)
// In a real scenario, this could show configuration details or statistics about the API.

export default async function DataSourcesInfoPage() {
  // Mock data for the primary news source
  const primarySource = {
    name: "NewsAPI.org (Simulated)",
    description: "This portal simulates fetching news from NewsAPI.org, a popular service for accessing live news headlines and articles from various sources and blogs.",
    type: "API",
    status: "Active (Simulated)",
    url: "https://newsapi.org/"
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <header className="mb-8">
        <h1 className="text-4xl font-headline font-bold text-primary flex items-center">
          <Info className="w-10 h-10 mr-3" /> News Source Information
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          Details about the primary source of news for this portal.
        </p>
      </header>
      
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Rss className="w-8 h-8 text-primary" />
            <CardTitle className="font-headline text-2xl">{primarySource.name}</CardTitle>
          </div>
          <CardDescription className="mt-1">Type: {primarySource.type} | Status: <span className="text-green-600 font-semibold">{primarySource.status}</span></CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">{primarySource.description}</p>
          <p className="text-sm">
            For more information about NewsAPI, you can visit their official website: <br/>
            <a href={primarySource.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">
              {primarySource.url}
            </a>
          </p>
          <p className="text-xs text-muted-foreground mt-6">
            Note: In a real application, API keys and other sensitive configurations would be managed securely on the backend.
            The data fetching in this demonstration is mocked.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export const dynamic = 'force-dynamic';
