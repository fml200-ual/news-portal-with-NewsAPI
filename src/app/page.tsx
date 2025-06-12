import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Newspaper, LayoutGrid, ArrowRight, Settings, BarChart3 } from 'lucide-react';

export default function Home() {
  return (
    <div className="container mx-auto py-12 px-4">
      <header className="text-center mb-16">        <h1 className="text-5xl lg:text-6xl font-headline font-bold mb-4 text-primary flex items-center justify-center">
          <Newspaper className="w-12 h-12 lg:w-14 lg:h-14 mr-4" />
          Portal de Noticias
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Tu centro de noticias con scraping real de sitios españoles, organizado y enriquecido con IA.
        </p>
      </header>      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg">
          <CardHeader className="flex flex-row items-start gap-4 p-6">
            <div className="p-3 bg-primary/10 rounded-md">
              <LayoutGrid className="w-8 h-8 text-primary" />
            </div>
            <div>
              <CardTitle className="font-headline text-2xl mb-1">Explorar Noticias</CardTitle>
              <CardDescription>Navega por artículos reales extraídos mediante scraping</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <p className="mb-6 text-sm text-muted-foreground">
              Descubre noticias actualizadas de fuentes españolas como El País, extraídas automáticamente mediante scraping real.
            </p>
          </CardContent>
          <CardFooter className="p-6 pt-0">
            <Link href="/data" passHref className="w-full">
              <Button variant="default" className="w-full font-semibold">
                Ver Artículos <ArrowRight className="ml-2 h-4 w-4" />
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
              <CardTitle className="font-headline text-2xl mb-1">Gestionar Fuentes</CardTitle>
              <CardDescription>Configura y ejecuta scraping en sitios web</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <p className="mb-6 text-sm text-muted-foreground">
              Añade nuevas fuentes de noticias, configura selectores CSS y ejecuta scraping en tiempo real.
            </p>
          </CardContent>
          <CardFooter className="p-6 pt-0">
            <Link href="/datasources" passHref className="w-full">
              <Button variant="outline" className="w-full font-semibold">
                Gestionar Fuentes <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg">
          <CardHeader className="flex flex-row items-start gap-4 p-6">
            <div className="p-3 bg-primary/10 rounded-md">
             <BarChart3 className="w-8 h-8 text-primary" />
            </div>
            <div>
              <CardTitle className="font-headline text-2xl mb-1">Dashboard</CardTitle>
              <CardDescription>Estadísticas y estado del sistema</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <p className="mb-6 text-sm text-muted-foreground">
              Ve estadísticas del scraping, artículos extraídos y el estado general del sistema.
            </p>
          </CardContent>
          <CardFooter className="p-6 pt-0">
            <Link href="/dashboard" passHref className="w-full">
              <Button variant="secondary" className="w-full font-semibold">
                Ver Dashboard <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>

      <footer className="text-center mt-20 pt-8 border-t">
        <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} Portal de Noticias. Mantente informado con scraping real.</p>
      </footer>
     <div className="text-center mt-4">
       <Link href="/auth/login" className="text-indigo-600 hover:text-indigo-500 font-medium">Iniciar sesión</Link>
     </div>
    </div>
  );
}
