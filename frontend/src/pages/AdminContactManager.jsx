import { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Save, 
  X, 
  MessageCircle, 
  Facebook, 
  Twitter, 
  Instagram, 
  Phone, 
  Mail, 
  Globe,
  RefreshCw,
  Edit2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config';

const AdminContactManager = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    platform: '',
    value: '',
    icon: 'MessageCircle',
    isActive: true
  });

  const icons = [
    { name: 'MessageCircle', icon: <MessageCircle size={18} /> },
    { name: 'Facebook', icon: <Facebook size={18} /> },
    { name: 'Twitter', icon: <Twitter size={18} /> },
    { name: 'Instagram', icon: <Instagram size={18} /> },
    { name: 'Phone', icon: <Phone size={18} /> },
    { name: 'Mail', icon: <Mail size={18} /> },
    { name: 'Globe', icon: <Globe size={18} /> },
  ];

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/v1/contacts/admin`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setContacts(res.data.data);
    } catch (err) {
      console.error('Error fetching contacts', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (editingId) {
        await axios.put(`${API_URL}/api/v1/contacts/${editingId}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${API_URL}/api/v1/contacts`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      fetchContacts();
      setFormData({ platform: '', value: '', icon: 'MessageCircle', isActive: true });
      setShowAddForm(false);
      setEditingId(null);
    } catch (err) {
      console.error('Error saving contact', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this contact?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/v1/contacts/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchContacts();
    } catch (err) {
      console.error('Error deleting contact', err);
    }
  };

  const startEdit = (contact) => {
    setFormData({
      platform: contact.platform,
      value: contact.value,
      icon: contact.icon,
      isActive: contact.isActive
    });
    setEditingId(contact._id);
    setShowAddForm(true);
  };

  const getIconComponent = (iconName) => {
    const iconObj = icons.find(i => i.name === iconName);
    return iconObj ? iconObj.icon : <MessageCircle size={18} />;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl pb-32">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-6">
        <div className="flex items-center gap-6">
          <Link to="/admin" className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all text-gray-400 border border-white/10">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter uppercase">Contact <span className="gold-text-gradient">Manager</span></h1>
            <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-[10px] mt-1">Manage store contact information</p>
          </div>
        </div>
        <button 
          onClick={() => setShowAddForm(true)}
          className="luxury-button w-full md:w-auto flex items-center justify-center gap-3 px-8 py-4"
        >
          <Plus size={20} />
          <span className="uppercase tracking-widest text-sm font-black">Add New Contact</span>
        </button>
      </div>

      {showAddForm && (
        <div className="luxury-card p-8 mb-12 animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-black text-white uppercase tracking-tight">
              {editingId ? 'Edit Contact' : 'New Contact Details'}
            </h2>
            <button onClick={() => { setShowAddForm(false); setEditingId(null); }} className="text-gray-500 hover:text-white transition-colors">
              <X size={24} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Platform Name</label>
              <input 
                type="text" 
                placeholder="e.g. WhatsApp, Facebook, Telegram"
                value={formData.platform}
                onChange={(e) => setFormData({...formData, platform: e.target.value})}
                className="w-full bg-black/20 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white font-bold focus:outline-none focus:border-primary/50 transition-all"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Number or Link</label>
              <input 
                type="text" 
                placeholder="e.g. +959..., https://facebook.com/..."
                value={formData.value}
                onChange={(e) => setFormData({...formData, value: e.target.value})}
                className="w-full bg-black/20 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white font-bold focus:outline-none focus:border-primary/50 transition-all"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Display Icon</label>
              <div className="grid grid-cols-7 gap-2">
                {icons.map((i) => (
                  <button
                    key={i.name}
                    type="button"
                    onClick={() => setFormData({...formData, icon: i.name})}
                    className={`p-3 rounded-xl border transition-all flex items-center justify-center ${formData.icon === i.name ? 'bg-primary text-black border-primary' : 'bg-white/5 text-gray-500 border-white/10 hover:border-white/20'}`}
                  >
                    {i.icon}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  className="w-5 h-5 rounded border-white/10 bg-white/5 text-primary focus:ring-primary"
                />
                <span className="text-xs font-black text-gray-500 uppercase tracking-widest group-hover:text-gray-300 transition-colors">Show in Footer</span>
              </label>
            </div>
            <div className="md:col-span-2 flex justify-end gap-4 mt-4">
              <button 
                type="button"
                onClick={() => { setShowAddForm(false); setEditingId(null); }}
                className="px-8 py-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl transition-all font-black uppercase tracking-widest text-xs border border-white/10"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="luxury-button px-12 py-3 flex items-center gap-3"
              >
                <Save size={18} />
                <span className="uppercase tracking-widest text-xs font-black">{editingId ? 'Update' : 'Save'} Contact</span>
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="luxury-card overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.02]">
              <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Platform</th>
              <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Contact Info</th>
              <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Status</th>
              <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr>
                <td colSpan="4" className="px-8 py-20 text-center">
                  <RefreshCw className="animate-spin text-primary mx-auto mb-4" size={32} />
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Loading contacts...</span>
                </td>
              </tr>
            ) : contacts.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-8 py-20 text-center text-gray-500 font-black uppercase tracking-widest text-xs">
                  No contacts found. Add your first one above.
                </td>
              </tr>
            ) : (
              contacts.map((contact) => (
                <tr key={contact._id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-primary border border-white/10">
                        {getIconComponent(contact.icon)}
                      </div>
                      <span className="text-sm font-black text-white uppercase tracking-tight">{contact.platform}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-xs font-bold text-gray-400 truncate max-w-[200px] inline-block">{contact.value}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${contact.isActive ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'}`}></div>
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                        {contact.isActive ? 'Active' : 'Hidden'}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                      <button 
                        onClick={() => startEdit(contact)}
                        className="p-2.5 bg-white/5 text-gray-400 hover:text-primary hover:bg-white/10 rounded-xl transition-all border border-white/10"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(contact._id)}
                        className="p-2.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all border border-red-500/20"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminContactManager;
