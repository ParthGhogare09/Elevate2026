import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Cpu, Eye, EyeOff } from 'lucide-react';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if already logged in
    const token = localStorage.getItem('adminToken');
    if (token) {
      navigate('/admin');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();

      if (data.success) {
        localStorage.setItem('adminToken', data.token);
        navigate('/admin');
      } else {
        setErrorMsg(data.message || 'Invalid username or password');
      }
    } catch (err) {
      setErrorMsg('Connection error, failed to reach authentication server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-36 pb-24 px-4 min-h-screen relative flex items-center justify-center bg-cyber-bg">
      {/* Background glow graphics */}
      <div className="absolute top-1/4 left-1/4 w-[250px] h-[250px] bg-cyber-blue/5 blur-[90px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[250px] h-[250px] bg-white/5 blur-[90px] pointer-events-none" />

      {/* Cyber Panel */}
      <div className="w-full max-w-sm glass-panel p-8 rounded-xl border border-slate-800 shadow-glass relative text-center">
        {/* Accent lines */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyber-blue" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyber-blue" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyber-blue" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyber-blue" />

        {/* Brand Icon */}
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-cyber-blue/10 border border-cyber-blue/30 text-cyber-blue mb-5">
          <Cpu className="w-5 h-5 text-glow-blue animate-pulse" />
        </div>

        <h2 className="font-sora font-extrabold text-2xl text-white uppercase tracking-wider mb-1">
          Admin Portal
        </h2>
        <p className="text-slate-400 text-xs mb-6">
          Access the Elevate 2026 event management console.
        </p>

        {errorMsg && (
          <p className="text-xs text-red-500 mb-4 bg-red-500/10 p-2.5 rounded border border-red-500/20 font-medium">
            {errorMsg}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {/* Username */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block">Username</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-[#030313] border border-slate-805 focus:border-cyber-blue focus:shadow-neon-blue/10 rounded px-4 py-2.5 text-xs text-white focus:outline-none transition-all"
              placeholder="e.g. admin"
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#030313] border border-slate-805 focus:border-cyber-blue focus:shadow-neon-blue/10 rounded px-4 py-2.5 text-xs text-white focus:outline-none transition-all pr-10"
                placeholder="Enter password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-450 hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3 rounded bg-gradient-to-r from-cyber-blue to-blue-600 text-white font-sora font-extrabold text-xs uppercase tracking-widest hover:brightness-110 shadow-neon-blue/20 hover:shadow-neon-blue transition-all flex items-center justify-center space-x-2"
          >
            <Lock className="w-4 h-4" />
            <span>{loading ? 'Decrypting Session...' : 'Enter Console'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
