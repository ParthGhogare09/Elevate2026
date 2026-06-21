import { Mail, Phone, Globe, Instagram, Linkedin, MessageSquare } from 'lucide-react';

const ContactUs = () => {
  return (
    <div className="pt-28 pb-20 px-4 min-h-screen relative max-w-5xl mx-auto bg-cyber-bg overflow-hidden">
      {/* Glow effects */}
      <div className="absolute top-1/4 left-1/10 w-[250px] h-[250px] bg-cyber-blue/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/10 w-[300px] h-[300px] bg-cyber-blue/5 blur-[150px] pointer-events-none" />

      <div className="text-center mb-12 animate-fadeIn">
        <div className="inline-block text-xs font-semibold text-cyber-blue uppercase tracking-widest mb-3">
          // CONNECT WITH US
        </div>
        <h1 className="font-sora font-extrabold text-3xl md:text-5xl text-white uppercase tracking-wider">
          Contact Our Team
        </h1>
        <p className="text-slate-400 text-sm mt-3 max-w-lg mx-auto">
          Have questions about Elevate 2026?
        </p>
      </div>

      {/* Centered 2x2 Grid of Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto items-stretch animate-scaleUp">
        {/* Card 1: Call Us */}
        <div className="glass-panel border border-slate-800 p-6 rounded-xl flex items-start space-x-4 hover:border-cyber-blue/40 transition-colors">
          <div className="p-3 bg-cyber-blue/10 border border-cyber-blue/20 rounded-lg text-cyber-blue">
            <Phone className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-sora font-bold text-sm text-white uppercase tracking-wider mb-2">Call Us</h4>
            <div className="flex flex-col space-y-1 text-xs text-slate-300 font-mono">
              <a href="tel:+918799971798" className="hover:text-cyber-blue transition-colors">+91 87999 71798</a>
              <a href="tel:+918446185796" className="hover:text-cyber-blue transition-colors">+91 84461 85796</a>
              <a href="tel:+918600957086" className="hover:text-cyber-blue transition-colors">+91 86009 57086</a>
            </div>
          </div>
        </div>

        {/* Card 2: Email Us */}
        <div className="glass-panel border border-slate-800 p-6 rounded-xl flex items-start space-x-4 hover:border-cyber-blue/40 transition-colors">
          <div className="p-3 bg-cyber-blue/10 border border-cyber-blue/20 rounded-lg text-cyber-blue">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-sora font-bold text-sm text-white uppercase tracking-wider mb-2">Email Address</h4>
            <p className="text-xs text-slate-300 font-medium">
              <a href="mailto:ieee.sb_skncoe@sinhgad.edu" className="hover:text-cyber-blue transition-colors">
                ieee.sb_skncoe@sinhgad.edu
              </a>
            </p>
          </div>
        </div>

        {/* Card 3: Website */}
        <div className="glass-panel border border-slate-800 p-6 rounded-xl flex items-start space-x-4 hover:border-cyber-blue/40 transition-colors">
          <div className="p-3 bg-cyber-blue/10 border border-cyber-blue/20 rounded-lg text-cyber-blue">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-sora font-bold text-sm text-white uppercase tracking-wider mb-2">Official Website</h4>
            <p className="text-xs text-slate-300 font-medium">
              <a href="http://www.sknisb.in" target="_blank" rel="noopener noreferrer" className="hover:text-cyber-blue transition-colors">
                www.sknisb.in
              </a>
            </p>
          </div>
        </div>

        {/* Card 4: Socials */}
        <div className="glass-panel border border-slate-800 p-6 rounded-xl flex items-start space-x-4 hover:border-cyber-blue/40 transition-colors">
          <div className="p-3 bg-cyber-blue/10 border border-cyber-blue/20 rounded-lg text-cyber-blue">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-sora font-bold text-sm text-white uppercase tracking-wider mb-3">Follow Us</h4>
            <div className="flex flex-col space-y-2 text-xs">
              <a 
                href="https://www.instagram.com/skn_ieee?igsh=MWphazZkazcyZHA1dQ==" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-slate-300 hover:text-pink-500 transition-colors"
              >
                <Instagram className="w-4 h-4 text-pink-500" />
                <span className="font-semibold">Instagram: @skn_ieee</span>
              </a>
              <a 
                href="https://www.linkedin.com/company/skn-ieee-student-branch/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-slate-300 hover:text-blue-500 transition-colors"
              >
                <Linkedin className="w-4 h-4 text-blue-500" />
                <span className="font-semibold">LinkedIn: SKN IEEE Student Branch</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
