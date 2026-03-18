import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config';
import { useSocket } from '../context/SocketContext';
import { 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ExternalLink,
  MessageSquare,
  Search,
  Filter,
  Eye,
  Bell
} from 'lucide-react';

const AdminOrderManager = () => {
  const socket = useSocket();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showRejectModal, setShowReRejectModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [newOrderNoti, setNewOrderNoti] = useState(null);
  const [processingStatus, setProcessingStatus] = useState(null); // { type: 'completed'|'rejected', step: 0, steps: [], status: 'processing'|'done'|'error', message: '' }

  const approveSteps = [
    "Initiating Elite Protocol...",
    "Verifying Player Identity...",
    "Executing Secure Top-up...",
    "Finalizing Order Status...",
    "Sending VIP Notification..."
  ];

  const rejectSteps = [
    "Analyzing Order Data...",
    "Recording Rejection Reason...",
    "Updating Order Archive...",
    "Notifying User of Decision..."
  ];

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('newOrder', (order) => {
        setOrders(prev => [order, ...prev]);
        setNewOrderNoti(order);
        // Play notification sound if desired
        const audio = new Audio('/assets/sounds/notification.mp3');
        audio.play().catch(e => console.log('Audio play failed'));
        
        // Clear notification after 5 seconds
        setTimeout(() => setNewOrderNoti(null), 5000);
      });

      return () => socket.off('newOrder');
    }
  }, [socket]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/v1/orders`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setOrders(res.data.data);
    } catch (err) {
      console.error('Error fetching orders', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status, reason = '') => {
    const steps = status === 'completed' ? approveSteps : rejectSteps;
    setProcessingStatus({ type: status, step: 0, steps, status: 'processing', message: 'Elite Protocol Initiated...' });

    // Helper to simulate/show progress
    const updateStep = (step, msg = '') => new Promise(resolve => {
      setProcessingStatus(prev => ({ ...prev, step, message: msg || (step < steps.length ? steps[step] : 'Protocol Complete') }));
      setTimeout(resolve, 800);
    });

    try {
      // Show first few steps for visual effect
      await updateStep(1, steps[0]);
      await updateStep(2, steps[1]);

      const res = await axios.put(`${API_URL}/api/v1/orders/${id}/status`, {
        status,
        rejectionReason: reason
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      // Finish remaining steps
      for (let i = 3; i < steps.length; i++) {
        await updateStep(i, steps[i-1]);
      }
      
      // Complete
      setProcessingStatus(prev => ({ ...prev, step: steps.length, status: 'done', message: status === 'completed' ? 'Order Approved Successfully!' : 'Order Rejected Successfully!' }));
      
      setTimeout(() => {
        setProcessingStatus(null);
        fetchOrders();
        setShowReRejectModal(false);
        setRejectionReason('');
        setSelectedOrder(null);
      }, 2000);

    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Database Protocol Failed';
      setProcessingStatus(prev => ({ ...prev, status: 'error', message: errorMsg }));
      
      setTimeout(() => setProcessingStatus(null), 3000);
    }
  };

  const handleDeleteOldOrders = async () => {
    if (!window.confirm('Are you sure you want to delete all completed and rejected orders older than 30 days?')) return;
    setDeleting(true);
    try {
      const res = await axios.delete(`${API_URL}/api/v1/orders/old?days=30`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      alert(res.data.message);
      fetchOrders();
    } catch (err) {
      console.error('Error deleting old orders', err);
      alert('Failed to delete old orders');
    } finally {
      setDeleting(false);
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesFilter = filter === 'all' || o.status === filter;
    const matchesSearch = o.player_id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         o.user_phone.includes(searchTerm);
    const orderDate = new Date(o.createdAt).toISOString().split('T')[0];
    const matchesDate = !dateFilter || orderDate === dateFilter;
    return matchesFilter && matchesSearch && matchesDate;
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-6">
          <Link to="/admin" className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all text-gray-400">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Order <span className="gold-text-gradient">Manager</span></h1>
            <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-[10px] mt-1">Review and process premium top-ups</p>
          </div>
        </div>
      </div>

      {/* New Order Notification Banner */}
      {newOrderNoti && (
        <div className="fixed top-24 right-4 z-[200] animate-in slide-in-from-right duration-500">
          <div className="bg-primary text-black p-4 rounded-2xl shadow-[0_0_30px_rgba(212,175,55,0.4)] flex items-center gap-4 border border-primary/20">
            <div className="w-12 h-12 bg-black/10 rounded-xl flex items-center justify-center">
              <Bell size={24} className="animate-bounce" />
            </div>
            <div>
              <p className="font-black uppercase tracking-widest text-xs">New Order Received!</p>
              <p className="text-[10px] font-bold opacity-80">Player ID: {newOrderNoti.player_id} • {newOrderNoti.selling_price} Ks</p>
            </div>
            <button onClick={() => setNewOrderNoti(null)} className="ml-4 p-1 hover:bg-black/5 rounded-lg">
              <XCircle size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Filters & Search */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 md:gap-6 mb-10">
        <div className="lg:col-span-4 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input 
            type="text" 
            placeholder="Search Player ID or Phone..."
            className="w-full pl-12 pr-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-primary/50 text-white font-bold transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="lg:col-span-4 overflow-x-auto pb-2 md:pb-0">
          <div className="flex bg-white/5 border border-white/10 rounded-2xl p-1 min-w-[300px]">
            {['pending', 'completed', 'rejected', 'all'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 py-3 px-2 md:px-4 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-primary text-black shadow-lg' : 'text-gray-500 hover:text-white'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="lg:col-span-2 relative">
          <input 
            type="date" 
            className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-primary/50 text-white font-bold transition-all [color-scheme:dark]"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>
        <div className="lg:col-span-2">
          <button 
            onClick={handleDeleteOldOrders}
            disabled={deleting}
            className="w-full py-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-black uppercase tracking-widest text-[10px] rounded-2xl border border-red-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <XCircle size={16} /> {deleting ? 'Wait...' : 'Clear Old'}
          </button>
        </div>
      </div>

      {/* Orders List */}
      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="flex justify-center py-20">
            <Clock className="animate-spin text-primary" size={48} />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="luxury-card p-20 text-center border-dashed">
            <p className="text-gray-500 font-black uppercase tracking-widest text-xs">No orders found in this category.</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div key={order._id} className="luxury-card overflow-hidden group">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 p-6 md:p-8">
                {/* User & Game Info */}
                <div className="lg:col-span-3 space-y-4">
                  <div className="flex justify-between items-start lg:block">
                    <div>
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Game / Product</p>
                      <h3 className="text-lg md:text-xl font-black text-white uppercase">{order.game}</h3>
                      <p className="text-primary font-bold text-sm">{order.product_name}</p>
                    </div>
                    <span className={`lg:hidden px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' : order.status === 'completed' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
                    <div>
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Account Info</p>
                      <p className="text-white font-black text-sm">ID: {order.player_id}</p>
                      {order.nickname && <p className="text-primary font-black text-xs uppercase">Name: {order.nickname}</p>}
                      {order.server_id && <p className="text-gray-400 text-xs font-bold">Zone: {order.server_id}</p>}
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Customer Phone</p>
                      <p className="text-white font-black text-sm">{order.user_phone}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Order Time</p>
                      <p className="text-gray-400 font-bold text-[10px]">
                        {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Price & Payment */}
                <div className="lg:col-span-3 space-y-4">
                  <div>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Total Amount</p>
                    <p className="text-2xl font-black gold-text-gradient">{order.selling_price.toLocaleString()} Ks</p>
                  </div>
                  <div className="lg:hidden h-[1px] bg-white/5 w-full"></div>
                  <div>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 lg:mb-3">Transaction Info</p>
                    <div className="flex items-center gap-4">
                      <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden border border-white/10 group-hover:border-primary/30 transition-all">
                        <img src={order.transaction_image} alt="Transaction" loading="lazy" className="w-full h-full object-cover" />
                        <a 
                          href={order.transaction_image} 
                          target="_blank" 
                          rel="noreferrer"
                          className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <ExternalLink size={16} className="text-primary" />
                        </a>
                      </div>
                      <div>
                        <p className="text-white font-black text-sm uppercase">{order.payment_method}</p>
                        <span className={`hidden lg:inline-block mt-2 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' : order.status === 'completed' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="lg:col-span-3 flex flex-col justify-center gap-2">
                  {order.status === 'pending' && (
                    <div className="grid grid-cols-1 gap-2">
                      <button 
                        onClick={() => handleStatusUpdate(order._id, 'completed')}
                        className="w-full py-2.5 bg-green-500 hover:bg-green-600 text-black font-black uppercase tracking-widest text-[10px] rounded-xl transition-all flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 size={14} /> Approve
                      </button>
                      <button 
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowReRejectModal(true);
                        }}
                        className="w-full py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-black uppercase tracking-widest text-[10px] rounded-xl border border-red-500/20 transition-all flex items-center justify-center gap-2"
                      >
                        <XCircle size={14} /> Reject
                      </button>
                    </div>
                  )}
                  {order.status === 'rejected' && order.rejection_reason && (
                    <div className="w-full p-3 bg-red-500/5 border border-red-500/10 rounded-xl">
                      <p className="text-[8px] font-black text-red-500/50 uppercase mb-1">Rejection Reason</p>
                      <p className="text-[10px] text-red-500 font-bold leading-tight">{order.rejection_reason}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in">
          <div className="luxury-card max-w-md w-full p-10 space-y-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center text-red-500 mx-auto mb-6">
                <MessageSquare size={40} />
              </div>
              <h2 className="text-2xl font-black text-white uppercase tracking-tight">Reject Order</h2>
              <p className="text-gray-500 font-bold text-sm mt-2">Please provide a reason for the customer.</p>
            </div>

            <div className="space-y-4">
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Transaction ID not found, Invalid screenshot..."
                className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-red-500/50 text-white font-bold transition-all h-32 resize-none"
              />
              
              <div className="flex gap-4">
                <button 
                  onClick={() => setShowReRejectModal(false)}
                  className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest text-xs rounded-2xl transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleStatusUpdate(selectedOrder._id, 'rejected', rejectionReason)}
                  disabled={!rejectionReason}
                  className="flex-1 py-4 bg-red-500 hover:bg-red-600 text-black font-black uppercase tracking-widest text-xs rounded-2xl transition-all disabled:opacity-50"
                >
                  Confirm Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Processing Progress Modal */}
      {processingStatus && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-in fade-in duration-300">
          <div className="luxury-card max-w-lg w-full p-12 relative overflow-hidden text-center">
            {/* Background Glow */}
            <div className={`absolute -top-24 -right-24 w-48 h-48 blur-[80px] rounded-full 
              ${processingStatus.status === 'error' ? 'bg-red-500/20' : 
                processingStatus.type === 'completed' ? 'bg-green-500/20' : 'bg-red-500/20'}`}
            ></div>
            
            <div className="relative z-10 space-y-10">
              <div className="flex flex-col items-center gap-6">
                <div className={`w-24 h-24 rounded-3xl flex items-center justify-center shadow-2xl 
                  ${processingStatus.status === 'error' ? 'bg-red-500/10 text-red-500' : 
                    processingStatus.status === 'done' ? 'bg-green-500/10 text-green-500' :
                    processingStatus.type === 'completed' ? 'bg-green-500/10 text-green-500 animate-pulse' : 'bg-red-500/10 text-red-500 animate-pulse'}`}
                >
                  {processingStatus.status === 'error' ? <XCircle size={48} /> : 
                   processingStatus.status === 'done' ? <CheckCircle2 size={48} /> :
                   processingStatus.type === 'completed' ? <CheckCircle2 size={48} /> : <XCircle size={48} />}
                </div>
                <div>
                  <h2 className={`text-3xl font-black uppercase tracking-tighter ${processingStatus.status === 'error' ? 'text-red-500' : 'text-white'}`}>
                    {processingStatus.status === 'error' ? 'Protocol Failed' : 
                     processingStatus.status === 'done' ? 'Mission Complete' :
                     processingStatus.type === 'completed' ? 'Approving Order' : 'Rejecting Order'}
                  </h2>
                  <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mt-2">
                    {processingStatus.status === 'error' ? 'The operation was aborted by the system' : 'Elite Admin Protocol in Progress'}
                  </p>
                </div>
              </div>

              {/* Progress Bar Container */}
              <div className="space-y-4">
                <div className="flex justify-between items-end mb-2">
                  <span className={`text-[11px] font-black uppercase tracking-widest 
                    ${processingStatus.status === 'error' ? 'text-red-500' : 
                      processingStatus.status === 'done' ? 'text-green-500' :
                      processingStatus.type === 'completed' ? 'text-green-500' : 'text-red-500'}`}
                  >
                    {processingStatus.message}
                  </span>
                  <span className="text-white font-black text-xs">
                    {processingStatus.status === 'error' ? '0%' : 
                     processingStatus.status === 'done' ? '100%' :
                     `${Math.round((processingStatus.step / processingStatus.steps.length) * 100)}%`}
                  </span>
                </div>
                
                <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-[2px]">
                  <div 
                    className={`h-full rounded-full transition-all duration-700 ease-out shadow-[0_0_15px_rgba(212,175,55,0.3)] 
                      ${processingStatus.status === 'error' ? 'bg-red-600 w-full opacity-50' : 
                        processingStatus.status === 'done' ? 'bg-green-500 w-full' :
                        processingStatus.type === 'completed' ? 'bg-gradient-to-r from-green-600 to-green-400' : 'bg-gradient-to-r from-red-600 to-red-400'}`}
                    style={{ width: processingStatus.status === 'done' || processingStatus.status === 'error' ? '100%' : `${(processingStatus.step / processingStatus.steps.length) * 100}%` }}
                  ></div>
                </div>

                {/* Step Indicators */}
                <div className="flex justify-between px-1">
                  {processingStatus.steps.map((_, i) => (
                    <div 
                      key={i}
                      className={`w-1.5 h-1.5 rounded-full transition-all duration-500 
                        ${processingStatus.status === 'error' ? 'bg-red-900' :
                          i < processingStatus.step || processingStatus.status === 'done' ? 
                          (processingStatus.type === 'completed' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]') : 'bg-white/10'}`}
                    ></div>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                {processingStatus.status === 'processing' ? (
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                    <Clock size={14} className="text-primary animate-spin" />
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Securing Database...</span>
                  </div>
                ) : (
                  <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${processingStatus.status === 'done' ? 'text-green-500' : 'text-red-500'}`}>
                    {processingStatus.status === 'done' ? 'Protocol Finished Successfully' : 'Please check connection and try again'}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrderManager;
