// Datos de noticias predefinidas para Dungeons & Dragons
const dndNews = [
  {
    title: "Para jugar a Dungeons & Dragons solo necesitabas un boli, papel y dados. Ahora un curso de 2.000 dólares quiere enseñarte a hacerlo mejor",
    link: "https://www.xataka.com/literatura-comics-y-juegos/para-jugar-a-dungeons-dragons-solo-necesitabas-boli-papel-dados-ahora-curso-2-000-dolares-quiere-ensenarte-mejor",
    pubDate: "2024-01-15",
    description: "Un curso premium de 2.000 dólares promete enseñar a jugar D&D como un profesional, generando debate en la comunidad.",
    imageUrl: "https://i.blogs.es/8a9a6a/dnd-course/840_560.jpg"
  },
  {
    title: "Este juego de estrategia y gestión donde interpretas al malo del juego de rol al estilo Diablo no te pierdas Dungeon Keeper 1 que vale un café en GOG",
    link: "https://www.3djuegospc.com/estrategia/este-juego-estrategia-gestion-interpretas-al-malo-juego-rol-al-estilo-diablo-no-te-pierdas-dungeon-keeper-1-que-vale-cafe-gog",
    pubDate: "2024-02-10",
    description: "Dungeon Keeper, el clásico donde eres el malo, ahora disponible a precio mínimo en GOG.",
    imageUrl: "https://cdn.hobbyconsolas.com/sites/navi.axelspringer.es/public/media/image/2023/02/dungeon-keeper-2958773.jpg"
  },
  {
    title: "Demeco x Dungeons & Dragons: Battlemarked - Uniendo mundos de rol",
    link: "https://vandal.elespanol.com/avances/pc/demeo-x-dungeons-dragons-battlemarked/192963/1",
    pubDate: "2024-03-05",
    description: "La colaboración entre Demeco y D&D trae nuevas experiencias de juego inmersivo.",
    imageUrl: "https://vandal.elespanol.com/avances/pc/demeo-x-dungeons-dragons-battlemarked/192963/1#foto:1"
  },
  {
    title: "Los mejores juegos de Dungeons & Dragons más allá de Baldur's Gate 3",
    link: "https://www.hobbyconsolas.com/reportajes/mejores-juegos-dungeons-dragons-alla-baldurs-gate-3-1476938",
    pubDate: "2024-01-20",
    description: "Descubre los títulos imprescindibles del universo D&D que no son Baldur's Gate 3.",
    imageUrl: "https://cdn.hobbyconsolas.com/sites/navi.axelspringer.es/public/media/image/2023/08/baldurs-gate-3-3093661.jpg"
  },
  {
    title: "Este RPG en blanco y negro simula una partida de rol de mesa con mucha muerte",
    link: "https://www.softonic.com/articulos/si-echas-de-menos-los-juegos-clasicos-de-dungeons-dragons-este-rpg-en-blanco-y-negro-simula-una-partida-de-rol-de-mesa-y-mucha-muerte",
    pubDate: "2024-02-28",
    description: "Un indie que captura la esencia de los juegos de rol clásicos con estética monocromática.",
    imageUrl: "https://i.blogs.es/7a3b5c/retro-rpg/840_560.jpg"
  },
  {
    title: "Dungeons & Dragons popularizó el concepto de juego de rol, pero en realidad era una etiqueta de competencia para protegerse, según sus abogados",
    link: "https://www.3djuegos.com/tv-series/noticias/dungeons-dragons-popularizo-concepto-juego-rol-realidad-era-etiqueta-competencia-para-protegerse-sus-abogados",
    pubDate: "2024-03-12",
    description: "La historia legal detrás del término 'juego de rol' y cómo D&D lo popularizó como estrategia comercial.",
    imageUrl: "https://i.blogs.es/5a5b5c/dnd-legal/840_560.jpg"
  },
  {
    title: "Dungeons & Dragons vive una etapa de éxito sin precedentes, pero está muy lejos de sus orígenes",
    link: "https://www.xataka.com/literatura-comics-y-juegos/dungeons-dragons-vive-etapa-exito-precedentes-motivo-esta-muy-lejos-origenes-juego",
    pubDate: "2024-01-08",
    description: "Análisis de la evolución de D&D desde sus humildes comienzos hasta el fenómeno actual.",
    imageUrl: "https://i.blogs.es/9a8b7c/dnd-evolution/840_560.jpg"
  },
  {
    title: "Dungeons & Dragons: Un año increíble para el juego de rol",
    link: "https://www.lacasadeel.net/2025/01/dungeons-dragons-ano-increible.html",
    pubDate: "2025-01-15",
    description: "Resumen de todos los logros y novedades de D&D en el último año.",
    imageUrl: "https://www.lacasadeel.net/wp-content/uploads/2025/01/dnd-2025.jpg"
  },
  {
    title: "Los dueños de Dungeons & Dragons se comprometen y afirman que harán más juegos como Baldur's Gate 3",
    link: "https://vandal.elespanol.com/noticia/1350781247/los-duenos-de-dungeons-dragons-se-comprometen-y-afirman-que-haran-mas-juegos-como-baldurs-gate-3/",
    pubDate: "2024-02-22",
    description: "Wizards of the Coast anuncia más colaboraciones de calidad tras el éxito de Baldur's Gate 3.",
    imageUrl: "https://vandal.elespanol.com/noticia/1350781247/los-duenos-de-dungeons-dragons-se-comprometen-y-afirman-que-haran-mas-juegos-como-baldurs-gate-3/#foto:1"
  },
  {
    title: "Pork & Mort: Dungeons and Dragons inspirado en rondalles mallorquines",
    link: "https://www.ultimahora.es/noticias/sociedad/2025/08/03/2433295/pork-mort-dungeons-and-dragons-inspirado-rondalles-mallorquines-queremos-gente-sienta-suyo.html",
    pubDate: "2025-08-03",
    description: "Una adaptación única de D&D basada en la mitología y folklore de Mallorca.",
    imageUrl: "https://estaticos-cdn.prensaiberica.es/clip/9a8c1e63-1e3f-4b4c-8e5c-8b5c5b5c5b5c_16-9-aspect-ratio_default_0.jpg"
  },
  {
    title: "Universal Studios une Dungeons & Dragons con serie de eventos de rol interactivos",
    link: "https://www.hobbyconsolas.com/noticias/universal-studios-une-dungeons-dragons-serie-eventos-rol-interactivos-1456683",
    pubDate: "2024-03-08",
    description: "Los parques temáticos incorporan experiencias de D&D en vivo para los visitantes.",
    imageUrl: "https://cdn.hobbyconsolas.com/sites/navi.axelspringer.es/public/media/image/2024/03/universal-dnd-3165432.jpg"
  },
  {
    title: "Si empezar en Dungeons & Dragons se te hace cuesta arriba, esta es la mejor hora para iniciarte en juegos de rol: Daggerheart",
    link: "https://www.3djuegos.com/fenomeno-fan/noticias/empezar-dungeons-dragons-se-te-hace-cuesta-arriba-a-mejor-hora-iniciarte-juegos-rol-daggerheart",
    pubDate: "2024-02-14",
    description: "Alternativas más accesibles para quienes quieren iniciarse en el mundo de los juegos de rol.",
    imageUrl: "https://i.blogs.es/6a7b8c/daggerheart/840_560.jpg"
  },
  {
    title: "Consejos para dirigir tu primera partida de Dragones y Mazmorras",
    link: "https://www.lascosasquenoshacenfelices.com/consejos-para-dirigir-tu-primera-partida-de-rol-de-dragones-y-mazmorras/",
    pubDate: "2024-01-30",
    description: "Guía práctica para nuevos Dungeon Masters que se enfrentan a su primera aventura.",
    imageUrl: "https://www.lascosasquenoshacenfelices.com/wp-content/uploads/2024/01/dnd-dm-tips.jpg"
  },
  {
    title: "Dungeons & Dragons le debe mucho a Stranger Things: así devuelve el favor el famoso juego de rol",
    link: "https://www.3djuegos.com/fenomeno-fan/noticias/dungeons-dragons-le-debe-mucho-a-stranger-things-asi-devuelve-favor-famoso-juego-rol",
    pubDate: "2024-03-01",
    description: "Cómo Stranger Things revitalizó el interés por D&D y las colaboraciones resultantes.",
    imageUrl: "https://i.blogs.es/4a3b2c/stranger-things-dnd/840_560.jpg"
  },
  {
    title: "He jugado una partida de rol con ChatGPT y se ha montado una película digna de un Oscar",
    link: "https://www.xataka.com/robotica-e-ia/he-jugado-partida-rol-chatgpt-se-ha-montado-pelicula-digna-oscar",
    pubDate: "2024-02-05",
    description: "Experiencia usando IA para dirigir partidas de rol y los sorprendentes resultados.",
    imageUrl: "https://i.blogs.es/3a4b5c/chatgpt-dnd/840_560.jpg"
  },
  {
    title: "5 juegos inspirados en Dungeons and Dragons que merecen mucha pena",
    link: "https://www.hobbyconsolas.com/noticias/5-juegos-inspirados-dungeons-and-dragons-merecen-mucho-pena-1449600",
    pubDate: "2024-01-25",
    description: "Una selección de títulos que han bebido de la influencia de D&D en su diseño.",
    imageUrl: "https://cdn.hobbyconsolas.com/sites/navi.axelspringer.es/public/media/image/2024/01/dnd-inspired-games-3154321.jpg"
  }
];

