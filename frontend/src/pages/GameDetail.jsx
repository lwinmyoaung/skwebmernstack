import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Smartphone, CheckCircle, Info, ShieldCheck, CreditCard, UserCheck, RefreshCw, AlertCircle, ChevronLeft, Zap, Trophy, Copy, CheckCircle2, XCircle, Clock } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import NotFound from './NotFound';

const regions = [
  { id: 'myanmar', name: 'Myanmar', flag: 'https://flagcdn.com/w40/mm.png' },
  { id: 'malaysia', name: 'Malaysia', flag: 'https://flagcdn.com/w40/my.png' },
  { id: 'philippines', name: 'Philippines', flag: 'https://flagcdn.com/w40/ph.png' },
  { id: 'singapore', name: 'Singapore', flag: 'https://flagcdn.com/w40/sg.png' },
  { id: 'indonesia', name: 'Indonesia', flag: 'https://flagcdn.com/w40/id.png' },
  { id: 'russia', name: 'Russia', flag: 'https://flagcdn.com/w40/ru.png' },
];

function GameDetail() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  
  const [region, setRegion] = useState('myanmar');
  const [playerId, setPlayerId] = useState('');
  const [serverId, setServerId] = useState('');
  const [nickname, setNickname] = useState('');
  const [checking, setChecking] = useState(false);
  const [checkError, setCheckError] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [userPhone, setUserPhone] = useState('');
  const [transactionImage, setTransactionImage] = useState(null);
  const [products, setProducts] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(gameId === 'mlbb' ? 1 : 2);
  const [gameActive, setGameActive] = useState(true);
  const [gameChecking, setGameChecking] = useState(true);
  const [successData, setSuccessData] = useState(null);
  const [validationError, setValidationError] = useState('');
  const [purchaseStatus, setPurchaseStatus] = useState(null); // { step: 0, status: 'processing'|'done'|'error', message: '' }

  const purchaseSteps = [
    "Establishing Secure Link...",
    "Syncing Player Profile...",
    "Uploading Elite Proof...",
    "Securing Transaction...",
    "Finalizing VIP Order..."
  ];

  const gameNames = {
    mlbb: 'Mobile Legends',
    pubg: 'PUBG Mobile',
    mcgg: 'Magic Chess GoGo',
    wwm: 'WWM'
  };

  useEffect(() => {
    const checkGameStatus = async () => {
      setGameChecking(true);
      try {
        const res = await axios.get(`${API_URL}/api/v1/games/${gameId}`);
        if (res.data.success && res.data.data) {
          setGameActive(res.data.data.isActive);
        } else {
          setGameActive(false);
        }
      } catch (err) {
        console.error('Error checking game status', err);
        setGameActive(false);
      } finally {
        setGameChecking(false);
      }
    };
    checkGameStatus();
  }, [gameId]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_URL}/api/v1/products/${gameId}?region=${region}`);
        const normalizedData = res.data.data.map(p => ({
          ...p,
          _id: p.product_id || p._id,
          name: p.name || (p.diamonds ? `${p.diamonds} Diamonds` : (p.uc ? `${p.uc} UC` : 'Product')),
          price: p.price || p.price_value || 0,
          currency: p.price_label || 'Ks'
        }));
        setProducts(normalizedData);
      } catch (err) {
        console.error('Error fetching products', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [gameId, region]);

  useEffect(() => {
    const fetchPayments = async () => {
      setPaymentLoading(true);
      try {
        const res = await axios.get(`${API_URL}/api/v1/payment-methods`);
        setPaymentMethods(res.data.data);
      } catch (err) {
        console.error('Error fetching payment methods', err);
        setPaymentMethods([]);
      } finally {
        setPaymentLoading(false);
      }
    };
    fetchPayments();
  }, []);

  // Auto-check ID when inputs are filled
  useEffect(() => {
    const idLength = playerId.length;
    const serverIdLength = serverId.length;

    // Define conditions for auto-checking based on the game
    const conditions = {
      mlbb: idLength >= 5 && serverIdLength >= 4,
      pubg: idLength >= 5,
      mcgg: idLength >= 5 && serverIdLength >= 4,
      wwm: idLength >= 10,
    };

    const shouldCheck = conditions[gameId] || false;

    if (shouldCheck && !nickname && !checking) {
      const timeoutId = setTimeout(() => {
        handleCheck();
      }, 800); // Debounce for 0.8 seconds
      return () => clearTimeout(timeoutId);
    }
  }, [playerId, serverId, gameId, nickname, checking]);

  const handleCheck = async () => {
    if (!playerId) return;
    setChecking(true);
    setCheckError('');
    setNickname('');
    try {
      const res = await axios.post(`${API_URL}/api/v1/game/check-user`, {
        game: gameId,
        game_id: playerId,
        server_id: serverId
      });
      if (res.data.success && res.data.nickname) {
        setNickname(res.data.nickname);
        // Auto-advance to payment after successful check
        setTimeout(() => {
          setCurrentStep(4);
        }, 800);
      } else {
        setCheckError(res.data.message || 'Could not find username. Please check the ID.');
      }
    } catch (err) {
      setCheckError(err.response?.data?.message || 'Check failed. Verify your ID.');
    } finally {
      setChecking(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');
    
    if (!selectedProduct) { setValidationError('Please select a top-up product.'); return; }
    if (!selectedPayment) { setValidationError('Please select a payment method.'); return; }
    if (!userPhone) { setValidationError('Please enter your phone number.'); return; }
    if (!transactionImage) { setValidationError('Please upload transaction screenshot.'); return; }

    setSubmitting(true);
    setPurchaseStatus({ step: 0, status: 'processing', message: 'Elite Protocol Initiated...' });

    // Helper to simulate/show progress
    const updateStep = (step, msg = '') => new Promise(resolve => {
      setPurchaseStatus(prev => ({ ...prev, step, message: msg || (step < purchaseSteps.length ? purchaseSteps[step] : 'Protocol Complete') }));
      setTimeout(resolve, 800);
    });

    const formData = new FormData();
    formData.append('productId', selectedProduct._id);
    formData.append('playerId', playerId);
    formData.append('serverId', serverId);
    formData.append('gameId', gameId);
    formData.append('paymentMethod', selectedPayment.name);
    formData.append('userPhone', userPhone);
    formData.append('nickname', nickname);
    formData.append('transactionImage', transactionImage);

    try {
      // Step 1: Secure Link
      await updateStep(1, purchaseSteps[0]);
      
      // Step 2: Sync Profile
      await updateStep(2, purchaseSteps[1]);

      const token = localStorage.getItem('token');
      const headers = { 
        'Content-Type': 'multipart/form-data'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Step 3: Upload Proof (This is the actual API call)
      setPurchaseStatus(prev => ({ ...prev, step: 3, message: purchaseSteps[2] }));
      
      const res = await axios.post(`${API_URL}/api/v1/orders`, formData, {
        headers
      });
      
      // Step 4: Securing Transaction
      await updateStep(4, purchaseSteps[3]);

      // Step 5: Finalizing
      await updateStep(5, purchaseSteps[4]);

      if (res.data.success) {
        setPurchaseStatus(prev => ({ ...prev, status: 'done', message: 'Purchase Secured Successfully!' }));
        
        // Brief delay to show completion
        setTimeout(() => {
          setPurchaseStatus(null);
          // Handle auto-account creation/login from response
          if (res.data.token && res.data.user) {
            localStorage.setItem('token', res.data.token);
            if (typeof setUser === 'function') {
              setUser(res.data.user);
            }
            setSuccessData({
              type: 'account_created',
              phone: res.data.user.phone,
              orderId: res.data.data._id
            });
          } else {
            setSuccessData({
              type: 'order_placed',
              orderId: res.data.data._id
            });
          }
        }, 1500);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message?.message || err.response?.data?.message || 'Protocol Failure: Transaction Aborted';
      setPurchaseStatus(prev => ({ ...prev, status: 'error', message: errorMsg }));
      
      // Keep error visible for a bit
      setTimeout(() => {
        setPurchaseStatus(null);
        setSubmitting(false);
      }, 3000);
    } finally {
      // Don't set submitting false here as it might trigger navigation/modals prematurely
    }
  };

  if (gameChecking) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-6">
        <RefreshCw className="animate-spin text-primary" size={48} />
        <p className="text-gray-500 font-black uppercase tracking-widest text-xs">Scanning Battlefield...</p>
      </div>
    );
  }

  if (!gameActive) {
    return <NotFound />;
  }

  return (
    <div className="pb-20 bg-black min-h-screen">
      {/* Purchase Progress Modal */}
      {purchaseStatus && (
        <div className="fixed inset-0 z-[6000] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-in fade-in duration-300">
          <div className="luxury-card max-w-lg w-full p-12 relative overflow-hidden text-center">
            <div className={`absolute -top-24 -right-24 w-48 h-48 blur-[80px] rounded-full 
              ${purchaseStatus.status === 'error' ? 'bg-red-500/20' : 
                purchaseStatus.status === 'done' ? 'bg-green-500/20' : 'bg-primary/20'}`}
            ></div>
            
            <div className="relative z-10 space-y-10">
              <div className="flex flex-col items-center gap-6">
                <div className={`w-24 h-24 rounded-3xl flex items-center justify-center shadow-2xl 
                  ${purchaseStatus.status === 'error' ? 'bg-red-500/10 text-red-500' : 
                    purchaseStatus.status === 'done' ? 'bg-green-500/10 text-green-500' : 'bg-primary/10 text-primary animate-pulse'}`}
                >
                  {purchaseStatus.status === 'error' ? <XCircle size={48} /> : 
                   purchaseStatus.status === 'done' ? <CheckCircle2 size={48} /> : <Zap size={48} />}
                </div>
                <div>
                  <h2 className={`text-3xl font-black uppercase tracking-tighter ${purchaseStatus.status === 'error' ? 'text-red-500' : 'text-white'}`}>
                    {purchaseStatus.status === 'error' ? 'Transaction Aborted' : 
                     purchaseStatus.status === 'done' ? 'Protocol Secured' : 'Securing Purchase'}
                  </h2>
                  <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mt-2">Elite Transaction in Progress</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-end mb-2">
                  <span className={`text-[11px] font-black uppercase tracking-widest 
                    ${purchaseStatus.status === 'error' ? 'text-red-500' : 
                      purchaseStatus.status === 'done' ? 'text-green-500' : 'text-primary'}`}
                  >
                    {purchaseStatus.message}
                  </span>
                  <span className="text-white font-black text-xs">
                    {purchaseStatus.status === 'error' ? '0%' : 
                     purchaseStatus.status === 'done' ? '100%' :
                     `${Math.round((purchaseStatus.step / purchaseSteps.length) * 100)}%`}
                  </span>
                </div>
                
                <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-[2px]">
                  <div 
                    className={`h-full rounded-full transition-all duration-700 ease-out shadow-[0_0_15px_rgba(212,175,55,0.3)] 
                      ${purchaseStatus.status === 'error' ? 'bg-red-600 w-full opacity-50' : 
                        purchaseStatus.status === 'done' ? 'bg-green-500 w-full' : 'bg-primary'}`}
                    style={{ width: purchaseStatus.status === 'done' || purchaseStatus.status === 'error' ? '100%' : `${(purchaseStatus.step / purchaseSteps.length) * 100}%` }}
                  ></div>
                </div>

                <div className="flex justify-between px-1">
                  {purchaseSteps.map((_, i) => (
                    <div 
                      key={i}
                      className={`w-1.5 h-1.5 rounded-full transition-all duration-500 
                        ${purchaseStatus.status === 'error' ? 'bg-red-900' :
                          i < purchaseStatus.step || purchaseStatus.status === 'done' ? 'bg-primary shadow-[0_0_8px_rgba(212,175,55,0.6)]' : 'bg-white/10'}`}
                    ></div>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                {purchaseStatus.status === 'processing' ? (
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                    <Clock size={14} className="text-primary animate-spin" />
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Authenticating Node...</span>
                  </div>
                ) : (
                  <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${purchaseStatus.status === 'done' ? 'text-green-500' : 'text-red-500'}`}>
                    {purchaseStatus.status === 'done' ? 'Purchase Finalized Successfully' : 'Please check connection and retry'}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {successData && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center px-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-lg luxury-card p-10 relative overflow-hidden text-center animate-in zoom-in-95 duration-500">
            {/* Background decoration */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 blur-[60px] rounded-full"></div>
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-primary/10 blur-[60px] rounded-full"></div>

            <div className="relative z-10">
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto mb-8 shadow-[0_0_50px_rgba(212,175,55,0.2)]">
                <ShieldCheck size={48} className="animate-in zoom-in-50 duration-700" />
              </div>

              <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">
                Elite <span className="gold-text-gradient">Purchase</span> Confirmed
              </h2>
              
              <div className="space-y-6 mb-10">
                <p className="text-gray-400 font-medium leading-relaxed">
                  {successData.type === 'account_created' 
                    ? `Your order has been secured. A premium VIP account has been automatically created for your phone number.`
                    : `Your premium order has been successfully placed and is now being processed by our elite team.`}
                </p>

                {successData.type === 'account_created' && (
                  <div className="p-6 bg-white/5 border border-white/10 rounded-3xl space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] uppercase tracking-widest font-black text-gray-500">Account ID</span>
                      <span className="text-sm font-black text-primary">{successData.phone}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] uppercase tracking-widest font-black text-gray-500">Initial Password</span>
                      <span className="text-sm font-black text-primary">{successData.phone}</span>
                    </div>
                    <div className="h-[1px] bg-white/5 w-full my-1"></div>
                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Login details secured in your local session</p>
                  </div>
                )}

                <div className="flex items-center justify-center gap-2 text-primary">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Order Status: Pending Delivery</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => navigate('/my-orders')}
                  className="luxury-button py-4 flex items-center justify-center gap-2 group"
                >
                  <Trophy size={18} className="group-hover:scale-110 transition-transform" />
                  <span className="font-black uppercase tracking-widest text-[10px]">Track Order</span>
                </button>
                <button 
                  onClick={() => navigate('/')}
                  className="bg-white/5 hover:bg-white/10 text-white py-4 rounded-2xl border border-white/10 font-black uppercase tracking-widest text-[10px] transition-all"
                >
                  Return to Store
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4">
        {/* Sticky Game Header - Aligned with Navbar */}
        <div className="sticky top-[81px] lg:top-[110px] z-[100] bg-black/80 backdrop-blur-xl py-4 -mx-4 px-4 mb-8 border-b border-white/5 flex items-center justify-between shadow-2xl">
          <div className="flex items-center gap-4 md:gap-6">
            <button onClick={() => navigate(-1)} className="p-2 md:p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-gray-400 border border-white/10 group">
              <ChevronLeft size={18} className="md:w-5 md:h-5 group-hover:-translate-x-1 transition-transform" />
            </button>
            <div className="flex flex-col">
              <h1 className="text-lg md:text-3xl font-black text-white tracking-tighter uppercase">{gameNames[gameId] || gameId}</h1>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-primary animate-pulse"></span>
                <span className="text-[8px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest">Premium Top-up Active</span>
              </div>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Store Status</span>
              <span className="text-xs font-black text-primary uppercase">Instant Delivery</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
              <Zap size={20} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column: Form Steps */}
          <div className="lg:col-span-8">
            <form onSubmit={handleSubmit} className="space-y-16">
              
              {/* 1. Region Selector (MLBB Only) */}
              {gameId === 'mlbb' && currentStep === 1 && (
                <section className="luxury-card overflow-hidden animate-in fade-in slide-in-from-right duration-500">
                  <div className="bg-white/5 px-8 py-5 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="w-10 h-10 bg-primary text-black rounded-xl flex items-center justify-center font-black shadow-[0_0_15px_rgba(212,175,55,0.3)]">1</span>
                      <h2 className="text-xl font-black text-white uppercase tracking-tight">Select Region</h2>
                    </div>
                  </div>
                  <div className="p-4 md:p-8">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4 mb-8">
                      {regions.map((r) => (
                        <label 
                          key={r.id}
                          className={`relative cursor-pointer p-3 md:p-4 border rounded-xl md:rounded-2xl transition-all duration-300 flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4 text-center sm:text-left ${region === r.id ? 'border-primary bg-primary/10 shadow-[0_0_20px_rgba(212,175,55,0.1)]' : 'border-white/5 bg-white/5 hover:border-white/20'}`}
                        >
                          <input type="radio" name="region" value={r.id} checked={region === r.id} onChange={() => setRegion(r.id)} className="hidden" />
                          <img src={r.flag} alt={r.name} loading="lazy" className="w-8 h-5 md:w-10 md:h-6 object-cover rounded-sm md:rounded-md shadow-lg" />
                          <span className={`font-bold uppercase tracking-wider text-[10px] md:text-xs ${region === r.id ? 'text-primary' : 'text-gray-400'}`}>{r.name}</span>
                          {region === r.id && <CheckCircle size={14} className="absolute top-2 right-2 md:top-3 md:right-3 text-primary animate-in zoom-in md:w-[18px] md:h-[18px]" />}
                        </label>
                      ))}
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setCurrentStep(2)}
                      className="w-full luxury-button py-4 flex items-center justify-center gap-2 group"
                    >
                      <span className="font-black uppercase tracking-widest text-sm">Continue to Inventory</span>
                      <Zap size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </section>
              )}

              {/* 2. Product Selection */}
              {currentStep === 2 && (
                <section className="luxury-card overflow-hidden animate-in fade-in slide-in-from-right duration-500">
                  <div className="bg-white/5 px-6 md:px-8 py-5 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {gameId === 'mlbb' && (
                        <button type="button" onClick={() => setCurrentStep(1)} className="p-2 bg-white/5 rounded-lg hover:bg-white/10 text-gray-400 transition-colors mr-2">
                          <ChevronLeft size={16} />
                        </button>
                      )}
                      <span className="w-8 h-8 md:w-10 md:h-10 bg-primary text-black rounded-xl flex items-center justify-center font-black shadow-[0_0_15px_rgba(212,175,55,0.3)] text-sm md:text-base">
                        {gameId === 'mlbb' ? '2' : '1'}
                      </span>
                      <h2 className="text-lg md:text-xl font-black text-white uppercase tracking-tight">Select Amount</h2>
                    </div>
                  </div>
                  <div className="p-4 md:p-8">
                    {loading ? (
                      <div className="flex flex-col items-center py-20 gap-4">
                        <RefreshCw className="animate-spin text-primary" size={48} />
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Accessing Game Inventory...</p>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
                          {products.map((p) => (
                            <button
                              key={p._id}
                              type="button"
                              onClick={() => {
                                setSelectedProduct(p);
                                setNickname(''); // Reset verification if product changes
                                setTimeout(() => setCurrentStep(3), 200); // Auto-advance
                              }}
                              className={`relative p-4 md:p-6 border rounded-[1.5rem] md:rounded-[2rem] text-left transition-all duration-300 group ${selectedProduct?._id === p._id ? 'border-primary bg-primary/10 shadow-[0_0_30px_rgba(212,175,55,0.1)]' : 'border-white/5 bg-white/5 hover:border-white/20'}`}
                            >
                              <div className="mb-3 md:mb-4 w-8 h-8 md:w-10 md:h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                <Zap size={16} className={selectedProduct?._id === p._id ? 'text-primary' : 'text-gray-500'} />
                              </div>
                              <p className={`font-black text-sm md:text-lg leading-tight mb-1 md:mb-2 ${selectedProduct?._id === p._id ? 'text-white' : 'text-gray-400'}`}>{p.name}</p>
                              <p className="text-primary font-black text-xs md:text-sm tracking-tight">{p.price.toLocaleString()} Ks</p>
                              {selectedProduct?._id === p._id && (
                                <div className="absolute top-3 right-3 md:top-4 md:right-4 w-5 h-5 md:w-6 md:h-6 bg-primary rounded-full flex items-center justify-center text-black">
                                  <CheckCircle size={12} />
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </section>
              )}

              {/* 3. User Info */}
              {currentStep === 3 && (
                <section className="luxury-card overflow-hidden animate-in fade-in slide-in-from-right duration-500">
                  <div className="bg-white/5 px-8 py-5 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button type="button" onClick={() => setCurrentStep(2)} className="p-2 bg-white/5 rounded-lg hover:bg-white/10 text-gray-400 transition-colors mr-2">
                        <ChevronLeft size={16} />
                      </button>
                      <span className="w-10 h-10 bg-primary text-black rounded-xl flex items-center justify-center font-black shadow-[0_0_15px_rgba(212,175,55,0.3)]">
                        {gameId === 'mlbb' ? '3' : '2'}
                      </span>
                      <h2 className="text-xl font-black text-white uppercase tracking-tight">User Verification</h2>
                    </div>
                  </div>
                  <div className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                      <div className={`space-y-3 ${gameId === 'pubg' || gameId === 'wwm' ? 'md:col-span-2' : ''}`}>
                        <label className="text-[10px] uppercase tracking-[0.2em] font-black text-gray-500 ml-1">Player ID</label>
                        <input 
                          type="text" 
                          placeholder={
                            gameId === 'pubg' ? "Enter your 8-12 digit Player ID" :
                            gameId === 'wwm' ? "Enter your 10-digit User ID (e.g., 0016672987)" :
                            "Enter your User ID"
                          }
                          className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-primary/50 text-white font-bold transition-all"
                          value={playerId}
                          onChange={(e) => {
                            setPlayerId(e.target.value);
                            setNickname(''); // Reset verification if ID changes
                          }}
                          required
                        />
                      </div>
                      {gameId !== 'pubg' && gameId !== 'wwm' && (
                        <div className="space-y-3">
                          <label className="text-[10px] uppercase tracking-[0.2em] font-black text-gray-500 ml-1">Zone ID</label>
                          <input 
                            type="text" 
                            placeholder="4-5 Digits"
                            className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-primary/50 text-white font-bold transition-all"
                            value={serverId}
                            onChange={(e) => {
                              setServerId(e.target.value);
                              setNickname(''); // Reset verification if server changes
                            }}
                            required={gameId === 'mlbb' || gameId === 'mcgg'}
                          />
                        </div>
                      )}
                    </div>

                    {gameId !== 'mcgg' && gameId !== 'pubg' && gameId !== 'wwm' && gameId !== 'mlbb' && (
                      <div className="mt-8">
                        <button
                          type="button"
                          onClick={handleCheck}
                          disabled={checking || !playerId || (gameId !== 'pubg' && gameId !== 'wwm' && !serverId)}
                          className="w-full py-4 bg-white/5 hover:bg-primary hover:text-black border border-white/10 hover:border-primary rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-3 group disabled:opacity-50 disabled:hover:bg-white/5 disabled:hover:text-gray-500 disabled:hover:border-white/10"
                        >
                          {checking ? (
                            <>
                              <RefreshCw size={18} className="animate-spin" />
                              <span>Verifying...</span>
                            </>
                          ) : (
                            <>
                              <UserCheck size={18} className="group-hover:scale-110 transition-transform" />
                              <span>Verify Account</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {checking && (
                      <div className="mt-8 flex items-center justify-center gap-3 text-primary animate-pulse">
                        <RefreshCw className="animate-spin" size={20} />
                        <span className="uppercase tracking-widest text-xs font-black">Scanning Battlefield...</span>
                      </div>
                    )}

                    {nickname && (
                      <div className="mt-8 p-6 bg-primary/10 rounded-3xl border border-primary/30 flex items-center gap-5 animate-in zoom-in duration-500">
                        <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center text-black shadow-lg">
                          <Trophy size={28} />
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.3em] font-black text-primary mb-1">Authenticated Account</p>
                          <p className="text-2xl font-black text-white tracking-tight">{nickname}</p>
                        </div>
                        <div className="ml-auto text-primary">
                          <CheckCircle size={24} />
                        </div>
                      </div>
                    )}

                    {checkError && (
                      <div className="mt-6 p-5 bg-red-500/10 text-red-500 rounded-2xl border border-red-500/20 flex items-center gap-4 animate-in shake">
                        <AlertCircle size={24} />
                        <p className="font-bold text-sm tracking-tight">{checkError}</p>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* 4. Payment Method */}
              {currentStep === 4 && (
                <section className="luxury-card overflow-hidden animate-in fade-in slide-in-from-right duration-500">
                  <div className="bg-white/5 px-8 py-5 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button type="button" onClick={() => setCurrentStep(3)} className="p-2 bg-white/5 rounded-lg hover:bg-white/10 text-gray-400 transition-colors mr-2">
                        <ChevronLeft size={16} />
                      </button>
                      <span className="w-10 h-10 bg-primary text-black rounded-xl flex items-center justify-center font-black shadow-[0_0_15px_rgba(212,175,55,0.3)]">
                        {gameId === 'mlbb' ? '4' : '3'}
                      </span>
                      <h2 className="text-xl font-black text-white uppercase tracking-tight">Final Step: Checkout</h2>
                    </div>
                  </div>
                  <div className="p-4 md:p-8">
                    {paymentLoading ? (
                      <div className="flex justify-center py-4">
                        <RefreshCw className="animate-spin text-primary" size={24} />
                      </div>
                    ) : paymentMethods.length === 0 ? (
                      <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] text-center">No payment methods available</p>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4 mb-8 md:mb-10">
                        {paymentMethods.map((pm) => (
                          <button
                            key={pm._id}
                            type="button"
                            onClick={() => {
                              setSelectedPayment(pm);
                              setValidationError('');
                            }}
                            className={`p-3 md:p-4 border rounded-xl md:rounded-2xl transition-all flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4 text-center sm:text-left ${selectedPayment?._id === pm._id ? 'border-primary bg-primary/10 shadow-lg' : 'border-white/5 bg-white/5 hover:border-white/20'}`}
                          >
                            <img src={pm.image} alt={pm.name} loading="lazy" className="w-10 h-10 md:w-14 md:h-14 rounded-lg md:rounded-xl object-cover shadow-lg" />
                            <div className="flex flex-col">
                              <span className={`font-black uppercase tracking-widest text-[9px] md:text-[10px] ${selectedPayment?._id === pm._id ? 'text-primary' : 'text-gray-500'}`}>{pm.name}</span>
                              <span className="text-[7px] md:text-[8px] font-bold text-gray-600 tracking-tighter">{pm.phone_number}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {selectedPayment && (
                      <div className="mb-8 md:mb-10 p-5 md:p-6 bg-primary/5 border border-primary/20 rounded-2xl flex flex-col sm:flex-row items-center gap-6 animate-in zoom-in-95 duration-300">
                        <div className="relative group shrink-0">
                          <img 
                            src={selectedPayment.image} 
                            alt={selectedPayment.name} 
                            loading="lazy"
                            className="w-32 h-32 md:w-40 md:h-40 object-contain rounded-xl shadow-2xl border border-white/10 bg-white/5 p-2" 
                            style={{ WebkitTouchCallout: 'default', userSelect: 'auto' }}
                          />
                        </div>
                        <div className="flex flex-col items-center sm:items-start text-center sm:text-left w-full">
                          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Transfer To</span>
                          <h4 className="text-lg md:text-xl font-black text-primary uppercase tracking-widest mb-4">{selectedPayment.name}</h4>
                          
                          <div className="flex items-center gap-3 bg-black/50 px-4 py-3 rounded-xl border border-white/10 w-full sm:w-auto justify-between group hover:border-primary/50 transition-colors">
                            <span className="text-sm md:text-lg font-bold text-white tracking-wider select-all">{selectedPayment.phone_number}</span>
                            <button 
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                navigator.clipboard.writeText(selectedPayment.phone_number);
                              }}
                              className="text-gray-400 hover:text-primary transition-colors p-2 bg-white/5 hover:bg-primary/10 rounded-lg flex items-center gap-2"
                            >
                              <Copy size={16} />
                              <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:inline">Copy</span>
                            </button>
                          </div>
                          <p className="text-[9px] md:text-[10px] text-gray-500 mt-4 uppercase tracking-widest leading-relaxed">
                            1. Long-press photo to save QR or copy Account Number.<br/>
                            2. Transfer the exact amount.<br/>
                            3. Upload the screenshot below.
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8 md:mb-10">
                      <div className="space-y-2 md:space-y-3">
                        <label className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] font-black text-gray-500 ml-1">Your Phone Number (For Account/Inbox)</label>
                        <input 
                          type="text" 
                          placeholder="09..."
                          className="w-full px-4 py-3 md:px-5 md:py-4 bg-white/5 border border-white/10 rounded-xl md:rounded-2xl focus:outline-none focus:border-primary/50 text-white font-bold transition-all text-sm md:text-base"
                          value={userPhone}
                          onChange={(e) => {
                            setUserPhone(e.target.value);
                            setValidationError('');
                          }}
                        />
                      </div>
                      <div className="space-y-2 md:space-y-3">
                        <label className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] font-black text-gray-500 ml-1">Upload Transaction Screenshot</label>
                        <div className="relative">
                          <input 
                            type="file" 
                            id="screenshot-upload"
                            className="hidden"
                            onChange={(e) => {
                              setTransactionImage(e.target.files[0]);
                              setValidationError('');
                            }}
                            accept="image/*"
                          />
                          <label 
                            htmlFor="screenshot-upload"
                            className={`w-full px-4 py-3 md:px-5 md:py-4 bg-white/5 border ${transactionImage ? 'border-primary/50 bg-primary/5' : 'border-white/10'} rounded-xl md:rounded-2xl flex items-center justify-between cursor-pointer hover:bg-white/10 transition-all`}
                          >
                            <span className={`text-xs md:text-sm font-bold truncate ${transactionImage ? 'text-white' : 'text-gray-500'}`}>
                              {transactionImage ? transactionImage.name : 'Choose image file...'}
                            </span>
                            <div className="px-3 py-1 bg-primary text-black text-[10px] font-black uppercase rounded-full shrink-0">
                              Browse
                            </div>
                          </label>
                        </div>
                      </div>
                    </div>

                    {validationError && (
                      <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 animate-in shake duration-300">
                        <AlertCircle size={18} className="text-red-500" />
                        <span className="text-xs font-black uppercase tracking-widest text-red-500">{validationError}</span>
                      </div>
                    )}

                    <button 
                      type="submit" 
                      disabled={submitting}
                      className="w-full luxury-button py-4 md:py-6 text-sm md:text-xl flex items-center justify-center gap-3 md:gap-4 group disabled:opacity-50"
                    >
                      {submitting ? <RefreshCw className="animate-spin w-5 h-5 md:w-6 md:h-6" /> : <ShieldCheck className="w-5 h-5 md:w-6 md:h-6" />}
                      <span className="font-black uppercase tracking-[0.2em]">{submitting ? 'Processing...' : 'Confirm Purchase'}</span>
                    </button>
                  </div>
                </section>
              )}
            </form>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-4">
            <div className="sticky top-32 space-y-6">
              <div className="luxury-card p-8 bg-gradient-to-br from-dark-soft to-black">
                <h3 className="text-lg font-black text-white uppercase tracking-widest mb-8 flex items-center gap-3">
                  <CreditCard size={20} className="text-primary" /> Order Summary
                </h3>
                
                <div className="space-y-6">
                  <div className="flex justify-between items-start pb-6 border-b border-white/5">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Selected Game</span>
                    <span className="text-sm font-black text-white uppercase">{gameNames[gameId] || gameId}</span>
                  </div>
                  
                  <div className="flex justify-between items-start pb-6 border-b border-white/5">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Top-up Item</span>
                    <span className="text-sm font-black text-primary text-right">{selectedProduct ? selectedProduct.name : 'Not Selected'}</span>
                  </div>

                  <div className="flex justify-between items-start pb-6 border-b border-white/5">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Player ID</span>
                    <span className="text-sm font-black text-white">{playerId || 'Not Entered'}</span>
                  </div>

                  {nickname && (
                    <div className="flex justify-between items-start pb-6 border-b border-white/5 animate-in fade-in slide-in-from-right-2 duration-500">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Username</span>
                      <span className="text-sm font-black text-primary text-right">{nickname}</span>
                    </div>
                  )}

                  <div className="pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Total Price</span>
                      <span className="text-3xl font-black gold-text-gradient">{selectedProduct ? selectedProduct.price.toLocaleString() : '0'} Ks</span>
                    </div>
                    <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest text-right">Instant automated delivery</p>
                  </div>
                </div>
              </div>

              <div className="luxury-card p-8 bg-primary/5 border-primary/20">
                <div className="flex items-start gap-4">
                  <Info size={24} className="text-primary flex-shrink-0" />
                  <div className="space-y-2">
                    <h4 className="text-xs font-black text-white uppercase tracking-widest">VIP Support</h4>
                    <p className="text-xs text-gray-500 leading-relaxed font-medium">Your purchase is protected by our elite security protocol. Need help? Contact our 24/7 VIP concierge.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GameDetail;
