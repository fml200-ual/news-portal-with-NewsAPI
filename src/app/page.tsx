import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { DatabaseZap, Settings, FileText, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="container mx-auto py-12 px-4">
      <header className="text-center mb-16">
        <h1 className="text-5xl lg:text-6xl font-headline font-bold mb-4 text-primary">News Aggregator</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Stay updated with the latest news from various sources, all in one place.
        </p>
      </header>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg">
          <CardHeader className="flex flex-row items-start gap-4 p-6">
            <div className="p-3 bg-primary/10 rounded-md">
              <DatabaseZap className="w-8 h-8 text-primary" />
            </div>
            <div>
              <CardTitle className="font-headline text-2xl mb-1">Manage News Sources</CardTitle>
              <CardDescription>Add news APIs (like News API) or websites to pull articles from.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <p className="mb-6 text-sm text-muted-foreground">
              Specify News APIs or websites to start collecting news articles. You can manage your sources and trigger fetching here.
            </p>
          </CardContent>
          <CardFooter className="p-6 pt-0">
            <Link href="/datasources" passHref className="w-full">
              <Button variant="default" className="w-full font-semibold">
                Go to News Sources <ArrowRight className="ml-2 h-4 w-4" />
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
              <CardTitle className="font-headline text-2xl mb-1">Read & Manage Articles</CardTitle>
              <CardDescription>Browse collected news articles, add summaries, or analyze sentiment.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <p className="mb-6 text-sm text-muted-foreground">
              Review news articles, edit their content, or use AI for summarization and sentiment analysis.
            </p>
          </CardContent>
          <CardFooter className="p-6 pt-0">
            <Link href="/data" passHref className="w-full">
              <Button variant="default" className="w-full font-semibold">
                Go to News Articles <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>

      <footer className="text-center mt-20 pt-8 border-t">
        <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} News Aggregator. Your daily dose of information, simplified.</p>
      </footer>
    </div>
  );
}
