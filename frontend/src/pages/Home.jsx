import { Link } from 'react-router-dom';
import { Smartphone, Eye, ShoppingCart, ChevronRight, Zap, Trophy, ShieldCheck, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';

const GameCard = ({ game, getImageUrl }) => {
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState({});

  useEffect(() => {
    if (game.images && game.images.length > 1) {
      const timer = setInterval(() => {
        setCurrentImgIndex((prev) => (prev + 1) % game.images.length);
      }, 3000 + Math.random() * 2000);
      return () => clearInterval(timer);
    }
  }, [game.images]);

  const handleImageLoad = (idx) => {
    setImagesLoaded(prev => ({ ...prev, [idx]: true }));
  };

  return (
    <Link 
      to={`/game/${game.id}`}
      className="group relative h-[200px] md:h-[450px] luxury-card overflow-hidden flex flex-col border-white/5 hover:border-primary/30"
    >
      {/* Badge */}
      {game.badge && (
        <div className="absolute top-3 left-3 md:top-6 md:left-6 z-20">
          <span className="bg-primary text-black text-[8px] md:text-[10px] font-black px-2 md:px-4 py-1 md:py-1.5 rounded-full uppercase tracking-widest shadow-xl border border-white/20">
            {game.badge}
          </span>
        </div>
      )}
      
      {/* Image Container with Slideshow */}
      <div className="relative h-full w-full overflow-hidden bg-white/5">
        {game.images.map((img, idx) => (
          <div key={idx} className={`absolute inset-0 transition-all duration-1000 ease-in-out ${idx === currentImgIndex ? 'opacity-100 scale-110 rotate-1' : 'opacity-0 scale-100 rotate-0'}`}>
            {!imagesLoaded[idx] && (
              <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
            )}
            <img 
              src={getImageUrl(img)} 
              alt={`${game.name} ${idx}`} 
              loading="lazy"
              decoding="async"
              onLoad={() => handleImageLoad(idx)}
              className={`w-full h-full object-cover transition-opacity duration-500 ${imagesLoaded[idx] ? 'opacity-100' : 'opacity-0'}`}
            />
          </div>
        ))}
        {/* Overlay Gradients */}
        <div className={`absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-black transition-opacity duration-500`}></div>
        <div className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-40 group-hover:opacity-60 transition-opacity duration-500`}></div>
      </div>

      {/* Info Container */}
      <div className="absolute bottom-0 left-0 w-full p-4 md:p-8 z-10 translate-y-2 md:translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
        <div className="hidden md:flex items-center gap-2 mb-3">
          <Smartphone size={14} className="text-primary" />
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Instant Top-up</span>
        </div>
        <h3 className="text-lg md:text-3xl font-black text-white mb-2 md:mb-6 leading-none tracking-tighter group-hover:gold-text-gradient transition-all duration-500">{game.name}</h3>
        
        <div className="flex items-center justify-between pt-3 md:pt-6 border-t border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100">
          <span className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest">Shop Now</span>
          <div className="w-6 h-6 md:w-10 md:h-10 rounded-full bg-primary flex items-center justify-center text-black shadow-[0_0_20px_rgba(212,175,55,0.4)]">
            <ShoppingCart size={12} className="md:w-[18px] md:h-[18px]" />
          </div>
        </div>
      </div>
    </Link>
  );
};

function Home() {
  const API_BASE = API_URL;
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState([]);
  const [gameImages, setGameImages] = useState([]);
  const [activeGames, setActiveGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [slidesRes, gameImagesRes, gamesRes] = await Promise.all([
          axios.get(`${API_BASE}/api/v1/slideshows`),
          axios.get(`${API_BASE}/api/v1/game-images`),
          axios.get(`${API_BASE}/api/v1/games`)
        ]);

        if (slidesRes.data.success && slidesRes.data.data.length > 0) {
          setSlides(slidesRes.data.data);
        } else {
          setSlides([
            { image: '/adminimages/ads/slides/BamR8QemjnTKb0V3S6Ki1CeMgJcR52rmevzDJuDX.png' },
            { image: '/adminimages/ads/slides/OOQ8ifGjUv1VKxq4sWPsAJcU8qfrRvhrEzDs1C11.jpg' },
            { image: '/adminimages/ads/slides/yjspOcki7jMtVj1omqxhFZlI6RZH8Iq3tNEOyjZI.jpg' },
          ]);
        }

        if (gameImagesRes.data.success) {
          setGameImages(gameImagesRes.data.data);
        }

        if (gamesRes.data.success && gamesRes.data.data.length > 0) {
          setActiveGames(gamesRes.data.data);
        } else {
          // Fallback to hardcoded games if DB is empty
          setActiveGames([
            { gameId: 'mlbb', name: 'Mobile Legends', defaultImage: '/adminimages/photo/1BcdDv9B90JnlajqQvQaO3PBabTVre9U7A87diA1.jpg', badge: 'MOST POPULAR', color: 'from-blue-600/20 to-primary/20' },
            { gameId: 'mcgg', name: 'Magic Chess GoGo', defaultImage: '/adminimages/photo/dmGEycfKf49L9fK6E64aG4CTBDCv9CnPw7eWA5V1.png', badge: 'NEW', color: 'from-purple-600/20 to-primary/20' },
            { gameId: 'pubg', name: 'PUBG Mobile', defaultImage: '/adminimages/photo/mjOPd1akM06euiAdpG1vhTnwREEX8UbAJrez2Phv.jpg', badge: 'HOT', color: 'from-orange-600/20 to-primary/20' },
            { gameId: 'wwm', name: 'WWM', defaultImage: '/adminimages/photo/z7SRsbBx9OlAo35d30jtryRHuvPkaAxCeWFeD1vf.jpg', badge: 'TRENDING', color: 'from-red-600/20 to-primary/20' },
          ]);
        }
      } catch (err) {
        console.error('Error fetching home data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getGameImagesForCategory = (gameId, defaultImages) => {
    const filtered = gameImages.filter(img => img.gameId === gameId);
    if (filtered.length > 0) {
      return filtered.map(img => img.image);
    }
    return defaultImages;
  };

  useEffect(() => {
    if (slides.length > 0) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 6000);
      return () => clearInterval(timer);
    }
  }, [slides]);

  const getImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http') || path.startsWith('data:')) return path;
    if (path.startsWith('/adminimages')) return path; // Served by frontend
    return `${API_BASE}${path}`; // Served by backend (e.g. /uploads)
  };

  return (
    <div>
      {/* Hero Section with Luxury Carousel */}
      <div className="container mx-auto px-4 mb-20">
        <div className="relative h-[250px] md:h-[450px] lg:h-[550px] rounded-[2.5rem] overflow-hidden group shadow-[0_30px_60px_rgba(0,0,0,0.8)] border border-white/5">
          {slides.length > 0 ? (
            slides.map((slide, index) => (
              <div 
                key={index}
                className={`absolute inset-0 transition-all duration-1000 ease-in-out transform ${index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
              >
                {slide.link ? (
                  <Link to={slide.link}>
                    <img src={getImageUrl(slide.image)} alt={slide.title || `Promotion ${index + 1}`} loading="lazy" className="w-full h-full object-cover" />
                  </Link>
                ) : (
                  <img src={getImageUrl(slide.image)} alt={slide.title || `Promotion ${index + 1}`} loading="lazy" className="w-full h-full object-cover" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent pointer-events-none"></div>
              </div>
            ))
          ) : (
            <div className="w-full h-full bg-white/5 animate-pulse flex items-center justify-center">
              <RefreshCw className="animate-spin text-primary/20" size={64} />
            </div>
          )}
          
          {/* Hero Overlay Content */}
          <div className="absolute bottom-12 left-8 md:left-16 z-10 max-w-2xl">
            <div className="flex items-center gap-3 mb-4 animate-in fade-in slide-in-from-left-4 duration-700">
              <span className="bg-primary text-black text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-[0_0_15px_rgba(212,175,55,0.5)]">Official Partner</span>
              <span className="text-white/60 text-[10px] font-bold uppercase tracking-widest">Premium Digital Store</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-none tracking-tighter animate-in fade-in slide-in-from-left-6 duration-1000">
              {slides[currentSlide]?.title || (
                <>LEVEL UP YOUR <br /> <span className="gold-text-gradient">GAMING EXPERIENCE</span></>
              )}
            </h1>
          </div>

          {/* Carousel Indicators */}
          <div className="absolute bottom-8 right-12 flex gap-3 z-20">
            {slides.map((_, index) => (
              <button 
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-1.5 transition-all duration-500 rounded-full ${index === currentSlide ? 'w-12 bg-primary shadow-[0_0_10px_rgba(212,175,55,0.8)]' : 'w-4 bg-white/20 hover:bg-white/40'}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Features Bar */}
      <div className="hidden md:block container mx-auto px-4 my-32">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="luxury-card p-8 flex items-center gap-6 group">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-black transition-all duration-500 shadow-inner">
              <Zap size={32} />
            </div>
            <div>
              <h3 className="text-xl font-black text-white mb-1 uppercase tracking-tight">Instant Delivery</h3>
              <p className="text-sm text-gray-500 font-medium leading-relaxed">Automated system for 24/7 instant top-ups.</p>
            </div>
          </div>
          <div className="luxury-card p-8 flex items-center gap-6 group">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-black transition-all duration-500 shadow-inner">
              <ShieldCheck size={32} />
            </div>
            <div>
              <h3 className="text-xl font-black text-white mb-1 uppercase tracking-tight">Secure Payments</h3>
              <p className="text-sm text-gray-500 font-medium leading-relaxed">Trusted by thousands of premium gamers.</p>
            </div>
          </div>
          <div className="luxury-card p-8 flex items-center gap-6 group">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-black transition-all duration-500 shadow-inner">
              <Trophy size={32} />
            </div>
            <div>
              <h3 className="text-xl font-black text-white mb-1 uppercase tracking-tight">Best Pricing</h3>
              <p className="text-sm text-gray-500 font-medium leading-relaxed">Competitive rates with VIP rewards.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Games Section */}
      <div className="container mx-auto px-4 mb-32 md:mb-48">
        <div className="hidden md:flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="w-12 h-1 bg-primary rounded-full"></span>
              <span className="text-primary font-black uppercase tracking-[0.3em] text-xs">Premium Collection</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter">SELECT YOUR <span className="gold-text-gradient">BATTLEFIELD</span></h2>
          </div>
          <Link to="/games" className="text-primary hover:text-white font-bold text-sm flex items-center gap-2 transition-all group uppercase tracking-widest border-b border-primary/20 pb-2">
            View All Games <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          {activeGames.map((game) => (
            <GameCard 
              key={game.gameId} 
              game={{
                ...game,
                id: game.gameId,
                images: getGameImagesForCategory(game.gameId, [game.defaultImage])
              }} 
              getImageUrl={getImageUrl} 
            />
          ))}
        </div>
      </div>

      {/* Newsletter/CTA Section */}
      <div className="hidden md:block container mx-auto px-4 mt-32 md:mt-64">
        <div className="relative rounded-[3rem] overflow-hidden p-16 md:p-24 text-center border border-white/10 shadow-2xl">
          <div className="absolute inset-0 bg-dark-soft"></div>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/10 blur-[100px] rounded-full"></div>
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-primary/10 blur-[100px] rounded-full"></div>
          
          <div className="relative z-10 max-w-3xl mx-auto">
            <Trophy size={64} className="text-primary mx-auto mb-8 animate-bounce duration-[3000ms]" />
            <h2 className="text-4xl md:text-6xl font-black text-white mb-8 leading-none tracking-tighter">JOIN THE <span className="gold-text-gradient">VIP ELITE</span></h2>
            <p className="text-lg text-gray-400 mb-12 font-medium leading-relaxed">Get exclusive access to VIP-only pricing, priority instant delivery, and dedicated 24/7 support. Elevate your gaming status today.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="luxury-button px-12 py-5 text-lg">CREATE VIP ACCOUNT</Link>
              <Link to="/about" className="bg-white/5 hover:bg-white/10 text-white px-12 py-5 rounded-2xl font-bold text-lg transition-all border border-white/10">LEARN MORE</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
