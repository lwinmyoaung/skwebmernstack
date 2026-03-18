import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import { 
  Video, 
  RefreshCw, 
  ChevronLeft,
  Play,
  HelpCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HowToUse = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/v1/how-to-use`);
        setItems(res.data.data);
      } catch (err) {
        console.error('Error fetching tutorials', err);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  const getFullVideoUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http') || path.startsWith('data:')) return path;
    return `${API_URL}${path}`;
  };

  return (
    <div className="container mx-auto px-4 pb-32 max-w-5xl animate-in fade-in duration-700">
      <div className="sticky top-[73px] lg:top-[105px] z-[100] bg-black/80 backdrop-blur-xl py-6 -mx-4 px-4 mb-12 border-b border-white/5 flex items-center gap-6 shadow-2xl">
        <button 
          onClick={() => navigate(-1)} 
          className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all text-gray-400 border border-white/10"
        >
          <ChevronLeft size={24} />
        </button>
        <div>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase leading-none">How To <span className="gold-text-gradient">Use</span></h1>
          <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-[10px] mt-2 flex items-center gap-2">
            <HelpCircle size={12} className="text-primary" /> Step-by-step tutorial guide
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-6">
          <RefreshCw className="animate-spin text-primary" size={48} />
          <p className="text-gray-500 font-black uppercase tracking-widest text-xs">Loading Tutorials...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="luxury-card p-20 text-center space-y-6">
          <Video size={64} className="text-gray-800 mx-auto" />
          <p className="text-gray-500 font-black uppercase tracking-widest text-xs">No tutorials available at the moment.</p>
        </div>
      ) : (
        <div className="space-y-12">
          {items.map((item, index) => (
            <div key={item._id} className="luxury-card overflow-hidden group">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden border-b lg:border-b-0 lg:border-r border-white/5">
                  {item.videoUrl.startsWith('/uploads/') ? (
                    <video 
                      src={getFullVideoUrl(item.videoUrl)} 
                      className="w-full h-full object-cover"
                      controls
                      poster="/adminimages/logo/skincollector.jpg"
                    />
                  ) : (
                    <div className="w-full h-full p-4 flex flex-col items-center justify-center bg-white/[0.02]">
                       {/* If it's a YouTube link, we could embed it here, but for now just show a link or message */}
                       <a 
                        href={item.videoUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex flex-col items-center gap-4 text-center group/link"
                       >
                        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover/link:scale-110 group-hover/link:bg-primary group-hover/link:text-black transition-all shadow-2xl">
                          <Play size={32} />
                        </div>
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest group-hover/link:text-white transition-colors">Watch External Video</p>
                       </a>
                    </div>
                  )}
                </div>
                <div className="p-8 md:p-12 flex flex-col justify-center space-y-6">
                  <div className="flex items-center gap-4">
                    <span className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center font-black text-xl shadow-inner border border-primary/20">
                      {index + 1}
                    </span>
                    <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight leading-none">{item.title}</h2>
                  </div>
                  <p className="text-gray-400 text-sm md:text-lg leading-relaxed font-medium">
                    {item.description}
                  </p>
                  <div className="pt-6 border-t border-white/5 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Premium Tutorial Guide</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HowToUse;
