import { useState, useEffect } from 'react';
import { X, Megaphone, CheckCircle2 } from 'lucide-react';
import { API_BASE_URL } from '../config';

const AnnouncementPopup = () => {
  const [announcement, setAnnouncement] = useState(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/announcements/active`);
        const data = await res.json();
        if (data.success && data.count > 0) {
          const activeItem = data.data[0]; // Get latest active announcement
          
          // Check if closed previously in this session
          const closedId = localStorage.getItem('closed_announcement_id');
          if (closedId !== activeItem._id) {
            setAnnouncement(activeItem);
            // Display popup after a short delay
            setTimeout(() => setShow(true), 1500);
          }
        }
      } catch (error) {
        console.error('Error fetching announcement popup:', error);
      }
    };

    fetchAnnouncement();
  }, []);

  const handleClose = () => {
    setShow(false);
    if (announcement) {
      localStorage.setItem('closed_announcement_id', announcement._id);
    }
  };

  if (!announcement || !show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
      {/* Glow highlight in center */}
      <div className="absolute w-[300px] h-[300px] bg-cyber-blue/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Cyber Panel */}
      <div className="relative w-full max-w-md p-6 glass-panel rounded-xl border border-cyber-blue/30 shadow-neon-blue/25 animate-scaleUp">
        {/* Corner Accents */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyber-blue" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyber-blue" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyber-blue" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyber-blue" />

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-cyber-blue/10 border border-cyber-blue/30 text-cyber-blue">
            <Megaphone className="w-5 h-5 animate-pulse" />
          </div>
          <h3 className="font-sora font-bold text-lg text-white uppercase tracking-wider">
            ANNOUNCEMENT
          </h3>
        </div>

        {/* Content */}
        <div className="mb-6">
          <h4 className="font-sora font-semibold text-base text-cyber-blue mb-2">
            {announcement.title}
          </h4>
          <p className="text-sm text-slate-300 leading-relaxed">
            {announcement.content}
          </p>
        </div>

        {/* Call to Action button */}
        <button
          onClick={handleClose}
          className="w-full py-2.5 rounded bg-gradient-to-r from-cyber-blue to-blue-600 text-white font-sora font-bold uppercase tracking-widest text-xs hover:brightness-110 shadow-neon-blue/20 hover:shadow-neon-blue transition-all flex items-center justify-center space-x-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>ACKNOWLEDGE</span>
        </button>
      </div>
    </div>
  );
};

export default AnnouncementPopup;
