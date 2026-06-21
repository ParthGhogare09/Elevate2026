import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ChevronDown, Cpu, Calendar, User, CheckCircle2, 
  Terminal, ShieldCheck, Trophy, Users, BookOpen, Clock, ArrowRight
} from 'lucide-react';
import { API_BASE_URL } from '../config';

const LandingPage = () => {
  const [workshops, setWorkshops] = useState([]);
  const [settings, setSettings] = useState({
    eventTitle: 'Elevate 2026',
    eventTagline: 'Upgrade Your Skills, Elevate Your Future',
    eventMode: 'Online Webinar Series'
  });
  const [milestones, setMilestones] = useState([]);
  const [activeFaq, setActiveFaq] = useState(null);
  const [terminalLog, setTerminalLog] = useState('Initializing system boot...');

  // Fallback default workshops
  const defaultWorkshops = [
    { id: 'linkedin-mastery', title: 'LinkedIn Mastery', description: 'Optimize your LinkedIn profile, learn search engine optimization networking strategies, and build a professional personal brand.', mentor: 'Rohan Sharma', dateTime: 'July 10, 2026 - 05:00 PM IST', status: 'Open' },
    { id: 'github-version-control', title: 'GitHub & Version Control', description: 'Master Git command line basics, branching, merging, pull requests, resolving conflicts, and building a stellar project repository portfolio.', mentor: 'Aisha Verma', dateTime: 'July 12, 2026 - 05:00 PM IST', status: 'Open' },
    { id: 'web-development', title: 'Web Development (React + Tailwind)', description: 'Build modern responsive layouts from scratch using React components, configure styling tokens, and deploy static build pages.', mentor: 'Vikram Malhotra', dateTime: 'July 15, 2026 - 05:00 PM IST', status: 'Open' },
    { id: 'app-development', title: 'App Development (React Native)', description: 'Introduction to building native cross-platform mobile apps for iOS and Android, handling state components, and mobile layout files.', mentor: 'Sneha Patil', dateTime: 'July 18, 2026 - 05:00 PM IST', status: 'Open' },
    { id: 'data-science', title: 'Data Science & Machine Learning', description: 'Analyze data frames using Python libraries, parse data fields, plot chart graphs, and train regression algorithms.', mentor: 'Dr. Amit Sen', dateTime: 'July 20, 2026 - 05:00 PM IST', status: 'Open' },
    { id: 'presentation-soft-skills', title: 'Presentation & Soft Skills', description: 'Overcome public speaking fear, design engaging visual pitch decks, and improve corporate presentation delivery.', mentor: 'Priya Iyer', dateTime: 'July 22, 2026 - 05:00 PM IST', status: 'Open' }
  ];

  // Fallback default milestones
  const defaultMilestones = [
    { title: 'Registration Open', date: 'June 20, 2026', desc: 'Secure your entry early. SKN IEEE SB Members enter free.', active: true },
    { title: 'Payment Verification', date: 'Ongoing', desc: 'Screenshot review and branch enrollment check-in audit.', active: true },
    { title: 'Workshop 1-6', date: 'July 10 - July 22, 2026', desc: 'Interactive live sessions with top tech mentors.', active: false },
    { title: 'Attendance logs', date: 'During Webinars', desc: 'Scan dynamic check-in codes to register presence.', active: false },
    { title: 'Feedback & Review', date: 'July 25, 2026', desc: 'Submit session feedback in student dashboard.', active: false }
  ];

  useEffect(() => {
    // Fetch settings
    fetch(`${API_BASE_URL}/api/settings/public`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setSettings(data.data);
      })
      .catch(err => console.log('Error loading settings:', err));

    // Fetch workshops
    fetch(`${API_BASE_URL}/api/workshops`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data.length > 0) {
          setWorkshops(data.data);
        } else {
          setWorkshops(defaultWorkshops);
        }
      })
      .catch(() => setWorkshops(defaultWorkshops));

    // Fetch timeline milestones
    fetch(`${API_BASE_URL}/api/settings/timeline`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data.length > 0) {
          setMilestones(data.data);
        } else {
          setMilestones(defaultMilestones);
        }
      })
      .catch(() => setMilestones(defaultMilestones));

    // Simulated terminal logs
    const logs = [
      'Establishing connection to core db...',
      'MongoDB status: CONNECTED.',
      'IEEE encryption modules: ACTIVE.',
      'Configuring dashboard panels...',
      'Registration server: STANDBY.',
      'System check complete. Elevate 2026 ready for launch!'
    ];

    let currentLogIndex = 0;
    const interval = setInterval(() => {
      if (currentLogIndex < logs.length) {
        setTerminalLog(logs[currentLogIndex]);
        currentLogIndex++;
      } else {
        clearInterval(interval);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  const faqs = [
    { q: 'What is the pricing model for Elevate 2026?', a: 'Buy the Full Package plan for ₹150 to access all 6 workshops, or register for individual workshops at ₹40 each. SKN IEEE Student Branch members can register completely free.' },
    { q: 'How does the free membership registration work?', a: 'If you are an active member of the SKN IEEE Student Branch, select "Yes" on the registration form, input your IEEE Membership ID, specify your domain, and study year. The price will calculate to ₹0, bypassing screenshot file requirements.' },
    { q: 'How does payment verification work for general signups?', a: 'Select your workshops, scan the displayed QR code to pay using UPI, input your Transaction ID, upload a screenshot proof, and submit. The admin panel will verify the transaction and confirm your seat.' },
    { q: 'How is attendance tracked?', a: 'During each webinar, a check-in QR code and Attendance Passcode will be displayed. Scan the QR code, fill in your credentials and the passcode, and attendance is logged instantly.' }
  ];

  return (
    <div className="pt-16 min-h-screen relative overflow-hidden bg-cyber-bg">
      {/* Background graphics */}
      <div className="absolute top-1/4 left-1/10 w-[200px] h-[200px] bg-cyber-blue/5 blur-[95px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/10 w-[300px] h-[300px] bg-cyber-blue/5 blur-[125px] pointer-events-none" />

      {/* --- HERO SECTION --- */}
      <section className="relative pt-6 pb-16 px-4 max-w-7xl mx-auto flex flex-col items-center justify-center text-center">
        {/* Logo and presents text */}
        <div className="flex flex-col items-center mb-6">
          <a 
            href="http://www.sknisb.in" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="mb-3 transition-transform hover:scale-105 duration-300 block"
            title="Visit SKN IEEE Student Branch website"
          >
            <img src="/skn-ieee-logo.png" alt="SKN IEEE Student Branch Logo" className="h-16 md:h-20 object-contain mx-auto" />
          </a>
          <span className="text-slate-400 font-mono tracking-[0.25em] text-[10px] uppercase font-bold animate-pulse">
            presents
          </span>
        </div>

        {/* Title */}
        <h1 className="font-sora font-extrabold text-4xl md:text-7xl tracking-tight mb-6 leading-tight">
          <span className="text-white">SHAPE YOUR FUTURE WITH</span>
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber-blue via-white to-white text-glow-blue">
            {settings.eventTitle}
          </span>
        </h1>

        {/* Tagline */}
        <p className="text-slate-300 text-base md:text-lg max-w-2xl mb-8 leading-relaxed">
          {settings.eventTagline}. An elite 6-part {settings.eventMode} designed to bridge the gap between college theory and industry expertise. Free signups for SKN IEEE SB Members.
        </p>

        {/* Call to Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-16 relative z-10 w-full max-w-md justify-center">
          <Link 
            to="/register" 
            className="w-full sm:w-auto px-8 py-4 rounded bg-gradient-to-r from-cyber-blue to-blue-600 text-white font-sora font-extrabold uppercase tracking-widest text-xs hover:brightness-110 shadow-neon-blue transition-all hover:-translate-y-1 text-center"
          >
            Start Registration
          </Link>
          <Link 
            to="/dashboard" 
            className="w-full sm:w-auto px-8 py-4 rounded border border-cyber-blue/50 text-cyber-blue hover:bg-cyber-blue/10 hover:text-white transition-all text-xs font-sora font-extrabold uppercase tracking-widest hover:-translate-y-1 text-center"
          >
            Student Dashboard
          </Link>
        </div>

        {/* Futuristic Terminal Logs Console */}
        <div className="w-full max-w-2xl glass-panel border border-slate-850 rounded-lg p-4 font-mono text-left text-xs text-slate-400 relative overflow-hidden shadow-glass">
          <div className="flex items-center justify-between border-b border-slate-850 pb-2 mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-slate-700" />
              <div className="w-2 h-2 rounded-full bg-slate-700" />
              <div className="w-2 h-2 rounded-full bg-slate-700" />
              <span className="text-slate-500 text-[10px] ml-2 tracking-wider">ELEVATE_SYSTEM_CON.SH</span>
            </div>
            <Terminal className="w-4 h-4 text-cyber-blue" />
          </div>
          <div className="space-y-1 min-h-[45px]">
            <p className="text-cyber-blue font-bold">&gt;&nbsp;<span className="text-white">{terminalLog}</span></p>
            <p className="text-slate-600">IEEE_SERVER_NODE: 10.179.215.58:27017</p>
            <p className="text-slate-500 flex items-center space-x-1.5">
              <span>Webinars status:</span> 
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping" /> 
              <span className="text-cyber-blue font-semibold">Active & Recruiting</span>
            </p>
          </div>
        </div>
      </section>

      {/* --- WORKSHOPS SECTION (PLACED FIRST AS REQUESTED) --- */}
      <section id="workshops" className="py-20 px-4 max-w-7xl mx-auto border-t border-slate-900">
        <div className="text-center mb-12">
          <div className="inline-block text-xs font-semibold text-cyber-blue uppercase tracking-widest mb-3">
            // MASTERCLASS SESSIONS
          </div>
          <h2 className="font-sora font-extrabold text-2xl md:text-4xl text-white tracking-wide uppercase">
            6 Targeted Skill-Building Workshops
          </h2>
          <p className="text-slate-400 mt-3 max-w-md mx-auto text-xs">
            Click any workshop card below to inspect topics, schedule details, and access registration forms.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workshops.map((wk) => {
            return (
              <Link 
                to={`/workshops/${wk.id}`}
                key={wk.id} 
                className="relative flex flex-col justify-between p-6 glass-panel rounded-xl border border-slate-800/80 transition-all duration-300 hover:-translate-y-1 hover:border-cyber-blue/60 hover:shadow-neon-blue group"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 rounded bg-cyber-blue/10 border border-cyber-blue/20 text-cyber-blue">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded ${
                      wk.status === 'Open' 
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      {wk.status}
                    </span>
                  </div>

                  <h3 className="font-sora font-bold text-base text-white mb-2 group-hover:text-cyber-blue transition-colors">
                    {wk.title}
                  </h3>
                  <p className="text-slate-400 text-xs leading-relaxed mb-6">
                    {wk.description}
                  </p>
                </div>

                <div className="border-t border-slate-900 pt-4 flex justify-between items-center text-xs text-slate-500 font-medium">
                  <div className="flex items-center space-x-1.5">
                    <Calendar className="w-3.5 h-3.5 text-cyber-blue" />
                    <span className="truncate max-w-[150px]">{wk.dateTime.split(' - ')[0]}</span>
                  </div>
                  <span className="text-cyber-blue flex items-center space-x-1 hover:underline">
                    <span>Details</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* --- ABOUT SECTION --- */}
      <section id="about" className="py-20 bg-[#02020a]/40 border-t border-slate-900 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7">
            <div className="inline-block text-xs font-semibold text-cyber-blue uppercase tracking-widest mb-3">
              // UPGRADE PATHWAYS
            </div>
            <h2 className="font-sora font-extrabold text-2xl md:text-3xl text-white mb-6 uppercase tracking-wide leading-tight">
              Unlock Professional Practical Skills Outside the Classroom
            </h2>
            <p className="text-slate-300 text-xs md:text-sm mb-6 leading-relaxed">
              Elevate 2026 is curated by the SKN IEEE Student Branch team to address standard challenges facing engineering graduates. We don't just lecture; we build. Each session guides you step-by-step through configuration pipelines, templates, codebases, and profiles used by modern technology experts.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3 p-3 bg-cyber-slate/30 border border-slate-850 rounded">
                <CheckCircle2 className="w-4 h-4 text-cyber-blue shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-xs text-white">Full Event Access</h4>
                  <p className="text-[10px] text-slate-400">Unlock recorded session backups and worksheets.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 bg-cyber-slate/30 border border-slate-850 rounded">
                <CheckCircle2 className="w-4 h-4 text-cyber-blue shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-xs text-white">Expert Mentorship</h4>
                  <p className="text-[10px] text-slate-400">Instructors from Top Tech giants and academia.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-5 relative flex justify-center">
            {/* Tech glowing circuit graphic box */}
            <div className="w-72 h-72 rounded-2xl glass-panel border border-cyber-blue/20 p-6 flex flex-col justify-between relative shadow-neon-blue/10">
              <div className="absolute inset-0 bg-gradient-to-br from-cyber-blue/10 to-transparent rounded-2xl -z-10" />
              <div className="flex justify-between items-start">
                <Cpu className="w-8 h-8 text-cyber-blue" />
                <span className="text-[9px] text-slate-500 font-mono">NODE-06.ENG</span>
              </div>
              <div>
                <div className="text-2xl font-extrabold font-mono text-white mb-1">6/6</div>
                <div className="text-xs uppercase font-sora font-semibold tracking-wider text-cyber-blue">
                  Core Workshops Completed Seeding
                </div>
              </div>
              <div className="border-t border-slate-900 pt-4 text-[11px] text-slate-400 leading-relaxed">
                Topics cover Git, Profile SEO, Web, Mobile App architectures, Data ML and Presentation skills.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- TIMELINE SECTION --- */}
      <section id="timeline" className="py-20 bg-[#000000]/60 border-t border-b border-slate-900 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-sora font-extrabold text-2xl text-white uppercase tracking-wider">
              Event Roadmap
            </h2>
            <p className="text-slate-400 text-xs mt-3">Follow the event milestones from signup to code execution.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            {milestones.map((m, idx) => (
              <div key={idx} className="relative p-5 glass-panel rounded-lg border border-slate-850/60 flex flex-col justify-between">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-mono text-xl font-bold text-slate-600">0{idx + 1}</span>
                  <div className={`w-3.5 h-3.5 rounded-full border border-black ${m.active ? 'bg-cyber-blue timeline-node-active' : 'bg-slate-700'}`} />
                </div>

                <div>
                  <h4 className="font-sora font-bold text-xs text-white uppercase tracking-wider mb-1">
                    {m.title}
                  </h4>
                  <span className="text-[9px] font-semibold text-cyber-blue">{m.date}</span>
                  <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
                    {m.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- LIVE STATS SECTION --- */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-5 glass-panel rounded-xl text-center border border-slate-850">
            <Users className="w-8 h-8 mx-auto text-cyber-blue mb-3" />
            <h3 className="font-mono text-2xl font-extrabold text-white mb-1">240+</h3>
            <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Registered students</span>
          </div>

          <div className="p-5 glass-panel rounded-xl text-center border border-slate-850">
            <BookOpen className="w-8 h-8 mx-auto text-cyber-blue mb-3" />
            <h3 className="font-mono text-2xl font-extrabold text-white mb-1">06</h3>
            <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Seeded Classes</span>
          </div>

          <div className="p-5 glass-panel rounded-xl text-center border border-slate-850">
            <Trophy className="w-8 h-8 mx-auto text-cyber-blue mb-3" />
            <h3 className="font-mono text-2xl font-extrabold text-white mb-1">100%</h3>
            <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Practical Learning</span>
          </div>

          <div className="p-5 glass-panel rounded-xl text-center border border-slate-850">
            <Clock className="w-8 h-8 mx-auto text-cyber-blue mb-3" />
            <h3 className="font-mono text-2xl font-extrabold text-white mb-1">14</h3>
            <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Seats Remaining</span>
          </div>
        </div>
      </section>

      {/* --- FAQ SECTION --- */}
      <section id="faq" className="py-20 bg-[#02020a]/40 border-t border-slate-900 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-sora font-extrabold text-2xl text-white uppercase tracking-wider">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-400 text-xs mt-3">Answers to general questions about registration, payments, and certificates.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div 
                  key={idx} 
                  className="glass-panel border border-slate-850 rounded-lg overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full px-5 py-4 flex justify-between items-center text-left focus:outline-none"
                  >
                    <span className="font-sora font-semibold text-xs md:text-sm text-white hover:text-cyber-blue transition-colors">
                      {faq.q}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-cyber-blue transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs text-slate-300 leading-relaxed border-t border-slate-850/60 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
