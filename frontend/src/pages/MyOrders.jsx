import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config';
import { useSocket } from '../context/SocketContext';
import { 
  ShoppingBag, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ChevronRight,
  Info,
  ShieldCheck,
  Smartphone,
  RefreshCw,
  Bell
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const MyOrders = () => {
  const socket = useSocket();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [updateNoti, setUpdateNoti] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchMyOrders();
  }, [user]);

  useEffect(() => {
    if (socket) {
      socket.on('orderUpdated', (data) => {
        // Refresh the list
        fetchMyOrders();
        // Show notification
        setUpdateNoti(data);
        // Play sound
        const audio = new Audio('/assets/sounds/notification.mp3');
        audio.play().catch(e => console.log('Audio play failed'));
        // Clear after 5s
        setTimeout(() => setUpdateNoti(null), 5000);
      });

      return () => socket.off('orderUpdated');
    }
  }, [socket]);

  const fetchMyOrders = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/v1/orders/my-orders`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setOrders(res.data.data);
      
      // Mark all as read when visiting history
      await axios.put(`${API_URL}/api/v1/messages/read-all`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      // Tell navbar to refresh
      if (socket && user) {
        socket.emit('refreshNotifications', user.id);
      }
    } catch (err) {
      console.error('Error fetching orders', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock size={20} className="text-yellow-500" />;
      case 'completed': return <CheckCircle2 size={20} className="text-green-500" />;
      case 'rejected': return <XCircle size={20} className="text-red-500" />;
      default: return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="w-12 h-1 bg-primary rounded-full"></span>
            <span className="text-primary font-black uppercase tracking-[0.3em] text-xs">Customer Inbox</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase">My <span className="gold-text-gradient">Orders</span></h1>
          <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-[10px] mt-2">Track your premium top-up status</p>
        </div>
        <Link to="/" className="luxury-button flex items-center gap-3 px-8 py-4">
          <ShoppingBag size={20} />
          <span className="uppercase tracking-widest text-sm font-black">Shop More</span>
        </Link>
      </div>

      {/* Real-time Status Notification */}
      {updateNoti && (
        <div className="fixed top-24 right-4 z-[200] animate-in slide-in-from-right duration-500 max-w-sm w-full">
          <div className={`p-4 rounded-2xl shadow-2xl flex items-center gap-4 border ${updateNoti.status === 'completed' ? 'bg-green-500 text-black border-green-600' : 'bg-red-500 text-white border-red-600'}`}>
            <div className="w-12 h-12 bg-black/10 rounded-xl flex items-center justify-center">
              <Bell size={24} className="animate-bounce" />
            </div>
            <div className="flex-1">
              <p className="font-black uppercase tracking-widest text-xs">{updateNoti.title}</p>
              <p className="text-[10px] font-bold opacity-90 line-clamp-1">{updateNoti.content}</p>
            </div>
            <button onClick={() => setUpdateNoti(null)} className="p-1 hover:bg-black/5 rounded-lg">
              <XCircle size={18} />
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="flex flex-col items-center py-20 gap-4">
            <RefreshCw className="animate-spin text-primary" size={48} />
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Accessing Secure Records...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="luxury-card p-20 text-center border-dashed">
            <ShoppingBag size={64} className="text-gray-800 mx-auto mb-6" />
            <h3 className="text-xl font-black text-white uppercase mb-2">No Orders Found</h3>
            <p className="text-gray-500 font-bold text-sm mb-8">You haven't made any purchases yet.</p>
            <Link to="/" className="text-primary hover:text-white font-black uppercase tracking-widest text-xs border-b-2 border-primary/20 pb-1 transition-all">Start Shopping</Link>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order._id} className="luxury-card group border-white/5 hover:border-primary/20 transition-all duration-500 overflow-hidden">
              <div className="p-8">
                <div className="flex flex-col lg:flex-row justify-between gap-8">
                  {/* Left: Product Info */}
                  <div className="flex gap-6">
                    <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center text-primary group-hover:bg-primary/10 transition-colors">
                      <Smartphone size={36} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5 ${order.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' : order.status === 'completed' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                          {getStatusIcon(order.status)}
                          {order.status}
                        </span>
                        <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">#{order._id.slice(-8)}</span>
                      </div>
                      <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-1">{order.product_name}</h3>
                      <p className="text-gray-500 font-bold text-xs uppercase tracking-widest">{order.game} • ID: {order.player_id}</p>
                    </div>
                  </div>

                  {/* Middle: Price & Date */}
                  <div className="flex flex-row lg:flex-col justify-between lg:justify-center items-center lg:items-end gap-2 border-t lg:border-t-0 border-white/5 pt-6 lg:pt-0">
                    <p className="text-2xl font-black text-white">{order.selling_price.toLocaleString()} <span className="text-sm text-primary font-bold">Ks</span></p>
                    <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">{new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>

                {/* Rejection Message */}
                {order.status === 'rejected' && (
                  <div className="mt-8 p-6 bg-red-500/5 border border-red-500/10 rounded-2xl flex items-start gap-4">
                    <Info size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1">Admin Feedback</p>
                      <p className="text-sm text-red-500/80 font-bold leading-relaxed">{order.rejection_reason || "Your transaction could not be verified. Please contact support."}</p>
                    </div>
                  </div>
                )}

                {/* Completion Message */}
                {order.status === 'completed' && (
                  <div className="mt-8 p-6 bg-green-500/5 border border-green-500/10 rounded-2xl flex items-start gap-4">
                    <ShieldCheck size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-black text-green-500 uppercase tracking-widest mb-1">Status Update</p>
                      <p className="text-sm text-green-500/80 font-bold leading-relaxed">Your premium top-up has been successfully delivered to your game account. Thank you for choosing our elite service.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyOrders;
