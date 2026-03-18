import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import { getImageUrl } from '../utils/image';
import { 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  RefreshCw, 
  ArrowLeft, 
  Edit, 
  Check, 
  X,
  Eye,
  EyeOff,
  Link as LinkIcon,
  Layers
} from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminLogoManager = () => {
  const [logos, setLogos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingLogo, setEditingLogo] = useState(null);
  
  // Form fields
  const [name, setName] = useState('');
  const [link, setLink] = useState('');
  const [displayOrder, setDisplayOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    fetchLogos();
  }, []);

  const fetchLogos = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/v1/logos/admin`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLogos(res.data.data);
    } catch (err) {
      console.error('Error fetching logos', err);
      alert('Failed to fetch logos');
    } finally {
      setLoading(false);
    }
  };

  const handleSeed = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/api/v1/logos/seed`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchLogos();
    } catch (err) {
      console.error('Error seeding logo', err);
      alert(err.response?.data?.message || 'Error seeding logo');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setName('');
    setLink('');
    setDisplayOrder(0);
    setIsActive(true);
    setImageFile(null);
    setImagePreview('');
    setEditingLogo(null);
    setShowAddModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('name', name);
    formData.append('link', link);
    formData.append('displayOrder', displayOrder);
    formData.append('isActive', isActive);
    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      if (editingLogo) {
        await axios.put(`${API_URL}/api/v1/logos/${editingLogo._id}`, formData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        if (!imageFile) {
          alert('Please select an image');
          return;
        }
        await axios.post(`${API_URL}/api/v1/logos`, formData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      }
      fetchLogos();
      resetForm();
    } catch (err) {
      console.error('Error saving logo', err);
      alert(err.response?.data?.message || 'Error saving logo');
    }
  };

  const handleEdit = (logo) => {
    setEditingLogo(logo);
    setName(logo.name);
    setLink(logo.link || '');
    setDisplayOrder(logo.displayOrder || 0);
    setIsActive(logo.isActive);
    setImagePreview(getImageUrl(logo.image));
    setShowAddModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this logo?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/v1/logos/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchLogos();
    } catch (err) {
      console.error('Error deleting logo', err);
      alert('Failed to delete logo');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl pb-32">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-6">
        <div>
          <Link to="/admin" className="inline-flex items-center gap-2 text-gray-500 hover:text-primary transition-colors mb-4 group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest">Back to Dashboard</span>
          </Link>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase mb-2">
            Logo <span className="gold-text-gradient">Manager</span>
          </h1>
          <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-[10px]">Manage store logos and partner icons</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="luxury-button px-8 py-4 flex items-center gap-3 group"
        >
          <Plus size={20} className="group-hover:rotate-90 transition-transform duration-500" />
          <span className="uppercase tracking-[0.2em] text-xs font-black">Add New Logo</span>
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <RefreshCw className="text-primary animate-spin" size={48} />
          <p className="text-gray-500 font-black uppercase tracking-widest text-xs">Accessing Database...</p>
        </div>
      ) : logos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-6 luxury-card bg-white/[0.02] border-dashed">
          <Layers size={48} className="text-gray-600" />
          <div className="text-center">
            <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">No Logos Found</h3>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-8">Your logo gallery is currently empty</p>
            <button 
              onClick={handleSeed}
              className="px-8 py-4 bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all flex items-center gap-3 mx-auto"
            >
              <RefreshCw size={16} />
              Import Current Default Logo
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {logos.map((logo) => (
            <div key={logo._id} className="luxury-card group overflow-hidden">
              <div className="relative h-48 bg-white/5 flex items-center justify-center p-8 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"></div>
                <img 
                  src={getImageUrl(logo.image)} 
                  alt={logo.name}
                  loading="lazy"
                  className="max-w-full max-h-full object-contain relative z-0 group-hover:scale-110 transition-transform duration-700"
                />
                
                <div className="absolute bottom-4 right-4 flex gap-2 z-20 translate-y-10 group-hover:translate-y-0 transition-transform duration-500">
                  <button 
                    onClick={() => handleEdit(logo)}
                    className="w-10 h-10 rounded-xl bg-primary text-black flex items-center justify-center hover:bg-white transition-colors shadow-xl"
                  >
                    <Edit size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(logo._id)}
                    className="w-10 h-10 rounded-xl bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors shadow-xl"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                {!logo.isActive && (
                  <div className="absolute top-4 left-4 z-20 px-3 py-1 bg-red-500/20 border border-red-500/50 rounded-full flex items-center gap-2">
                    <EyeOff size={12} className="text-red-500" />
                    <span className="text-[8px] font-black text-red-500 uppercase tracking-widest">Inactive</span>
                  </div>
                )}
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-black text-white uppercase tracking-tight truncate">{logo.name}</h3>
                  <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    #{logo.displayOrder}
                  </div>
                </div>
                
                {logo.link && (
                  <div className="flex items-center gap-2 text-primary/60 text-[10px] font-bold truncate mb-2">
                    <LinkIcon size={12} />
                    <span>{logo.link}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-in fade-in duration-300">
          <div className="luxury-card max-w-2xl w-full p-8 md:p-12 relative overflow-hidden animate-in zoom-in-95 duration-500">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 blur-[80px] rounded-full"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                    <Layers size={24} />
                  </div>
                  <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
                    {editingLogo ? 'Edit' : 'Add New'} <span className="gold-text-gradient">Logo</span>
                  </h2>
                </div>
                <button onClick={resetForm} className="text-gray-500 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Logo Name</label>
                      <input 
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Partner Logo"
                        className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-primary/50 text-white font-bold transition-all"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">External Link (Optional)</label>
                      <input 
                        type="text"
                        value={link}
                        onChange={(e) => setLink(e.target.value)}
                        placeholder="https://..."
                        className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-primary/50 text-white font-bold transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Display Order</label>
                        <input 
                          type="number"
                          value={displayOrder}
                          onChange={(e) => setDisplayOrder(e.target.value)}
                          className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-primary/50 text-white font-bold transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Status</label>
                        <button
                          type="button"
                          onClick={() => setIsActive(!isActive)}
                          className={`w-full h-[60px] rounded-2xl flex items-center justify-center gap-3 font-black uppercase tracking-widest text-[10px] transition-all border ${isActive ? 'bg-green-500/10 border-green-500/50 text-green-500' : 'bg-red-500/10 border-red-500/50 text-red-500'}`}
                        >
                          {isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                          {isActive ? 'Active' : 'Hidden'}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Logo Asset</label>
                    <div className="relative h-full min-h-[200px]">
                      <input 
                        type="file" 
                        onChange={handleImageChange}
                        className="hidden" 
                        id="logo-image"
                        accept="image/*"
                      />
                      <label 
                        htmlFor="logo-image"
                        className="h-full border-2 border-dashed border-white/10 hover:border-primary/50 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer transition-all bg-white/[0.02] group/upload overflow-hidden relative"
                      >
                        {imagePreview ? (
                          <>
                            <img src={imagePreview} alt="Preview" loading="lazy" className="w-full h-full object-contain p-8" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/upload:opacity-100 transition-opacity flex items-center justify-center">
                              <ImageIcon className="text-white" size={32} />
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4 group-hover/upload:bg-primary group-hover/upload:text-black transition-all">
                              <ImageIcon size={32} />
                            </div>
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Click to Upload</span>
                          </>
                        )}
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={resetForm}
                    className="flex-1 py-5 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 luxury-button py-5 flex items-center justify-center gap-3"
                  >
                    <Check size={18} />
                    <span className="uppercase tracking-[0.2em] text-[10px] font-black">{editingLogo ? 'Update Logo' : 'Deploy Logo'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLogoManager;
