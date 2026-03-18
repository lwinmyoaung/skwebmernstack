import { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  Calendar,
  ChevronRight,
  RefreshCw,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config';

const AdminProfitTracker = () => {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('monthly'); // 'monthly' or 'yearly'
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchStats();
  }, [period]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/v1/orders/profit-stats?period=${period}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data);
    } catch (err) {
      console.error('Error fetching profit stats', err);
    } finally {
      setLoading(false);
    }
  };

  const gameNames = {
    mlbb: 'Mobile Legends',
    pubg: 'PUBG Mobile',
    mcgg: 'Magic Chess GoGo',
    wwm: 'WWM'
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl pb-32">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-6">
        <div className="flex items-center gap-6">
          <Link to="/admin" className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all text-gray-400 border border-white/10">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Profit <span className="gold-text-gradient">Tracker</span></h1>
            <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-[10px] mt-1">Real-time revenue & margin analysis</p>
          </div>
        </div>
        <div className="flex p-1.5 bg-white/5 rounded-2xl border border-white/10">
          <button 
            onClick={() => setPeriod('monthly')}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${period === 'monthly' ? 'bg-primary text-black shadow-lg' : 'text-gray-500 hover:text-white'}`}
          >
            Monthly
          </button>
          <button 
            onClick={() => setPeriod('yearly')}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${period === 'yearly' ? 'bg-primary text-black shadow-lg' : 'text-gray-500 hover:text-white'}`}
          >
            Yearly
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 gap-4">
          <RefreshCw className="animate-spin text-primary" size={48} />
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest animate-pulse">Calculating margins...</span>
        </div>
      ) : stats ? (
        <div className="space-y-12">
          {/* Top Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
        <div className="luxury-card p-4 md:p-8 group hover:border-primary/30 transition-all duration-500">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-green-500/10 flex items-center justify-center text-green-500 group-hover:bg-green-500 group-hover:text-black transition-all">
              <TrendingUp size={20} className="md:w-6 md:h-6" />
            </div>
            <div className="text-[8px] md:text-[10px] font-black text-green-500 uppercase tracking-widest flex items-center gap-1">
              <span className="hidden sm:inline">Profit</span> <ArrowUpRight size={12} />
            </div>
          </div>
          <div className="text-[8px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Total Profit</div>
          <div className="text-lg md:text-3xl font-black text-white tracking-tighter truncate">
            {stats.totals.totalProfit.toLocaleString()} <span className="text-[10px] md:text-xs text-primary ml-0.5 md:ml-1">Ks</span>
          </div>
        </div>

        <div className="luxury-card p-4 md:p-8 group hover:border-primary/30 transition-all duration-500">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-black transition-all">
              <DollarSign size={20} className="md:w-6 md:h-6" />
            </div>
            <div className="text-[8px] md:text-[10px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-1">
              <span className="hidden sm:inline">Revenue</span> <ArrowUpRight size={12} />
            </div>
          </div>
          <div className="text-[8px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Total Revenue</div>
          <div className="text-lg md:text-3xl font-black text-white tracking-tighter truncate">
            {stats.totals.totalRevenue.toLocaleString()} <span className="text-[10px] md:text-xs text-primary ml-0.5 md:ml-1">Ks</span>
          </div>
        </div>

        <div className="luxury-card p-4 md:p-8 group hover:border-primary/30 transition-all duration-500">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 group-hover:bg-orange-500 group-hover:text-black transition-all">
              <BarChart3 size={20} className="md:w-6 md:h-6" />
            </div>
            <div className="text-[8px] md:text-[10px] font-black text-orange-500 uppercase tracking-widest flex items-center gap-1">
              <span className="hidden sm:inline">Cost</span> <ArrowDownRight size={12} />
            </div>
          </div>
          <div className="text-[8px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Cost of Goods</div>
          <div className="text-lg md:text-3xl font-black text-white tracking-tighter truncate">
            {stats.totals.totalCost.toLocaleString()} <span className="text-[10px] md:text-xs text-primary ml-0.5 md:ml-1">Ks</span>
          </div>
        </div>

        <div className="luxury-card p-4 md:p-8 group hover:border-primary/30 transition-all duration-500">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 group-hover:bg-purple-500 group-hover:text-black transition-all">
              <ShoppingCart size={20} className="md:w-6 md:h-6" />
            </div>
            <div className="text-[8px] md:text-[10px] font-black text-purple-500 uppercase tracking-widest"><span className="hidden sm:inline">Completed</span></div>
          </div>
          <div className="text-[8px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Order Count</div>
          <div className="text-lg md:text-3xl font-black text-white tracking-tighter">{stats.totals.orderCount}</div>
        </div>
      </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profit by Game */}
            <div className="lg:col-span-1 space-y-8">
              <div className="flex items-center gap-3">
                <span className="w-8 h-1 bg-primary rounded-full"></span>
                <span className="text-primary font-black uppercase tracking-[0.3em] text-[10px]">Profit by Game</span>
              </div>
              <div className="luxury-card p-6 space-y-4">
                {stats.gameStats.map(game => (
                  <div key={game._id} className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl group hover:border-primary/20 transition-all">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-black text-white group-hover:text-primary transition-colors uppercase tracking-tight">
                        {gameNames[game._id] || game._id}
                      </span>
                      <span className="text-xs font-black text-primary">{game.profit.toLocaleString()} Ks</span>
                    </div>
                    <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-primary h-full rounded-full transition-all duration-1000"
                        style={{ width: `${(game.profit / stats.totals.totalProfit) * 100}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-2">
                      <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">{game.orders} Orders</span>
                      <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">
                        {((game.profit / stats.totals.totalProfit) * 100).toFixed(1)}% of total
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Daily/Monthly Breakdown Table */}
            <div className="lg:col-span-2 space-y-8">
              <div className="flex items-center gap-3">
                <span className="w-8 h-1 bg-primary rounded-full"></span>
                <span className="text-primary font-black uppercase tracking-[0.3em] text-[10px]">
                  {period === 'monthly' ? 'Daily' : 'Monthly'} Breakdown
                </span>
              </div>
              <div className="luxury-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-white/5 bg-white/[0.02]">
                        <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                          {period === 'monthly' ? 'Day' : 'Month'}
                        </th>
                        <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Orders</th>
                        <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Revenue</th>
                        <th className="px-8 py-6 text-[10px] font-black text-primary uppercase tracking-widest text-right">Profit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {stats.data.map((row, idx) => (
                        <tr key={idx} className="group hover:bg-white/[0.02] transition-colors">
                          <td className="px-8 py-6">
                            <span className="text-xs font-black text-white">
                              {period === 'monthly' ? `Day ${row._id.day}` : 
                                new Date(0, row._id.month - 1).toLocaleString('default', { month: 'long' })}
                            </span>
                          </td>
                          <td className="px-8 py-6 text-center">
                            <span className="text-xs font-bold text-gray-400">{row.orderCount}</span>
                          </td>
                          <td className="px-8 py-6 text-right text-xs font-bold text-gray-400">
                            {row.totalRevenue.toLocaleString()} Ks
                          </td>
                          <td className="px-8 py-6 text-right">
                            <span className="text-xs font-black text-primary">
                              {row.totalProfit.toLocaleString()} Ks
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-40">
          <PieChart size={64} className="text-gray-800 mx-auto mb-6" />
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">No completed order data available for this period.</p>
        </div>
      )}
    </div>
  );
};

export default AdminProfitTracker;
