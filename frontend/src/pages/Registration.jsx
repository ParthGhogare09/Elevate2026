import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Check, Info, Sparkles, ArrowRight, ShieldCheck, Cpu 
} from 'lucide-react';
import canvasConfetti from 'canvas-confetti';

const Registration = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryWorkshop = searchParams.get('workshop');

  // Pricing & Settings state
  const [settings, setSettings] = useState({
    upiId: 'sknieee@upi',
    qrCodeFull: '',
    qrCodeCustom: '',
    qrCode1: '',
    qrCode2: '',
    qrCode3: '',
    qrCode4: '',
    qrCode5: '',
    qrCode6: '',
    priceFull: 150,
    priceCustom: 40
  });
  const [workshops, setWorkshops] = useState([]);

  // Form inputs state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    college: 'SKNCOE, Pune', // Default college
    department: '',
    year: '1st',
    ieeeMember: false,
    ieeeMemberId: '',
    ieeeDomain: '',
    registrationType: 'full', // 'full' or 'custom'
    selectedWorkshops: [],
    transactionId: '',
    referredBy: ''
  });

  // Dynamic price state
  const [basePrice, setBasePrice] = useState(150);
  
  // UI helpers
  const [showRecommendation, setShowRecommendation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successReceipt, setSuccessReceipt] = useState(null);

  useEffect(() => {
    // Fetch public configurations
    fetch('http://localhost:5000/api/settings/public')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setSettings(data.data);
        }
      })
      .catch(err => console.log('Error loading settings:', err));

    // Fetch workshops
    fetch('http://localhost:5000/api/workshops')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const openWk = data.data.filter(w => w.status === 'Open');
          setWorkshops(openWk);

          // Handle pre-selecting workshop from URL query parameter
          if (queryWorkshop) {
            const exists = openWk.find(w => w.id === queryWorkshop);
            if (exists) {
              setFormData(prev => ({
                ...prev,
                registrationType: 'custom',
                selectedWorkshops: [queryWorkshop]
              }));
            }
          }
        }
      })
      .catch(err => console.log('Error loading workshops:', err));
  }, [queryWorkshop]);

  // Recalculate price dynamically
  useEffect(() => {
    if (formData.ieeeMember) {
      setBasePrice(0); // SKN IEEE Student Branch Member is free
      setShowRecommendation(false);
      return;
    }

    let price = 0;
    if (formData.registrationType === 'full') {
      price = settings.priceFull;
      setShowRecommendation(false);
    } else {
      price = formData.selectedWorkshops.length * settings.priceCustom;
      // Recommend Full Package if they selected all 6 workshops individually
      if (formData.selectedWorkshops.length === 6) {
        setShowRecommendation(true);
      } else {
        setShowRecommendation(false);
      }
    }

    setBasePrice(price);
  }, [formData.registrationType, formData.selectedWorkshops, formData.ieeeMember, settings]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleRegistrationTypeChange = (type) => {
    setFormData(prev => ({
      ...prev,
      registrationType: type,
      selectedWorkshops: type === 'full' ? [] : prev.selectedWorkshops
    }));
  };

  const handleWorkshopToggle = (workshopId) => {
    setFormData(prev => {
      const selected = [...prev.selectedWorkshops];
      const index = selected.indexOf(workshopId);
      if (index > -1) {
        selected.splice(index, 1);
      } else {
        selected.push(workshopId);
      }
      return { ...prev, selectedWorkshops: selected };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    // Form inputs validation checks
    if (!formData.ieeeMember) {
      if (formData.registrationType === 'custom' && formData.selectedWorkshops.length === 0) {
        setErrorMessage('Please select at least one workshop to register.');
        setLoading(false);
        return;
      }
      if (!formData.transactionId) {
        setErrorMessage('Please enter the transaction ID/Ref Number.');
        setLoading(false);
        return;
      }
    } else {
      // IEEE member inputs verification
      if (!formData.ieeeMemberId.trim()) {
        setErrorMessage('Please provide your IEEE Membership ID.');
        setLoading(false);
        return;
      }
      if (!formData.ieeeDomain) {
        setErrorMessage('Please select your Student Branch Domain.');
        setLoading(false);
        return;
      }
    }

    setLoadingMessage('Submitting registration details...');
    const payload = {
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      college: formData.college,
      department: formData.department,
      year: formData.year,
      ieeeMember: formData.ieeeMember,
      ieeeMemberId: formData.ieeeMember ? formData.ieeeMemberId : '',
      ieeeDomain: formData.ieeeMember ? formData.ieeeDomain : '',
      registrationType: formData.registrationType,
      selectedWorkshops: formData.selectedWorkshops,
      referredBy: formData.referredBy
    };

    if (!formData.ieeeMember) {
      payload.transactionId = formData.transactionId;
    }

    try {
      const res = await fetch('http://localhost:5000/api/registrations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        setSuccessReceipt(data.data);
        canvasConfetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 }
        });
      } else {
        setErrorMessage(data.message || 'Registration failed. Please check inputs.');
      }
    } catch (err) {
      setErrorMessage('Server connection error. Please try again.');
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  const acceptRecommendation = () => {
    handleRegistrationTypeChange('full');
    setShowRecommendation(false);
  };

  return (
    <div className="pt-28 pb-20 px-4 min-h-screen relative max-w-5xl mx-auto bg-cyber-bg">
      {/* Background radial overlays */}
      <div className="absolute top-10 left-10 w-[200px] h-[200px] bg-cyber-blue/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[200px] h-[200px] bg-cyber-blue/5 blur-[100px] pointer-events-none" />

      {/* --- CONFIRMATION SCREEN --- */}
      {successReceipt ? (
        <div className="glass-panel border-cyber-blue border p-8 md:p-12 rounded-2xl max-w-xl mx-auto text-center relative overflow-hidden shadow-neon-blue/20 animate-scaleUp">
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyber-blue" />
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyber-blue" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyber-blue" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyber-blue" />

          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-cyber-blue/10 border border-cyber-blue text-cyber-blue mx-auto mb-6">
            <Sparkles className="w-8 h-8 animate-bounce" />
          </div>

          <h2 className="font-sora font-extrabold text-xl md:text-2xl text-white mb-2 uppercase tracking-wider">
            REGISTRATION SUBMITTED
          </h2>
          <p className="text-slate-400 text-xs mb-8">
            Thank you {successReceipt.fullName}! We have successfully received your signup details.
          </p>

          <div className="bg-[#000000]/90 border border-slate-900 rounded-lg p-5 mb-8 text-left space-y-4 font-mono text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 uppercase font-semibold">Registration ID</span>
              <span className="text-cyber-blue font-bold text-sm tracking-wider">{successReceipt.registrationId}</span>
            </div>
            <div className="flex justify-between items-center border-t border-slate-900 pt-3">
              <span className="text-slate-500 uppercase font-semibold">Your Referral Code</span>
              <span className="text-white font-bold text-sm tracking-wider">{successReceipt.referralCode}</span>
            </div>
            <div className="flex justify-between items-center border-t border-slate-900 pt-3">
              <span className="text-slate-500 uppercase font-semibold">Verification Status</span>
              <span className="px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-500 font-bold uppercase tracking-wider border border-yellow-500/25 text-[9px]">
                PENDING VERIFICATION
              </span>
            </div>
          </div>

          <p className="text-slate-400 text-xs leading-relaxed mb-8">
            The organizers will verify your IEEE Membership ID or transaction reference screenshot. You can log into your Student Dashboard using your Email or Registration ID to view meeting links once approved.
          </p>

          <button
            onClick={() => navigate('/dashboard')}
            className="px-8 py-3.5 rounded bg-gradient-to-r from-cyber-blue to-blue-600 text-white font-sora font-bold uppercase tracking-widest text-xs hover:brightness-110 shadow-neon-blue transition-all flex items-center justify-center space-x-2 mx-auto"
          >
            <span>Access Student Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        /* --- CHECKOUT FORM SCREEN --- */
        <div>
          <div className="text-center mb-12">
            <h1 className="font-sora font-extrabold text-3xl md:text-5xl text-white uppercase tracking-wider">
              Secure Your Seat
            </h1>
            <p className="text-slate-400 text-sm mt-3">
              Sign up for the webinar classes. IEEE SB members access everything free.
            </p>
          </div>

          {errorMessage && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg mb-8 flex items-center space-x-3">
              <Info className="w-5 h-5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Form Details */}
            <div className="lg:col-span-7 space-y-6 glass-panel border border-slate-800 p-6 md:p-8 rounded-xl shadow-glass relative">
              <div className="absolute top-0 left-0 w-3.5 h-3.5 border-t-2 border-l-2 border-cyber-blue" />
              <div className="absolute top-0 right-0 w-3.5 h-3.5 border-t-2 border-r-2 border-cyber-blue" />

              <h3 className="font-sora font-bold text-lg text-white mb-6 border-b border-slate-900 pb-3 uppercase tracking-wider flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-cyber-blue animate-pulse" />
                <span>1. Personal Details</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full bg-[#000000] border border-slate-850 focus:border-cyber-blue focus:shadow-neon-blue/10 rounded px-4 py-2.5 text-xs text-white focus:outline-none transition-all"
                    placeholder="Enter your name"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-[#000000] border border-slate-850 focus:border-cyber-blue focus:shadow-neon-blue/10 rounded px-4 py-2.5 text-xs text-white focus:outline-none transition-all"
                    placeholder="name@domain.com"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-[#000000] border border-slate-850 focus:border-cyber-blue focus:shadow-neon-blue/10 rounded px-4 py-2.5 text-xs text-white focus:outline-none transition-all"
                    placeholder="Mobile number"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">College Name</label>
                  <input
                    type="text"
                    required
                    value={formData.college}
                    onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                    className="w-full bg-[#000000] border border-slate-850 focus:border-cyber-blue focus:shadow-neon-blue/10 rounded px-4 py-2.5 text-xs text-white focus:outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Department / Branch</label>
                  <input
                    type="text"
                    required
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full bg-[#000000] border border-slate-850 focus:border-cyber-blue focus:shadow-neon-blue/10 rounded px-4 py-2.5 text-xs text-white focus:outline-none transition-all"
                    placeholder="e.g. Computer Engineering"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Year of Study</label>
                  <select
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    className="w-full bg-[#000000] border border-slate-850 focus:border-cyber-blue focus:shadow-neon-blue/10 rounded px-4 py-2.5 text-xs text-white focus:outline-none transition-all"
                  >
                    <option value="1st">First Year</option>
                    <option value="2nd">Second Year</option>
                    <option value="3rd">Third Year</option>
                    <option value="4th">Final Year</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* SKN IEEE Student Branch Member Verification toggle */}
              <div className="p-4 bg-cyber-blue/5 border border-cyber-blue/20 rounded-lg space-y-4 pt-4 mt-6">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="ieeeMember"
                    name="ieeeMember"
                    checked={formData.ieeeMember}
                    onChange={handleInputChange}
                    className="w-4 h-4 rounded text-cyber-blue bg-black border-slate-800 focus:ring-cyber-blue"
                  />
                  <label htmlFor="ieeeMember" className="text-xs font-bold text-white select-none cursor-pointer uppercase tracking-wide">
                    Are you a member of SKN IEEE Student Branch? (Free Entry)
                  </label>
                </div>

                {formData.ieeeMember && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-cyber-blue/15 animate-fadeIn">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest block">IEEE Membership ID</label>
                      <input
                        type="text"
                        required={formData.ieeeMember}
                        value={formData.ieeeMemberId}
                        onChange={(e) => setFormData({ ...formData, ieeeMemberId: e.target.value })}
                        className="w-full bg-[#000000] border border-slate-800 focus:border-cyber-blue rounded px-3 py-2 text-xs text-white focus:outline-none"
                        placeholder="e.g. 98394839"
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest block">Student Branch Domain</label>
                      <select
                        required={formData.ieeeMember}
                        value={formData.ieeeDomain}
                        onChange={(e) => setFormData({ ...formData, ieeeDomain: e.target.value })}
                        className="w-full bg-[#000000] border border-slate-800 focus:border-cyber-blue rounded px-3 py-2 text-xs text-white focus:outline-none"
                      >
                        <option value="">-- Choose Domain --</option>
                        <option value="Technical">Technical</option>
                        <option value="Graphics">Graphics & Design</option>
                        <option value="Publicity">Publicity</option>
                        <option value="Social Media">Social Media</option>
                        <option value="Documentation">Documentation</option>
                        <option value="WIE">Women in Engineering (WIE)</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Plans Switch */}
              <h3 className="font-sora font-bold text-lg text-white mb-6 border-b border-slate-900 pt-6 pb-3 uppercase tracking-wider">
                2. Select Plan
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div 
                  onClick={() => handleRegistrationTypeChange('full')}
                  className={`p-5 rounded-lg border cursor-pointer select-none transition-all relative ${
                    formData.registrationType === 'full' 
                      ? 'border-cyber-blue bg-cyber-blue/5 shadow-neon-blue/5' 
                      : 'border-slate-850 hover:border-slate-800 bg-transparent'
                  }`}
                >
                  {formData.registrationType === 'full' && (
                    <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-cyber-blue flex items-center justify-center text-white">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                  <h4 className="font-sora font-bold text-xs text-white mb-1 uppercase tracking-wider">Full Package Plan</h4>
                  <p className="text-[10px] text-slate-400 leading-relaxed mb-3">All 6 workshops at a discounted flat rate.</p>
                  <span className="font-mono text-lg font-bold text-cyber-blue">
                    {formData.ieeeMember ? 'Free (₹0)' : `₹${settings.priceFull}`}
                  </span>
                </div>

                <div 
                  onClick={() => handleRegistrationTypeChange('custom')}
                  className={`p-5 rounded-lg border cursor-pointer select-none transition-all relative ${
                    formData.registrationType === 'custom' 
                      ? 'border-cyber-blue bg-cyber-blue/5 shadow-neon-blue/5' 
                      : 'border-slate-850 hover:border-slate-800 bg-transparent'
                  }`}
                >
                  {formData.registrationType === 'custom' && (
                    <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-cyber-blue flex items-center justify-center text-white">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                  <h4 className="font-sora font-bold text-xs text-white mb-1 uppercase tracking-wider">Custom Plan</h4>
                  <p className="text-[10px] text-slate-400 leading-relaxed mb-3">Select specific workshops of your choice.</p>
                  <span className="font-mono text-lg font-bold text-cyber-blue">
                    {formData.ieeeMember ? 'Free (₹0)' : `₹${settings.priceCustom} / Class`}
                  </span>
                </div>
              </div>

              {/* Workshops Checkboxes Grid */}
              {formData.registrationType === 'custom' && (
                <div className="pt-4 space-y-3 animate-fadeIn">
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block mb-1">
                    Select Workshops:
                  </label>
                  <div className="grid grid-cols-1 gap-2.5">
                    {workshops.map(wk => {
                      const isSelected = formData.selectedWorkshops.includes(wk.id);
                      return (
                        <div 
                          key={wk.id}
                          onClick={() => handleWorkshopToggle(wk.id)}
                          className={`p-4 rounded border cursor-pointer flex items-center justify-between select-none transition-all ${
                            isSelected 
                              ? 'border-cyber-blue/50 bg-cyber-blue/5' 
                              : 'border-slate-850 bg-transparent hover:border-slate-800'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                              isSelected ? 'bg-cyber-blue border-cyber-blue text-white' : 'border-slate-700 bg-transparent'
                            }`}>
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <span className="text-xs font-semibold text-slate-350">{wk.title}</span>
                          </div>
                          {!formData.ieeeMember && (
                            <span className="text-xs font-bold text-slate-500 font-mono">₹{settings.priceCustom}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Referral */}
              <div className="pt-4 space-y-2 border-t border-slate-900 mt-6">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Referral Code (Optional)</label>
                <input
                  type="text"
                  name="referredBy"
                  value={formData.referredBy}
                  onChange={handleInputChange}
                  className="w-full bg-[#000000] border border-slate-850 focus:border-cyber-blue rounded px-4 py-2.5 text-xs text-white focus:outline-none transition-all uppercase"
                  placeholder="e.g. REF-ROHA123"
                />
              </div>

            </div>

            {/* Right Column: Checkout Gateway */}
            <div className="lg:col-span-5 space-y-6">
              
              <div className="glass-panel border border-slate-800 p-6 rounded-xl shadow-glass relative">
                <h3 className="font-sora font-bold text-sm text-white mb-4 uppercase tracking-wider border-b border-slate-900 pb-2">
                  Checkout Summary
                </h3>

                {/* Checkout pricing details */}
                <div className="space-y-3 mb-6 bg-[#000000]/60 border border-slate-900 rounded p-4 font-mono text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Selected Plan</span>
                    <span className="font-semibold text-white uppercase">{formData.registrationType} plan</span>
                  </div>
                  {formData.registrationType === 'custom' && (
                    <div className="flex justify-between items-center border-t border-slate-950 pt-2 text-slate-450">
                      <span>Workshops Count</span>
                      <span className="font-semibold text-white">{formData.selectedWorkshops.length} Class(es)</span>
                    </div>
                  )}
                  {formData.ieeeMember && (
                    <div className="flex flex-col border-t border-slate-900 pt-3 text-[10px] text-green-500 space-y-1">
                      <span className="font-bold flex items-center space-x-1">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>IEEE BRANCH FREE PASS</span>
                      </span>
                      <span className="text-[9px] text-slate-450 leading-relaxed font-sans">Verified SB membership ID: {formData.ieeeMemberId}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-sm font-bold border-t border-slate-800 pt-3">
                    <span className="text-white">Total Cost</span>
                    <span className="text-cyber-blue font-mono text-base">₹{basePrice}</span>
                  </div>
                </div>

                {formData.ieeeMember ? (
                  /* IEEE Branch free message */
                  <div className="p-4 bg-green-500/10 border border-green-500/25 rounded text-center space-y-2">
                    <ShieldCheck className="w-8 h-8 text-green-500 mx-auto" />
                    <h4 className="font-sora font-bold text-xs text-green-400 uppercase tracking-wider">Free Checkout Enabled</h4>
                    <p className="text-[10px] text-slate-350 leading-relaxed font-sans">
                      Payment verification screenshot and transaction ID are skipped for active members of SKN IEEE Student Branch.
                    </p>
                  </div>
                ) : (
                  /* Paid registration checkout */
                  <div className="space-y-6 animate-fadeIn">
                    <div className="flex flex-col items-center justify-center p-3 bg-white rounded-lg max-w-[180px] mx-auto border border-slate-200">
                      {(() => {
                        let qrToDisplay = '';
                        if (formData.registrationType === 'full') {
                          qrToDisplay = settings.qrCodeFull;
                        } else {
                          const count = formData.selectedWorkshops.length;
                          if (count === 1) qrToDisplay = settings.qrCode1;
                          else if (count === 2) qrToDisplay = settings.qrCode2;
                          else if (count === 3) qrToDisplay = settings.qrCode3;
                          else if (count === 4) qrToDisplay = settings.qrCode4;
                          else if (count === 5) qrToDisplay = settings.qrCode5;
                          else if (count === 6) qrToDisplay = settings.qrCode6;
                          
                          // Fallback to custom/generic QR if specific combination QR is not set
                          if (!qrToDisplay) {
                            qrToDisplay = settings.qrCodeCustom || settings.qrCodeFull;
                          }
                        }

                        return qrToDisplay ? (
                          <img src={qrToDisplay} alt="Payment QR Code" className="w-36 h-36 object-contain" />
                        ) : (
                          <div className="w-36 h-36 bg-slate-100 flex items-center justify-center text-slate-400 text-[10px] text-center px-2">
                            QR Code Unavailable
                          </div>
                        );
                      })()}
                    </div>

                    <div className="text-center space-y-1">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">UPI ID: {settings.upiId}</p>
                      <p className="text-[8px] text-slate-500 leading-none">Scan QR to pay. Take a screenshot once paid.</p>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-slate-900">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Transaction ID / Ref No</label>
                        <input
                          type="text"
                          required={!formData.ieeeMember}
                          value={formData.transactionId}
                          onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
                          className="w-full bg-[#000000] border border-slate-850 focus:border-cyber-blue rounded px-3 py-2 text-xs text-white focus:outline-none transition-all tracking-wider"
                          placeholder="e.g. 617392847192"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit Register */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-6 py-3.5 rounded bg-gradient-to-r from-cyber-blue to-blue-600 text-white font-sora font-extrabold uppercase tracking-widest text-xs hover:brightness-110 shadow-neon-blue/30 hover:shadow-neon-blue transition-all flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <span>{loadingMessage || 'Initiating signup...'}</span>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>SUBMIT SIGNUP DETAILS</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          </form>
        </div>
      )}

      {/* --- SMART RECOMMENDATION POPUP --- */}
      {showRecommendation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-sm p-6 glass-panel border border-cyber-blue rounded-xl shadow-neon-blue/20 animate-scaleUp text-center">
            <h3 className="font-sora font-extrabold text-sm text-white uppercase tracking-wider mb-2 flex items-center justify-center space-x-2">
              <Sparkles className="w-5 h-5 text-cyber-blue animate-bounce" />
              <span>Smart Recommendation</span>
            </h3>
            <p className="text-xs text-slate-350 leading-relaxed mb-6">
              You selected all 6 workshops individually at ₹{settings.priceCustom} each (Total: ₹{workshops.length * settings.priceCustom}). 
              <br />
              Save money by switching to the <strong className="text-white font-semibold">Full Package Plan</strong> for <strong className="text-cyber-blue font-bold font-mono">only ₹{settings.priceFull}</strong>!
            </p>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={acceptRecommendation}
                className="flex-grow py-2 rounded bg-cyber-blue text-white font-sora font-bold text-xs uppercase tracking-wider hover:brightness-115 transition-all"
              >
                Switch to Full Package
              </button>
              <button
                type="button"
                onClick={() => setShowRecommendation(false)}
                className="px-4 py-2 rounded bg-slate-800 text-slate-300 font-sora font-bold text-xs uppercase tracking-wider hover:bg-slate-700 transition-colors"
              >
                Keep Individual
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Registration;
