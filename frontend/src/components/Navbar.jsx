import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { User, LogOut, LayoutDashboard, Bell, Receipt, ChevronDown, Menu, X, ShoppingCart, Crown, Search, Home as HomeIcon, HelpCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import { getImageUrl } from '../utils/image';

const Navbar = () => {
  const { user, logout } = useAuth();
  const socket = useSocket();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [logo, setLogo] = useState(null);

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
    }
  }, [user]);

  useEffect(() => {
    fetchLogo();
  }, []);

  const fetchLogo = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/v1/logos`);
      if (res.data.success && res.data.data.length > 0) {
        setLogo(res.data.data[0]);
      }
    } catch (err) {
      console.error('Error fetching logo', err);
    }
  };

  useEffect(() => {
    if (socket) {
      socket.on('orderUpdated', () => {
        fetchUnreadCount();
      });
      socket.on('unreadCountChanged', () => {
        fetchUnreadCount();
      });
      return () => {
        socket.off('orderUpdated');
        socket.off('unreadCountChanged');
      };
    }
  }, [socket]);

  const fetchUnreadCount = async () => {
    const token = localStorage.getItem('token');
    if (!user || !token) {
      setUnreadCount(0);
      return;
    }
    try {
      const res = await axios.get(`${API_URL}/api/v1/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const unread = res.data.data.filter(m => !m.is_read).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error('Error fetching unread count', err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-[2000] bg-black/80 backdrop-blur-xl border-b border-white/5">
        {/* Top Bar - Subtle Luxury */}
        <div className="hidden lg:block bg-primary/5 text-primary-light py-1.5 text-[11px] uppercase tracking-[0.2em] font-bold">
          <div className="container mx-auto px-4 flex justify-between items-center">
            <div className="flex gap-6">
              <span className="flex items-center gap-2 opacity-80"><span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span> Exclusive Flash Sale Active</span>
              <span className="flex items-center gap-2 opacity-80"><span className="w-1.5 h-1.5 rounded-full bg-primary"></span> New Premium Games Added</span>
            </div>
            {user?.role === 'admin' && (
              <Link to="/admin" className="text-primary hover:text-white transition-colors flex items-center gap-2">
                <Crown size={12} /> Access Admin Dashboard
              </Link>
            )}
          </div>
        </div>

        {/* Main Header */}
        <div className="py-4">
          <div className="container mx-auto px-4 flex justify-between items-center gap-8">
            {/* Logo - Modern Luxury */}
            <Link to="/" className="flex items-center gap-4 group">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full group-hover:bg-primary/40 transition-all"></div>
                <img 
                  src={logo ? getImageUrl(logo.image) : "/uploads/logo/skincollector.jpg"} 
                  alt={logo ? logo.name : "Skins Collector"} 
                  loading="lazy"
                  className="relative w-12 h-12 rounded-xl object-cover border border-white/10 shadow-2xl transition-transform group-hover:scale-105"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black tracking-tighter text-white group-hover:gold-text-gradient transition-all">
                  SKINS<span className="text-primary group-hover:text-white transition-colors">COLLECTOR</span>
                </span>
                <span className="text-[10px] uppercase tracking-[0.3em] text-gray-500 font-bold -mt-1">Luxury Gaming Store</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              <Link to="/" className={`text-sm font-bold uppercase tracking-widest transition-colors ${location.pathname === '/' ? 'text-primary' : 'text-gray-400 hover:text-white'}`}>Home</Link>
              <Link to="/how-to-use" className={`text-sm font-bold uppercase tracking-widest flex items-center gap-2 transition-colors ${location.pathname === '/how-to-use' ? 'text-primary' : 'text-gray-400 hover:text-white'}`}>
                <HelpCircle size={16} /> How to use
              </Link>
              {user && (
                <>
                  <Link to="/inbox" className={`text-sm font-bold uppercase tracking-widest transition-colors ${location.pathname === '/inbox' ? 'text-primary' : 'text-gray-400 hover:text-white'}`}>
                    Inbox
                  </Link>
                  <Link to="/my-orders" className={`text-sm font-bold uppercase tracking-widest relative transition-colors ${location.pathname === '/my-orders' ? 'text-primary' : 'text-gray-400 hover:text-white'}`}>
                    Order History
                    {unreadCount > 0 && (
                      <span className="absolute -top-2 -right-3 w-4 h-4 bg-primary text-black text-[10px] font-black rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount}
                      </span>
                    )}
                  </Link>
                </>
              )}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-6">
              <div className="relative">
                <button 
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center gap-3 bg-white/5 hover:bg-white/10 text-white px-5 py-2.5 rounded-full transition-all border border-white/10 group"
                >
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-black transition-all">
                    <User size={14} />
                  </div>
                  <span className="text-sm font-bold tracking-tight">{user ? user.name : 'Account'}</span>
                  <ChevronDown size={14} className={`text-gray-500 transition-transform ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isUserDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-72 bg-dark-soft border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] py-3 text-gray-300 animate-in fade-in slide-in-from-top-4 overflow-hidden">
                    {user ? (
                      <>
                        <div className="px-5 py-4 flex items-center gap-4 bg-white/5 border-b border-white/5 mb-2">
                          <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center border border-primary/20">
                            <User size={24} />
                          </div>
                          <div className="flex flex-col overflow-hidden">
                            <span className="font-bold text-white truncate">{user.name}</span>
                            <span className="text-[10px] text-gray-500 truncate uppercase tracking-wider">{user.email}</span>
                          </div>
                        </div>
                        <Link to="/dashboard" className="flex items-center gap-4 px-5 py-3 hover:bg-white/5 hover:text-primary transition-all group">
                          <LayoutDashboard size={18} className="text-gray-500 group-hover:text-primary" />
                          <span className="text-sm font-bold">Dashboard</span>
                        </Link>
                        <Link to="/inbox" className="flex items-center gap-4 px-5 py-3 hover:bg-white/5 hover:text-primary transition-all group">
                          <Bell size={18} className="text-gray-500 group-hover:text-primary" />
                          <span className="text-sm font-bold">Inbox / Messages</span>
                        </Link>
                        <Link to="/my-orders" className="flex items-center gap-4 px-5 py-3 hover:bg-white/5 hover:text-primary transition-all group">
                          <Receipt size={18} className="text-gray-500 group-hover:text-primary" />
                          <span className="text-sm font-bold">Order History</span>
                        </Link>
                        {user.role === 'admin' && (
                          <Link to="/admin" className="flex items-center gap-4 px-5 py-3 hover:bg-primary/10 text-primary transition-all group border-t border-white/5 mt-2">
                            <Crown size={18} />
                            <span className="text-sm font-bold uppercase tracking-widest">Admin Control</span>
                          </Link>
                        )}
                        <div className="border-t border-white/5 mt-2 pt-2">
                          <button 
                            onClick={handleLogout}
                            className="w-full flex items-center gap-4 px-5 py-3 hover:bg-red-500/10 text-red-500 transition-all group"
                          >
                            <LogOut size={18} />
                            <span className="text-sm font-bold">Sign Out</span>
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="p-4 space-y-3">
                        <Link to="/login" className="block w-full text-center py-3 rounded-xl bg-primary text-black font-bold text-sm transition-all hover:bg-primary-dark">Sign In</Link>
                        <Link to="/register" className="block w-full text-center py-3 rounded-xl bg-white/5 text-white font-bold text-sm transition-all hover:bg-white/10 border border-white/10">Create Account</Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-gray-400 hover:text-white transition-colors"
            >
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

      </header>

      {/* Mobile Menu - Redesigned for Elite UX */}
      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-black z-[4000] p-6 pt-24 animate-in slide-in-from-right-full duration-300">
          <button 
            onClick={() => setIsMenuOpen(false)}
            className="absolute top-5 right-5 p-2 text-gray-400 hover:text-white transition-colors"
          >
            <X size={32} />
          </button>

          <div className="h-full flex flex-col">
            {/* Auth Actions First */}
            {!user && (
              <div className="grid grid-cols-1 gap-4 mb-8">
                <Link 
                  to="/login" 
                  onClick={() => setIsMenuOpen(false)} 
                  className="w-full text-center py-4 rounded-xl bg-primary text-black font-bold text-lg transition-all hover:bg-primary-dark shadow-[0_0_20px_rgba(212,175,55,0.3)] flex items-center justify-center gap-3"
                >
                  <User size={20} />
                  <span>Sign In</span>
                </Link>
                <Link 
                  to="/register" 
                  onClick={() => setIsMenuOpen(false)} 
                  className="w-full text-center py-4 rounded-xl bg-white/5 text-white font-bold text-lg transition-all hover:bg-white/10 border border-white/10 flex items-center justify-center gap-3"
                >
                  <Crown size={20} />
                  <span>Create Account</span>
                </Link>
              </div>
            )}

            {/* Navigation Links */}
            <nav className="flex-grow space-y-2">
              <Link to="/" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-between text-2xl font-black text-white py-4 border-b border-white/5 uppercase group">
                <span>Home</span>
                <ChevronDown size={24} className="-rotate-90 text-gray-600 group-hover:text-primary transition-transform" />
              </Link>
              {user && (
                <>
                  <Link to="/inbox" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-between text-2xl font-black text-white py-4 border-b border-white/5 uppercase group">
                    <span>Inbox</span>
                    <Bell size={24} className="text-gray-600 group-hover:text-primary transition-transform" />
                  </Link>
                  <Link to="/my-orders" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-between text-2xl font-black text-white py-4 border-b border-white/5 uppercase group">
                    <span>Order History</span>
                    <Receipt size={24} className="text-gray-600 group-hover:text-primary transition-transform" />
                  </Link>
                  <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-between text-2xl font-black text-white py-4 border-b border-white/5 uppercase group">
                    <span>Dashboard</span>
                    <LayoutDashboard size={24} className="text-gray-600 group-hover:text-primary transition-transform" />
                  </Link>
                  {user.role === 'admin' && (
                    <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-between text-2xl font-black text-primary py-4 border-b border-primary/10 uppercase group bg-primary/5 px-4 -mx-4 rounded-xl">
                      <span>Admin Control</span>
                      <Crown size={24} />
                    </Link>
                  )}
                </>
              )}
            </nav>

            {/* Logout Button at the bottom */}
            {user && (
              <div className="mt-auto pt-8">
                <button 
                  onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                  className="w-full flex items-center justify-center gap-4 text-lg font-black text-red-500 py-4 uppercase group bg-red-500/10 rounded-xl"
                >
                  <LogOut size={24} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation - Elite Look */}

      {/* Mobile Bottom Navigation - Elite Look */}
      <div className="lg:hidden fixed bottom-0 left-0 w-full bg-black/80 backdrop-blur-2xl border-t border-white/5 py-3 px-4 z-[2001] flex justify-around items-center shadow-[0_-10px_30px_rgba(0,0,0,0.8)]">
        <Link to="/" className="flex flex-col items-center gap-1 group">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${location.pathname === '/' ? 'bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(212,175,55,0.2)]' : 'bg-white/5 text-gray-400 group-hover:bg-primary/20 group-hover:text-primary'}`}>
            <HomeIcon size={20} />
          </div>
          <span className={`text-[9px] font-black uppercase tracking-widest transition-colors ${location.pathname === '/' ? 'text-primary' : 'text-gray-500 group-hover:text-primary'}`}>Home</span>
        </Link>
        <Link to="/inbox" className="flex flex-col items-center gap-1 group relative">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${location.pathname === '/inbox' ? 'bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(212,175,55,0.2)]' : 'bg-white/5 text-gray-400 group-hover:bg-primary/20 group-hover:text-primary'}`}>
            <Bell size={20} />
          </div>
          <span className={`text-[9px] font-black uppercase tracking-widest transition-colors ${location.pathname === '/inbox' ? 'text-primary' : 'text-gray-500 group-hover:text-primary'}`}>Inbox</span>
        </Link>
        <Link to="/my-orders" className="flex flex-col items-center gap-1 group relative">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${location.pathname === '/my-orders' ? 'bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(212,175,55,0.2)]' : 'bg-white/5 text-gray-400 group-hover:bg-primary/20 group-hover:text-primary'}`}>
            <Receipt size={20} />
          </div>
          {unreadCount > 0 && (
            <span className="absolute top-0 right-2 w-4 h-4 bg-primary text-black text-[9px] font-black rounded-full flex items-center justify-center border-2 border-black">
              {unreadCount}
            </span>
          )}
          <span className={`text-[9px] font-black uppercase tracking-widest transition-colors ${location.pathname === '/my-orders' ? 'text-primary' : 'text-gray-500 group-hover:text-primary'}`}>History</span>
        </Link>
        <Link to="/how-to-use" className="flex flex-col items-center gap-1 group">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${location.pathname === '/how-to-use' ? 'bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(212,175,55,0.2)]' : 'bg-white/5 text-gray-400 group-hover:bg-primary/20 group-hover:text-primary'}`}>
            <HelpCircle size={20} />
          </div>
          <span className={`text-[9px] font-black uppercase tracking-widest transition-colors ${location.pathname === '/how-to-use' ? 'text-primary' : 'text-gray-500 group-hover:text-primary'}`}>Guide</span>
        </Link>
      </div>
    </>
  );
};

export default Navbar;
