import { WebScraper } from '../src/services/scrapingService.js';

// Configuración para El Economista
const config = {
  url: 'https://www.eleconomista.es/actualidad/',
  selectors: {
    container: '.articleContent',
    title: '.articleHeadline',
    description: '.textWrap',
    image: 'img',
    link: 'a',
    publishedAt: 'time'
  },
  baseUrl: 'https://www.eleconomista.es'
};

async function testScraping() {
  try {
    console.log('🔍 Iniciando test de scraping...');
    const scraper = new WebScraper(config);
    const articles = await scraper.scrapeArticles();
    
    console.log(`✅ Resultado: ${articles.length} artículos encontrados`);
    
    articles.slice(0, 3).forEach((article, i) => {
      console.log(`\n${i + 1}. ${article.title}`);
      console.log(`   URL: ${article.url}`);
      console.log(`   Descripción: ${article.description?.substring(0, 100)}...`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testScraping();
