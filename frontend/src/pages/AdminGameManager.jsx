import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import { 
  ArrowLeft, 
  RefreshCw, 
  Eye, 
  EyeOff, 
  Gamepad2, 
  Settings,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminGameManager = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/v1/games/admin`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGames(res.data.data);
    } catch (err) {
      console.error('Error fetching games', err);
    } finally {
      setLoading(false);
    }
  };

  const initializeDefaultGames = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const defaults = [
        { gameId: 'mlbb', name: 'Mobile Legends', defaultImage: '/adminimages/photo/1BcdDv9B90JnlajqQvQaO3PBabTVre9U7A87diA1.jpg', badge: 'MOST POPULAR', color: 'from-blue-600/20 to-primary/20', order: 1 },
        { gameId: 'mcgg', name: 'Magic Chess GoGo', defaultImage: '/adminimages/photo/dmGEycfKf49L9fK6E64aG4CTBDCv9CnPw7eWA5V1.png', badge: 'NEW', color: 'from-purple-600/20 to-primary/20', order: 2 },
        { gameId: 'pubg', name: 'PUBG Mobile', defaultImage: '/adminimages/photo/mjOPd1akM06euiAdpG1vhTnwREEX8UbAJrez2Phv.jpg', badge: 'HOT', color: 'from-orange-600/20 to-primary/20', order: 3 },
        { gameId: 'wwm', name: 'WWM', defaultImage: '/adminimages/photo/z7SRsbBx9OlAo35d30jtryRHuvPkaAxCeWFeD1vf.jpg', badge: 'TRENDING', color: 'from-red-600/20 to-primary/20', order: 4 },
        { gameId: 'freefire', name: 'Free Fire', defaultImage: '/adminimages/photo/1BcdDv9B90JnlajqQvQaO3PBabTVre9U7A87diA1.jpg', badge: 'POPULAR', color: 'from-orange-600/20 to-primary/20', order: 5 },
      ];

      for (const game of defaults) {
        await axios.post(`${API_URL}/api/v1/games`, game, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      fetchGames();
    } catch (err) {
      console.error('Error initializing games', err);
      alert('Failed to initialize games');
    } finally {
      setLoading(false);
    }
  };

  const toggleGameStatus = async (game) => {
    setUpdating(game._id);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/api/v1/games/${game._id}`, {
        isActive: !game.isActive
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchGames();
    } catch (err) {
      console.error('Error updating game', err);
      alert('Failed to update game status');
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl pb-32">
      <div className="flex items-center gap-6 mb-12">
        <Link to="/admin" className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all text-gray-400 border border-white/10">
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Game <span className="gold-text-gradient">Manager</span></h1>
          <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-[10px] mt-1 text-left">Control visibility of game cards on home page</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="flex justify-center py-20">
            <RefreshCw className="animate-spin text-primary" size={48} />
          </div>
        ) : games.length === 0 ? (
          <div className="luxury-card p-20 text-center border-dashed border-white/10 space-y-8">
            <div className="space-y-4">
              <Gamepad2 size={64} className="text-gray-800 mx-auto mb-6" />
              <p className="text-gray-500 font-black uppercase tracking-widest text-xs">No games found in database.</p>
              <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest max-w-md mx-auto leading-relaxed">
                Initialize the default games to start managing visibility.
              </p>
            </div>
            <button 
              onClick={initializeDefaultGames}
              className="luxury-button px-10 py-4 flex items-center justify-center gap-3 mx-auto"
            >
              <RefreshCw size={20} />
              <span className="uppercase tracking-widest text-sm font-black">Initialize Default Games</span>
            </button>
          </div>
        ) : (
          games.map((game) => (
            <div key={game._id} className={`luxury-card overflow-hidden transition-all duration-500 ${!game.isActive ? 'opacity-60 grayscale' : ''}`}>
              <div className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-6 w-full md:w-auto">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border transition-all ${game.isActive ? 'bg-primary/10 border-primary/20 text-primary shadow-[0_0_20px_rgba(212,175,55,0.2)]' : 'bg-white/5 border-white/10 text-gray-500'}`}>
                    <Gamepad2 size={32} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tight">{game.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`w-2 h-2 rounded-full ${game.isActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                      <span className={`text-[10px] font-black uppercase tracking-widest ${game.isActive ? 'text-green-500' : 'text-red-500'}`}>
                        {game.isActive ? 'Visible to Users' : 'Hidden from Users'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                  <button
                    onClick={() => toggleGameStatus(game)}
                    disabled={updating === game._id}
                    className={`flex-1 md:flex-none flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all border ${
                      game.isActive 
                        ? 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500 hover:text-black' 
                        : 'bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500 hover:text-black'
                    }`}
                  >
                    {updating === game._id ? (
                      <RefreshCw size={18} className="animate-spin" />
                    ) : game.isActive ? (
                      <>
                        <EyeOff size={18} />
                        <span>Turn Off</span>
                      </>
                    ) : (
                      <>
                        <Eye size={18} />
                        <span>Turn On</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminGameManager;
