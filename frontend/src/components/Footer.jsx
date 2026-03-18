import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Mail, 
  MessageCircle, 
  Clock, 
  ShieldCheck, 
  Twitter, 
  Instagram, 
  Facebook, 
  Phone, 
  Globe 
} from 'lucide-react';
import axios from 'axios';

import { API_URL } from '../config';

const Footer = () => {
  const [contacts, setContacts] = useState([]);
  const [logo, setLogo] = useState(null);

  useEffect(() => {
    const fetchFooterData = async () => {
      try {
        const [contactsRes, logosRes] = await Promise.all([
          axios.get(`${API_URL}/api/v1/contacts`),
          axios.get(`${API_URL}/api/v1/logos`)
        ]);
        setContacts(contactsRes.data.data);
        if (logosRes.data.success && logosRes.data.data.length > 0) {
          setLogo(logosRes.data.data[0]);
        }
      } catch (err) {
        console.error('Error fetching footer data', err);
      }
    };
    fetchFooterData();
  }, []);

  const getIconComponent = (iconName) => {
    switch (iconName) {
      case 'Facebook': return <Facebook size={18} />;
      case 'Twitter': return <Twitter size={18} />;
      case 'Instagram': return <Instagram size={18} />;
      case 'Phone': return <Phone size={18} />;
      case 'Mail': return <Mail size={18} />;
      case 'Globe': return <Globe size={18} />;
      default: return <MessageCircle size={18} />;
    }
  };

  const renderContactValue = (contact) => {
    const isLink = contact.value.startsWith('http') || contact.value.startsWith('www');
    if (isLink) {
      const href = contact.value.startsWith('www') ? `https://${contact.value}` : contact.value;
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-gray-300 hover:text-primary transition-colors">
          {contact.platform}
        </a>
      );
    }
    return <span className="text-sm font-bold text-gray-300">{contact.value}</span>;
  };

  return (
    <footer className="bg-dark-soft border-t border-white/5 text-gray-400 pt-12 md:pt-20 pb-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mb-16">
          {/* Brand Section */}
          <div className="flex flex-col gap-4 md:gap-6">
            <Link to="/" className="flex items-center gap-3 md:gap-4 group">
              <img 
                src={logo ? `${API_URL}${logo.image}` : "/adminimages/logo/skincollector.jpg"} 
                alt={logo ? logo.name : "Skins Collector"} 
                loading="lazy"
                className="w-10 h-10 md:w-12 md:h-12 rounded-xl object-cover border border-white/10 group-hover:scale-105 transition-transform shadow-2xl"
              />
              <span className="text-xl md:text-2xl font-black text-white tracking-tighter uppercase">SKINS<span className="text-primary">COLLECTOR</span></span>
            </Link>
            <p className="text-xs md:text-sm leading-relaxed font-medium opacity-80">
              Elevating your gaming journey with premium digital assets and elite top-up services. Experience the gold standard of instant delivery and secure transactions.
            </p>
            <div className="flex gap-3 md:gap-4">
              {contacts.filter(c => ['Facebook', 'Twitter', 'Instagram'].includes(c.icon)).map(c => (
                <a 
                  key={c._id}
                  href={c.value.startsWith('http') ? c.value : `https://${c.value}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary hover:text-black transition-all duration-300"
                >
                  {getIconComponent(c.icon)}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Support */}
          <div>
            <h5 className="text-sm font-black text-white uppercase tracking-[0.2em] mb-8 border-l-4 border-primary pl-4">VIP Support</h5>
            <ul className="space-y-4">
              <li><Link to="/about" className="text-sm font-bold hover:text-primary transition-colors flex items-center gap-2">About Our Store</Link></li>
              <li><Link to="/contact" className="text-sm font-bold hover:text-primary transition-colors flex items-center gap-2">Concierge Contact</Link></li>
              <li><Link to="/faq" className="text-sm font-bold hover:text-primary transition-colors flex items-center gap-2">Service FAQ</Link></li>
              <li><Link to="/privacy" className="text-sm font-bold hover:text-primary transition-colors flex items-center gap-2">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Gaming Links */}
          <div>
            <h5 className="text-sm font-black text-white uppercase tracking-[0.2em] mb-8 border-l-4 border-primary pl-4">Quick Links</h5>
            <ul className="space-y-4">
              <li><Link to="/games" className="text-sm font-bold hover:text-primary transition-colors flex items-center gap-2">Browse All Games</Link></li>
              <li><Link to="/promotions" className="text-sm font-bold hover:text-primary transition-colors flex items-center gap-2">Exclusive Promotions</Link></li>
              <li><Link to="/terms" className="text-sm font-bold hover:text-primary transition-colors flex items-center gap-2">Terms of Service</Link></li>
              <li><Link to="/redeem" className="text-sm font-bold hover:text-primary transition-colors flex items-center gap-2">Redeem Code</Link></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h5 className="text-sm font-black text-white uppercase tracking-[0.2em] mb-8 border-l-4 border-primary pl-4">Contact Info</h5>
            <ul className="space-y-6">
              {contacts.length > 0 ? (
                contacts.map(c => (
                  <li key={c._id} className="flex items-center gap-4 group">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-black transition-all">
                      {getIconComponent(c.icon)}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-black text-gray-600">{c.platform}</span>
                      {renderContactValue(c)}
                    </div>
                  </li>
                ))
              ) : (
                <li className="flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-black transition-all">
                    <Clock size={18} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-black text-gray-600">Availability</span>
                    <span className="text-sm font-bold text-gray-300 uppercase tracking-widest">24/7 Global Service</span>
                  </div>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-gray-600 text-[10px] uppercase font-black tracking-widest">
            © {new Date().getFullYear()} SKINS COLLECTOR. ALL RIGHTS RESERVED.
          </p>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-600">
            <ShieldCheck size={14} className="text-primary" /> SECURED BY ELITE-PROTOCOL
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
