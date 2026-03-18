import { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Search, 
  Trash2, 
  MoreVertical, 
  RefreshCw, 
  Users,
  ShieldCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config';

const AdminUserManager = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/v1/auth/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data.data);
    } catch (err) {
      console.error('Error fetching users', err);
      alert('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRole = async (u) => {
    const newRole = u.role === 'admin' ? 'user' : 'admin';
    if (!window.confirm(`Are you sure you want to ${newRole === 'admin' ? 'promote' : 'demote'} this user?`)) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/api/v1/auth/users/${u._id}/role`, { role: newRole }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers(); // Refresh the list
    } catch (err) {
      console.error('Error updating user role', err);
      alert(err.response?.data?.message || 'Failed to update user role');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/v1/auth/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(users.filter(u => u._id !== id));
    } catch (err) {
      console.error('Error deleting user', err);
      alert('Failed to delete user');
    }
  };

  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.phone?.includes(searchQuery)
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl pb-32">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-12 gap-6">
        <div className="flex items-center gap-6">
          <Link to="/admin" className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all text-gray-400 border border-white/10">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter uppercase">User <span className="gold-text-gradient">Management</span></h1>
            <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-[10px] mt-1">Manage registered users and permissions</p>
          </div>
        </div>
        <div className="w-full lg:w-auto flex flex-col sm:flex-row items-center gap-4 md:gap-6 bg-white/5 p-4 rounded-3xl border border-white/10">
          <div className="flex items-center justify-between w-full sm:w-auto gap-6 px-2">
            <div className="text-left sm:text-right">
              <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Total Users</div>
              <div className="text-2xl font-black text-white tracking-tighter">{users.length}</div>
            </div>
            <div className="h-10 w-[1px] bg-white/10 hidden sm:block"></div>
          </div>
          <div className="relative group w-full sm:w-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-black/20 border border-white/10 rounded-2xl py-3 pl-12 pr-6 text-sm text-white font-bold focus:outline-none focus:border-primary/50 transition-all w-full lg:w-[300px]"
            />
          </div>
        </div>
      </div>

      <div className="luxury-card overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">ID</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">User</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Role</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Status</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Joined Date</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <RefreshCw className="animate-spin text-primary" size={40} />
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest animate-pulse">Accessing Secure Database...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center gap-4 text-gray-700">
                      <Users size={64} />
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">No users found matching your search</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u, idx) => (
                  <tr key={u._id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="px-8 py-6">
                      <span className="text-xs font-black text-gray-500">#{users.length - idx}</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-lg border border-primary/20 group-hover:bg-primary group-hover:text-black transition-all duration-500 shadow-lg">
                          {u.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <div className="text-sm font-black text-white group-hover:text-primary transition-colors">{u.name || `User${u.phone?.slice(-4)}`}</div>
                          <div className="text-[10px] font-bold text-gray-500">{u.email || u.phone || 'No contact info'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${u.role === 'admin' ? 'bg-primary/10 text-primary border-primary/20 shadow-[0_0_15px_rgba(212,175,55,0.1)]' : 'bg-white/5 text-gray-400 border-white/10'}`}>
                        {u.role || 'User'}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2.5">
                        <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)] animate-pulse"></div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-xs font-bold text-gray-400">
                        {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                      </div>
                      <div className="text-[10px] font-medium text-gray-600 mt-0.5">
                        {new Date(u.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button 
                          onClick={() => handleToggleRole(u)}
                          className={`p-2.5 rounded-xl transition-all border opacity-0 group-hover:opacity-100 ${u.role === 'admin' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20 hover:bg-orange-500 hover:text-white' : 'bg-primary/10 text-primary border-primary/20 hover:bg-primary hover:text-black'}`}
                          title={u.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}
                        >
                          <ShieldCheck size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(u._id)}
                          className="p-2.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all opacity-0 group-hover:opacity-100 border border-red-500/20"
                          title="Delete User"
                        >
                          <Trash2 size={16} />
                        </button>
                        <button className="p-2.5 text-gray-500 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                          <MoreVertical size={18} />
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
    </div>
  );
};

export default AdminUserManager;
