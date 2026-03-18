import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard, 
  Users, 
  ShoppingCart, 
  Settings, 
  Image as ImageIcon, 
  CreditCard, 
  MessageSquare,
  Gem,
  Crosshair,
  Wind,
  ShieldCheck,
  ChevronRight,
  Gamepad2,
  TrendingUp,
  Video,
  Layers
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalUsers: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const [ordersRes, usersRes] = await Promise.all([
          axios.get(`${API_URL}/api/v1/orders`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${API_URL}/api/v1/auth/users`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        const orders = ordersRes.data.data;
        const allUsers = usersRes.data.data;
        
        const pending = orders.filter(o => o.status === 'pending').length;
        const revenue = orders.reduce((acc, curr) => acc + (curr.status === 'completed' ? curr.selling_price : 0), 0);
        
        setStats({
          totalOrders: orders.length,
          pendingOrders: pending,
          totalUsers: allUsers.length,
          totalRevenue: revenue
        });
      } catch (err) {
        console.error('Error fetching admin data', err);
      }
    };
    fetchStats();
  }, []);

  const categories = [
    { id: 'mlbb', name: 'Mobile Legends', icon: <Gem className="text-blue-500" />, color: 'from-blue-600/20 to-primary/20', route: '/admin/products/mlbb' },
    { id: 'pubg', name: 'PUBG Mobile', icon: <Crosshair className="text-orange-500" />, color: 'from-orange-600/20 to-primary/20', route: '/admin/products/pubg' },
    { id: 'mcgg', name: 'Magic Chess GoGo', icon: <Gem className="text-purple-500" />, color: 'from-purple-600/20 to-primary/20', route: '/admin/products/mcgg' },
    { id: 'wwm', name: 'WWM', icon: <Wind className="text-green-500" />, color: 'from-red-600/20 to-primary/20', route: '/admin/products/wwm' },
  ];

  const managementTools = [
    { id: 'users', name: 'User Management', icon: <Users size={24} />, route: '/admin/users', color: 'bg-primary/10 text-primary' },
    { id: 'profit', name: 'Profit Tracker', icon: <TrendingUp size={24} />, route: '/admin/profit', color: 'bg-green-500/10 text-green-500' },
    { id: 'slideshow', name: 'Slideshow Manager', icon: <ImageIcon size={24} />, route: '/admin/slideshow', color: 'bg-orange-500/10 text-orange-500' },
    { id: 'game-images', name: 'Game Images Manager', icon: <Gamepad2 size={24} />, route: '/admin/game-images', color: 'bg-cyan-500/10 text-cyan-500' },
    { id: 'settings', name: 'Cookie & API', icon: <Settings size={24} />, route: '/admin/settings', color: 'bg-gray-500/10 text-gray-400' },
    { id: 'ads', name: 'Ads Manager', icon: <ImageIcon size={24} />, route: '/admin/ads', color: 'bg-yellow-500/10 text-yellow-500' },
    { id: 'payments', name: 'Payments', icon: <CreditCard size={24} />, route: '/admin/payments', color: 'bg-green-500/10 text-green-500' },
    { id: 'contacts', name: 'Contacts', icon: <MessageSquare size={24} />, route: '/admin/contacts', color: 'bg-blue-500/10 text-blue-500' },
    { id: 'how-to-use', name: 'Manage How to Use', icon: <Video size={24} />, route: '/admin/how-to-use', color: 'bg-purple-500/10 text-purple-500' },
    { id: 'game-manager', name: 'Game Manager', icon: <Gamepad2 size={24} />, route: '/admin/games', color: 'bg-orange-500/10 text-orange-500' },
  ];

  return (
    <div className="container mx-auto px-4 py-8 pb-32">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase mb-2">
            Admin <span className="gold-text-gradient">Dashboard</span>
          </h1>
          <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-[10px]">Welcome back, {user?.name}</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <Link to="/dashboard" className="bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-2xl transition-all flex items-center gap-2 font-black uppercase tracking-widest text-xs border border-white/10">
            <LayoutDashboard size={18} /> User Panel
          </Link>
          <Link to="/admin/orders" className="luxury-button px-6 py-3 flex items-center gap-2">
            <ShoppingCart size={18} /> <span className="uppercase tracking-widest text-xs font-black">Order Manager</span>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 mb-20">
        <div className="luxury-card p-4 md:p-8 flex flex-col md:flex-row items-center md:items-center gap-3 md:gap-6 group hover:border-primary/30 transition-all duration-500">
          <div className="w-10 h-10 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-black transition-all duration-500 shadow-inner">
            <ShoppingCart size={20} className="md:w-8 md:h-8" />
          </div>
          <div className="text-center md:text-left">
            <div className="text-[8px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Total Orders</div>
            <div className="text-lg md:text-3xl font-black text-white tracking-tighter">{stats.totalOrders}</div>
          </div>
        </div>
        <div className="luxury-card p-4 md:p-8 flex flex-col md:flex-row items-center md:items-center gap-3 md:gap-6 group hover:border-primary/30 transition-all duration-500">
          <div className="w-10 h-10 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 group-hover:bg-orange-500 group-hover:text-black transition-all duration-500 shadow-inner">
            <ShieldCheck size={20} className="md:w-8 md:h-8" />
          </div>
          <div className="text-center md:text-left">
            <div className="text-[8px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Pending</div>
            <div className="text-lg md:text-3xl font-black text-white tracking-tighter">{stats.pendingOrders}</div>
          </div>
        </div>
        <div className="luxury-card p-4 md:p-8 flex flex-col md:flex-row items-center md:items-center gap-3 md:gap-6 group hover:border-primary/30 transition-all duration-500">
          <div className="w-10 h-10 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-green-500/10 flex items-center justify-center text-green-500 group-hover:bg-green-500 group-hover:text-black transition-all duration-500 shadow-inner">
            <CreditCard size={20} className="md:w-8 md:h-8" />
          </div>
          <div className="text-center md:text-left overflow-hidden w-full">
            <div className="text-[8px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Revenue</div>
            <div className="text-sm md:text-3xl font-black text-white tracking-tighter truncate">{stats.totalRevenue.toLocaleString()} <span className="text-[8px] md:text-xs text-primary ml-0.5">Ks</span></div>
          </div>
        </div>
        <div className="luxury-card p-4 md:p-8 flex flex-col md:flex-row items-center md:items-center gap-3 md:gap-6 group hover:border-primary/30 transition-all duration-500">
          <div className="w-10 h-10 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 group-hover:bg-purple-500 group-hover:text-black transition-all duration-500 shadow-inner">
            <Users size={20} className="md:w-8 md:h-8" />
          </div>
          <div className="text-center md:text-left">
            <div className="text-[8px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Total Users</div>
            <div className="text-lg md:text-3xl font-black text-white tracking-tighter">{stats.totalUsers}</div>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="mb-12 md:mb-20">
        <div className="flex items-center gap-2 md:gap-3 mb-6 md:mb-12">
          <span className="w-8 md:w-12 h-1 bg-primary rounded-full"></span>
          <span className="text-primary font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-[10px] md:text-xs">Product Categories</span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          {categories.map((cat) => (
            <Link 
              key={cat.id} 
              to={cat.route}
              className="group relative h-[180px] md:h-[280px] luxury-card overflow-hidden flex flex-col border-white/5 hover:border-primary/30 transition-all duration-500"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-10 group-hover:opacity-20 transition-opacity duration-500`}></div>
              <div className="relative h-full w-full flex flex-col items-center justify-center p-4 md:p-8 text-center z-10">
                <div className="w-12 h-12 md:w-20 md:h-20 rounded-2xl md:rounded-3xl bg-white/5 flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 group-hover:bg-primary group-hover:text-black transition-all duration-500 shadow-xl border border-white/5">
                  {/* Clone the icon and set its size if it's a lucide component, but the icon is already an element */}
                  <div className="scale-75 md:scale-100">{cat.icon}</div>
                </div>
                <h3 className="text-sm md:text-2xl font-black text-white mb-1 md:mb-2 leading-none tracking-tighter group-hover:gold-text-gradient transition-all duration-500">{cat.name}</h3>
                <div className="text-[8px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                  Manage <ChevronRight size={10} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Management Tools */}
      <div>
        <div className="flex items-center gap-2 md:gap-3 mb-6 md:mb-12">
          <span className="w-8 md:w-12 h-1 bg-primary rounded-full"></span>
          <span className="text-primary font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-[10px] md:text-xs">Management Tools</span>
        </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {managementTools.map((tool) => (
          <Link 
            key={tool.id}
            to={tool.route} 
            className="luxury-card p-4 md:p-6 flex items-center gap-4 md:gap-6 group hover:border-primary/30 transition-all duration-500 bg-white/[0.02]"
          >
            <div className={`w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl ${tool.color} flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-all duration-500 shadow-inner`}>
              {/* Clone icon or use fixed size */}
              <div className="scale-75 md:scale-100 flex items-center justify-center">
                {tool.icon}
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-sm md:text-lg font-black text-white uppercase tracking-tight group-hover:text-primary transition-colors">{tool.name}</h3>
              <p className="text-[8px] md:text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5 md:mt-1 flex items-center gap-1">
                Configure <ChevronRight size={8} />
              </p>
            </div>
          </Link>
        ))}
      </div>
      </div>

      {/* Brand & Identity Section */}
      <div className="mt-12 md:mb-20">
        <div className="flex items-center gap-2 md:gap-3 mb-6 md:mb-12">
          <span className="w-8 md:w-12 h-1 bg-primary rounded-full"></span>
          <span className="text-primary font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-[10px] md:text-xs">Brand & Identity</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <Link 
            to="/admin/logos" 
            className="luxury-card p-6 md:p-10 flex flex-col items-center justify-center text-center group hover:border-primary/30 transition-all duration-500 bg-white/[0.02] relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-3xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 group-hover:bg-primary group-hover:text-black transition-all duration-500 mb-6 shadow-xl relative z-10">
              <Layers size={32} />
            </div>
            <div className="relative z-10">
              <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight mb-2 group-hover:text-primary transition-colors">Logo Manager</h3>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed max-w-[200px]">
                Manage official store logos, partner icons, and brand assets
              </p>
              <div className="mt-6 inline-flex items-center gap-2 text-primary font-black uppercase tracking-[0.2em] text-[10px] opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                Launch Tool <ChevronRight size={12} />
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
