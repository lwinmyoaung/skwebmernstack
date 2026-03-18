import { Link } from 'react-router-dom';
import { Home, AlertCircle, ChevronLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full"></div>
          <AlertCircle size={120} className="text-primary relative z-10 mx-auto" strokeWidth={1} />
        </div>
        
        <div className="space-y-4">
          <h1 className="text-6xl font-black text-white tracking-tighter">404</h1>
          <h2 className="text-2xl font-black text-white uppercase tracking-widest gold-text-gradient">Battlefield Not Found</h2>
          <p className="text-gray-500 font-medium leading-relaxed">
            The page or game you are looking for has been moved, deactivated, or does not exist in our current collection.
          </p>
        </div>

        <div className="pt-8">
          <Link 
            to="/" 
            className="luxury-button inline-flex items-center gap-3 px-8 py-4 rounded-2xl group"
          >
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-black uppercase tracking-widest text-sm">Return to Base</span>
          </Link>
        </div>

        <div className="pt-12 flex items-center justify-center gap-3">
          <div className="w-12 h-[1px] bg-white/5"></div>
          <span className="text-[10px] font-black text-gray-700 uppercase tracking-[0.3em]">Skin Collector Elite</span>
          <div className="w-12 h-[1px] bg-white/5"></div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
