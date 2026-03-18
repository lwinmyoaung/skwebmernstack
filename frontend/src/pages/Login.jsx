import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Smartphone, Mail, Lock, AlertCircle, RefreshCw } from 'lucide-react';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-32 pb-20 min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="luxury-card p-10 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 blur-[60px] rounded-full"></div>
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-primary/10 blur-[60px] rounded-full"></div>

          <div className="relative z-10">
            <div className="text-center mb-10">
              <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mx-auto mb-6 shadow-[0_0_30px_rgba(212,175,55,0.2)]">
                <LogIn size={40} />
              </div>
              <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Elite <span className="gold-text-gradient">Access</span></h1>
              <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-[10px] mt-2">Login to your premium account</p>
            </div>

            {error && (
              <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 animate-in shake">
                <AlertCircle size={20} className="text-red-500" />
                <span className="text-xs font-bold text-red-500 leading-tight">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.2em] font-black text-gray-500 ml-1">Phone or Email</label>
                <div className="relative">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500">
                    <Smartphone size={18} />
                  </div>
                  <input 
                    type="text" 
                    placeholder="09... or email@example.com"
                    className="w-full pl-14 pr-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-primary/50 text-white font-bold transition-all"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.2em] font-black text-gray-500 ml-1">Password</label>
                <div className="relative">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500">
                    <Lock size={18} />
                  </div>
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    className="w-full pl-14 pr-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-primary/50 text-white font-bold transition-all"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full luxury-button py-5 text-lg flex items-center justify-center gap-3 group disabled:opacity-50"
              >
                {loading ? <RefreshCw className="animate-spin" size={24} /> : <LogIn size={24} />}
                <span className="font-black uppercase tracking-[0.2em]">{loading ? 'Authenticating...' : 'Enter Sanctuary'}</span>
              </button>
            </form>

            <div className="mt-10 pt-8 border-t border-white/5 space-y-4">
              <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                <p className="text-[10px] text-gray-400 font-medium leading-relaxed">
                  <span className="text-primary font-black uppercase tracking-widest block mb-1">Tip: First Time Buyer?</span>
                  If you just made a purchase, use your <span className="text-white font-bold">phone number</span> and the password <span className="text-white font-bold">passXXXX</span> (where XXXX is the last 4 digits of your phone) to login.
                </p>
              </div>
              <p className="text-center text-[10px] font-bold text-gray-600 uppercase tracking-widest">
                New to the collection? <Link to="/register" className="text-primary hover:text-white transition-colors underline underline-offset-4">Join the Elite</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
