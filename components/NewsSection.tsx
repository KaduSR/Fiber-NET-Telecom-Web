import React, { useState, useEffect, useRef } from 'react';
import { ExternalLink, Newspaper, RefreshCw, Search, X, Wifi, Image as ImageIcon } from 'lucide-react';
import Button from './Button';

// Interface for our internal news structure
interface NewsArticle {
  id: string | number;
  title: string;
  excerpt: string;
  link: string;
  date: string;
  timestamp: number; // For sorting
  imageUrl: string;
  source: string;
}

// Palavras que, se estiverem no título, a notícia será ignorada (Filtro de Spam/Comércio)
const BLOCKED_TERMS = [
    'cupom', 'oferta', 'desconto', 'promoção', 'barato', 'menor preço', 'comprar', 
    'leroy', 'merlin', 'amazon', 'shopee', 'magalu', 'magazine', 'achados', 'imperdível',
    'frete grátis', 'cashback', 'horóscopo', 'signo', 'bbb', 'fofoca', 'resumo da novela'
];

// RSS Feeds confiáveis
const RSS_SOURCES = [
    { url: 'https://g1.globo.com/rss/g1/tecnologia/', name: 'G1 Globo' },
    { url: 'https://olhardigital.com.br/rss', name: 'Olhar Digital' },
    { url: 'https://rss.tecmundo.com.br/feed', name: 'TecMundo' },
    { url: 'https://adrenaline.com.br/rss', name: 'Adrenaline' }
];

// CACHE KEY ATUALIZADA (Limpeza de Cache)
const CACHE_KEY = 'fiber_news_v2025_mascot_restore'; 

// === SUB-COMPONENT PARA IMAGEM OTIMIZADA ===
const NewsImage: React.FC<{ src: string; alt: string }> = ({ src, alt }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [imgSrc, setImgSrc] = useState(src);

    // Reset state if src changes (recycling list items)
    useEffect(() => {
        setImgSrc(src);
        setIsLoading(true);
        setHasError(false);
    }, [src]);

    const handleError = () => {
        if (!hasError) {
            setHasError(true);
            // Fallback genérico de tecnologia
            setImgSrc('https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop');
            setIsLoading(false); // Remove loader even on error
        }
    };

    return (
        <div className="relative h-40 overflow-hidden bg-neutral-900 group-hover:opacity-100">
            {/* Placeholder Skeleton */}
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/5 animate-pulse z-10">
                    <ImageIcon size={24} className="text-white/10" />
                </div>
            )}

            <img 
                src={imgSrc} 
                alt={alt} 
                loading="lazy" 
                decoding="async"
                className={`w-full h-full object-cover transition-all duration-700 ease-out transform
                    ${isLoading ? 'opacity-0 scale-105' : 'opacity-90 group-hover:opacity-100 group-hover:scale-105'}
                `}
                onLoad={() => setIsLoading(false)}
                onError={handleError}
            />
            
            {/* Gradiente de sobreposição estética */}
            <div className="absolute inset-0 bg-gradient-to-t from-fiber-card via-transparent to-transparent opacity-60 pointer-events-none"></div>
        </div>
    );
};

