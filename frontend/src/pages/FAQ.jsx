import React, { useState, useEffect } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Zap, ShieldCheck, CreditCard, User, MessageCircle } from 'lucide-react';

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const faqs = [
    {
      category: "Ordering & Delivery",
      icon: <Zap className="text-primary" size={20} />,
      questions: [
        {
          q: "How long does delivery take?",
          a: "Our elite system is designed for instant automated delivery. Most top-ups are credited to your account within 60 seconds of payment verification. During peak hours or maintenance, it may take up to 15-30 minutes."
        },
        {
          q: "I entered the wrong Player ID, what should I do?",
          a: "Since our delivery is automated, top-ups sent to incorrect IDs provided by the user cannot be reversed. Please double-check your ID and Server ID carefully before confirming. Use our 'Auto-Check' feature to verify your nickname first."
        },
        {
          q: "Can I cancel my order?",
          a: "Once an order is confirmed and the payment screenshot is uploaded, it enters our automated processing queue. Cancellations are only possible if the order status is still 'Pending' and delivery hasn't started. Contact our VIP Concierge immediately for assistance."
        }
      ]
    },
    {
      category: "Payments & Security",
      icon: <ShieldCheck className="text-primary" size={20} />,
      questions: [
        {
          q: "Which payment methods do you accept?",
          a: "We accept all major local mobile banking and digital wallets (KBZPay, WavePay, etc.). Our payment section is updated regularly with the most secure and convenient options for our members."
        },
        {
          q: "Is it safe to buy from Skins Collector?",
          a: "Absolutely. We use elite-grade encryption and direct API integrations with game publishers. We never ask for your game password. Your transaction is secured by our Elite-Protocol, ensuring 100% safety for your game account."
        }
      ]
    },
    {
      category: "Account & Inbox",
      icon: <User className="text-primary" size={20} />,
      questions: [
        {
          q: "How do I create an account?",
          a: "Accounts are automatically created for you using your phone number during your first purchase. This 'VIP Account' allows you to track all your orders and receive notifications in your personal Inbox."
        },
        {
          q: "Where can I see my order updates?",
          a: "Once logged in, check your 'Order History' for status tracking and your 'Inbox' for personalized messages from our administrators regarding your delivery."
        }
      ]
    }
  ];

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-black pt-28 pb-20">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <HelpCircle size={14} className="text-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Intelligence Center</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-6">
            Service <span className="gold-text-gradient">FAQ</span>
          </h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Everything you need to know about our elite services</p>
        </div>

        {/* FAQ Sections */}
        <div className="space-y-12">
          {faqs.map((section, sIdx) => (
            <div key={sIdx} className="animate-in fade-in slide-in-from-bottom-8 duration-700" style={{ animationDelay: `${sIdx * 150}ms` }}>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                  {section.icon}
                </div>
                <h2 className="text-xl font-black text-white uppercase tracking-widest">{section.category}</h2>
              </div>

              <div className="space-y-4">
                {section.questions.map((item, qIdx) => {
                  const globalIdx = `${sIdx}-${qIdx}`;
                  const isOpen = activeIndex === globalIdx;
                  return (
                    <div 
                      key={qIdx} 
                      className={`luxury-card overflow-hidden transition-all duration-500 ${isOpen ? 'border-primary/40 ring-1 ring-primary/20' : 'hover:border-white/20'}`}
                    >
                      <button 
                        onClick={() => toggleAccordion(globalIdx)}
                        className="w-full px-8 py-6 flex items-center justify-between text-left group"
                      >
                        <span className={`text-sm md:text-lg font-bold transition-colors ${isOpen ? 'text-primary' : 'text-gray-300 group-hover:text-white'}`}>
                          {item.q}
                        </span>
                        <div className={`shrink-0 ml-4 transition-transform duration-500 ${isOpen ? 'rotate-180 text-primary' : 'text-gray-600'}`}>
                          <ChevronDown size={20} />
                        </div>
                      </button>
                      
                      <div 
                        className={`transition-all duration-500 ease-in-out overflow-hidden ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
                      >
                        <div className="px-8 pb-8 text-gray-400 font-medium leading-relaxed border-t border-white/5 pt-6">
                          {item.a}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Support CTA */}
        <div className="mt-20 luxury-card p-10 md:p-16 bg-gradient-to-br from-primary/10 to-transparent border-primary/20 text-center relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 blur-[80px] rounded-full"></div>
          <div className="relative z-10">
            <MessageCircle className="text-primary mx-auto mb-6" size={48} />
            <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight mb-4">Still Have Questions?</h3>
            <p className="text-gray-500 font-medium mb-10 max-w-lg mx-auto">
              Our elite concierge team is ready to assist you 24/7 with any specific inquiries about your orders or our platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="luxury-button px-12 py-5 font-black uppercase tracking-[0.2em] text-[10px]">
                Open Support Ticket
              </button>
              <button className="bg-white/5 hover:bg-white/10 text-white px-12 py-5 rounded-2xl border border-white/10 font-black uppercase tracking-[0.2em] text-[10px] transition-all">
                Live Chat Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
