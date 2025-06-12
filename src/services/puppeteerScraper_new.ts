// import puppeteer from 'puppeteer';
import type { NewsArticle } from '@/types';

// NOTA: PuppeteerScraper está deshabilitado temporalmente debido a problemas de instalación
// Para habilitarlo, instalar: npm install puppeteer
// y descomentar el código a continuación

export class PuppeteerScraper {
  private url: string;

  constructor(url: string) {
    this.url = url;
  }

  async scrapeWithBrowser(): Promise<NewsArticle[]> {
    throw new Error('PuppeteerScraper está deshabilitado. Instale puppeteer para habilitarlo. Use WebScraper con Cheerio en su lugar.');
    
    /*
    // Código comentado hasta que se instale puppeteer correctamente
    let browser;
    
    try {
      // ... código de puppeteer comentado
      return [];
    } catch (error) {
      console.error('Error en Puppeteer scraping:', error);
      throw new Error(`Error al hacer scraping con Puppeteer de ${this.url}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      // ... cleanup
    }
    */
  }

  private parseDate(dateString: string): string | null {
    if (!dateString) return null;
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return null;
      return date.toISOString();
    } catch {
      return null;
    }
  }
}

// Función para detectar si un sitio requiere JavaScript
export function requiresJavaScript(url: string): boolean {
  const jsHeavySites = [
    'twitter.com',
    'x.com',
    'facebook.com',
    'instagram.com',
    'linkedin.com',
    'reddit.com',
    'medium.com',
    'substack.com'
  ];

  const hostname = new URL(url).hostname.toLowerCase();
  return jsHeavySites.some(site => hostname.includes(site));
}
