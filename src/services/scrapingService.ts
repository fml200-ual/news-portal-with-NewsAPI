import axios from 'axios';
import * as cheerio from 'cheerio';
import type { NewsArticle } from '@/types';

interface ScrapingConfig {
  url: string;
  selectors: {
    title: string;
    description?: string;
    content?: string;
    image?: string;
    publishedAt?: string;
    link?: string;
    container?: string;
  };
  baseUrl?: string;
}

export class WebScraper {
  private config: ScrapingConfig;

  constructor(config: ScrapingConfig) {
    this.config = config;
  }
  async scrapeArticles(): Promise<NewsArticle[]> {
    try {
      console.log(`🔍 Iniciando scraping de: ${this.config.url}`);
      
      const response = await axios.get(this.config.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'es-ES,es;q=0.8,en-US;q=0.5,en;q=0.3',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        },
        timeout: 20000,
        maxRedirects: 5
      });

      const $ = cheerio.load(response.data);
      const articles: NewsArticle[] = [];

      // Verificar si hay configuración específica para este sitio
      const siteConfig = getSiteConfig(this.config.url);
      
      if (siteConfig) {
        console.log(`📋 Usando configuración específica para: ${new URL(this.config.url).hostname}`);
        
        // Probar diferentes selectores de contenedor
        for (const containerSelector of siteConfig.containerSelectors) {
          const foundElements = $(containerSelector);
          console.log(`🎯 Probando selector "${containerSelector}": ${foundElements.length} elementos`);
          
          if (foundElements.length > 0) {
            foundElements.each((index, element) => {
              try {
                const article = this.extractArticleDataWithConfig($, element, siteConfig);
                if (article && article.title.length > 10) {
                  articles.push(article);
                  console.log(`✅ Artículo extraído: ${article.title.substring(0, 50)}...`);
                }
              } catch (error) {
                console.warn(`⚠️ Error extrayendo artículo ${index}:`, error);
              }
            });
            
            if (articles.length > 0) {
              break; // Salir si encontramos artículos
            }
          }
        }
      } else {
        // Usar selector de contenedor específico o genérico
        const containerSelector = this.config.selectors.container || 'article, .article, .news-item, .post, .story, .noticia';
        
        console.log(`🎯 Buscando artículos con selector genérico: ${containerSelector}`);
        const foundElements = $(containerSelector);
        console.log(`📊 Encontrados ${foundElements.length} elementos potenciales`);

        $(containerSelector).each((index, element) => {
          try {
            const article = this.extractArticleData($, element);
            if (article && article.title.length > 10) {
              articles.push(article);
              console.log(`✅ Artículo extraído: ${article.title.substring(0, 50)}...`);
            }
          } catch (error) {
            console.warn(`⚠️ Error extrayendo artículo ${index}:`, error);
          }
        });
      }

      // Si no encontramos artículos con contenedores, intentar con selectores directos
      if (articles.length === 0) {
        const directTitles = $(this.config.selectors.title);
        directTitles.each((index, element) => {
          try {
            const article = this.extractArticleDataDirect($, element);
            if (article && article.title.length > 10) {
              articles.push(article);
            }
          } catch (error) {
            console.warn(`Error extrayendo artículo directo ${index}:`, error);
          }
        });
      }

