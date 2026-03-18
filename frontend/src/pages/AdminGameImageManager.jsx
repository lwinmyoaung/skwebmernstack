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
  Gamepad2
} from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminGameImageManager = () => {
  const API_BASE = API_URL;
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingImage, setEditingImage] = useState(null);
  
  // Form fields
  const [gameId, setGameId] = useState('mlbb');
  const [order, setOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const gamesList = [
    { id: 'mlbb', name: 'Mobile Legends' },
    { id: 'pubg', name: 'PUBG Mobile' },
    { id: 'mcgg', name: 'Magic Chess GoGo' },
    { id: 'wwm', name: 'WWM' },
    { id: 'freefire', name: 'Free Fire' }
  ];

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE}/api/v1/game-images/admin`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setImages(res.data.data);
    } catch (err) {
      console.error('Error fetching game images', err);
      alert('Failed to fetch game images');
    } finally {
      setLoading(false);
    }
  };

  const handleSeedDefaults = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE}/api/v1/game-images/seed`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Default game images loaded successfully!');
      fetchImages();
    } catch (err) {
      console.error('Error seeding game images', err);
      alert(err.response?.data?.message || 'Failed to load default game images');
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
    setGameId('mlbb');
    setOrder(0);
    setIsActive(true);
    setImageFile(null);
    setImagePreview('');
    setEditingImage(null);
    setShowAddModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('gameId', gameId);
    formData.append('order', order);
    formData.append('isActive', isActive);
    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      if (editingImage) {
        await axios.put(`${API_BASE}/api/v1/game-images/${editingImage._id}`, formData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        alert('Game image updated successfully');
      } else {
        if (!imageFile) {
          alert('Please select an image');
          return;
        }
        await axios.post(`${API_BASE}/api/v1/game-images`, formData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        alert('Game image added successfully');
      }
      resetForm();
      fetchImages();
    } catch (err) {
      console.error('Error saving game image', err);
      alert(err.response?.data?.message || 'Failed to save game image');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const res = await axios.delete(`${API_BASE}/api/v1/game-images/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data.success) {
        alert('Image deleted successfully');
        fetchImages();
      }
    } catch (err) {
      console.error('Error deleting game image', err);
      alert(err.response?.data?.message || 'Failed to delete game image');
    }
  };

  const handleEdit = (img) => {
    setEditingImage(img);
    setGameId(img.gameId);
    setOrder(img.order || 0);
    setIsActive(img.isActive);
    setImagePreview(img.image);
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
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter uppercase">Game Images <span className="gold-text-gradient">Manager</span></h1>
            <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-[10px] mt-1">Manage game card slideshow images</p>
          </div>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="luxury-button w-full md:w-auto flex items-center justify-center gap-3 px-8 py-4"
        >
          <Plus size={20} />
          <span className="uppercase tracking-widest text-sm font-black">Add New Game Image</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {loading ? (
          <div className="col-span-full flex justify-center py-20">
            <RefreshCw className="animate-spin text-primary" size={48} />
          </div>
        ) : images.length === 0 ? (
          <div className="col-span-full luxury-card p-20 text-center border-dashed border-white/5 space-y-8">
            <div className="space-y-4">
              <Gamepad2 size={64} className="text-gray-800 mx-auto mb-6" />
              <p className="text-gray-500 font-black uppercase tracking-widest text-xs">No manageable game images found in database.</p>
              <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest max-w-md mx-auto leading-relaxed">
                The storefront is currently showing default images. Click the button below to import them into the manager.
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
          images.map((img) => (
            <div key={img._id} className="luxury-card overflow-hidden group">
              <div className="relative aspect-[4/5]">
                <img src={getImageUrl(img.image)} alt={img.gameId} loading="lazy" className="w-full h-full object-cover" />
                <div className="absolute top-4 right-4 flex gap-2">
                  <div className={`p-2 rounded-lg backdrop-blur-md ${img.isActive ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                    {img.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                  </div>
                  <div className="p-2 rounded-lg bg-black/50 text-white font-black text-[10px] backdrop-blur-md border border-white/10">
                    Order: {img.order}
                  </div>
                </div>
                <div className="absolute bottom-4 left-4">
                  <span className="px-3 py-1 bg-primary text-black font-black text-[10px] rounded-full uppercase tracking-widest shadow-lg">
                    {gamesList.find(g => g.id === img.gameId)?.name || img.gameId}
                  </span>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex gap-4">
                  <button 
                    onClick={() => handleEdit(img)}
                    className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest text-[10px] rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <Edit size={14} /> Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(img._id)}
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
                {editingImage ? 'Edit' : 'Add New'} <span className="gold-text-gradient">Game Image</span>
              </h2>
              <p className="text-gray-500 font-bold text-xs uppercase tracking-widest mt-2">Configure game card image settings</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Image Upload */}
              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-[0.2em] font-black text-gray-500 ml-1">Game Image</label>
                <div 
                  className="relative aspect-[4/5] rounded-3xl border-2 border-dashed border-white/10 overflow-hidden flex items-center justify-center group cursor-pointer hover:border-primary/50 transition-all bg-white/5 max-w-[300px] mx-auto"
                  onClick={() => document.getElementById('game-image-upload').click()}
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
                  id="game-image-upload"
                  type="file" 
                  className="hidden" 
                  onChange={handleImageChange}
                  accept="image/*"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-[0.2em] font-black text-gray-500 ml-1">Select Game Category</label>
                  <select 
                    value={gameId}
                    onChange={(e) => setGameId(e.target.value)}
                    className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-primary/50 text-white font-bold transition-all appearance-none"
                  >
                    {gamesList.map(game => (
                      <option key={game.id} value={game.id} className="bg-dark-soft">{game.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-[0.2em] font-black text-gray-500 ml-1">Display Order</label>
                  <input 
                    type="number" 
                    value={order}
                    onChange={(e) => setOrder(e.target.value)}
                    className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-primary/50 text-white font-bold transition-all"
                  />
                </div>
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
                  <Check size={20} /> {editingImage ? 'Update Image' : 'Add Image'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminGameImageManager;
