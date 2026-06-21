import { Link } from 'react-router-dom';
import { Cpu, Mail, Globe, ShieldAlert, Phone, Instagram, Linkedin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="relative border-t border-cyber-blue/10 bg-[#000000]/90 pt-16 pb-8 overflow-hidden">
      {/* Background radial highlight */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[350px] h-[150px] bg-cyber-blue/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Logo and Brand details */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="flex items-center justify-center w-8 h-8 rounded bg-cyber-slate border border-cyber-blue/20">
                <Cpu className="w-4 h-4 text-cyber-blue" />
              </div>
              <span className="font-sora font-extrabold text-lg tracking-wider text-white">
                ELEVATE <span className="text-cyber-blue">2026</span>
              </span>
            </div>
            <p className="text-slate-400 text-sm max-w-sm mb-4 leading-relaxed">
              An advanced skill-building webinar series organized by <a href="http://www.sknisb.in" target="_blank" rel="noopener noreferrer" className="text-cyber-blue hover:underline font-semibold">SKN IEEE Student Branch</a>. Elevate your learning, build real-world applications, and boost your resume.
            </p>
            <div className="flex items-center space-x-3 text-slate-400 text-xs">
              <span>© {new Date().getFullYear()} <a href="http://www.sknisb.in" target="_blank" rel="noopener noreferrer" className="hover:text-cyber-blue transition-colors font-semibold">SKN IEEE</a>. All rights reserved.</span>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-sora text-sm font-semibold uppercase tracking-wider text-cyber-blue mb-4">Navigation</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <a href="#about" className="hover:text-white transition-colors">About event</a>
              </li>
              <li>
                <a href="#workshops" className="hover:text-white transition-colors">Our Workshops</a>
              </li>
              <li>
                <a href="#timeline" className="hover:text-white transition-colors">Event Timeline</a>
              </li>
              <li>
                <a href="#faq" className="hover:text-white transition-colors">FAQs</a>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="font-sora text-sm font-semibold uppercase tracking-wider text-cyber-blue mb-4">Get in Touch</h4>
            <ul className="space-y-3 text-xs text-slate-400">
              <li className="flex items-start space-x-2">
                <Phone className="w-4 h-4 text-cyber-blue mt-0.5 shrink-0" />
                <div className="flex flex-col space-y-0.5">
                  <a href="tel:+918799971798" className="hover:text-white transition-colors font-mono">+91 87999 71798</a>
                  <a href="tel:+918446185796" className="hover:text-white transition-colors font-mono">+91 84461 85796</a>
                  <a href="tel:+918600957086" className="hover:text-white transition-colors font-mono">+91 86009 57086</a>
                </div>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-cyber-blue shrink-0" />
                <a href="mailto:ieee.sb_skncoe@sinhgad.edu" className="hover:text-white transition-colors truncate max-w-[200px]" title="ieee.sb_skncoe@sinhgad.edu">
                  ieee.sb_skncoe@sinhgad.edu
                </a>
              </li>
              <li className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-cyber-blue shrink-0" />
                <a href="http://www.sknisb.in" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">www.sknisb.in</a>
              </li>
              <li className="flex items-center space-x-3 pt-1 border-t border-slate-900/50">
                <a href="https://www.instagram.com/skn_ieee?igsh=MWphazZkazcyZHA1dQ==" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-pink-500 transition-colors" title="Instagram">
                  <Instagram className="w-4 h-4" />
                </a>
                <a href="https://www.linkedin.com/company/skn-ieee-student-branch/" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-500 transition-colors" title="LinkedIn">
                  <Linkedin className="w-4 h-4" />
                </a>
              </li>
              <li className="flex items-center space-x-2 pt-2 border-t border-slate-800">
                <ShieldAlert className="w-4 h-4 text-red-500" />
                <Link to="/admin/login" className="text-xs text-red-500 hover:text-white transition-colors uppercase tracking-widest font-semibold">
                  Admin Dashboard Login
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom micro-credits */}
        <div className="border-t border-slate-900 pt-8 flex flex-col sm:flex-row justify-center items-center text-xs text-slate-500">
          <p className="text-center">Designed & Developed by SKN IEEE Web Dev Team</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
