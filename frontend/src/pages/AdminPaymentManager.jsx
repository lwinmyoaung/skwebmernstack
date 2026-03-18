import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config';
import { 
  ArrowLeft, 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  X, 
  CheckCircle2, 
  AlertCircle,
  Smartphone,
  Image as ImageIcon
} from 'lucide-react';

const AdminPaymentManager = () => {
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [form, setForm] = useState({
    name: '',
    phone_number: '',
    status: 'active'
  });
  const [imageFile, setImageFile] = useState(null);

  const fetchMethods = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/v1/payment-methods/admin`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setMethods(res.data.data);
    } catch (err) {
      console.error('Error fetching payment methods', err);
      setMessage({ type: 'error', text: 'Failed to load payment methods' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMethods();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('phone_number', form.phone_number);
    formData.append('status', form.status);
    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      await axios.post(`${API_URL}/api/v1/payment-methods`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setMessage({ type: 'success', text: 'Payment method created successfully' });
      setIsAdding(false);
      setForm({ name: '', phone_number: '', status: 'active' });
      setImageFile(null);
      fetchMethods();
    } catch (err) {
      const errorMessage = err.response?.data?.message?.message || err.response?.data?.message || 'Creation failed';
      setMessage({ type: 'error', text: errorMessage });
    }
  };

  const handleUpdate = async (id) => {
    try {
      await axios.put(`${API_URL}/api/v1/payment-methods/${id}`, form, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setMessage({ type: 'success', text: 'Payment method updated successfully' });
      setEditingId(null);
      fetchMethods();
    } catch (err) {
      setMessage({ type: 'error', text: 'Update failed' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this payment method?')) return;
    try {
      await axios.delete(`${API_URL}/api/v1/payment-methods/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setMessage({ type: 'success', text: 'Payment method deleted' });
      fetchMethods();
    } catch (err) {
      setMessage({ type: 'error', text: 'Delete failed' });
    }
  };

  const startEdit = (method) => {
    setEditingId(method._id);
    setForm({
      name: method.name,
      image: method.image,
      phone_number: method.phone_number,
      status: method.status
    });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('paymentImage', file);
    setUploading(true);
    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      };
      const { data } = await axios.post(`${API_URL}/api/v1/upload/payment-method`, formData, config);
      setForm({ ...form, image: data.data });
      setMessage({ type: 'success', text: 'Image uploaded successfully' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Image upload failed' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl pb-32">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-6">
        <div className="flex items-center gap-6">
          <Link to="/admin" className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all text-gray-400 border border-white/10">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter uppercase">Payment <span className="gold-text-gradient">Methods</span></h1>
            <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-[10px] mt-1">Manage your digital banking options</p>
          </div>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="luxury-button w-full md:w-auto flex items-center justify-center gap-3 px-8 py-4"
        >
          <Plus size={20} />
          <span className="uppercase tracking-widest text-sm font-black">Add New Method</span>
        </button>
      </div>

      {message.text && (
        <div className={`mb-8 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 ${message.type === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
          {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span className="font-bold text-sm">{message.text}</span>
        </div>
      )}

      {/* Add Form Overlay */}
      {isAdding && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="luxury-card w-full max-w-md p-8 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-black text-white uppercase tracking-tight">New Payment Method</h2>
              <button onClick={() => setIsAdding(false)} className="text-gray-500 hover:text-white"><X size={24} /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-gray-500 ml-1">Method Name</label>
                <input 
                  type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-primary/50 text-white font-bold transition-all"
                  placeholder="e.g. KBZ Pay"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-gray-500 ml-1">Image</label>
                <input 
                  type="file" 
                  required
                  onChange={(e) => setImageFile(e.target.files[0])}
                  className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-gray-500 ml-1">Account Phone Number</label>
                <input 
                  type="text" required value={form.phone_number} onChange={e => setForm({...form, phone_number: e.target.value})}
                  className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-primary/50 text-white font-bold transition-all"
                  placeholder="09..."
                />
              </div>
              <button type="submit" className="w-full luxury-button py-4 mt-4 uppercase tracking-[0.2em] text-xs font-black">Save Method</button>
            </form>
          </div>
        </div>
      )}

      {/* Methods Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 flex flex-col items-center gap-4 text-gray-500">
            <ImageIcon className="animate-pulse" size={48} />
            <p className="uppercase tracking-widest text-xs font-black">Loading Payment Infrastructure...</p>
          </div>
        ) : methods.length === 0 ? (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-white/5 rounded-[2.5rem]">
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">No payment methods configured yet.</p>
          </div>
        ) : (
          methods.map((m) => (
            <div key={m._id} className="luxury-card overflow-hidden group border-white/5 hover:border-primary/30 transition-all duration-500">
              <div className="relative h-40 bg-white/5 flex items-center justify-center overflow-hidden">
                <img src={m.image} alt={m.name} loading="lazy" className="h-24 w-auto object-contain transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60"></div>
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${m.status === 'active' ? 'bg-primary text-black' : 'bg-red-500/20 text-red-500 border border-red-500/20'}`}>
                    {m.status}
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                {editingId === m._id ? (
                  <div className="space-y-4">
                    <input 
                      type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                      className="w-full px-4 py-2 bg-white/5 border border-primary/50 rounded-xl text-white text-sm font-bold"
                    />
                    <input 
                      type="text" value={form.phone_number} onChange={e => setForm({...form, phone_number: e.target.value})}
                      className="w-full px-4 py-2 bg-white/5 border border-primary/50 rounded-xl text-white text-sm font-bold"
                    />
                    <select 
                      value={form.status} onChange={e => setForm({...form, status: e.target.value})}
                      className="w-full px-4 py-2 bg-white/5 border border-primary/50 rounded-xl text-white text-sm font-bold"
                    >
                      <option value="active" className="bg-black">Active</option>
                      <option value="inactive" className="bg-black">Inactive</option>
                    </select>
                    <div className="flex gap-2 pt-2">
                      <button onClick={() => handleUpdate(m._id)} className="flex-grow py-2 bg-primary text-black rounded-xl font-bold text-xs uppercase tracking-widest">Update</button>
                      <button onClick={() => setEditingId(null)} className="px-4 py-2 bg-white/5 text-white rounded-xl font-bold text-xs"><X size={16} /></button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mb-4">
                      <h3 className="text-lg font-black text-white uppercase tracking-tight">{m.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Smartphone size={12} className="text-primary" />
                        <span className="text-xs font-bold text-gray-500 tracking-wider">{m.phone_number}</span>
                      </div>
                    </div>
                    <div className="flex gap-3 pt-4 border-t border-white/5">
                      <button 
                        onClick={() => startEdit(m)}
                        className="flex-grow flex items-center justify-center gap-2 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                      >
                        <Edit2 size={14} /> Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(m._id)}
                        className="p-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminPaymentManager;