      return articles.slice(0, 20); // Limitar a 20 artículos
    } catch (error) {
      console.error('Error en scraping:', error);
      throw new Error(`Error al hacer scraping de ${this.config.url}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  private extractArticleData($: cheerio.CheerioAPI, element: any): NewsArticle | null {
    const $element = $(element);
    
    const title = this.extractText($, $element, this.config.selectors.title);
    if (!title || title.length < 10) return null;

    const description = this.extractText($, $element, this.config.selectors.description);
    const content = this.extractText($, $element, this.config.selectors.content);
    const imageUrl = this.extractAttribute($, $element, this.config.selectors.image, 'src');
    const link = this.extractAttribute($, $element, this.config.selectors.link, 'href');
    const publishedAt = this.extractText($, $element, this.config.selectors.publishedAt);

    return this.createNewsArticle({
      title: title.trim(),
      description: description?.trim() || '',
      content: content?.trim() || description?.trim() || '',
      imageUrl: this.resolveUrl(imageUrl),
      url: this.resolveUrl(link),
      publishedAt: this.parseDate(publishedAt) || new Date().toISOString()
    });
  }

  private extractArticleDataDirect($: cheerio.CheerioAPI, element: any): NewsArticle | null {
    const $element = $(element);
    
    const title = $element.text().trim();
    if (!title || title.length < 10) return null;

    // Buscar elementos relacionados
    const $parent = $element.closest('article, .article, .news-item, .post, div');
    const description = $parent.find('p, .description, .summary').first().text().trim();
    const imageUrl = $parent.find('img').first().attr('src');
    const link = $element.attr('href') || $element.closest('a').attr('href');

    return this.createNewsArticle({
      title,
      description: description || '',
      content: description || '',
      imageUrl: this.resolveUrl(imageUrl),
      url: this.resolveUrl(link),
      publishedAt: new Date().toISOString()
    });
  }

  private extractArticleDataWithConfig($: cheerio.CheerioAPI, element: any, siteConfig: any): NewsArticle | null {
    const $element = $(element);
    
    // Buscar título usando los selectores específicos del sitio
    let title = '';
    for (const titleSelector of siteConfig.titleSelectors) {
      const foundTitle = this.extractText($, $element, titleSelector);
      if (foundTitle && foundTitle.length > 10) {
        title = foundTitle;
        break;
      }
    }
    
    if (!title) return null;

    // Buscar link usando los selectores específicos del sitio
    let link = '';
    for (const linkSelector of siteConfig.linkSelectors) {
      const foundLink = this.extractAttribute($, $element, linkSelector, 'href');
      if (foundLink) {
        link = foundLink;
        break;
      }
    }

    // Buscar descripción en el contenedor
    const description = this.extractText($, $element, 'p, .description, .summary, .lead, .excerpt') || '';
    const imageUrl = this.extractAttribute($, $element, 'img', 'src') || '';

    return this.createNewsArticle({
      title: title.trim(),
      description: description.trim(),
      content: description.trim() || title.trim(),
      imageUrl: this.resolveUrl(imageUrl),
      url: this.resolveUrl(link),
      publishedAt: new Date().toISOString()
    });
  }

  private createNewsArticle(data: {
    title: string;
    description: string;
    content: string;
    imageUrl: string;
    url: string;
    publishedAt: string;
  }): NewsArticle {
    return {
      id: `scraped-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      dataSourceId: 'web-scraper',
      dataSourceName: new URL(this.config.url).hostname,
      title: data.title,
      description: data.description,
      url: data.url,
      imageUrl: data.imageUrl,
      publishedAt: data.publishedAt,
      content: data.content,
      category: 'general',
      sourceName: new URL(this.config.url).hostname,
      isEnriched: false,
      createdAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString(),
    };
  }

  private extractText($: cheerio.CheerioAPI, $element: cheerio.Cheerio<any>, selector?: string): string {
    if (!selector) return '';
    
    const element = $element.find(selector).first();
    if (element.length === 0) {
      // Si no encuentra en el elemento actual, buscar en toda la página
      return $(selector).first().text();
    }
    return element.text();
  }

  private extractAttribute($: cheerio.CheerioAPI, $element: cheerio.Cheerio<any>, selector?: string, attribute: string = 'href'): string {
    if (!selector) return '';
    
    const element = $element.find(selector).first();
    if (element.length === 0) {
      return $(selector).first().attr(attribute) || '';
    }
    return element.attr(attribute) || '';
  }

  private resolveUrl(url?: string): string {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    if (url.startsWith('//')) return `https:${url}`;
    if (url.startsWith('/')) return `${this.config.baseUrl || new URL(this.config.url).origin}${url}`;
    return url;
  }

  private parseDate(dateString?: string): string | null {
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

// Configuraciones predefinidas para sitios populares de noticias
export const scrapingConfigs: Record<string, ScrapingConfig> = {
  'elpais.com': {
    url: 'https://elpais.com',
    selectors: {
      container: 'article, .articulo-titular',
      title: 'h2 a, h1, .titulo',
      description: '.entradilla, .c_d, p',
      image: 'img',
      link: 'h2 a, .titulo a',
      publishedAt: 'time, .fecha'
    },
    baseUrl: 'https://elpais.com'
  },
  'elmundo.es': {
    url: 'https://elmundo.es',
    selectors: {
      container: 'article, .ue-c-cover-content',
      title: '.ue-c-cover-content__headline a, h2 a, h1',
      description: '.ue-c-cover-content__footer, .entradilla',
      image: 'img',
      link: '.ue-c-cover-content__headline a, h2 a',
      publishedAt: '.ue-c-cover-content__byline-time, time'
    },
    baseUrl: 'https://elmundo.es'
  },
  'abc.es': {
    url: 'https://abc.es',
    selectors: {
      container: 'article, .noticia',
      title: 'h2 a, h1, .titular',
      description: '.entradilla, .resumen',
      image: 'img',
      link: 'h2 a, .titular a',
      publishedAt: 'time, .fecha'
    },
    baseUrl: 'https://abc.es'
  },
  'lavanguardia.com': {
    url: 'https://lavanguardia.com',
    selectors: {
      container: 'article, .tease',
      title: 'h2 a, h1, .tease-headline',
      description: '.tease-text, .entradilla',
      image: 'img',
      link: 'h2 a, .tease-headline a',
      publishedAt: 'time, .date'
    },
    baseUrl: 'https://lavanguardia.com'
  },
  '20minutos.es': {
    url: 'https://20minutos.es',
    selectors: {
      container: 'article, .media-news',
      title: 'h2 a, h1, .media-news-title',
      description: '.media-news-summary, .entradilla',
      image: 'img',
      link: 'h2 a, .media-news-title a',
      publishedAt: 'time, .date'
    },
    baseUrl: 'https://20minutos.es'
  }
};

// Configuraciones específicas para sitios web problemáticos
const SITE_CONFIGS = {
  'eleconomista.es': {
    containerSelectors: [
      'article',
      '.articleContent',
      '.article',
      '.noticia-home',
      '.story-box', 
      '.article-list-item',
      '[data-test="story"]',
      '.story',
      '.noticia'
    ],
    titleSelectors: [
      '.articleHeadline',
      '.articleHeadline a',
      'h2 a',
      'h3 a', 
      '.story-title a',
      '.headline a',
      '.titulo a',
      'a[title]'
    ],
    linkSelectors: [
      '.articleHeadline a',
      'a[href*="/actualidad/"]',
      'a[href*="/economia/"]',
      'a[href*="/tecnologia/"]',
      'h2 a',
      'h3 a'
    ]
  },
  '20minutos.es': {
    containerSelectors: [
      '.story',
      '.article-item',
      '.news-item',
      '[data-module="story"]',
      '.noticia',
      'article',
      '.story-box'
    ],
    titleSelectors: [
      'h2 a',
      'h3 a',
      '.story-title a',
      '.headline a',
      '.titulo a',
      'a[title]'
    ],
    linkSelectors: [
      'a[href*="/noticia/"]',
      'a[href*="/deportes/"]',
      'a[href*="/nacional/"]',
      'h2 a',
      'h3 a'
    ]
  }
};

// Función para obtener configuración específica del sitio
function getSiteConfig(url: string) {
  const hostname = new URL(url).hostname;
  for (const [domain, config] of Object.entries(SITE_CONFIGS)) {
    if (hostname.includes(domain)) {
      return config;
    }
  }
  return null;
}

// Función para crear configuración genérica para cualquier sitio
export function createGenericConfig(url: string): ScrapingConfig {
  return {
    url,
    selectors: {
      container: 'article, .article, .news-item, .post, .story, .content-item',
      title: 'h1, h2, h3, .title, .headline, [class*="title"], [class*="headline"]',
      description: 'p, .description, .summary, .excerpt, .intro, .lead',
      image: 'img',
      link: 'a',
      publishedAt: 'time, .date, .published, [class*="date"], [class*="time"]'
    },
    baseUrl: new URL(url).origin
  };
}
