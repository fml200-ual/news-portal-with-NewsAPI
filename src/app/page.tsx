import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { DatabaseZap, Settings, FileText, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="container mx-auto py-12 px-4">
      <header className="text-center mb-16">
        <h1 className="text-5xl lg:text-6xl font-headline font-bold mb-4 text-primary">DataHarvester</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Your central hub for web scraping, data extraction, and insightful enrichment. Streamline your data workflows with ease.
        </p>
      </header>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg">
          <CardHeader className="flex flex-row items-start gap-4 p-6">
            <div className="p-3 bg-primary/10 rounded-md">
              <DatabaseZap className="w-8 h-8 text-primary" />
            </div>
            <div>
              <CardTitle className="font-headline text-2xl mb-1">Manage Data Sources</CardTitle>
              <CardDescription>Add, view, and configure your target websites and APIs for scraping.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <p className="mb-6 text-sm text-muted-foreground">
              Define where DataHarvester should look for information. Specify URLs or API endpoints to start collecting valuable data.
            </p>
          </CardContent>
          <CardFooter className="p-6 pt-0">
            <Link href="/datasources" passHref className="w-full">
              <Button variant="default" className="w-full font-semibold">
                Go to Data Sources <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg">
          <CardHeader className="flex flex-row items-start gap-4 p-6">
            <div className="p-3 bg-primary/10 rounded-md">
             <FileText className="w-8 h-8 text-primary" />
            </div>
            <div>
              <CardTitle className="font-headline text-2xl mb-1">View & Edit Data</CardTitle>
              <CardDescription>Explore, clean, and enrich the data collected from your sources.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <p className="mb-6 text-sm text-muted-foreground">
              Browse through the scraped data, make necessary edits, and utilize external APIs for enrichment and validation.
            </p>
          </CardContent>
          <CardFooter className="p-6 pt-0">
            <Link href="/data" passHref className="w-full">
              <Button variant="default" className="w-full font-semibold">
                Go to Scraped Data <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>

      <footer className="text-center mt-20 pt-8 border-t">
        <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} DataHarvester. Efficient data collection and processing, simplified.</p>
      </footer>
    </div>
  );
}