// Datos de noticias predefinidas para Magic: The Gathering
const magicNews = [
  {
    title: "Nueva expansión de Magic: The Gathering rompe récords de ventas",
    link: "https://example.com/magic-news-1",
    pubDate: "2024-03-15",
    description: "La última expansión supera todas las expectativas con mecánicas innovadoras.",
    imageUrl: "https://cdn.hobbyconsolas.com/sites/navi.axelspringer.es/public/media/image/2023/04/magic-new-set-3012345.jpg"
  },
  {
    title: "Torneo Mundial de Magic anuncia cambios en formato para 2024",
    link: "https://example.com/magic-news-2",
    pubDate: "2024-03-10",
    description: "Nuevos formatos y reglas buscan hacer más competitivo el torneo mundial.",
    imageUrl: "https://i.blogs.es/1a2b3c/magic-tournament/840_560.jpg"
  },
  {
    title: "Magic Arena introduce modo cooperativo inédito",
    link: "https://example.com/magic-news-3",
    pubDate: "2024-03-05",
    description: "Por primera vez, jugadores podrán unir fuerzas en Magic Arena.",
    imageUrl: "https://cdn.hobbyconsolas.com/sites/navi.axelspringer.es/public/media/image/2024/03/magic-arena-coop-3165432.jpg"
  },
  {
    title: "Coleccionistas pagan fortuna por carta rara de Magic",
    link: "https://example.com/magic-news-4",
    pubDate: "2024-02-28",
    description: "Una Black Lotus en perfecto estado alcanza precio récord en subasta.",
    imageUrl: "https://i.blogs.es/4d5e6f/black-lotus/840_560.jpg"
  },
  {
    title: "Crossover inesperado: Magic se une a franquicia de anime",
    link: "https://example.com/magic-news-5",
    pubDate: "2024-02-20",
    description: "Sorprendente colaboración trae personajes de anime al multiverso de Magic.",
    imageUrl: "https://cdn.hobbyconsolas.com/sites/navi.axelspringer.es/public/media/image/2024/02/magic-anime-3156789.jpg"
  },
  {
    title: "Nuevo formato Limited revoluciona modo draft",
    link: "https://example.com/magic-news-6",
    pubDate: "2024-02-15",
    description: "Cambios significativos en el formato Limited buscan mayor equilibrio.",
    imageUrl: "https://i.blogs.es/7e8f9a/magic-draft/840_560.jpg"
  },
  {
    title: "Magic: The Gathering celebra 30 años con edición especial",
    link: "https://example.com/magic-news-7",
    pubDate: "2024-02-10",
    description: "Edición conmemorativa incluye cartas retro y arte exclusivo.",
    imageUrl: "https://cdn.hobbyconsolas.com/sites/navi.axelspringer.es/public/media/image/2024/02/magic-30th-3154321.jpg"
  },
  {
    title: "Pro player revela mazo secreto que domina el meta actual",
    link: "https://example.com/magic-news-8",
    pubDate: "2024-02-05",
    description: "Estrategia innovadora cambia el panorama competitivo del juego.",
    imageUrl: "https://i.blogs.es/a1b2c3/magic-meta/840_560.jpg"
  },
  {
    title: "Magic conquista nuevos mercados con lanzamiento en idiomas adicionales",
    link: "https://example.com/magic-news-9",
    pubDate: "2024-01-30",
    description: "Expansión global acerca el juego a nuevas audiencias internacionales.",
    imageUrl: "https://cdn.hobbyconsolas.com/sites/navi.axelspringer.es/public/media/image/2024/01/magic-languages-3145678.jpg"
  },
  {
    title: "App oficial de Magic mejora experiencia para jugadores casuales",
    link: "https://example.com/magic-news-10",
    pubDate: "2024-01-25",
    description: "Actualización enfocada en hacer el juego más accesible para nuevos jugadores.",
    imageUrl: "https://i.blogs.es/d4e5f6/magic-app/840_560.jpg"
  }
];

