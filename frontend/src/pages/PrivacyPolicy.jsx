import { ShieldCheck, Lock, Eye, FileText, Bell, Globe, Mail } from 'lucide-react';

const PrivacyPolicy = () => {
  const sections = [
    {
      icon: <Eye size={24} />,
      title: "Information Collection",
      content: "We collect information you provide directly to us when you create an account, make a purchase, or communicate with our VIP concierge. This includes your name, email address, phone number, and gaming IDs (e.g., Player ID, Zone ID)."
    },
    {
      icon: <ShieldCheck size={24} />,
      title: "Data Usage",
      content: "Your information is used to process your elite top-up orders, verify your gaming identity, and provide instant automated delivery. We also use it to communicate order status updates and exclusive VIP promotions."
    },
    {
      icon: <Lock size={24} />,
      title: "Security Protocols",
      content: "We implement industry-standard security measures to protect your personal data. All transactions are processed through encrypted channels, and sensitive payment information is never stored directly on our servers."
    },
    {
      icon: <Globe size={24} />,
      title: "Third-Party Sharing",
      content: "We do not sell your personal information. We only share data with trusted gaming partners and payment processors necessary to fulfill your orders and maintain our elite service standards."
    },
    {
      icon: <Bell size={24} />,
      title: "Cookie Policy",
      content: "Our platform uses cookies to enhance your browsing experience, remember your preferences, and analyze our traffic to provide a more personalized gaming store experience."
    },
    {
      icon: <Mail size={24} />,
      title: "Contact Us",
      content: "If you have any questions regarding our Privacy Policy or your personal data, please contact our 24/7 VIP support team through our official channels."
    }
  ];

  return (
    <div className="pt-32 pb-20 bg-black min-h-screen">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header Section */}
        <div className="text-center mb-20">
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="w-12 h-1 bg-primary rounded-full"></span>
            <span className="text-primary font-black uppercase tracking-[0.3em] text-xs">Legal Transparency</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tighter">
            PRIVACY <span className="gold-text-gradient">POLICY</span>
          </h1>
          <p className="text-gray-500 font-medium max-w-2xl mx-auto leading-relaxed">
            At SKINS COLLECTOR, your data security is our highest priority. This policy outlines how we handle your personal information within our elite gaming ecosystem.
          </p>
        </div>

        {/* Content Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {sections.map((section, index) => (
            <div 
              key={index} 
              className="luxury-card p-8 group hover:border-primary/30 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-black transition-all duration-500 shadow-inner">
                {section.icon}
              </div>
              <h3 className="text-xl font-black text-white mb-4 uppercase tracking-tight">{section.title}</h3>
              <p className="text-sm text-gray-500 font-medium leading-relaxed">
                {section.content}
              </p>
            </div>
          ))}
        </div>

        {/* Footer Info */}
        <div className="mt-20 p-8 rounded-[2rem] bg-white/5 border border-white/10 text-center">
          <FileText className="text-primary mx-auto mb-4" size={32} />
          <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.2em] mb-2">Last Updated</p>
          <p className="text-white font-bold uppercase tracking-widest text-sm">March 2026</p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
