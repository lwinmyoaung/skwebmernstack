import React, { useEffect } from 'react';
import { Shield, FileText, Scale, Lock, RefreshCw, AlertTriangle, ChevronRight, Zap } from 'lucide-react';

const Terms = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const sections = [
    {
      icon: <FileText className="text-primary" size={24} />,
      title: "Agreement to Terms",
      content: "By accessing and using Skins Collector, you agree to be bound by these Terms and Services. Our platform provides premium game top-up services with elite security protocols. If you do not agree with any part of these terms, you must not use our services."
    },
    {
      icon: <Zap className="text-primary" size={24} />,
      title: "Service Delivery",
      content: "We provide instant automated delivery for most game top-ups. However, in cases of maintenance or technical issues, delivery may take up to 24 hours. Users are responsible for providing the correct Player ID and Zone ID. We are not liable for top-ups sent to incorrect IDs provided by the user."
    },
    {
      icon: <Shield className="text-primary" size={24} />,
      title: "Elite Security & Accounts",
      content: "When you confirm a purchase, a VIP account is automatically created for your phone number to track your orders. You are responsible for maintaining the confidentiality of your account details. One account per phone number is permitted under our fair use policy."
    },
    {
      icon: <RefreshCw className="text-primary" size={24} />,
      title: "Refund Policy",
      content: "Due to the digital nature of game top-ups, all successful transactions are final and non-refundable. If a transaction fails or an order is rejected by an administrator, the balance will be credited back or resolved through our VIP support concierge."
    },
    {
      icon: <AlertTriangle className="text-primary" size={24} />,
      title: "Prohibited Activities",
      content: "Users are prohibited from attempting to bypass our security protocols, using fraudulent payment methods, or exploiting system vulnerabilities. Any suspicious activity will result in an immediate permanent ban and forfeiture of all pending orders."
    },
    {
      icon: <Scale className="text-primary" size={24} />,
      title: "Governing Law",
      content: "These terms are governed by the laws applicable to digital commerce. We reserve the right to update these terms at any time to maintain our elite service standards. Continued use of the platform constitutes acceptance of any updates."
    }
  ];

  return (
    <div className="min-h-screen bg-black pt-28 pb-20">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header Section */}
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Lock size={14} className="text-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Legal Documentation</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-6">
            Terms of <span className="gold-text-gradient">Service</span>
          </h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Last Updated: March 18, 2026</p>
        </div>

        {/* Introduction Card */}
        <div className="luxury-card p-8 md:p-12 mb-12 relative overflow-hidden group animate-in fade-in duration-1000">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 blur-[80px] rounded-full group-hover:bg-primary/10 transition-all"></div>
          <p className="relative z-10 text-gray-400 leading-relaxed font-medium text-lg italic">
            "At Skins Collector, we believe in transparency and elite security. These terms ensure a safe and premium experience for every member of our community."
          </p>
        </div>

        {/* Detailed Sections */}
        <div className="space-y-6">
          {sections.map((section, index) => (
            <div 
              key={index} 
              className="luxury-card p-8 hover:border-primary/30 transition-all group animate-in fade-in slide-in-from-right-8 duration-700"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-primary/10 group-hover:border-primary/20 transition-all">
                  {section.icon}
                </div>
                <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight mb-3 flex items-center gap-3">
                    {section.title}
                    <ChevronRight size={16} className="text-primary opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0" />
                  </h3>
                  <p className="text-gray-400 leading-relaxed font-medium">
                    {section.content}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Note */}
        <div className="mt-16 text-center p-12 bg-primary/5 border border-primary/10 rounded-[2.5rem] animate-in zoom-in duration-1000">
          <h4 className="text-white font-black uppercase tracking-widest mb-4">Need Clarification?</h4>
          <p className="text-gray-500 text-sm font-medium mb-8 max-w-md mx-auto">
            Our elite support team is available 24/7 to answer any questions regarding our terms or your privacy.
          </p>
          <button className="luxury-button px-10 py-4 font-black uppercase tracking-[0.2em] text-[10px]">
            Contact VIP Concierge
          </button>
        </div>
      </div>
    </div>
  );
};

export default Terms;