document.addEventListener("DOMContentLoaded", () => {
  const newsContainer = document.getElementById("news-container");
  const loadingSpinner = document.getElementById("loading-spinner");
  const errorMessage = document.getElementById("error-message");
  
  // Determinar qué noticias mostrar según la página actual
  const isDnDPage = window.location.pathname.includes('novedades_DnD');
  const currentNews = isDnDPage ? dndNews : magicNews;
  
  // Función para mostrar las noticias en el DOM
  function displayNews(news) {
    if (loadingSpinner) loadingSpinner.classList.add("d-none");
    
    if (!news || news.length === 0) {
      newsContainer.innerHTML = `
        <div class="col-12 text-center">
          <p>No se encontraron noticias recientes.</p>
        </div>
      `;
      return;
    }
    
    newsContainer.innerHTML = news.map(item => `
      <div class="col">
        <div class="card h-100 news-card">
          <div class="news-header">
            <i class="fa-solid fa-newspaper fa-2xl icon"></i>
          </div>
          <div class="card-body d-flex flex-column">
            <h5 class="card-title news-title">${item.title}</h5>
            <p class="card-text news-desc flex-grow-1">${item.description}</p>
            <div class="d-flex justify-content-between align-items-center mt-auto">
              <small class="text-body-secondary news-meta">${item.pubDate}</small>
              <a href="${item.link}" target="_blank" class="btn btn-sm btn-outline-primary">Leer más</a>
            </div>
          </div>
        </div>
      </div>
    `).join('');
  }
  
  // Mostrar noticias inmediatamente
  displayNews(currentNews);
  
  // También intentar obtener noticias en tiempo real como respaldo
  async function fetchLiveNews() {
    try {
      const query = isDnDPage ? "Dungeons%20and%20Dragons" : "Magic%3A%20The%20Gathering";
      const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
      const targetUrl = `https://news.google.com/rss/search?q=${query}&hl=es-419&gl=AR&ceid=AR%3Aes-419`;
      
      const response = await fetch(proxyUrl + targetUrl);
      
      if (response.ok) {
        const xmlText = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, "text/xml");
        
        const items = xmlDoc.querySelectorAll("item");
        const liveNews = [];
        
        for (let i = 0; i < Math.min(items.length, 5); i++) {
          const item = items[i];
          const title = item.querySelector("title").textContent;
          const link = item.querySelector("link").textContent;
          const pubDate = item.querySelector("pubDate").textContent;
          
          liveNews.push({
            title,
            link,
            pubDate: new Date(pubDate).toLocaleDateString('es-ES'),
            description: "Noticia reciente sobre " + (isDnDPage ? "Dungeons & Dragons" : "Magic: The Gathering"),
            imageUrl: null
          });
        }
        
        // Combinar noticias predefinidas con noticias en vivo
        const combinedNews = [...currentNews, ...liveNews].slice(0, 16);
        displayNews(combinedNews);
      }
    } catch (error) {
      console.error("Error al obtener noticias en vivo:", error);
      // Mantener las noticias predefinidas si hay error
    }
  }
  
  // Intentar cargar noticias en vivo (opcional)
  fetchLiveNews();
});