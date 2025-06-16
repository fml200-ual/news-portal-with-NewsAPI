const axios = require('axios');
const cheerio = require('cheerio');

// Función para obtener configuración específica del sitio
function getSiteConfig(url) {
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
    }
  };

  const hostname = new URL(url).hostname;
  for (const [domain, config] of Object.entries(SITE_CONFIGS)) {
    if (hostname.includes(domain)) {
      return config;
    }
  }
  return null;
}

async function testElEconomistaScraping() {
  try {
    const url = 'https://www.eleconomista.es/actualidad/';
    console.log(`🔍 Probando scraping de: ${url}`);
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'es-ES,es;q=0.8,en-US;q=0.5,en;q=0.3',
        'Connection': 'keep-alive'
      },
      timeout: 20000
    });

    const $ = cheerio.load(response.data);
    const siteConfig = getSiteConfig(url);
    const articles = [];

    if (siteConfig) {
      console.log(`📋 Usando configuración específica para: ${new URL(url).hostname}`);
      
      // Probar diferentes selectores de contenedor
      for (const containerSelector of siteConfig.containerSelectors) {
        const foundElements = $(containerSelector);
        console.log(`🎯 Probando selector "${containerSelector}": ${foundElements.length} elementos`);
        
        if (foundElements.length > 0) {
          foundElements.each((index, element) => {
            try {
              const $element = $(element);
              
              // Buscar título usando los selectores específicos del sitio
              let title = '';
              for (const titleSelector of siteConfig.titleSelectors) {
                const titleElement = $element.find(titleSelector).first();
                if (titleElement.length === 0) {
                  // Si no encuentra en el elemento actual, buscar en toda la página
                  const globalTitle = $(titleSelector).first().text();
                  if (globalTitle && globalTitle.length > 10) {
                    title = globalTitle;
                    break;
                  }
                } else {
                  const foundTitle = titleElement.text();
                  if (foundTitle && foundTitle.length > 10) {
                    title = foundTitle;
                    break;
                  }
                }
              }
              
              if (title) {
                // Buscar link usando los selectores específicos del sitio
                let link = '';
                for (const linkSelector of siteConfig.linkSelectors) {
                  const linkElement = $element.find(linkSelector).first();
                  const foundLink = linkElement.attr('href') || $(linkSelector).first().attr('href');
                  if (foundLink) {
                    link = foundLink;
                    break;
                  }
                }

                if (title.length > 10) {
                  articles.push({
                    title: title.trim(),
                    link: link,
                    container: containerSelector
                  });
                  console.log(`✅ Artículo extraído: ${title.substring(0, 50)}...`);
                }
              }
            } catch (error) {
              console.warn(`⚠️ Error extrayendo artículo ${index}:`, error.message);
            }
          });
          
          if (articles.length > 0) {
            console.log(`🎉 Encontrados ${articles.length} artículos con selector: ${containerSelector}`);
            break; // Salir si encontramos artículos
          }
        }
      }
    }

    console.log(`\n📊 Resultado final: ${articles.length} artículos encontrados`);
    articles.slice(0, 5).forEach((article, i) => {
      console.log(`${i + 1}. ${article.title}`);
      console.log(`   Link: ${article.link}`);
      console.log(`   Container: ${article.container}\n`);
    });

  } catch (error) {
    console.error('❌ Error en scraping:', error.message);
  }
}

testElEconomistaScraping();
