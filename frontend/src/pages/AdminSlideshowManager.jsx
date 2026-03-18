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
  EyeOff
} from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminSlideshowManager = () => {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSlide, setEditingSlide] = useState(null);
  
  // Form fields
  const [title, setTitle] = useState('');
  const [link, setLink] = useState('');
  const [order, setOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/v1/slideshows/admin`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSlides(res.data.data);
    } catch (err) {
      console.error('Error fetching slides', err);
      alert('Failed to fetch slideshows');
    } finally {
      setLoading(false);
    }
  };

  const handleSeedDefaults = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/api/v1/slideshows/seed`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Default slides loaded successfully!');
      fetchSlides();
    } catch (err) {
      console.error('Error seeding slides', err);
      alert(err.response?.data?.message || 'Failed to load default slides');
    } finally {
      setLoading(false);
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
    setTitle('');
    setLink('');
    setOrder(0);
    setIsActive(true);
    setImageFile(null);
    setImagePreview('');
    setEditingSlide(null);
    setShowAddModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('title', title);
    formData.append('link', link);
    formData.append('order', order);
    formData.append('isActive', isActive);
    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      if (editingSlide) {
        await axios.put(`${API_URL}/api/v1/slideshows/${editingSlide._id}`, formData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        alert('Slide updated successfully');
      } else {
        if (!imageFile) {
          alert('Please select an image');
          return;
        }
        await axios.post(`${API_URL}/api/v1/slideshows`, formData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        alert('Slide added successfully');
      }
      resetForm();
      fetchSlides();
    } catch (err) {
      console.error('Error saving slide', err);
      alert(err.response?.data?.message || 'Failed to save slide');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this slide?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/v1/slideshows/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchSlides();
    } catch (err) {
      console.error('Error deleting slide', err);
      alert('Failed to delete slide');
    }
  };

  const handleEdit = (slide) => {
    setEditingSlide(slide);
    setTitle(slide.title || '');
    setLink(slide.link || '');
    setOrder(slide.order || 0);
    setIsActive(slide.isActive);
    setImagePreview(slide.image);
    setShowAddModal(true);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl pb-32">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-6">
        <div className="flex items-center gap-6">
          <Link to="/admin" className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all text-gray-400 border border-white/10">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter uppercase">Slideshow <span className="gold-text-gradient">Manager</span></h1>
            <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-[10px] mt-1">Manage home screen banners</p>
          </div>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="luxury-button w-full md:w-auto flex items-center justify-center gap-3 px-8 py-4"
        >
          <Plus size={20} />
          <span className="uppercase tracking-widest text-sm font-black">Add New Slide</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {loading ? (
          <div className="col-span-full flex justify-center py-20">
            <RefreshCw className="animate-spin text-primary" size={48} />
          </div>
        ) : slides.length === 0 ? (
          <div className="col-span-full luxury-card p-20 text-center border-dashed border-white/5 space-y-8">
            <div className="space-y-4">
              <ImageIcon size={64} className="text-gray-800 mx-auto mb-6" />
              <p className="text-gray-500 font-black uppercase tracking-widest text-xs">No manageable slides found in database.</p>
              <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest max-w-md mx-auto leading-relaxed">
                The user side is currently showing system default banners. Click the button below to import them into the manager.
              </p>
            </div>
            <button 
              onClick={handleSeedDefaults}
              className="luxury-button px-10 py-4 flex items-center gap-3 mx-auto group shadow-[0_0_30px_rgba(212,175,55,0.1)] hover:shadow-[0_0_40px_rgba(212,175,55,0.2)] transition-all"
            >
              <RefreshCw size={20} className="group-hover:rotate-180 transition-transform duration-700" />
              <span className="uppercase tracking-widest text-sm font-black">Import System Defaults</span>
            </button>
          </div>
        ) : (
          slides.map((slide) => (
            <div key={slide._id} className="luxury-card overflow-hidden group">
              <div className="relative aspect-video">
                <img src={getImageUrl(slide.image)} alt={slide.title} loading="lazy" className="w-full h-full object-cover" />
                <div className="absolute top-4 right-4 flex gap-2">
                  <div className={`p-2 rounded-lg backdrop-blur-md ${slide.isActive ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                    {slide.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                  </div>
                  <div className="p-2 rounded-lg bg-black/50 text-white font-black text-[10px] backdrop-blur-md border border-white/10">
                    Order: {slide.order}
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <h3 className="text-lg font-black text-white uppercase tracking-tight truncate">{slide.title || 'Untitled Slide'}</h3>
                  <p className="text-[10px] text-gray-500 font-bold truncate uppercase tracking-widest mt-1">{slide.link || 'No Link'}</p>
                </div>
                <div className="flex gap-4 pt-4 border-t border-white/5">
                  <button 
                    onClick={() => handleEdit(slide)}
                    className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest text-[10px] rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <Edit size={14} /> Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(slide._id)}
                    className="flex-1 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-black uppercase tracking-widest text-[10px] rounded-xl border border-red-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in">
          <div className="luxury-card max-w-2xl w-full p-10 space-y-8 overflow-y-auto max-h-[90vh]">
            <div className="text-center">
              <h2 className="text-3xl font-black text-white uppercase tracking-tighter">
                {editingSlide ? 'Edit' : 'Add New'} <span className="gold-text-gradient">Slide</span>
              </h2>
              <p className="text-gray-500 font-bold text-xs uppercase tracking-widest mt-2">Configure banner image and settings</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Image Upload */}
              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-[0.2em] font-black text-gray-500 ml-1">Banner Image</label>
                <div 
                  className="relative aspect-video rounded-3xl border-2 border-dashed border-white/10 overflow-hidden flex items-center justify-center group cursor-pointer hover:border-primary/50 transition-all bg-white/5"
                  onClick={() => document.getElementById('slide-image').click()}
                >
                  {imagePreview ? (
                    <img src={getImageUrl(imagePreview)} alt="Preview" loading="lazy" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center space-y-2">
                      <ImageIcon className="text-gray-600 mx-auto" size={48} />
                      <p className="text-[10px] font-black text-gray-500 uppercase">Click to upload image</p>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-xs font-black text-white uppercase">Change Image</p>
                  </div>
                </div>
                <input 
                  id="slide-image"
                  type="file" 
                  className="hidden" 
                  onChange={handleImageChange}
                  accept="image/*"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-[0.2em] font-black text-gray-500 ml-1">Title (Optional)</label>
                  <input 
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-primary/50 text-white font-bold transition-all"
                    placeholder="Enter slide title"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-[0.2em] font-black text-gray-500 ml-1">Link URL (Optional)</label>
                  <input 
                    type="text" 
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-primary/50 text-white font-bold transition-all"
                    placeholder="e.g. /game/mlbb"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-[0.2em] font-black text-gray-500 ml-1">Display Order</label>
                  <input 
                    type="number" 
                    value={order}
                    onChange={(e) => setOrder(e.target.value)}
                    className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-primary/50 text-white font-bold transition-all"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-[0.2em] font-black text-gray-500 ml-1">Visibility</label>
                  <div className="flex gap-4">
                    <button 
                      type="button"
                      onClick={() => setIsActive(true)}
                      className={`flex-1 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 ${isActive ? 'bg-green-500 text-black shadow-[0_0_20px_rgba(34,197,94,0.3)]' : 'bg-white/5 text-gray-500 border border-white/5'}`}
                    >
                      <Eye size={16} /> Visible
                    </button>
                    <button 
                      type="button"
                      onClick={() => setIsActive(false)}
                      className={`flex-1 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 ${!isActive ? 'bg-red-500 text-black shadow-[0_0_20px_rgba(239,68,68,0.3)]' : 'bg-white/5 text-gray-500 border border-white/5'}`}
                    >
                      <EyeOff size={16} /> Hidden
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <button 
                  type="button"
                  onClick={resetForm}
                  className="flex-1 py-5 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest text-xs rounded-2xl transition-all border border-white/10"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-5 luxury-button font-black uppercase tracking-widest text-xs rounded-2xl transition-all flex items-center justify-center gap-3"
                >
                  <Check size={20} /> {editingSlide ? 'Update Slide' : 'Create Slide'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSlideshowManager;
