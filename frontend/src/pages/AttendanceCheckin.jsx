import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { QrCode, CheckCircle2, ShieldAlert, Cpu, RefreshCw, Key } from 'lucide-react';
import canvasConfetti from 'canvas-confetti';

const AttendanceCheckin = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const workshopId = searchParams.get('w');
  const qrToken = searchParams.get('t');

  // Load session data states
  const [sessionLoading, setSessionLoading] = useState(true);
  const [sessionError, setSessionError] = useState('');
  const [sessionData, setSessionData] = useState(null);

  // Form check-in inputs
  const [studentKey, setStudentKey] = useState('');
  const [attendanceId, setAttendanceId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successResult, setSuccessResult] = useState(null); // { fullName, registrationId }
  const [errorResult, setErrorResult] = useState('');

  useEffect(() => {
    if (!workshopId || !qrToken) {
      setSessionError('Invalid check-in link parameters.');
      setSessionLoading(false);
      return;
    }

    // Fetch active session to verify link validity
    fetch(`http://localhost:5000/api/attendance/session/${workshopId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          // If the token matches the active server session
          if (data.data.secureToken === qrToken) {
            setSessionData(data.data);
          } else {
            setSessionError('This attendance QR session is expired or invalid.');
          }
        } else {
          setSessionError(data.message || 'No active attendance session found.');
        }
      })
      .catch(() => {
        setSessionError('Network error checking attendance session.');
      })
      .finally(() => {
        setSessionLoading(false);
      });
  }, [workshopId, qrToken]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!studentKey.trim() || !attendanceId.trim()) return;

    setSubmitting(true);
    setErrorResult('');
    setSuccessResult(null);

    try {
      const res = await fetch('http://localhost:5000/api/attendance/mark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentKey: studentKey.trim(),
          attendanceId: attendanceId.trim(),
          workshopId,
          qrToken
        })
      });
      const data = await res.json();

      if (data.success) {
        setSuccessResult(data.data);
        canvasConfetti({
          particleCount: 100,
          spread: 60,
          origin: { y: 0.6 }
        });
      } else {
        setErrorResult(data.message || 'Failed to mark attendance.');
      }
    } catch (err) {
      setErrorResult('Connection error. Failed to send attendance log.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pt-32 pb-24 px-4 min-h-screen relative flex items-center justify-center bg-cyber-bg">
      {/* Background blobs */}
      <div className="absolute top-1/4 left-1/4 w-[200px] h-[200px] bg-cyber-blue/5 blur-[80px] pointer-events-none" />
      
      <div className="w-full max-w-md relative z-10 text-center">
        {sessionLoading ? (
          <div className="text-cyber-blue space-y-2">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto" />
            <p className="font-mono text-xs font-semibold uppercase tracking-wider">Validating check-in window...</p>
          </div>
        ) : sessionError ? (
          /* Session validation failed */
          <div className="glass-panel border-red-500/20 p-8 rounded-xl border text-center space-y-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 text-red-500 mx-auto">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <h3 className="font-sora font-extrabold text-sm text-red-400 uppercase tracking-widest">
              Check-In Locked
            </h3>
            <p className="text-xs text-slate-350 max-w-sm mx-auto leading-relaxed">
              {sessionError}
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2 rounded bg-slate-800 hover:bg-slate-700 text-white font-sora font-semibold text-xs transition-colors uppercase tracking-wider"
            >
              Back to Home
            </button>
          </div>
        ) : successResult ? (
          /* Check-In Success */
          <div className="glass-panel border-green-500/20 border p-8 rounded-xl relative shadow-neon-blue/10 animate-scaleUp">
            <div className="absolute top-0 left-0 w-3.5 h-3.5 border-t-2 border-l-2 border-green-500" />
            <div className="absolute top-0 right-0 w-3.5 h-3.5 border-t-2 border-r-2 border-green-500" />

            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-green-500/10 border border-green-500 text-green-500 mx-auto mb-5">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <h3 className="font-sora font-extrabold text-xl text-green-400 uppercase tracking-wider mb-2">
              Attendance Logged
            </h3>
            <p className="text-slate-400 text-xs mb-6">
              Presence registered for {successResult.fullName}.
            </p>

            <div className="bg-[#000000]/60 border border-slate-900 rounded p-4 font-mono text-left text-xs space-y-2.5">
              <div className="flex justify-between items-center text-slate-400">
                <span>Student ID</span>
                <span className="font-semibold text-white">{successResult.registrationId}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400 border-t border-slate-900/60 pt-2">
                <span>Workshop ID</span>
                <span className="font-semibold text-cyber-blue">{successResult.workshopId.toUpperCase()}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/dashboard')}
              className="mt-6 w-full py-2.5 rounded bg-gradient-to-r from-cyber-blue to-blue-600 text-white font-sora font-bold uppercase tracking-widest text-[10px]"
            >
              Access Dashboard Workspace
            </button>
          </div>
        ) : (
          /* Check-In Form */
          <div className="glass-panel p-8 rounded-xl border border-slate-800 relative text-left shadow-glass">
            <div className="absolute top-0 left-0 w-3.5 h-3.5 border-t-2 border-l-2 border-cyber-blue" />
            <div className="absolute top-0 right-0 w-3.5 h-3.5 border-t-2 border-r-2 border-cyber-blue" />

            <div className="flex items-center space-x-3 mb-6 border-b border-slate-850 pb-3">
              <div className="flex items-center justify-center w-9 h-9 rounded bg-cyber-blue/10 border border-cyber-blue/30 text-cyber-blue">
                <QrCode className="w-5 h-5 text-glow-blue" />
              </div>
              <div>
                <h3 className="font-sora font-bold text-sm text-white uppercase tracking-wider">
                  Check-In Presence
                </h3>
                <span className="text-[9px] text-slate-500 font-mono tracking-wider">{workshopId.toUpperCase()}</span>
              </div>
            </div>

            {errorResult && (
              <p className="text-xs text-red-500 mb-4 bg-red-500/10 p-2.5 rounded border border-red-500/20 font-medium">
                {errorResult}
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block">Email or Registration ID</label>
                <input
                  type="text"
                  required
                  value={studentKey}
                  onChange={(e) => setStudentKey(e.target.value)}
                  className="w-full bg-[#000000] border border-slate-805 focus:border-cyber-blue rounded px-4 py-2.5 text-xs text-white focus:outline-none transition-all tracking-wide"
                  placeholder="e.g. EV26-4928"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block">Webinar Attendance Passcode</label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={attendanceId}
                    onChange={(e) => setAttendanceId(e.target.value)}
                    className="w-full bg-[#000000] border border-slate-805 focus:border-cyber-blue rounded pl-9 pr-4 py-2.5 text-xs text-white focus:outline-none transition-all tracking-wider uppercase font-mono"
                    placeholder="Enter passcode shared on screen"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-4 py-3 rounded bg-gradient-to-r from-cyber-blue to-blue-600 text-white font-sora font-extrabold text-xs uppercase tracking-widest hover:brightness-110 shadow-neon-blue/20 hover:shadow-neon-blue transition-all"
              >
                {submitting ? 'Verifying Log...' : 'Confirm Presence'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceCheckin;
