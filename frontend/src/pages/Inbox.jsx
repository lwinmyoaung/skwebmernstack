import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config';
import { useSocket } from '../context/SocketContext';
import { 
  Bell, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Trash2,
  MailOpen,
  Mail,
  RefreshCw,
  ChevronLeft
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Inbox = () => {
  const socket = useSocket();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchMessages();
  }, [user]);

  useEffect(() => {
    if (socket) {
      socket.on('orderUpdated', () => {
        fetchMessages();
      });
      return () => socket.off('orderUpdated');
    }
  }, [socket]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/v1/messages`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setMessages(res.data.data);
      
      // Mark all as read when visiting inbox
      await axios.put(`${API_URL}/api/v1/messages/read-all`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      // Tell navbar to refresh
      if (socket && user) {
        socket.emit('refreshNotifications', user.id);
      }
    } catch (err) {
      console.error('Error fetching messages', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.put(`${API_URL}/api/v1/messages/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setMessages(messages.map(m => m._id === id ? { ...m, is_read: true } : m));
    } catch (err) {
      console.error('Error marking as read', err);
    }
  };

  const deleteMessage = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/v1/messages/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setMessages(messages.filter(m => m._id !== id));
    } catch (err) {
      console.error('Error deleting message', err);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="w-12 h-1 bg-primary rounded-full"></span>
            <span className="text-primary font-black uppercase tracking-[0.3em] text-xs">Secure Inbox</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase">My <span className="gold-text-gradient">Messages</span></h1>
          <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-[10px] mt-2">Personal notifications & status updates</p>
        </div>
        <button onClick={() => navigate(-1)} className="luxury-button flex items-center gap-3 px-8 py-4">
          <ChevronLeft size={20} />
          <span className="uppercase tracking-widest text-sm font-black">Go Back</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="flex flex-col items-center py-20 gap-4">
            <RefreshCw className="animate-spin text-primary" size={48} />
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Accessing Secure Records...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="luxury-card p-20 text-center border-dashed border-white/5">
            <Bell size={64} className="text-gray-800 mx-auto mb-6" />
            <h3 className="text-xl font-black text-white uppercase mb-2">Inbox is Empty</h3>
            <p className="text-gray-500 font-bold text-sm">No notifications available at this time.</p>
          </div>
        ) : (
          messages.map((message) => (
            <div 
              key={message._id} 
              className={`luxury-card group transition-all duration-500 overflow-hidden ${message.is_read ? 'opacity-60 grayscale-[0.5]' : 'border-primary/20 shadow-[0_0_30px_rgba(212,175,55,0.05)]'}`}
              onMouseEnter={() => !message.is_read && markAsRead(message._id)}
            >
              <div className="p-8">
                <div className="flex items-start gap-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-colors ${message.type === 'success' ? 'bg-green-500/10 text-green-500' : message.type === 'error' ? 'bg-red-500/10 text-red-500' : 'bg-primary/10 text-primary'}`}>
                    {message.type === 'success' ? <CheckCircle2 size={28} /> : message.type === 'error' ? <XCircle size={28} /> : <Bell size={28} />}
                  </div>
                  
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-black text-white uppercase tracking-tight truncate">{message.title}</h3>
                        {!message.is_read && <span className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(212,175,55,1)]"></span>}
                      </div>
                      <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest flex-shrink-0">{new Date(message.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-gray-400 font-bold text-sm leading-relaxed mb-6">{message.content}</p>
                    
                    <div className="flex items-center justify-between pt-6 border-t border-white/5">
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-600">
                        {message.is_read ? <MailOpen size={12} /> : <Mail size={12} />}
                        {message.is_read ? 'Seen' : 'Unread'}
                      </div>
                      <button 
                        onClick={() => deleteMessage(message._id)}
                        className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                        title="Delete Notification"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Inbox;
