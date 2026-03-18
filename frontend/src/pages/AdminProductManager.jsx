import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config';
import { getImageUrl } from '../utils/image';
import { 
  ArrowLeft, 
  RefreshCw, 
  Search, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  Plus,
  Save,
  X,
  Smartphone,
  ChevronRight,
  Globe,
  Tag,
  DollarSign,
  Activity
} from 'lucide-react';

const regions = [
  { id: 'myanmar', name: 'Myanmar', flag: 'https://flagcdn.com/w40/mm.png' },
  { id: 'malaysia', name: 'Malaysia', flag: 'https://flagcdn.com/w40/my.png' },
  { id: 'philippines', name: 'Philippines', flag: 'https://flagcdn.com/w40/ph.png' },
  { id: 'singapore', name: 'Singapore', flag: 'https://flagcdn.com/w40/sg.png' },
  { id: 'indonesia', name: 'Indonesia', flag: 'https://flagcdn.com/w40/id.png' },
  { id: 'russia', name: 'Russia', flag: 'https://flagcdn.com/w40/ru.png' },
];

const AdminProductManager = () => {
  const { gameId } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', price: 0, status: 'active', region: 'myanmar' });
  const [activeRegion, setActiveRegion] = useState('myanmar');
  const [bulkPercentage, setBulkPercentage] = useState(0);
  const [updatingBulk, setUpdatingBulk] = useState(false);

  const gameNames = {
    mlbb: 'Mobile Legends',
    pubg: 'PUBG Mobile',
    mcgg: 'Magic Chess GoGo',
    wwm: 'WWM'
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/v1/products/admin/${gameId}?region=${activeRegion}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setProducts(res.data.data);
    } catch (err) {
      console.error('Error fetching products', err);
      setMessage({ type: 'error', text: 'Failed to load products from database' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [gameId, activeRegion]);

  const handleSync = async () => {
    setSyncing(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await axios.post(`${API_URL}/api/v1/settings/sync`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setMessage({ type: 'success', text: res.data.message });
      fetchProducts(); 
    } catch (err) {
      setMessage({ type: 'error', text: 'Sync failed' });
    } finally {
      setSyncing(false);
    }
  };

  const startEdit = (product) => {
    setEditingId(product._id);
    setEditForm({
      name: product.name,
      price: product.price,
      status: product.status || 'active',
      region: product.region
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const handleUpdate = async (id) => {
    try {
      await axios.put(`${API_URL}/api/v1/products/${gameId}/${id}`, editForm, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setMessage({ type: 'success', text: 'Product updated and synced to user view!' });
      setEditingId(null);
      fetchProducts();
    } catch (err) {
      console.error('Update failed', err);
      setMessage({ type: 'error', text: 'Failed to update product' });
    }
  };

  const handleBulkUpdate = async () => {
    if (bulkPercentage === 0) return;
    const action = bulkPercentage > 0 ? 'increase' : 'decrease';
    if (!window.confirm(`Are you sure you want to ${action} ALL prices in ${gameId} (${activeRegion}) by ${Math.abs(bulkPercentage)}%?`)) return;
    
    setUpdatingBulk(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/api/v1/products/admin/${gameId}/bulk-price`, {
        percentage: bulkPercentage,
        region: activeRegion
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage({ type: 'success', text: `Successfully ${action}d all prices by ${Math.abs(bulkPercentage)}%` });
      fetchProducts();
      setBulkPercentage(0); // Reset after update
    } catch (err) {
      console.error('Bulk update failed', err);
      setMessage({ type: 'error', text: 'Bulk price update failed' });
    } finally {
      setUpdatingBulk(false);
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await axios.post(`${API_URL}/api/v1/products/admin/${gameId}/publish`, 
        { region: activeRegion }, 
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      setMessage({ type: 'success', text: res.data.message });
    } catch (err) {
      setMessage({ type: 'error', text: 'Publishing failed' });
    } finally {
      setPublishing(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.product_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl pb-32">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-6">
        <div className="flex items-center gap-6">
          <Link to="/admin" className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all text-gray-400 border border-white/10">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase">
              {gameNames[gameId] || gameId} <span className="gold-text-gradient">Products</span>
            </h1>
            <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-[10px] mt-1">Manage pricing and inventory levels</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-4">
          <button 
            onClick={handleSync}
            disabled={syncing}
            className="bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-2xl transition-all flex items-center gap-3 font-black uppercase tracking-widest text-xs border border-white/10 disabled:opacity-50"
          >
            <RefreshCw className={syncing ? 'animate-spin' : ''} size={18} />
            {syncing ? 'Syncing...' : 'Global Sync'}
          </button>
          <button 
            onClick={handlePublish}
            disabled={publishing}
            className="luxury-button px-8 py-3 flex items-center gap-3 disabled:opacity-50"
          >
            <CheckCircle2 className={publishing ? 'animate-spin' : ''} size={18} />
            <span className="uppercase tracking-widest text-xs font-black">{publishing ? 'Publishing...' : 'Publish Live'}</span>
          </button>
        </div>
      </div>

      {/* Region Selector */}
      {gameId === 'mlbb' && (
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-8 h-1 bg-primary rounded-full"></span>
            <span className="text-primary font-black uppercase tracking-[0.3em] text-[10px]">Active Region</span>
          </div>
          <div className="flex flex-wrap gap-2 md:gap-3">
            {regions.map(r => (
              <button
                key={r.id}
                onClick={() => setActiveRegion(r.id)}
                className={`flex items-center gap-2 md:gap-3 px-4 md:px-6 py-2.5 md:py-3 rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[9px] md:text-[10px] transition-all border ${activeRegion === r.id ? 'bg-primary text-black border-primary shadow-[0_0_20px_rgba(212,175,55,0.3)]' : 'bg-white/5 text-gray-500 border-white/10 hover:bg-white/10'}`}
              >
                <img src={getImageUrl(r.flag)} alt={r.name} loading="lazy" className="w-4 h-2.5 md:w-5 md:h-3 object-cover rounded-sm" />
                {r.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {message.text && (
        <div className={`mb-12 p-6 rounded-3xl flex items-center gap-4 animate-in fade-in slide-in-from-top-4 border ${message.type === 'success' ? 'bg-green-500/10 text-green-500 border-green-500/20 shadow-[0_0_20px_rgba(34,197,94,0.1)]' : 'bg-red-500/10 text-red-500 border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.1)]'}`}>
          {message.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
          <span className="font-black uppercase tracking-widest text-xs">{message.text}</span>
        </div>
      )}

      {/* Tools Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Search */}
        <div className="lg:col-span-2 luxury-card p-6 flex items-center gap-6">
          <div className="relative flex-grow group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Search by name or product ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm text-white font-bold focus:outline-none focus:border-primary/50 transition-all"
            />
          </div>
        </div>

        {/* Bulk Update Tool */}
        <div className="luxury-card p-6 flex flex-col justify-center">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Bulk Percentage (%)</div>
            <div className="text-[10px] font-black text-primary uppercase tracking-widest">e.g. 10 or -5</div>
          </div>
          <div className="flex items-center gap-4">
            <input 
              type="number" 
              step="1"
              value={bulkPercentage}
              onChange={(e) => setBulkPercentage(parseFloat(e.target.value))}
              className="w-24 px-4 py-3 bg-black/20 border border-white/10 rounded-2xl focus:outline-none focus:border-primary/50 text-white font-black text-center text-sm transition-all"
              placeholder="%"
            />
            <button 
              onClick={handleBulkUpdate}
              disabled={updatingBulk || bulkPercentage === 0}
              className="flex-1 luxury-button py-3 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {updatingBulk ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
              <span className="uppercase tracking-widest text-[10px] font-black">Apply %</span>
            </button>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="luxury-card overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest"><div className="flex items-center gap-2"><Tag size={12}/> ID</div></th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest"><div className="flex items-center gap-2"><Globe size={12}/> Region</div></th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest"><div className="flex items-center gap-2"><Smartphone size={12}/> Product</div></th>
                <th className="px-8 py-6 text-[10px] font-black text-blue-500/50 uppercase tracking-widest text-center">Live API</th>
                <th className="px-8 py-6 text-[10px] font-black text-primary/50 uppercase tracking-widest text-center">Your Price</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest"><div className="flex items-center gap-2"><Activity size={12}/> Status</div></th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <RefreshCw className="animate-spin text-primary" size={40} />
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest animate-pulse">Retrieving Product Data...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center gap-4 text-gray-700">
                      <Search size={64} />
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">No products found in this category</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p._id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="px-8 py-6 font-mono text-[10px] text-gray-500">{p.product_id}</td>
                    <td className="px-8 py-6">
                      <span className="px-3 py-1 bg-white/5 text-gray-400 rounded-lg text-[10px] font-black uppercase tracking-widest border border-white/5 group-hover:border-white/10 transition-all">
                        {p.region}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      {editingId === p._id ? (
                        <input 
                          type="text" 
                          value={editForm.name}
                          onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                          className="w-full bg-black/40 border border-primary/50 rounded-xl px-4 py-2 text-sm text-white font-bold focus:outline-none"
                        />
                      ) : (
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-white group-hover:text-primary transition-colors">{p.name}</span>
                          {p.live_name && p.live_name !== p.name && (
                            <span className="text-[10px] text-gray-600 font-bold italic tracking-tight">API: {p.live_name}</span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-8 py-6 text-center">
                      {p.live_price ? (
                        <div className="flex flex-col items-center">
                          <span className="text-xs font-black text-blue-500/80">{p.live_price.toLocaleString()}</span>
                          <span className="text-[8px] font-black text-gray-600 uppercase">MMK</span>
                        </div>
                      ) : (
                        <span className="text-gray-800 font-black">--</span>
                      )}
                    </td>
                    <td className="px-8 py-6 text-center">
                      {editingId === p._id ? (
                        <div className="relative">
                          <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 text-primary" size={12} />
                          <input 
                            type="number" 
                            value={editForm.price}
                            onChange={(e) => setEditForm({...editForm, price: e.target.value})}
                            className="w-32 bg-black/40 border border-primary/50 rounded-xl pl-8 pr-4 py-2 text-sm text-primary font-black focus:outline-none"
                          />
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-primary">{p.price.toLocaleString()}</span>
                            {p.live_price && p.price !== p.live_price && (
                              <div className="w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]" title="Out of sync with API"></div>
                            )}
                          </div>
                          <span className="text-[8px] font-black text-gray-600 uppercase">MMK</span>
                        </div>
                      )}
                    </td>
                    <td className="px-8 py-6">
                      {editingId === p._id ? (
                        <select 
                          value={editForm.status}
                          onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                          className="bg-black/40 border border-primary/50 rounded-xl px-4 py-2 text-[10px] text-white font-black uppercase tracking-widest focus:outline-none appearance-none"
                        >
                          <option value="active" className="bg-dark-soft">Active</option>
                          <option value="inactive" className="bg-dark-soft">Inactive</option>
                        </select>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full ${p.status === 'active' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'}`}></div>
                          <span className={`text-[10px] font-black uppercase tracking-widest ${p.status === 'active' ? 'text-gray-400' : 'text-red-500/50'}`}>
                            {p.status || 'active'}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-8 py-6 text-right">
                      {editingId === p._id ? (
                        <div className="flex justify-end gap-3">
                          <button 
                            onClick={() => handleUpdate(p._id)} 
                            className="p-2.5 bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-black rounded-xl transition-all border border-green-500/20 shadow-lg"
                            title="Save Changes"
                          >
                            <CheckCircle2 size={18} />
                          </button>
                          <button 
                            onClick={cancelEdit} 
                            className="p-2.5 bg-white/5 text-gray-400 hover:bg-white/10 rounded-xl transition-all border border-white/10"
                            title="Cancel Edit"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                          <button 
                            onClick={() => startEdit(p)} 
                            className="p-2.5 bg-primary/10 text-primary hover:bg-primary hover:text-black rounded-xl transition-all border border-primary/20 shadow-lg"
                            title="Edit Product"
                          >
                            <Edit2 size={18} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminProductManager;
