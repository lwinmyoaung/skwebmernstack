import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import { Save, RefreshCw, Cookie, Link as LinkIcon, AlertCircle, CheckCircle2 } from 'lucide-react';

const CookieAndApiManager = () => {
  const [settings, setSettings] = useState({
    so_miniapp_base_uri: '',
    so_miniapp_timeout: 15,
    so_miniapp_verify: true,
    so_miniapp_cookie: '',
    mlbb_api_base_url: 'http://163.44.196.36:8000',
    pubg_api_products_url: 'http://163.44.196.36:8000/products',
    mcgg_api_products_url: 'http://163.44.196.36:8000/mcgg/products',
    wwm_api_products_url: 'http://163.44.196.36:8000/wwm/products'
  });
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/v1/settings`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const data = res.data.data;
        const newSettings = { ...settings };
        data.forEach(s => {
          if (newSettings.hasOwnProperty(s.key)) {
            newSettings[s.key] = s.value;
          }
        });
        setSettings(newSettings);
      } catch (err) {
        console.error('Error fetching settings', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    try {
      await axios.post(`${API_URL}/api/v1/settings`, { settings }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setMessage({ type: 'success', text: 'Settings saved successfully' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to save settings' });
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await axios.post(`${API_URL}/api/v1/settings/sync`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setMessage({ type: 'success', text: res.data.message });
    } catch (err) {
      setMessage({ type: 'error', text: 'Sync failed' });
    } finally {
      setSyncing(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading settings...</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl pb-32">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter uppercase">Elite <span className="gold-text-gradient">Settings</span></h1>
          <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-[10px] mt-1">Manage purchase cookies and external API endpoints</p>
        </div>
        <button 
          onClick={handleSync}
          disabled={syncing}
          className="luxury-button w-full md:w-auto flex items-center justify-center gap-3 px-8 py-4 disabled:opacity-50"
        >
          <RefreshCw className={syncing ? 'animate-spin' : ''} size={20} />
          <span className="uppercase tracking-widest text-sm font-black">{syncing ? 'Syncing...' : 'Sync Inventory'}</span>
        </button>
      </div>

      {message.text && (
        <div className={`mb-8 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 ${message.type === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
          {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span className="font-bold text-sm">{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* SO Miniapp Section */}
        <div className="luxury-card overflow-hidden">
          <div className="bg-white/5 px-8 py-5 border-b border-white/5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
              <Cookie size={24} />
            </div>
            <h2 className="text-xl font-black text-white uppercase tracking-tight">SO Miniapp Infrastructure</h2>
          </div>
          <div className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-[0.2em] font-black text-gray-500 ml-1">Base URI</label>
                <input 
                  type="text" 
                  value={settings.so_miniapp_base_uri}
                  onChange={(e) => setSettings({...settings, so_miniapp_base_uri: e.target.value})}
                  className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-primary/50 text-white font-bold transition-all"
                  placeholder="https://so.miniapp.zone"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-[0.2em] font-black text-gray-500 ml-1">Network Timeout (Sec)</label>
                <input 
                  type="number" 
                  value={settings.so_miniapp_timeout}
                  onChange={(e) => setSettings({...settings, so_miniapp_timeout: e.target.value})}
                  className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-primary/50 text-white font-bold transition-all"
                />
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] uppercase tracking-[0.2em] font-black text-gray-500 ml-1">Purchase Authentication Cookie</label>
              <textarea 
                rows="6"
                value={settings.so_miniapp_cookie}
                onChange={(e) => setSettings({...settings, so_miniapp_cookie: e.target.value})}
                className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-primary/50 text-white font-bold transition-all font-mono text-xs leading-relaxed"
                placeholder="Paste full elite cookie string here..."
              />
              <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
                <AlertCircle size={12} className="text-primary" /> Security Warning: Never share this cookie with third parties.
              </p>
            </div>
          </div>
        </div>

        {/* API Endpoints Section */}
        <div className="luxury-card overflow-hidden">
          <div className="bg-white/5 px-8 py-5 border-b border-white/5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
              <LinkIcon size={24} />
            </div>
            <h2 className="text-xl font-black text-white uppercase tracking-tight">External Gaming APIs</h2>
          </div>
          <div className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-[0.2em] font-black text-gray-500 ml-1">MLBB API Endpoint</label>
                <input 
                  type="text" 
                  value={settings.mlbb_api_base_url}
                  onChange={(e) => setSettings({...settings, mlbb_api_base_url: e.target.value})}
                  className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-primary/50 text-white font-bold transition-all font-mono text-sm"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-[0.2em] font-black text-gray-500 ml-1">PUBG Products API</label>
                <input 
                  type="text" 
                  value={settings.pubg_api_products_url}
                  onChange={(e) => setSettings({...settings, pubg_api_products_url: e.target.value})}
                  className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-primary/50 text-white font-bold transition-all font-mono text-sm"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-[0.2em] font-black text-gray-500 ml-1">MCGG Products API</label>
                <input 
                  type="text" 
                  value={settings.mcgg_api_products_url}
                  onChange={(e) => setSettings({...settings, mcgg_api_products_url: e.target.value})}
                  className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-primary/50 text-white font-bold transition-all font-mono text-sm"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-[0.2em] font-black text-gray-500 ml-1">WWM Products API</label>
                <input 
                  type="text" 
                  value={settings.wwm_api_products_url}
                  onChange={(e) => setSettings({...settings, wwm_api_products_url: e.target.value})}
                  className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-primary/50 text-white font-bold transition-all font-mono text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        <button 
          type="submit"
          className="luxury-button w-full py-6 text-xl font-black uppercase tracking-[0.3em] flex items-center justify-center gap-4 group"
        >
          <Save size={28} className="group-hover:scale-110 transition-transform" /> Save Elite Configurations
        </button>
      </form>
    </div>
  );
};

export default CookieAndApiManager;
