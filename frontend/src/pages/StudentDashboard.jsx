import { useState, useEffect } from 'react';
import { 
  User, CheckCircle2, Lock, Award, Key, Clock, 
  ExternalLink, FileText, Video, Star, LogOut 
} from 'lucide-react';
import { API_BASE_URL } from '../config';

const StudentDashboard = () => {
  // Session authentication states
  const [token, setToken] = useState(localStorage.getItem('studentToken'));
  const [loginKey, setLoginKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Workspace data states
  const [studentData, setStudentData] = useState(null);
  const [workshops, setWorkshops] = useState([]);
  
  // Feedback rating states
  const [selectedWorkshopForFeedback, setSelectedWorkshopForFeedback] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState('');

  // Tab management: 'overview' | 'workshops'
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (token) {
      fetchStudentDetails(token);
    }
  }, [token]);

  const fetchStudentDetails = async (sessionToken) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/registrations/me`, {
        headers: {
          'Authorization': `Bearer ${sessionToken}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setStudentData(data.data);
        
        // Fetch workshops list to match titles
        const wkRes = await fetch(`${API_BASE_URL}/api/workshops`);
        const wkData = await wkRes.json();
        if (wkData.success) {
          setWorkshops(wkData.data);
        }
      } else {
        handleLogout();
      }
    } catch (err) {
      console.log('Error loading dashboard data:', err);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginKey.trim()) return;

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/registrations/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loginKey })
      });
      const data = await res.json();

      if (data.success) {
        localStorage.setItem('studentToken', data.token);
        setToken(data.token);
        setStudentData(data.data);
      } else {
        setErrorMsg(data.message || 'Login credentials not found');
      }
    } catch (err) {
      setErrorMsg('Failed to connect to authentication server');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('studentToken');
    setToken(null);
    setStudentData(null);
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!selectedWorkshopForFeedback) return;
    setFeedbackSuccess('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/registrations/${studentData._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          feedback: [
            ...studentData.feedback.filter(f => f.workshopId !== selectedWorkshopForFeedback),
            { workshopId: selectedWorkshopForFeedback, rating: feedbackRating, comment: feedbackComment }
          ]
        })
      });
      const data = await res.json();

      if (data.success) {
        setFeedbackSuccess('Thank you! Your feedback has been saved.');
        setStudentData(data.data);
        setFeedbackComment('');
        setSelectedWorkshopForFeedback('');
      }
    } catch (err) {
      console.error('Error submitting feedback review:', err);
    }
  };

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return <span className="px-3 py-1 rounded bg-green-500/10 text-green-400 border border-green-500/25 font-bold uppercase tracking-wider text-[10px]">Verified (Seat Confirmed)</span>;
      case 'Rejected':
        return <span className="px-3 py-1 rounded bg-red-500/10 text-red-400 border border-red-500/25 font-bold uppercase tracking-wider text-[10px]">Verification Failed</span>;
      default:
        return <span className="px-3 py-1 rounded bg-yellow-500/10 text-yellow-500 border border-yellow-500/25 font-bold uppercase tracking-wider text-[10px] animate-pulse">Pending Review</span>;
    }
  };

  const checkIndividualCertEligibility = (wkId) => {
    const isAttended = studentData.attendance.includes(wkId);
    return studentData.paymentStatus === 'Approved' && isAttended;
  };

  const checkFullCertEligibility = () => {
    return studentData.paymentStatus === 'Approved' && studentData.registrationType === 'full' && studentData.attendance.length >= 4;
  };

  if (!studentData) {
    return (
      <div className="pt-36 pb-24 px-4 min-h-screen relative flex items-center justify-center bg-cyber-bg">
        <div className="absolute top-1/4 left-1/4 w-[200px] h-[200px] bg-cyber-blue/5 blur-[80px] pointer-events-none" />
        
        <div className="w-full max-w-md glass-panel p-8 rounded-xl border border-slate-800 shadow-glass relative text-center">
          <div className="absolute top-0 left-0 w-3.5 h-3.5 border-t-2 border-l-2 border-cyber-blue" />
          <div className="absolute top-0 right-0 w-3.5 h-3.5 border-t-2 border-r-2 border-cyber-blue" />
          
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-cyber-blue/10 border border-cyber-blue/30 text-cyber-blue mb-5">
            <Key className="w-5 h-5 text-glow-blue" />
          </div>
          
          <h2 className="font-sora font-extrabold text-2xl text-white uppercase tracking-wider mb-2">
            Student Workspace
          </h2>
          <p className="text-slate-400 text-xs mb-6">
            Enter your Email or Registration ID to access resources.
          </p>

          {errorMsg && <p className="text-xs text-red-500 mb-4 bg-red-500/10 p-2.5 rounded border border-red-500/20">{errorMsg}</p>}

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div className="space-y-2">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block">Email or Registration ID</label>
              <input
                type="text"
                required
                value={loginKey}
                onChange={(e) => setLoginKey(e.target.value)}
                className="w-full bg-[#000000] border border-slate-850 focus:border-cyber-blue focus:shadow-neon-blue/10 rounded px-4 py-3 text-xs text-white focus:outline-none transition-all tracking-wide"
                placeholder="name@domain.com or EV26-4928"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded bg-gradient-to-r from-cyber-blue to-blue-600 text-white font-sora font-bold text-xs uppercase tracking-widest hover:brightness-110 shadow-neon-blue/20 hover:shadow-neon-blue transition-all"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const registeredWorkshops = workshops.filter(w => 
    studentData.registrationType === 'full' || studentData.selectedWorkshops.includes(w.id)
  );

  return (
    <div className="pt-28 pb-20 px-4 max-w-7xl mx-auto min-h-screen bg-cyber-bg">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Navigation Sidebar */}
        <div className="lg:col-span-3 space-y-6 glass-panel border border-slate-800 p-5 rounded-xl">
          <div className="flex items-center space-x-3 pb-4 border-b border-slate-800">
            <div className="w-10 h-10 rounded-full bg-cyber-blue/10 border border-cyber-blue flex items-center justify-center text-cyber-blue text-sm font-extrabold uppercase font-mono">
              {studentData.fullName.substring(0, 2)}
            </div>
            <div className="truncate">
              <h4 className="text-sm font-bold text-white uppercase truncate">{studentData.fullName}</h4>
              <span className="text-[10px] text-slate-500 font-mono">{studentData.registrationId}</span>
            </div>
          </div>

          <div className="flex flex-col space-y-1 text-xs">
            <button 
              onClick={() => setActiveTab('overview')} 
              className={`w-full text-left px-3 py-2.5 rounded hover:bg-slate-900 transition-colors uppercase font-semibold ${
                activeTab === 'overview' ? 'text-cyber-blue bg-cyber-blue/10 border-l-2 border-cyber-blue' : 'text-slate-400'
              }`}
            >
              Overview & Status
            </button>
            <button 
              onClick={() => setActiveTab('workshops')} 
              className={`w-full text-left px-3 py-2.5 rounded hover:bg-slate-900 transition-colors uppercase font-semibold ${
                activeTab === 'workshops' ? 'text-cyber-blue bg-cyber-blue/10 border-l-2 border-cyber-blue' : 'text-slate-400'
              }`}
            >
              Workshop Workspace
            </button>
            <button 
              onClick={() => handleLogout()}
              className="w-full text-left px-3 py-2.5 rounded text-red-400 hover:bg-red-500/10 transition-colors uppercase font-semibold flex items-center justify-between"
            >
              <span>Sign Out</span>
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Dynamic Display Panels */}
        <div className="lg:col-span-9">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fadeIn">
              
              <div className="glass-panel border border-slate-800 p-6 rounded-xl relative">
                <h3 className="font-sora font-extrabold text-base text-white uppercase tracking-wider mb-6 border-b border-slate-900 pb-2">
                  Registration Overview
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-3 font-mono text-xs">
                    <div className="flex justify-between items-center py-1.5 border-b border-slate-900">
                      <span className="text-slate-500 uppercase">College</span>
                      <span className="text-white text-right max-w-[200px] truncate">{studentData.college}</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-slate-900">
                      <span className="text-slate-500 uppercase">Department</span>
                      <span className="text-white truncate">{studentData.department}</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-slate-900">
                      <span className="text-slate-500 uppercase">Study Year</span>
                      <span className="text-white">{studentData.year}</span>
                    </div>
                  </div>

                  <div className="space-y-3 font-mono text-xs">
                    <div className="flex justify-between items-center py-1.5 border-b border-slate-900">
                      <span className="text-slate-500 uppercase">Tier Enrolled</span>
                      <span className="text-cyber-blue uppercase font-bold">{studentData.registrationType} package</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-slate-900">
                      <span className="text-slate-500 uppercase">Referral Code</span>
                      <span className="text-white font-bold tracking-wider">{studentData.referralCode}</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-slate-900">
                      <span className="text-slate-500 uppercase">IEEE SB Member</span>
                      <span className="text-white font-bold">{studentData.ieeeMember ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                </div>

                {/* IEEE Member details details */}
                {studentData.ieeeMember && (
                  <div className="mb-6 p-4 bg-cyber-blue/5 border border-cyber-blue/20 rounded-lg grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
                    <div className="flex justify-between items-center border-b border-cyber-blue/10 pb-2 sm:border-0 sm:pb-0">
                      <span className="text-slate-500">IEEE Member ID:</span>
                      <span className="text-cyber-blue font-bold">{studentData.ieeeMemberId}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Branch Domain:</span>
                      <span className="text-cyber-blue font-bold">{studentData.ieeeDomain}</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-3 p-4 bg-[#000000]/60 border border-slate-900 rounded">
                  <span className="text-xs text-slate-400 font-mono">Verification Status:</span>
                  {renderStatusBadge(studentData.paymentStatus)}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-panel border border-slate-800 p-6 rounded-xl">
                  <h4 className="font-sora font-semibold text-sm text-white uppercase tracking-wider mb-4 border-b border-slate-900 pb-2">
                    Attendance Log
                  </h4>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-xs text-slate-400">Total Workshops Attended</span>
                    <span className="font-mono text-lg font-bold text-cyber-blue">{studentData.attendance.length} / {registeredWorkshops.length}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden mb-2">
                    <div 
                      className="h-full bg-cyber-blue" 
                      style={{ width: `${(studentData.attendance.length / Math.max(1, registeredWorkshops.length)) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="glass-panel border border-slate-800 p-6 rounded-xl">
                  <h4 className="font-sora font-semibold text-sm text-white uppercase tracking-wider mb-4 border-b border-slate-900 pb-2">
                    Invite Referrals
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    Share your referral code <strong className="text-cyber-blue font-mono">{studentData.referralCode}</strong> with friends. Invitees receive discounts and you boost your organizer participation leaderboard points.
                  </p>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: WORKSHOP ACCESS LINKS & RESOURCES */}
          {activeTab === 'workshops' && (
            <div className="space-y-6 animate-fadeIn">
              
              {studentData.paymentStatus !== 'Approved' && (
                <div className="glass-panel border-yellow-500/30 p-6 rounded-xl bg-yellow-500/5 text-center space-y-3 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-yellow-500" />
                  <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-yellow-500" />
                  
                  <Lock className="w-8 h-8 text-yellow-500 mx-auto animate-bounce" />
                  <h4 className="font-sora font-extrabold text-sm text-yellow-500 uppercase tracking-widest">
                    Workspace Locked
                  </h4>
                  <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                    Workshop Zoom links, presentations, and resources will unlock instantly once the organizers verify your payment or IEEE branch membership. Status: {studentData.paymentStatus}.
                  </p>
                </div>
              )}

              {/* Workshops Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                {studentData.paymentStatus !== 'Approved' && (
                  <div className="absolute inset-0 bg-cyber-bg/70 backdrop-blur-sm z-10 rounded-xl pointer-events-none" />
                )}

                {registeredWorkshops.map(wk => {
                  const isAttended = studentData.attendance.includes(wk.id);
                  return (
                    <div key={wk.id} className="glass-panel border border-slate-800 p-5 rounded-xl flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-[10px] font-bold tracking-widest text-cyber-blue uppercase font-mono">{wk.id}</span>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                            isAttended 
                              ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                              : 'bg-slate-850 text-slate-400 border border-slate-850'
                          }`}>
                            {isAttended ? 'Attended' : 'Absent/Pending'}
                          </span>
                        </div>

                        <h4 className="font-sora font-bold text-sm text-white mb-2 leading-snug">{wk.title}</h4>
                        <p className="text-slate-400 text-[11px] leading-relaxed mb-4">{wk.description.substring(0, 80)}...</p>
                      </div>

                      {/* Resource links */}
                      <div className="space-y-2 border-t border-slate-900/60 pt-3">
                        {wk.meetingLink && (
                          <a 
                            href={wk.meetingLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center justify-between text-xs text-cyber-blue hover:text-white transition-colors"
                          >
                            <span className="flex items-center space-x-1.5 font-medium">
                              <Video className="w-3.5 h-3.5" />
                              <span>Live Webinar Meeting Link</span>
                            </span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}

                        {wk.resources?.map((res, ri) => (
                          <a 
                            key={ri}
                            href={res.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between text-xs text-slate-350 hover:text-cyber-blue transition-colors"
                          >
                            <span className="flex items-center space-x-1.5">
                              <FileText className="w-3.5 h-3.5 text-cyber-blue" />
                              <span>{res.title} ({res.type})</span>
                            </span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        ))}

                        {(!wk.meetingLink && (!wk.resources || wk.resources.length === 0)) && (
                          <p className="text-[10px] text-slate-500 italic">No links uploaded yet for this workshop.</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Feedback Form Panel */}
              {studentData.paymentStatus === 'Approved' && studentData.attendance.length > 0 && (
                <div className="glass-panel border border-slate-800 p-6 rounded-xl mt-8">
                  <h4 className="font-sora font-semibold text-sm text-white uppercase tracking-wider mb-4 border-b border-slate-900 pb-2">
                    Submit Workshop Review
                  </h4>

                  {feedbackSuccess && <p className="text-xs text-green-500 mb-4 font-semibold">{feedbackSuccess}</p>}

                  <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs text-slate-400">Select Attended Workshop</label>
                        <select
                          required
                          value={selectedWorkshopForFeedback}
                          onChange={(e) => setSelectedWorkshopForFeedback(e.target.value)}
                          className="w-full bg-[#000000] border border-slate-850 rounded px-3 py-2 text-xs text-white focus:outline-none"
                        >
                          <option value="">-- Choose Workshop --</option>
                          {registeredWorkshops
                            .filter(w => studentData.attendance.includes(w.id))
                            .map(w => (
                              <option key={w.id} value={w.id}>{w.title}</option>
                            ))
                          }
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs text-slate-400 block mb-1">Rating (1 to 5 Stars)</label>
                        <div className="flex items-center space-x-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setFeedbackRating(star)}
                              className="focus:outline-none"
                            >
                              <Star className={`w-5 h-5 ${star <= feedbackRating ? 'text-yellow-500 fill-yellow-500' : 'text-slate-650'}`} />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-slate-400">Critique & Remarks</label>
                      <textarea
                        value={feedbackComment}
                        onChange={(e) => setFeedbackComment(e.target.value)}
                        className="w-full bg-[#000000] border border-slate-850 rounded px-3 py-2 text-xs text-white focus:outline-none h-16 animate-fadeIn"
                        placeholder="What did you learn? Give us your review..."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={!selectedWorkshopForFeedback}
                      className="px-5 py-2 rounded bg-cyber-blue hover:brightness-110 text-white font-sora font-semibold text-xs transition-colors uppercase tracking-wider disabled:opacity-40"
                    >
                      Save Review
                    </button>
                  </form>
                </div>
              )}

            </div>
          )}



        </div>

      </div>
    </div>
  );
};

export default StudentDashboard;
