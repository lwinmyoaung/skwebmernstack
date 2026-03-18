import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import { 
  Plus, 
  Trash2, 
  Video, 
  RefreshCw, 
  ArrowLeft, 
  Check, 
  X,
  Eye,
  EyeOff,
  Link as LinkIcon
} from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminHowToUse = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [order, setOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState('');

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/v1/how-to-use/admin`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setItems(res.data.data);
    } catch (err) {
      console.error('Error fetching how-to-use items', err);
      alert('Failed to fetch items');
    } finally {
      setLoading(false);
    }
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
      setVideoUrl(''); // Clear external URL if file is selected
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setVideoUrl('');
    setOrder(0);
    setIsActive(true);
    setVideoFile(null);
    setVideoPreview('');
    setShowAddModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('videoUrl', videoUrl);
    formData.append('order', order);
    formData.append('isActive', isActive);
    if (videoFile) {
      formData.append('video', videoFile);
    }

    try {
      if (!videoFile && !videoUrl) {
        alert('Please select a video file or provide a URL');
        return;
      }
      
      await axios.post(`${API_URL}/api/v1/how-to-use`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      alert('Item added successfully');
      resetForm();
      fetchItems();
    } catch (err) {
      console.error('Error saving item', err);
      alert(err.response?.data?.message || 'Failed to save item');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/v1/how-to-use/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchItems();
    } catch (err) {
      console.error('Error deleting item', err);
      alert('Failed to delete item');
    }
  };

  const getFullVideoUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http') || path.startsWith('data:')) return path;
    return `${API_URL}${path}`;
  };

  return (
    <div className="container mx-auto px-4 pt-12 md:pt-20 pb-32 max-w-7xl">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-6">
        <div className="flex items-center gap-6">
          <Link to="/admin" className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all text-gray-400 border border-white/10">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter uppercase">How To Use <span className="gold-text-gradient">Manager</span></h1>
            <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-[10px] mt-1">Manage tutorial videos</p>
          </div>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="luxury-button w-full md:w-auto flex items-center justify-center gap-3 px-8 py-4"
        >
          <Plus size={20} />
          <span className="uppercase tracking-widest text-sm font-black">Add New Video</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {loading ? (
          <div className="col-span-full flex justify-center py-20">
            <RefreshCw className="animate-spin text-primary" size={48} />
          </div>
        ) : items.length === 0 ? (
          <div className="col-span-full luxury-card p-20 text-center border-dashed border-white/5 space-y-8">
            <div className="space-y-4">
              <Video size={64} className="text-gray-800 mx-auto mb-6" />
              <p className="text-gray-500 font-black uppercase tracking-widest text-xs">No videos found in database.</p>
              <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest max-w-md mx-auto leading-relaxed">
                Add a tutorial video to help your users understand how to use the store.
              </p>
            </div>
          </div>
        ) : (
          items.map((item) => (
            <div key={item._id} className="luxury-card overflow-hidden group">
              <div className="relative aspect-video bg-black flex items-center justify-center">
                {item.videoUrl.startsWith('/uploads/') ? (
                  <video 
                    src={getFullVideoUrl(item.videoUrl)} 
                    className="w-full h-full object-cover"
                    controls
                  />
                ) : (
                  <div className="flex flex-col items-center gap-3 p-6 text-center">
                    <LinkIcon size={48} className="text-primary/40" />
                    <p className="text-[10px] text-gray-400 font-bold uppercase truncate max-w-full">{item.videoUrl}</p>
                  </div>
                )}
                <div className="absolute top-4 right-4 flex gap-2">
                  <div className={`p-2 rounded-lg backdrop-blur-md ${item.isActive ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                    {item.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                  </div>
                  <div className="p-2 rounded-lg bg-black/50 text-white font-black text-[10px] backdrop-blur-md border border-white/10">
                    Order: {item.order}
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <h3 className="text-lg font-black text-white uppercase tracking-tight truncate">{item.title}</h3>
                  <p className="text-xs text-gray-500 font-medium line-clamp-2 mt-2">{item.description || 'No description provided.'}</p>
                </div>
                <div className="flex gap-4 pt-4 border-t border-white/5">
                  <button 
                    onClick={() => handleDelete(item._id)}
                    className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-black uppercase tracking-widest text-[10px] rounded-xl border border-red-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    <Trash2 size={14} /> Delete Video
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in">
          <div className="luxury-card max-w-2xl w-full p-10 space-y-8 overflow-y-auto max-h-[90vh]">
            <div className="text-center">
              <h2 className="text-3xl font-black text-white uppercase tracking-tighter">
                Add New <span className="gold-text-gradient">Video</span>
              </h2>
              <p className="text-gray-500 font-bold text-xs uppercase tracking-widest mt-2">Configure tutorial video and settings</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-[0.2em] font-black text-gray-500 ml-1">Title</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-primary/50 text-white font-bold transition-all"
                  placeholder="Enter video title"
                  required
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-[0.2em] font-black text-gray-500 ml-1">Description (Optional)</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-primary/50 text-white font-bold transition-all min-h-[100px]"
                  placeholder="Enter video description"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-[0.2em] font-black text-gray-500 ml-1">Video File (Upload)</label>
                  <div 
                    className="relative aspect-video rounded-3xl border-2 border-dashed border-white/10 overflow-hidden flex items-center justify-center group cursor-pointer hover:border-primary/50 transition-all bg-white/5"
                    onClick={() => document.getElementById('how-to-use-video').click()}
                  >
                    {videoPreview ? (
                      <video src={videoPreview} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center space-y-2">
                        <Video className="text-gray-600 mx-auto" size={48} />
                        <p className="text-[10px] font-black text-gray-500 uppercase">Click to upload video</p>
                      </div>
                    )}
                  </div>
                  <input 
                    id="how-to-use-video"
                    type="file" 
                    className="hidden" 
                    onChange={handleVideoChange}
                    accept="video/*"
                  />
                </div>
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase tracking-[0.2em] font-black text-gray-500 ml-1">OR External Video URL</label>
                    <input 
                      type="text" 
                      value={videoUrl}
                      onChange={(e) => {
                        setVideoUrl(e.target.value);
                        setVideoFile(null);
                        setVideoPreview('');
                      }}
                      className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-primary/50 text-white font-bold transition-all"
                      placeholder="e.g. https://youtube.com/..."
                    />
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
                  <Check size={20} /> Create Video Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminHowToUse;