const NewsSection: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // === OTIMIZAÇÃO DE PERFORMANCE: LAZY STATE INITIALIZATION ===
  // Carrega do cache IMEDIATAMENTE na inicialização
  const [news, setNews] = useState<NewsArticle[]>(() => {
      try {
          const cached = localStorage.getItem(CACHE_KEY);
          if (cached) {
              const { data } = JSON.parse(cached);
              return Array.isArray(data) ? data : [];
          }
      } catch (e) {
          console.warn('News cache error');
      }
      return [];
  });

  // Se já temos notícias do cache (news.length > 0), não mostramos loading
  const [loading, setLoading] = useState(news.length === 0);
  const [isBackgroundUpdating, setIsBackgroundUpdating] = useState(false);
  
  const abortControllerRef = useRef<AbortController | null>(null);

  const saveToCache = (articles: NewsArticle[]) => {
      try {
          localStorage.setItem(CACHE_KEY, JSON.stringify({
              data: articles,
              timestamp: Date.now()
          }));
      } catch (e) {
          console.warn('News cache full', e);
      }
  };

  const fetchNews = async (forceRefresh = false) => {
    if (forceRefresh) {
        setLoading(true);
    } else {
        // Se já temos notícias, mostramos indicador de fundo, senão loading principal
        if (news.length > 0) setIsBackgroundUpdating(true);
        else setLoading(true);
    }

    if (abortControllerRef.current) {
        abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
        const promises = RSS_SOURCES.map(source => 
            fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(source.url)}`, {
                signal: controller.signal
            })
            .then(res => res.ok ? res.json() : null)
            .then(data => ({ status: 'ok' as const, items: data?.items || [], sourceName: source.name }))
            .catch(err => ({ status: 'error' as const, sourceName: source.name, error: err }))
        );

        const results = await Promise.all(promises);
        
        if (controller.signal.aborted) return;

        let allArticles: NewsArticle[] = [];
        const processedLinks = new Set<string>();

        results.forEach((result) => {
            if (result.status === 'ok') {
                const recentItems = result.items.slice(0, 6);

                const sourceArticles = recentItems.map((item: any, index: number) => {
                    if (processedLinks.has(item.link)) return null;
                    
                    const lowerTitle = (item.title || '').toLowerCase();
                    if (BLOCKED_TERMS.some(term => lowerTitle.includes(term))) return null;

                    let img = item.enclosure?.link || item.thumbnail;
                    if (!img) {
                        const imgMatch = item.description?.match(/src="([^"]+)"/);
                        if (imgMatch?.[1]) img = imgMatch[1];
                    }
                    if (!img || img.includes('placeholder')) {
                        img = `https://source.unsplash.com/800x600/?technology,internet,network&sig=${index}`;
                    }

                    const plainTextDesc = (item.description || '').replace(/<[^>]+>/g, '');
                    const pubDate = new Date(item.pubDate.replace(/-/g, '/')); 

                    const article: NewsArticle = {
                        id: `${result.sourceName}-${index}-${Math.random().toString(36).substr(2, 5)}`,
                        title: item.title,
                        excerpt: plainTextDesc.substring(0, 100) + '...',
                        link: item.link,
                        date: isNaN(pubDate.getTime()) ? 'Recente' : pubDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
                        timestamp: isNaN(pubDate.getTime()) ? Date.now() : pubDate.getTime(),
                        imageUrl: img,
                        source: result.sourceName
                    };

                    processedLinks.add(item.link);
                    return article;
                }).filter((article: any): article is NewsArticle => article !== null);

                allArticles = [...allArticles, ...sourceArticles];
            }
        });

        allArticles.sort((a, b) => b.timestamp - a.timestamp);
        const finalNews = allArticles.slice(0, 12);

        if (finalNews.length > 0) {
            setNews(finalNews);
            saveToCache(finalNews);
        } else if (news.length === 0) {
            // Se falhou tudo e não temos nada, usa fallback
            setNews(FALLBACK_NEWS);
        }

    } catch (error: any) {
        if (error.name !== 'AbortError') {
            console.warn('Background fetch warning:', error);
            if (news.length === 0) setNews(FALLBACK_NEWS);
        }
    } finally {
        if (!controller.signal.aborted) {
            setLoading(false);
            setIsBackgroundUpdating(false);
        }
    }
  };

  useEffect(() => {
    fetchNews();
    return () => {
        if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  const filteredNews = news.filter(item => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return item.title.toLowerCase().includes(query) || 
           item.source.toLowerCase().includes(query);
  });

  return (
    <div className="bg-fiber-dark min-h-screen pt-24">
       <div className="bg-fiber-card py-12 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-fiber-orange/10 rounded-full text-fiber-orange mb-6">
             <Newspaper size={32} />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Portal de <span className="text-fiber-orange">Notícias</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Tecnologia e conectividade em tempo real.
          </p>
          
          {isBackgroundUpdating && (
            <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full bg-fiber-blue/10 text-fiber-blue text-xs border border-fiber-blue/20 animate-pulse">
               <Wifi size={12} className="mr-2" /> Atualizando feed...
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div className="relative w-full md:w-96 group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                    <Search size={18} />
                </div>
                <input 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filtrar notícias..."
                    className="w-full h-10 pl-10 pr-10 bg-neutral-900 border border-white/10 rounded-lg text-white text-sm focus:border-fiber-orange focus:ring-1 focus:ring-fiber-orange transition-all"
                />
                {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute inset-y-0 right-0 pr-3 text-gray-500 hover:text-white">
                        <X size={14} />
                    </button>
                )}
            </div>

            <button 
                onClick={() => fetchNews(true)} 
                disabled={loading || isBackgroundUpdating}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-sm transition-colors border border-white/5"
            >
                <RefreshCw size={14} className={loading || isBackgroundUpdating ? 'animate-spin' : ''} />
                {loading ? 'Carregando...' : 'Atualizar'}
            </button>
        </div>

        {/* Skeleton Loading apenas se não houver NENHUMA notícia (nem cache, nem fetch) */}
        {loading && news.length === 0 ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {[1,2,3,4,5,6].map(i => (
                     <div key={i} className="h-96 bg-neutral-900 rounded-xl border border-white/5 animate-pulse flex flex-col">
                        <div className="h-40 bg-white/5 w-full"></div>
                        <div className="p-5 space-y-3 flex-grow">
                            <div className="h-4 bg-white/10 rounded w-1/3"></div>
                            <div className="h-6 bg-white/10 rounded w-3/4"></div>
                            <div className="h-4 bg-white/5 rounded w-full"></div>
                            <div className="h-4 bg-white/5 rounded w-2/3"></div>
                        </div>
                     </div>
                 ))}
             </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
            {filteredNews.map((item) => (
                <article 
                key={item.id} 
                className="bg-fiber-card border border-white/10 rounded-xl overflow-hidden flex flex-col hover:border-fiber-orange/30 transition-all duration-300 group h-full"
                >
                {/* Componente de Imagem Otimizado */}
                <NewsImage src={item.imageUrl} alt={item.title} />

                <div className="p-5 flex-grow flex flex-col">
                    <div className="flex items-center gap-2 text-[10px] text-gray-500 mb-2 uppercase tracking-wider font-bold">
                        <span className="text-fiber-orange">{item.source}</span>
                        <span>•</span>
                        <span>{item.date}</span>
                    </div>
                    
                    <h2 className="text-base font-bold text-white mb-2 leading-snug group-hover:text-fiber-orange transition-colors line-clamp-2">
                        {item.title}
                    </h2>
                    
                    <p className="text-gray-400 text-xs mb-4 flex-grow line-clamp-3 leading-relaxed">
                        {item.excerpt}
                    </p>

                    <Button 
                        variant="outline" 
                        fullWidth 
                        onClick={() => window.open(item.link, '_blank')}
                        className="mt-auto !text-xs !py-2 group-hover:bg-neutral-800 border-neutral-700"
                    >
                        Ler Completa <ExternalLink size={12} className="ml-2" />
                    </Button>
                </div>
                </article>
            ))}
            </div>
        )}

        {!loading && filteredNews.length === 0 && (
             <div className="text-center py-20">
                 <p className="text-gray-400">Nenhuma notícia encontrada.</p>
             </div>
        )}
      </div>
    </div>
  );
};

const FALLBACK_NEWS: NewsArticle[] = [
  {
    id: 1,
    title: 'Anatel intensifica combate à pirataria digital',
    excerpt: 'Novas medidas visam proteger a qualidade da rede e a segurança dos usuários de banda larga.',
    date: 'Hoje',
    timestamp: Date.now(),
    source: 'Tecnologia',
    imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=600&auto=format&fit=crop',
    link: '#'
  }
];

export default NewsSection;