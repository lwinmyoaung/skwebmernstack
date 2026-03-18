import React, { useEffect } from 'react';
import { Trophy, Users, Globe, ShieldCheck, Zap, Crown, Star, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config';
import { getImageUrl } from '../utils/image';

const About = () => {
  const [logo, setLogo] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchLogo();
  }, []);

  const fetchLogo = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/v1/logos`);
      if (res.data.success && res.data.data.length > 0) {
        setLogo(res.data.data[0]);
      }
    } catch (err) {
      console.error('Error fetching logo for about page', err);
    }
  };

  const stats = [
    { label: "Elite Members", value: "50,000+", icon: <Users className="text-primary" size={20} /> },
    { label: "Instant Deliveries", value: "1M+", icon: <Zap className="text-primary" size={20} /> },
    { label: "Global Regions", value: "12+", icon: <Globe className="text-primary" size={20} /> },
    { label: "Satisfaction Rate", value: "99.9%", icon: <Star className="text-primary" size={20} /> }
  ];

  const values = [
    {
      title: "The Gold Standard",
      description: "We don't just sell top-ups; we provide an elite experience. Every transaction is handled with the precision and speed that professional gamers demand.",
      icon: <Crown className="text-primary" size={32} />
    },
    {
      title: "Uncompromising Security",
      description: "Our proprietary security protocols ensure that your account and financial data remain protected under a digital fortress of elite encryption.",
      icon: <ShieldCheck className="text-primary" size={32} />
    },
    {
      title: "Player First",
      description: "Founded by gamers, for gamers. We understand the thrill of the win and the importance of having your assets ready when the battle begins.",
      icon: <Heart className="text-primary" size={32} />
    }
  ];

  return (
    <div className="min-h-screen bg-black pt-28 pb-20 overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="relative mb-24 text-center">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full -z-10"></div>
          
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Trophy size={14} className="text-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Est. 2024 • Luxury Gaming Services</span>
          </div>
          
          <h1 className="text-5xl md:text-8xl font-black text-white uppercase tracking-tighter mb-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
            Beyond the <span className="gold-text-gradient">Game</span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-gray-400 text-lg md:text-xl font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-12 duration-700 delay-200">
            Skins Collector is the premier destination for elite gamers seeking a seamless, secure, and sophisticated top-up experience.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 mb-32 animate-in zoom-in duration-1000 delay-300">
          {stats.map((stat, index) => (
            <div key={index} className="luxury-card p-8 text-center hover:border-primary/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/10 transition-colors">
                {stat.icon}
              </div>
              <div className="text-3xl font-black text-white mb-1 tracking-tight">{stat.value}</div>
              <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Story Section */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-32">
          <div className="relative group animate-in slide-in-from-left-8 duration-1000 delay-400">
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
            <img 
              src={logo ? getImageUrl(logo.image) : "/uploads/logo/skincollector.jpg"} 
              alt={logo ? logo.name : "Our Story"} 
              loading="lazy"
              className="relative w-full aspect-square object-cover rounded-[3rem] border border-white/10 shadow-2xl"
            />
          </div>
          <div className="space-y-8 animate-in slide-in-from-right-8 duration-1000 delay-400">
            <h2 className="text-4xl font-black text-white uppercase tracking-tight">
              Our <span className="text-primary">Vision</span>
            </h2>
            <div className="space-y-6 text-gray-400 font-medium leading-relaxed text-lg">
              <p>
                In the fast-paced world of competitive gaming, every second counts. We saw a gap in the market for a top-up service that wasn't just functional, but exceptional.
              </p>
              <p>
                Skins Collector was born from a desire to bring the "White Glove" concierge experience to the gaming industry. We believe that buying digital assets should be as rewarding as using them in the battlefield.
              </p>
              <p>
                Today, we serve a global community of elite players, providing instant access to diamonds, UC, and premium credits across the world's most popular titles.
              </p>
            </div>
          </div>
        </div>

        {/* Core Values */}
        <div className="mb-32">
          <h2 className="text-center text-3xl font-black text-white uppercase tracking-widest mb-16">The Elite Philosophy</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div 
                key={index} 
                className="luxury-card p-10 space-y-6 hover:translate-y-[-10px] transition-all duration-500 animate-in fade-in slide-in-from-bottom-8"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                  {value.icon}
                </div>
                <h3 className="text-xl font-black text-white uppercase tracking-tight">{value.title}</h3>
                <p className="text-gray-500 font-medium leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="luxury-card p-12 md:p-20 bg-gradient-to-br from-primary/10 to-transparent border-primary/20 text-center relative overflow-hidden">
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary/5 blur-[100px] rounded-full"></div>
          <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter mb-8">Ready to Level Up Your Experience?</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/" className="luxury-button px-12 py-5 font-black uppercase tracking-[0.2em] text-xs">
              Start Shopping
            </Link>
            <Link to="/contact" className="bg-white/5 hover:bg-white/10 text-white px-12 py-5 rounded-2xl border border-white/10 font-black uppercase tracking-[0.2em] text-xs transition-all">
              Contact Concierge
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
