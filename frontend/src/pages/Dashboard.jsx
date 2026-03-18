import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import { LogOut, LayoutDashboard, Clock, CheckCircle, XCircle, Bell, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const [ordersRes, messagesRes] = await Promise.all([
          axios.get(`${API_URL}/api/v1/orders/me`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${API_URL}/api/v1/messages`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        setOrders(ordersRes.data.data);
        setMessages(messagesRes.data.data);
      } catch (err) {
        console.error('Error fetching data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle size={16} className="text-green-500" />;
      case 'cancelled': return <XCircle size={16} className="text-red-500" />;
      default: return <Clock size={16} className="text-amber-500" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#1c99dc] text-white rounded-2xl flex items-center justify-center shadow-lg">
            <LayoutDashboard size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">My Dashboard</h1>
            <p className="text-gray-500">Welcome back, {user?.name}</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 px-6 py-2.5 font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-all shadow-md active:scale-95"
        >
          <LogOut size={20} /> Logout
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Stats */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">My Elite Status</h3>
            <div className="flex items-center gap-4 mt-4">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/20">
                <Bell size={32} />
              </div>
              <div>
                <p className="text-2xl font-black text-gray-800">{messages.filter(m => !m.is_read).length}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">New Messages</p>
              </div>
            </div>
            <Link to="/inbox" className="w-full mt-6 py-3 bg-primary text-black font-black uppercase tracking-widest text-xs rounded-xl hover:bg-primary-dark transition-all flex items-center justify-center gap-2">
              <Bell size={16} /> Open Secure Inbox
            </Link>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Order Summary</h3>
            <div className="space-y-4 mt-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-bold text-sm uppercase tracking-wider">Total Orders</span>
                <span className="font-black text-lg">{orders.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-bold text-sm uppercase tracking-wider">Completed</span>
                <span className="font-black text-lg text-green-500">{orders.filter(o => o.status === 'completed').length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-bold text-sm uppercase tracking-wider">Rejected</span>
                <span className="font-black text-lg text-red-500">{orders.filter(o => o.status === 'rejected').length}</span>
              </div>
            </div>
            <Link to="/my-orders" className="w-full mt-6 py-3 bg-gray-100 text-gray-600 font-black uppercase tracking-widest text-xs rounded-xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2">
              <ShoppingBag size={16} /> View All Orders
            </Link>
          </div>
        </div>

        {/* Recent Orders Table */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Recent Orders</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                    <th className="px-6 py-4 font-bold">Game / Product</th>
                    <th className="px-6 py-4 font-bold">Player Info</th>
                    <th className="px-6 py-4 font-bold">Price</th>
                    <th className="px-6 py-4 font-bold">Status</th>
                    <th className="px-6 py-4 font-bold">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">Loading orders...</td></tr>
                  ) : orders.length === 0 ? (
                    <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">No orders found. Start gaming!</td></tr>
                  ) : (
                    orders.map((order) => (
                      <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-800 uppercase text-xs">{order.game}</div>
                          <div className="text-sm text-gray-600">{order.product_name}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-800">ID: {order.player_id}</div>
                          <div className="text-xs text-gray-500">Server: {order.server_id || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 font-bold text-gray-800">{order.selling_price} Ks</td>
                        <td className="px-6 py-4">
                          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold w-fit ${
                            order.status === 'completed' ? 'bg-green-50 text-green-600' : 
                            order.status === 'cancelled' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                          }`}>
                            {getStatusIcon(order.status)}
                            {order.status.toUpperCase()}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
