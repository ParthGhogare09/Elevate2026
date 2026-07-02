import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Calendar, User, ArrowLeft, Clock, Sparkles, BookOpen, AlertCircle } from 'lucide-react';
import { API_BASE_URL } from '../config';
import { getWorkshopTheme } from '../utils/themes';


const WorkshopDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workshop, setWorkshop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    setLoading(true);
    setErrorMsg('');

    fetch(`${API_BASE_URL}/api/workshops/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setWorkshop(data.data);
        } else {
          setErrorMsg(data.message || 'Workshop details not found.');
        }
      })
      .catch(() => {
        setErrorMsg('Network error pulling workshop records.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="pt-36 pb-24 text-center text-cyber-blue bg-cyber-bg min-h-screen">
        <div className="animate-spin w-8 h-8 border-2 border-t-transparent border-cyber-blue rounded-full mx-auto mb-2" />
        <span className="font-mono text-xs uppercase tracking-widest">Retrieving Workshop Node...</span>
      </div>
    );
  }

  if (errorMsg || !workshop) {
    return (
      <div className="pt-36 pb-24 px-4 text-center bg-cyber-bg min-h-screen max-w-md mx-auto space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
        <h3 className="font-sora font-extrabold text-sm text-red-400 uppercase tracking-widest">Details Locked</h3>
        <p className="text-xs text-slate-300 leading-relaxed">{errorMsg || 'Workshop record unavailable.'}</p>
        <button 
          onClick={() => navigate('/')}
          className="px-6 py-2 rounded bg-slate-800 hover:bg-slate-700 text-white font-sora font-semibold text-xs transition-colors uppercase tracking-wider"
        >
          Back to Home
        </button>
      </div>
    );
  }

  const theme = getWorkshopTheme(workshop.id, workshop.title);
  const containerStyle = {
    '--theme-primary': theme.primary,
    '--theme-secondary': theme.secondary,
    '--theme-accent': theme.accent,
    '--theme-primary-alpha': theme.primaryAlpha,
    '--theme-primary-glow': theme.primaryGlow,
    '--theme-primary-border': theme.primaryBorder,
  };
  const sectionBgStyle = theme.bgOverride ? { background: theme.bgOverride } : {};

  return (
    <div className="pt-32 pb-24 px-4 min-h-screen relative max-w-4xl mx-auto bg-cyber-bg">
      {/* Background blobs */}
      <div 
        style={{ backgroundColor: theme.primary }}
        className="absolute top-10 left-10 w-[200px] h-[200px] opacity-5 blur-[100px] pointer-events-none" 
      />

      {/* Back Button */}
      <Link 
        to="/" 
        style={{ '--theme-primary': theme.primary }}
        className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-450 hover:text-[var(--theme-primary)] transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>BACK TO HOME</span>
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start relative z-10">
        
        {/* Left Column: Workshop Descriptions */}
        <div 
          style={{ ...containerStyle, ...sectionBgStyle }}
          className="md:col-span-8 glass-panel p-6 md:p-8 rounded-xl border border-slate-800 space-y-6 shadow-glass relative"
        >
          <div className="absolute top-0 left-0 w-3.5 h-3.5 border-t-2 border-l-2 themed-corner-border" />
          <div className="absolute top-0 right-0 w-3.5 h-3.5 border-t-2 border-r-2 themed-corner-border" />

          {/* Heading info */}
          <div className="flex justify-between items-start">
            <div className="p-2.5 rounded themed-card-icon">
              <BookOpen className="w-6 h-6" />
            </div>
            <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
              workshop.status === 'Open' 
                ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                : 'bg-red-500/10 text-red-400 border border-red-500/20'
            }`}>
              {workshop.status}
            </span>
          </div>

          <div className="space-y-2">
            <h1 className="font-sora font-extrabold text-2xl md:text-3xl text-white tracking-wide uppercase leading-tight">
              {workshop.title}
            </h1>
            <p className="text-slate-500 text-xs font-mono tracking-widest uppercase">WORKSHOP MODULE ID: {workshop.id}</p>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-900">
            <h4 className="font-sora font-bold text-xs uppercase themed-card-icon-hover tracking-wider">Module Description</h4>
            <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
              {workshop.description}
            </p>
          </div>

          {/* Syllabus topics list */}
          <div className="space-y-3 pt-4 border-t border-slate-900 text-xs">
            <h4 className="font-sora font-bold text-xs uppercase themed-card-icon-hover tracking-wider">Core Skills Acquired</h4>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-400">
              <li className="flex items-center space-x-2">
                <Sparkles className="w-3.5 h-3.5 themed-card-icon-hover" />
                <span>Hands-on Code Implementation</span>
              </li>
              <li className="flex items-center space-x-2">
                <Sparkles className="w-3.5 h-3.5 themed-card-icon-hover" />
                <span>Interactive Q&A Session</span>
              </li>
              <li className="flex items-center space-x-2">
                <Sparkles className="w-3.5 h-3.5 themed-card-icon-hover" />
                <span>Reference Slidedecks & Resources</span>
              </li>
              <li className="flex items-center space-x-2">
                <Sparkles className="w-3.5 h-3.5 themed-card-icon-hover" />
                <span>Direct Verification Audits</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Column: Checkout Action box */}
        <div className="md:col-span-4 space-y-6">
          <div 
            style={{ ...containerStyle, ...sectionBgStyle }}
            className="glass-panel p-6 rounded-xl border border-slate-800 space-y-6 shadow-glass relative text-center"
          >
            <h4 className="font-sora font-bold text-xs uppercase text-slate-400 tracking-wider">Schedule Details</h4>
            
            <div 
              style={{ backgroundColor: theme.bgOverride ? '#0a0a0a' : 'rgba(0, 0, 0, 0.6)' }}
              className="space-y-4 text-left border border-slate-900 rounded p-4 text-xs"
            >
              <div className="flex items-center space-x-3 text-slate-300">
                <Calendar className="w-4 h-4 themed-card-icon-hover shrink-0" />
                <div>
                  <p className="font-semibold text-[10px] text-slate-500 uppercase">Timing Bounds</p>
                  <p className="mt-0.5">{workshop.dateTime}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 text-slate-300 border-t border-slate-900/60 pt-3">
                <User className="w-4 h-4 themed-card-icon-hover shrink-0" />
                <div>
                  <p className="font-semibold text-[10px] text-slate-500 uppercase">Class Instructor</p>
                  <p className="mt-0.5">{workshop.mentor}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Link
                to={`/register?workshop=${workshop.id}`}
                className="block w-full py-3 rounded themed-card-button text-white font-sora font-extrabold uppercase tracking-widest text-[10px] transition-all"
              >
                Register For This Class
              </Link>
              
              <Link 
                to="/register"
                className="block text-[10px] text-slate-450 hover:text-[var(--theme-primary)] underline uppercase tracking-widest transition-colors font-semibold"
              >
                Or Register For Full Package (₹150)
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default WorkshopDetail;
