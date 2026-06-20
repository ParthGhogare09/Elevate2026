import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Cpu } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (sectionId) => {
    setIsOpen(false);
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const isLinkActive = (path) => location.pathname === path;

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
      isScrolled 
        ? 'py-3 bg-cyber-bg/90 backdrop-blur-md border-b border-cyber-blue/15 shadow-neon-blue/5' 
        : 'py-5 bg-transparent border-b border-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo Brand */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-cyber-slate border border-cyber-blue/30 group-hover:border-cyber-blue transition-colors">
              <Cpu className="w-5 h-5 text-cyber-blue group-hover:scale-110 transition-transform" />
              <div className="absolute inset-0 rounded-lg bg-cyber-blue/20 blur opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <span className="font-sora font-extrabold text-xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-cyber-blue">
              ELEVATE <span className="text-cyber-blue text-glow-blue">2026</span>
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <button onClick={() => handleNavClick('about')} className="text-sm font-medium text-slate-300 hover:text-cyber-blue hover:text-glow-blue transition-colors">
              About
            </button>
            <button onClick={() => handleNavClick('workshops')} className="text-sm font-medium text-slate-300 hover:text-cyber-blue hover:text-glow-blue transition-colors">
              Workshops
            </button>
            <button onClick={() => handleNavClick('timeline')} className="text-sm font-medium text-slate-300 hover:text-cyber-blue hover:text-glow-blue transition-colors">
              Timeline
            </button>
            <button onClick={() => handleNavClick('faq')} className="text-sm font-medium text-slate-300 hover:text-cyber-blue hover:text-glow-blue transition-colors">
              FAQ
            </button>
            
            <Link 
              to="/dashboard" 
              className="px-4 py-1.5 text-xs font-semibold uppercase tracking-wider rounded border border-cyber-blue/40 hover:border-cyber-blue text-cyber-blue hover:text-white transition-all shadow-sm hover:shadow-neon-blue hover:bg-cyber-blue/10"
            >
              Dashboard
            </Link>

            <Link 
              to="/register" 
              className="px-5 py-2 text-xs font-bold uppercase tracking-widest rounded bg-gradient-to-r from-cyber-blue to-blue-600 text-white font-sora hover:brightness-110 hover:shadow-neon-blue transition-all hover:-translate-y-0.5"
            >
              Register Now
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-1 rounded text-slate-400 hover:text-white focus:outline-none"
            >
              {isOpen ? <X className="w-6 h-6 text-cyber-blue" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 top-[60px] bg-cyber-bg/95 backdrop-blur-lg border-t border-cyber-blue/15 z-40 animate-fadeIn">
          <div className="px-6 py-8 flex flex-col space-y-6">
            <button onClick={() => handleNavClick('about')} className="text-left font-sora text-lg font-semibold text-slate-300 hover:text-cyber-blue">
              About
            </button>
            <button onClick={() => handleNavClick('workshops')} className="text-left font-sora text-lg font-semibold text-slate-300 hover:text-cyber-blue">
              Workshops
            </button>
            <button onClick={() => handleNavClick('timeline')} className="text-left font-sora text-lg font-semibold text-slate-300 hover:text-cyber-blue">
              Timeline
            </button>
            <button onClick={() => handleNavClick('faq')} className="text-left font-sora text-lg font-semibold text-slate-300 hover:text-cyber-blue">
              FAQ
            </button>
            
            <div className="h-px bg-slate-800 my-2" />

            <Link 
              to="/dashboard" 
              onClick={() => setIsOpen(false)}
              className="w-full text-center py-2.5 rounded border border-cyber-blue/50 text-cyber-blue hover:bg-cyber-blue/10 text-sm font-semibold uppercase tracking-wider"
            >
              Student Dashboard
            </Link>

            <Link 
              to="/register" 
              onClick={() => setIsOpen(false)}
              className="w-full text-center py-3 rounded bg-gradient-to-r from-cyber-blue to-blue-600 text-white font-bold uppercase tracking-widest text-sm"
            >
              Register Now
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
