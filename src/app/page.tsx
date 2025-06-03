
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Newspaper, LayoutGrid, ArrowRight, Settings } from 'lucide-react';

export default function Home() {
  return (
    <div className="container mx-auto py-12 px-4">
      <header className="text-center mb-16">
        <h1 className="text-5xl lg:text-6xl font-headline font-bold mb-4 text-primary flex items-center justify-center">
          <Newspaper className="w-12 h-12 lg:w-14 lg:h-14 mr-4" />
          News Portal
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Your central hub for the latest news, neatly categorized for easy browsing.
        </p>
      </header>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg">
          <CardHeader className="flex flex-row items-start gap-4 p-6">
            <div className="p-3 bg-primary/10 rounded-md">
              <LayoutGrid className="w-8 h-8 text-primary" />
            </div>
            <div>
              <CardTitle className="font-headline text-2xl mb-1">Browse News by Category</CardTitle>
              <CardDescription>Explore articles from technology, business, sports, and more.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <p className="mb-6 text-sm text-muted-foreground">
              Dive into specific categories to find news that matters most to you. Our portal fetches and organizes articles for a streamlined reading experience.
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

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg">
          <CardHeader className="flex flex-row items-start gap-4 p-6">
            <div className="p-3 bg-primary/10 rounded-md">
             <Settings className="w-8 h-8 text-primary" />
            </div>
            <div>
              <CardTitle className="font-headline text-2xl mb-1">News Source Info</CardTitle>
              <CardDescription>Learn about where our news comes from.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <p className="mb-6 text-sm text-muted-foreground">
              This portal primarily utilizes News API (simulated for this demo) to bring you up-to-date information.
            </p>
          </CardContent>
          <CardFooter className="p-6 pt-0">
            <Link href="/datasources" passHref className="w-full">
              <Button variant="outline" className="w-full font-semibold">
                View Source Info <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>

      <footer className="text-center mt-20 pt-8 border-t">
        <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} News Portal. Stay informed.</p>
      </footer>
    </div>
  );
}
