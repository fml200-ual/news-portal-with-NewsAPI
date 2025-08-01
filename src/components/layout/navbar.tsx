
import Link from 'next/link';
import { Newspaper } from '@/components/ui/safe-icons';

export function Navbar() {
  return (
    <nav className="bg-card border-b border-border shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-xl font-headline font-semibold text-primary hover:text-primary/90 transition-colors">
          <Newspaper className="h-7 w-7" /> {/* Changed icon */}
          News Portal
        </Link>
        <div className="flex items-center gap-6 text-sm font-medium">
          <Link href="/data" className="text-foreground hover:text-primary transition-colors">
            Noticias
          </Link>
          <Link href="/datasources" className="text-foreground hover:text-primary transition-colors">
            Fuentes
          </Link>
          <Link href="/dashboard" className="text-foreground hover:text-primary transition-colors">
            Estadísticas
          </Link>
          <Link href="/docs" className="text-blue-600 hover:text-blue-800">
            📚 API Docs
          </Link>
        </div>
      </div>
    </nav>
  );
}
