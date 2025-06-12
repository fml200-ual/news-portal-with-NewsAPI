// Script de prueba para verificar el scraping sin MongoDB
import { WebScraper, scrapingConfigs, createGenericConfig } from '../src/services/scrapingService.js';

async function testScraping() {
  console.log('🧪 Iniciando pruebas de scraping...\n');

  try {
    // Prueba 1: Scraping con configuración predefinida
    console.log('📰 Probando scraping de El País...');
    const elPaisConfig = scrapingConfigs['elpais.com'];
    if (elPaisConfig) {
      const elPaisScraper = new WebScraper(elPaisConfig);
      const elPaisArticles = await elPaisScraper.scrapeArticles();
      console.log(`✅ El País: ${elPaisArticles.length} artículos encontrados`);
      if (elPaisArticles.length > 0) {
        console.log(`   Primer artículo: "${elPaisArticles[0].title.substring(0, 50)}..."`);
      }
    }

    // Prueba 2: Scraping genérico
    console.log('\n🌐 Probando scraping genérico con BBC...');
    const bbcConfig = createGenericConfig('https://www.bbc.com/news');
    const bbcScraper = new WebScraper(bbcConfig);
    const bbcArticles = await bbcScraper.scrapeArticles();
    console.log(`✅ BBC: ${bbcArticles.length} artículos encontrados`);
    if (bbcArticles.length > 0) {
      console.log(`   Primer artículo: "${bbcArticles[0].title.substring(0, 50)}..."`);
    }

    console.log('\n🎉 Todas las pruebas completadas exitosamente!');
    
  } catch (error) {
    console.error('❌ Error durante las pruebas:', error);
  }
}

testScraping();
