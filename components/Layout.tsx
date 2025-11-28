import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, History, PieChart, Menu, X, BrainCircuit, LineChart, Instagram, Send, Phone } from 'lucide-react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/chart', label: 'Chart', icon: <LineChart size={20} /> },
    { path: '/add', label: 'New Trade', icon: <PlusCircle size={20} /> },
    { path: '/history', label: 'Journal', icon: <History size={20} /> },
    { path: '/analytics', label: 'Analytics', icon: <PieChart size={20} /> },
    { path: '/coach', label: 'AI Coach', icon: <BrainCircuit size={20} /> },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-black text-gray-200 font-sans selection:bg-neon-green selection:text-black">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-neon-card border-b border-white/10 sticky top-0 z-50 backdrop-blur-md bg-black/80">
        <h1 className="text-xl font-bold bg-gradient-to-r from-neon-green to-neon-blue bg-clip-text text-transparent">
          TBK<span className="font-light text-white">TRADES</span>
        </h1>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white">
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar / Mobile Menu */}
      <nav className={`
        fixed md:sticky md:top-0 top-[60px] left-0 w-full md:w-64 h-[calc(100vh-60px)] md:h-screen
        bg-black/95 md:bg-black border-r border-white/10
        flex flex-col p-6 transition-transform duration-300 z-40
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="hidden md:block mb-10 mt-2">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-neon-green to-neon-blue bg-clip-text text-transparent tracking-tighter">
            TBK<span className="font-light text-white">TRADES</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">Professional Trading Journal</p>
        </div>

        <div className="space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                  ${isActive 
                    ? 'bg-neon-green/10 text-neon-green border border-neon-green/20 shadow-[0_0_15px_rgba(0,255,148,0.1)]' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'}
                `}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Contact Footer */}
        <div className="mt-auto pt-6 border-t border-white/5 space-y-4">
          <div>
            <p className="text-xs font-medium text-gray-500 mb-3 uppercase tracking-wider">Contact & Support</p>
            <div className="flex gap-4">
              <a 
                href="https://t.me/Tradingbykaltuss" 
                target="_blank" 
                rel="noreferrer"
                className="p-2 bg-white/5 rounded-lg text-gray-400 hover:text-neon-blue hover:bg-neon-blue/10 transition-all"
                title="Telegram"
              >
                <Send size={18} />
              </a>
              <a 
                href="https://www.instagram.com/_the_kaltus_/?hl=en" 
                target="_blank" 
                rel="noreferrer"
                className="p-2 bg-white/5 rounded-lg text-gray-400 hover:text-neon-red hover:bg-neon-red/10 transition-all"
                title="Instagram"
              >
                <Instagram size={18} />
              </a>
              <a 
                href="https://wa.me/8801769111850" 
                target="_blank" 
                rel="noreferrer"
                className="p-2 bg-white/5 rounded-lg text-gray-400 hover:text-neon-green hover:bg-neon-green/10 transition-all"
                title="WhatsApp: +8801769111850"
              >
                <Phone size={18} />
              </a>
            </div>
          </div>
          <p className="text-xs text-gray-600">© 2024 TBK Trades</p>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  );
};