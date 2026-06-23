import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, DollarSign, Award, Calendar, Search, Check, X, Trash2, 
  QrCode, FileSpreadsheet, Plus, Eye, RefreshCw, BarChart3, LogOut, Cpu, Settings, Menu,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { API_BASE_URL } from '../config';

// Register ChartJS modules
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('adminToken');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // Page panels: 'overview' | 'registrations' | 'workshops' | 'timeline' | 'attendance' | 'settings'
  const [activePanel, setActivePanel] = useState('overview'); 
  const [loading, setLoading] = useState(false);
  const [globalStats, setGlobalStats] = useState({ registrationsCount: 0, revenue: 0, attendanceRate: 0 });

  // Database lists
  const [registrations, setRegistrations] = useState([]);
  const [workshops, setWorkshops] = useState([]);
  const [timelineMilestones, setTimelineMilestones] = useState([]);
  const [settings, setSettings] = useState({
    upiId: 'sknieee@upi',
    qrCodeFull: '',
    qrCodeCustom: '',
    priceFull: 150,
    priceCustom: 40
  });

  // Filter states
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [workshopFilter, setWorkshopFilter] = useState('');
  const [selectedRegs, setSelectedRegs] = useState([]);

  // Attendance states
  const [selectedWorkshopForAttendance, setSelectedWorkshopForAttendance] = useState('');
  const [attendanceCode, setAttendanceCode] = useState('');
  const [attendanceDuration, setAttendanceDuration] = useState(60);
  const [activeSessions, setActiveSessions] = useState({});
  const [attendanceAnalytics, setAttendanceAnalytics] = useState([]);
  const [viewingAttendanceWorkshop, setViewingAttendanceWorkshop] = useState(null);

  // Timeline form states
  const [milestoneTitle, setMilestoneTitle] = useState('');
  const [milestoneDate, setMilestoneDate] = useState('');
  const [milestoneDesc, setMilestoneDesc] = useState('');
  const [milestoneOrder, setMilestoneOrder] = useState(1);
  const [milestoneActive, setMilestoneActive] = useState(true);
  const [editingMilestoneId, setEditingMilestoneId] = useState(null);

  // Settings form states
  const [editSettings, setEditSettings] = useState({});

  useEffect(() => {
    if (!token) {
      navigate('/admin/login');
    } else {
      loadAllData();
    }
  }, [token, navigate]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${token}` };

      // Load Settings
      const settingsRes = await fetch(`${API_BASE_URL}/api/settings`, { headers });
      const settingsData = await settingsRes.json();
      if (settingsData.success) {
        setSettings(settingsData.data);
        setEditSettings(settingsData.data);
      }

      // Load Workshops
      const wkRes = await fetch(`${API_BASE_URL}/api/workshops`, { headers });
      const wkData = await wkRes.json();
      if (wkData.success) setWorkshops(wkData.data);

      // Load Timeline milestones
      const tlRes = await fetch(`${API_BASE_URL}/api/settings/timeline/all`, { headers });
      const tlData = await tlRes.json();
      if (tlData.success) setTimelineMilestones(tlData.data);

      // Load Registrations
      await loadRegistrationsList();

      // Load Attendance Analytics
      const attRes = await fetch(`${API_BASE_URL}/api/attendance/analytics`, { headers });
      const attData = await attRes.json();
      if (attData.success) setAttendanceAnalytics(attData.data);

    } catch (err) {
      console.log('Error pulling database data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadRegistrationsList = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      const res = await fetch(`${API_BASE_URL}/api/registrations`, { headers });
      const data = await res.json();
      if (data.success) {
        setRegistrations(data.data);
        calculateStats(data.data);
      }
    } catch (err) {
      console.error('Error fetching registrations list:', err);
    }
  };

  const calculateStats = (list) => {
    const approved = list.filter(r => r.paymentStatus === 'Approved');
    const revenue = approved.reduce((sum, r) => sum + r.paidAmount, 0);
    setGlobalStats({
      registrationsCount: list.length,
      revenue,
      attendanceRate: approved.length > 0 ? (approved.filter(r => r.attendance.length > 0).length / approved.length * 100).toFixed(1) : 0
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  // --- ACTIONS FOR REGISTRATIONS ---
  const handleVerifyStatus = async (id, status) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/registrations/${id}/verify`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) {
        loadRegistrationsList();
      }
    } catch (err) {
      console.log('Error verifying status:', err);
    }
  };

  const handleDeleteRegistration = async (id) => {
    if (!window.confirm('Delete registration record?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/registrations/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) loadRegistrationsList();
    } catch (err) {
      console.log('Error deleting record:', err);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedRegs.length === 0) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/registrations/bulk-approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ids: selectedRegs })
      });
      const data = await res.json();
      if (data.success) {
        setSelectedRegs([]);
        loadRegistrationsList();
      }
    } catch (err) {
      console.log('Error bulk approving records:', err);
    }
  };

  const handleExportCSV = () => {
    if (registrations.length === 0) return;

    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Registration ID,Name,Email,Phone,College,Department,Year,Type,IEEE Member,IEEE Member ID,IEEE Domain,Amount Paid,Status\n';

    registrations.forEach(r => {
      csvContent += `"${r.registrationId}","${r.fullName}","${r.email}","${r.phone}","${r.college}","${r.department}","${r.year}","${r.registrationType}","${r.ieeeMember ? 'Yes' : 'No'}","${r.ieeeMemberId}","${r.ieeeDomain}",${r.paidAmount},"${r.paymentStatus}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `elevate_2026_registrations_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSelectReg = (id) => {
    setSelectedRegs(prev => {
      const index = prev.indexOf(id);
      if (index > -1) {
        return prev.filter(item => item !== id);
      }
      return [...prev, id];
    });
  };

  const handleSelectAll = (filteredList) => {
    if (selectedRegs.length === filteredList.length) {
      setSelectedRegs([]);
    } else {
      setSelectedRegs(filteredList.map(r => r._id));
    }
  };

  // --- ACTIONS FOR TIMELINE MILESTONES ---
  const handleSaveMilestone = async (e) => {
    e.preventDefault();
    if (!milestoneTitle || !milestoneDate || !milestoneDesc) return;

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    const payload = {
      title: milestoneTitle,
      date: milestoneDate,
      desc: milestoneDesc,
      order: milestoneOrder,
      active: milestoneActive
    };

    try {
      let res;
      if (editingMilestoneId) {
        res = await fetch(`${API_BASE_URL}/api/settings/timeline/${editingMilestoneId}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch(`${API_BASE_URL}/api/settings/timeline`, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload)
        });
      }

      const data = await res.json();
      if (data.success) {
        setMilestoneTitle('');
        setMilestoneDate('');
        setMilestoneDesc('');
        setMilestoneOrder(1);
        setMilestoneActive(true);
        setEditingMilestoneId(null);
        loadAllData();
      }
    } catch (err) {
      console.log('Error saving timeline milestone:', err);
    }
  };

  const handleEditMilestoneClick = (m) => {
    setEditingMilestoneId(m._id);
    setMilestoneTitle(m.title);
    setMilestoneDate(m.date);
    setMilestoneDesc(m.desc);
    setMilestoneOrder(m.order);
    setMilestoneActive(m.active);
  };

  const handleDeleteMilestone = async (id) => {
    if (!window.confirm('Delete timeline milestone?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/settings/timeline/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) loadAllData();
    } catch (err) {
      console.log('Error deleting milestone:', err);
    }
  };

  // --- ACTIONS FOR SYSTEM CONFIGS ---
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/api/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editSettings)
      });
      const data = await res.json();
      if (data.success) {
        setSettings(data.data);
        alert('Pricing and Payment parameters updated!');
      }
    } catch (err) {
      console.log('Error updating settings:', err);
    }
  };

  const handleQRFileChange = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditSettings(prev => ({ ...prev, [field]: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // --- ACTIONS FOR ATTENDANCE ---
  const handleExportWorkshopAttendanceCSV = (workshopId, workshopTitle) => {
    const list = registrations.filter(r => r.selectedWorkshops.includes(workshopId) && r.paymentStatus === 'Approved');
    if (list.length === 0) {
      alert('No verified registrants for this workshop yet.');
      return;
    }

    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Registration ID,Name,Email,Phone,College,Department,Year,Attendance Status\n';

    list.forEach(r => {
      const isPresent = r.attendance.includes(workshopId) ? 'Present' : 'Absent';
      csvContent += `"${r.registrationId}","${r.fullName}","${r.email}","${r.phone}","${r.college}","${r.department}","${r.year}","${isPresent}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const filename = `${workshopTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_attendance.csv`;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleActivateAttendance = async () => {
    if (!selectedWorkshopForAttendance || !attendanceCode) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/attendance/activate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          workshopId: selectedWorkshopForAttendance,
          attendanceId: attendanceCode,
          durationMinutes: attendanceDuration
        })
      });
      const data = await res.json();
      if (data.success) {
        setActiveSessions(prev => ({ ...prev, [selectedWorkshopForAttendance]: data.data }));
        loadAllData();
      }
    } catch (err) {
      console.log('Error activating attendance:', err);
    }
  };

  const handleDeactivateAttendance = async (wkId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/attendance/deactivate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ workshopId: wkId })
      });
      const data = await res.json();
      if (data.success) {
        setActiveSessions(prev => {
          const next = { ...prev };
          delete next[wkId];
          return next;
        });
        loadAllData();
      }
    } catch (err) {
      console.log('Error closing session:', err);
    }
  };

  // --- CHART RENDERING ---
  const renderWorkshopBarChart = () => {
    if (workshops.length === 0 || registrations.length === 0) return null;

    const labels = workshops.map(w => w.id.substring(0, 15).toUpperCase());
    const dataValues = workshops.map(w => 
      registrations.filter(r => r.selectedWorkshops.includes(w.id) && r.paymentStatus === 'Approved').length
    );

    const chartData = {
      labels,
      datasets: [
        {
          label: 'Seats Verified',
          data: dataValues,
          backgroundColor: 'rgba(0, 82, 255, 0.4)',
          borderColor: '#0052ff',
          borderWidth: 1.5,
        }
      ]
    };

    const chartOptions = {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: { display: true, text: 'Approved Signups per Workshop', color: '#fff', font: { family: 'Sora', size: 12 } }
      },
      scales: {
        x: { ticks: { color: '#94a3b8', font: { size: 9 } }, grid: { color: 'rgba(255, 255, 255, 0.05)' } },
        y: { ticks: { color: '#94a3b8', font: { size: 9 } }, grid: { color: 'rgba(255, 255, 255, 0.05)' }, beginAtZero: true }
      }
    };

    return <Bar data={chartData} options={chartOptions} />;
  };

  const filteredRegistrations = registrations.filter(r => {
    const matchesSearch = 
      r.fullName.toLowerCase().includes(search.toLowerCase()) ||
      r.email.toLowerCase().includes(search.toLowerCase()) ||
      r.phone.includes(search) ||
      r.registrationId.includes(search.toUpperCase()) ||
      r.transactionId.includes(search) ||
      (r.ieeeMemberId && r.ieeeMemberId.includes(search));
      
    const matchesStatus = statusFilter ? r.paymentStatus === statusFilter : true;
    const matchesType = typeFilter ? r.registrationType === typeFilter : true;
    const matchesWorkshop = workshopFilter ? r.selectedWorkshops.includes(workshopFilter) : true;

    return matchesSearch && matchesStatus && matchesType && matchesWorkshop;
  });

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-cyber-bg text-white">
      
      {/* Mobile Top Navbar */}
      <div className="md:hidden flex items-center justify-between px-6 py-4 bg-[#000000] border-b border-slate-900 sticky top-0 z-40">
        <div className="flex items-center space-x-2">
          <div className="flex items-center justify-center w-8 h-8 rounded bg-cyber-slate border border-cyber-blue/30">
            <Users className="w-4 h-4 text-cyber-blue text-glow-blue" />
          </div>
          <span className="font-sora font-extrabold text-sm tracking-wider">
            ELEVATE <span className="text-cyber-blue">CONSOLE</span>
          </span>
        </div>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded text-slate-400 hover:text-white focus:outline-none"
        >
          {isSidebarOpen ? <X className="w-6 h-6 text-cyber-blue" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Overlay Backdrop */}
      {isSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/80 backdrop-blur-xs z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Controls */}
      <div className={`fixed md:relative inset-y-0 left-0 z-50 border-r border-slate-900 bg-[#000000] flex flex-col justify-between shrink-0 transition-all duration-300 transform ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      } ${
        isMinimized ? 'w-64 md:w-20 p-6 md:p-4' : 'w-64 p-6'
      }`}>
        <div className="space-y-8">
          {/* Logo brand */}
          <div className={`flex items-center ${isMinimized ? 'justify-start md:justify-center md:space-x-0' : 'space-x-2'}`}>
            <div className="flex items-center justify-center w-8 h-8 rounded bg-cyber-slate border border-cyber-blue/30 shrink-0">
              <Users className="w-4 h-4 text-cyber-blue text-glow-blue" />
            </div>
            <span className={`font-sora font-extrabold text-sm tracking-wider transition-all duration-300 ${isMinimized ? 'opacity-100 md:hidden' : 'opacity-100'}`}>
              ELEVATE <span className="text-cyber-blue">CONSOLE</span>
            </span>
          </div>

          {/* Navigation links */}
          <div className="flex flex-col space-y-1.5 text-xs">
            <button
              onClick={() => { setActivePanel('overview'); setIsSidebarOpen(false); }}
              title={isMinimized ? "Dashboard Overview" : ""}
              className={`w-full rounded font-semibold transition-all flex items-center ${
                isMinimized 
                  ? 'justify-start md:justify-center px-3 md:px-0 py-2.5 space-x-2.5 md:space-x-0' 
                  : 'text-left px-3 py-2.5 space-x-2.5'
              } ${
                activePanel === 'overview' ? 'text-cyber-blue bg-cyber-blue/10 border-l-2 border-cyber-blue' : 'text-slate-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4 shrink-0" />
              <span className={`transition-all duration-300 ${isMinimized ? 'opacity-100 md:hidden' : 'opacity-100'}`}>Dashboard Overview</span>
            </button>

            <button
              onClick={() => { setActivePanel('registrations'); setIsSidebarOpen(false); }}
              title={isMinimized ? `Registrations (${registrations.length})` : ""}
              className={`w-full rounded font-semibold transition-all flex items-center ${
                isMinimized 
                  ? 'justify-start md:justify-center px-3 md:px-0 py-2.5 space-x-2.5 md:space-x-0' 
                  : 'text-left px-3 py-2.5 space-x-2.5'
              } ${
                activePanel === 'registrations' ? 'text-cyber-blue bg-cyber-blue/10 border-l-2 border-cyber-blue' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4 shrink-0" />
              <span className={`transition-all duration-300 ${isMinimized ? 'opacity-100 md:hidden' : 'opacity-100'}`}>
                {isMinimized ? `Registrations` : `Registrations (${registrations.length})`}
              </span>
            </button>

            <button
              onClick={() => { setActivePanel('workshops'); setIsSidebarOpen(false); }}
              title={isMinimized ? "Workshops & Resources" : ""}
              className={`w-full rounded font-semibold transition-all flex items-center ${
                isMinimized 
                  ? 'justify-start md:justify-center px-3 md:px-0 py-2.5 space-x-2.5 md:space-x-0' 
                  : 'text-left px-3 py-2.5 space-x-2.5'
              } ${
                activePanel === 'workshops' ? 'text-cyber-blue bg-cyber-blue/10 border-l-2 border-cyber-blue' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Calendar className="w-4 h-4 shrink-0" />
              <span className={`transition-all duration-300 ${isMinimized ? 'opacity-100 md:hidden' : 'opacity-100'}`}>Workshops & Resources</span>
            </button>

            <button
              onClick={() => { setActivePanel('timeline'); setIsSidebarOpen(false); }}
              title={isMinimized ? "Milestone Timeline" : ""}
              className={`w-full rounded font-semibold transition-all flex items-center ${
                isMinimized 
                  ? 'justify-start md:justify-center px-3 md:px-0 py-2.5 space-x-2.5 md:space-x-0' 
                  : 'text-left px-3 py-2.5 space-x-2.5'
              } ${
                activePanel === 'timeline' ? 'text-cyber-blue bg-cyber-blue/10 border-l-2 border-cyber-blue' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Cpu className="w-4 h-4 shrink-0" />
              <span className={`transition-all duration-300 ${isMinimized ? 'opacity-100 md:hidden' : 'opacity-100'}`}>Milestone Timeline</span>
            </button>

            <button
              onClick={() => { setActivePanel('attendance'); setIsSidebarOpen(false); }}
              title={isMinimized ? "Attendance QR Panel" : ""}
              className={`w-full rounded font-semibold transition-all flex items-center ${
                isMinimized 
                  ? 'justify-start md:justify-center px-3 md:px-0 py-2.5 space-x-2.5 md:space-x-0' 
                  : 'text-left px-3 py-2.5 space-x-2.5'
              } ${
                activePanel === 'attendance' ? 'text-cyber-blue bg-cyber-blue/10 border-l-2 border-cyber-blue' : 'text-slate-400 hover:text-white'
              }`}
            >
              <QrCode className="w-4 h-4 shrink-0" />
              <span className={`transition-all duration-300 ${isMinimized ? 'opacity-100 md:hidden' : 'opacity-100'}`}>Attendance QR Panel</span>
            </button>

            <button
              onClick={() => { setActivePanel('settings'); setIsSidebarOpen(false); }}
              title={isMinimized ? "Pricing & Payment QR" : ""}
              className={`w-full rounded font-semibold transition-all flex items-center ${
                isMinimized 
                  ? 'justify-start md:justify-center px-3 md:px-0 py-2.5 space-x-2.5 md:space-x-0' 
                  : 'text-left px-3 py-2.5 space-x-2.5'
              } ${
                activePanel === 'settings' ? 'text-cyber-blue bg-cyber-blue/10 border-l-2 border-cyber-blue' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Settings className="w-4 h-4 shrink-0" />
              <span className={`transition-all duration-300 ${isMinimized ? 'opacity-100 md:hidden' : 'opacity-100'}`}>Pricing & Payment QR</span>
            </button>

            {/* Collapse/Expand Toggle Button (Only on desktop) */}
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="hidden md:flex w-full px-3 py-2.5 text-slate-500 hover:text-white rounded transition-colors items-center justify-center border border-dashed border-slate-800/40 hover:border-slate-700/60"
              title={isMinimized ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isMinimized ? (
                <ChevronRight className="w-4 h-4 text-cyber-blue" />
              ) : (
                <div className="flex items-center space-x-2">
                  <ChevronLeft className="w-4 h-4 text-cyber-blue" />
                  <span className="text-[10px] uppercase font-bold tracking-wider">Collapse Menu</span>
                </div>
              )}
            </button>
          </div>
        </div>

        <button
          onClick={handleLogout}
          title={isMinimized ? "Exit console" : ""}
          className={`w-full py-2.5 text-xs text-red-500 border border-red-500/30 rounded hover:bg-red-500/10 transition-colors uppercase tracking-widest font-semibold flex items-center justify-center ${
            isMinimized ? 'space-x-1.5 md:space-x-0' : 'space-x-1.5'
          }`}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span className={`transition-all duration-300 ${isMinimized ? 'opacity-100 md:hidden' : 'opacity-100'}`}>Exit console</span>
        </button>
      </div>

      {/* Main Panel Content */}
      <div className="flex-grow p-4 md:p-8 overflow-y-auto md:max-h-screen">
        
        {loading && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center text-cyber-blue space-x-2">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto" />
            <span className="font-mono text-sm font-semibold uppercase tracking-widest">Querying Node details...</span>
          </div>
        )}

        {/* PANEL 1: OVERVIEW METRICS */}
        {activePanel === 'overview' && (
          <div className="space-y-8 animate-fadeIn">
            <h2 className="font-sora font-extrabold text-2xl uppercase tracking-wider text-white">
              Executive Dashboard Overview
            </h2>

            {/* Metrics cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass-panel border border-slate-800 p-6 rounded-xl relative flex items-center space-x-4">
                <div className="p-3 bg-cyber-blue/10 border border-cyber-blue/30 rounded-lg text-cyber-blue shrink-0">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest block font-bold">Total Signups</span>
                  <h3 className="text-2xl font-extrabold font-mono mt-0.5">{globalStats.registrationsCount}</h3>
                </div>
              </div>

              <div className="glass-panel border border-slate-800 p-6 rounded-xl relative flex items-center space-x-4">
                <div className="p-3 bg-cyber-blue/10 border border-cyber-blue/30 rounded-lg text-cyber-blue shrink-0">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest block font-bold">Revenue Generated</span>
                  <h3 className="text-2xl font-extrabold font-mono mt-0.5 text-green-400">₹{globalStats.revenue}</h3>
                </div>
              </div>

              <div className="glass-panel border border-slate-800 p-6 rounded-xl relative flex items-center space-x-4">
                <div className="p-3 bg-cyber-blue/10 border border-cyber-blue/30 rounded-lg text-cyber-blue shrink-0">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest block font-bold">Session Presence Rate</span>
                  <h3 className="text-2xl font-extrabold font-mono mt-0.5">{globalStats.attendanceRate}%</h3>
                </div>
              </div>
            </div>

            {/* Charts section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-8 glass-panel border border-slate-800 p-6 rounded-xl shadow-glass">
                {renderWorkshopBarChart()}
              </div>

              <div className="lg:col-span-4 space-y-4">
                <div className="glass-panel border border-slate-800 p-5 rounded-xl text-xs space-y-3">
                  <h4 className="font-sora font-semibold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
                    Verification Pending
                  </h4>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-400">Registration Count</span>
                    <span className="font-mono text-sm font-semibold text-yellow-500">
                      {registrations.filter(r => r.paymentStatus === 'Pending').length}
                    </span>
                  </div>
                  <button 
                    onClick={() => { setActivePanel('registrations'); setStatusFilter('Pending'); }}
                    className="w-full py-1.5 rounded bg-slate-900 border border-slate-800 hover:border-cyber-blue text-[10px] uppercase font-bold text-slate-300 hover:text-cyber-blue transition-all"
                  >
                    View list
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PANEL 2: REGISTRATION LIST MANAGER */}
        {activePanel === 'registrations' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <h2 className="font-sora font-extrabold text-2xl uppercase tracking-wider text-white">
                Registration Management
              </h2>
              <div className="flex gap-3">
                <button
                  onClick={handleExportCSV}
                  className="px-4 py-2 rounded bg-[#000000] border border-slate-850 hover:border-cyber-blue text-slate-300 hover:text-cyber-blue font-sora font-bold text-xs uppercase tracking-wider transition-all flex items-center space-x-1.5 shadow-sm"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Export CSV</span>
                </button>
                {selectedRegs.length > 0 && (
                  <button
                    onClick={handleBulkApprove}
                    className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-sora font-bold text-xs uppercase tracking-wider transition-all flex items-center space-x-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Verify Selected ({selectedRegs.length})</span>
                  </button>
                )}
              </div>
            </div>

            {/* Filter and search bar */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 glass-panel border border-slate-800 rounded-xl">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-[#000000] border border-slate-850 rounded pl-9 pr-3 py-2 text-xs text-white focus:outline-none"
                  placeholder="Search name, phone, ID, member ID..."
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-[#000000] border border-slate-850 rounded px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value="">All Verification Status</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full bg-[#000000] border border-slate-850 rounded px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value="">All Enrollment Tiers</option>
                <option value="full">Full Package</option>
                <option value="custom">Custom plan</option>
              </select>

              <select
                value={workshopFilter}
                onChange={(e) => setWorkshopFilter(e.target.value)}
                className="w-full bg-[#000000] border border-slate-850 rounded px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value="">All Workshops</option>
                {workshops.map(w => <option key={w.id} value={w.id}>{w.title.substring(0, 20)}...</option>)}
              </select>
            </div>

            {/* Table data displaying registrations list */}
            <div className="glass-panel border border-slate-800 rounded-xl overflow-hidden shadow-glass">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-850 bg-slate-900/40 text-slate-400 uppercase tracking-widest font-semibold font-mono">
                      <th className="p-4 text-center">
                        <input
                          type="checkbox"
                          checked={selectedRegs.length === filteredRegistrations.length && filteredRegistrations.length > 0}
                          onChange={() => handleSelectAll(filteredRegistrations)}
                          className="w-3.5 h-3.5"
                        />
                      </th>
                      <th className="p-4">Reg ID / Name</th>
                      <th className="p-4">Email / Phone</th>
                      <th className="p-4">IEEE Status</th>
                      <th className="p-4">Plan / classes</th>
                      <th className="p-4">Transaction ID</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRegistrations.length === 0 ? (
                      <tr>
                        <td colSpan="9" className="p-8 text-center text-slate-500 italic">No registration records found.</td>
                      </tr>
                    ) : (
                      filteredRegistrations.map((reg) => (
                        <tr key={reg._id} className="border-b border-slate-850/60 hover:bg-[#000000]/30 transition-colors">
                          <td className="p-4 text-center">
                            <input
                              type="checkbox"
                              checked={selectedRegs.includes(reg._id)}
                              onChange={() => handleSelectReg(reg._id)}
                              className="w-3.5 h-3.5"
                            />
                          </td>
                          <td className="p-4 space-y-1">
                            <span className="font-mono text-[10px] font-bold text-cyber-blue">{reg.registrationId}</span>
                            <p className="font-semibold text-white uppercase">{reg.fullName}</p>
                          </td>
                          <td className="p-4 space-y-1 text-slate-300">
                            <p>{reg.email}</p>
                            <p className="text-[10px] text-slate-500">{reg.phone}</p>
                          </td>
                          <td className="p-4 space-y-1">
                            {reg.ieeeMember ? (
                              <div className="space-y-0.5">
                                <span className="px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-blue-500/10 text-cyber-blue border border-blue-500/25">SKN IEEE SB</span>
                                <p className="text-[9px] text-slate-450 font-mono">ID: {reg.ieeeMemberId}</p>
                                <p className="text-[9px] text-slate-450 uppercase">{reg.ieeeDomain}</p>
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-500 italic">Non-Member</span>
                            )}
                          </td>
                          <td className="p-4 space-y-1">
                            <span className="capitalize font-semibold text-white">{reg.registrationType === 'full' ? 'Full Package' : 'Custom Plan'}</span>
                            {reg.registrationType === 'full' ? (
                              <p className="text-[10px] text-slate-500 mt-1 font-medium">All 6 Workshops</p>
                            ) : (
                              <div className="text-[9px] text-slate-400 mt-1 space-y-0.5 max-w-[150px] truncate">
                                {reg.selectedWorkshops.map(id => {
                                  const wk = workshops.find(w => w.id === id);
                                  return (
                                    <div key={id} className="truncate" title={wk ? wk.title : id}>
                                      • {wk ? wk.title : id}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </td>
                          <td className="p-4">
                            <span className="font-mono text-slate-300 font-semibold">{reg.transactionId}</span>
                          </td>
                          <td className="p-4 font-mono font-bold text-slate-200">₹{reg.paidAmount}</td>
                          <td className="p-4">
                            <span className={`px-2.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                              reg.paymentStatus === 'Approved' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                              reg.paymentStatus === 'Rejected' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                              'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                            }`}>
                              {reg.paymentStatus}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center space-x-2">
                              {reg.paymentStatus !== 'Approved' && (
                                <button
                                  onClick={() => handleVerifyStatus(reg._id, 'Approved')}
                                  title="Approve registration"
                                  className="p-1 rounded bg-green-500/10 hover:bg-green-500 border border-green-500/30 hover:text-black text-green-500 transition-all"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {reg.paymentStatus !== 'Rejected' && (
                                <button
                                  onClick={() => handleVerifyStatus(reg._id, 'Rejected')}
                                  title="Reject registration"
                                  className="p-1 rounded bg-red-500/10 hover:bg-red-500 border border-red-500/30 hover:text-black text-red-500 transition-all"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteRegistration(reg._id)}
                                title="Delete record"
                                className="p-1 rounded bg-slate-800 hover:bg-red-650 border border-slate-700 hover:border-red-500 hover:text-white text-slate-400 transition-all"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* PANEL 3: WORKSHOP & RESOURCES */}
        {activePanel === 'workshops' && (
          <div className="space-y-6 animate-fadeIn">
            <h2 className="font-sora font-extrabold text-2xl uppercase tracking-wider text-white">
              Workshop Schedule & Materials
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {workshops.map(wk => (
                <div key={wk.id} className="glass-panel border border-slate-800 p-6 rounded-xl space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                    <span className="font-mono text-[10px] text-cyber-blue font-bold uppercase">{wk.id}</span>
                    <span className="text-xs text-slate-400 font-semibold">{wk.status}</span>
                  </div>

                  <form 
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const form = e.target;
                      const title = form.title.value;
                      const description = form.description.value;
                      const mentor = form.mentor.value;
                      const dateTime = form.dateTime.value;
                      const meetingLink = form.meetingLink.value;
                      const whatsappGroupLink = form.whatsappGroupLink.value;
                      const studyMaterialLink = form.studyMaterialLink.value;
                      const status = form.status.value;

                      try {
                        const res = await fetch(`${API_BASE_URL}/api/workshops/${wk.id}`, {
                          method: 'PUT',
                          headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                          },
                          body: JSON.stringify({ title, description, mentor, dateTime, meetingLink, whatsappGroupLink, studyMaterialLink, status })
                        });
                        const data = await res.json();
                        if (data.success) {
                          alert('Workshop details saved successfully!');
                          loadAllData();
                        }
                      } catch (err) {
                        console.error('Error saving workshop properties:', err);
                      }
                    }}
                    className="space-y-3 text-xs"
                  >
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 font-semibold uppercase">Workshop Title</label>
                      <input 
                        type="text" 
                        name="title" 
                        defaultValue={wk.title} 
                        className="w-full bg-[#000000] border border-slate-850 rounded px-3 py-1.5 text-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 font-semibold uppercase">Workshop Description</label>
                      <textarea 
                        name="description" 
                        defaultValue={wk.description} 
                        className="w-full bg-[#000000] border border-slate-850 rounded px-3 py-1.5 text-white focus:outline-none h-16 leading-relaxed"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 font-semibold uppercase">Mentor Name</label>
                      <input 
                        type="text" 
                        name="mentor" 
                        defaultValue={wk.mentor} 
                        className="w-full bg-[#000000] border border-slate-850 rounded px-3 py-1.5 text-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 font-semibold uppercase">Date / Time</label>
                      <input 
                        type="text" 
                        name="dateTime" 
                        defaultValue={wk.dateTime} 
                        className="w-full bg-[#000000] border border-slate-850 rounded px-3 py-1.5 text-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 font-semibold uppercase">Meeting Link</label>
                      <input 
                        type="text" 
                        name="meetingLink" 
                        defaultValue={wk.meetingLink || ''} 
                        className="w-full bg-[#000000] border border-slate-850 rounded px-3 py-1.5 text-white focus:outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 font-semibold uppercase">WhatsApp Group Link</label>
                        <input 
                          type="text" 
                          name="whatsappGroupLink" 
                          defaultValue={wk.whatsappGroupLink || ''} 
                          className="w-full bg-[#000000] border border-slate-850 rounded px-3 py-1.5 text-white focus:outline-none font-mono"
                          placeholder="WhatsApp group link"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 font-semibold uppercase">Google Drive Material Link</label>
                        <input 
                          type="text" 
                          name="studyMaterialLink" 
                          defaultValue={wk.studyMaterialLink || ''} 
                          className="w-full bg-[#000000] border border-slate-850 rounded px-3 py-1.5 text-white focus:outline-none font-mono"
                          placeholder="Drive folder or link"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 font-semibold uppercase">Status</label>
                        <select 
                          name="status" 
                          defaultValue={wk.status} 
                          className="w-full bg-[#000000] border border-slate-850 rounded px-3 py-1.5 text-white focus:outline-none"
                        >
                          <option value="Open">Open</option>
                          <option value="Closed">Closed</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </div>
                      <div className="flex items-end">
                        <button 
                          type="submit" 
                          className="w-full py-1.5 rounded bg-cyber-blue hover:brightness-110 text-white font-sora font-semibold uppercase tracking-wider text-[10px]"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PANEL 4: MILESTONE TIMELINE */}
        {activePanel === 'timeline' && (
          <div className="space-y-6 animate-fadeIn">
            <h2 className="font-sora font-extrabold text-2xl uppercase tracking-wider text-white">
              Dynamic Milestone Timeline Editor
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Creator Form */}
              <form onSubmit={handleSaveMilestone} className="lg:col-span-5 glass-panel border border-slate-800 p-6 rounded-xl space-y-4 text-xs">
                <h3 className="font-sora font-bold text-sm text-white uppercase tracking-wider border-b border-slate-900 pb-2">
                  {editingMilestoneId ? 'Edit Milestone' : 'Add Milestone'}
                </h3>

                <div className="space-y-1.5">
                  <label className="text-slate-400 uppercase font-semibold">Title</label>
                  <input 
                    type="text" 
                    required
                    value={milestoneTitle}
                    onChange={(e) => setMilestoneTitle(e.target.value)}
                    className="w-full bg-[#000000] border border-slate-850 rounded px-3 py-2 text-white focus:outline-none"
                    placeholder="e.g. Registration Open"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400 uppercase font-semibold">Schedule Info / Date</label>
                  <input 
                    type="text" 
                    required
                    value={milestoneDate}
                    onChange={(e) => setMilestoneDate(e.target.value)}
                    className="w-full bg-[#000000] border border-slate-850 rounded px-3 py-2 text-white focus:outline-none"
                    placeholder="e.g. June 20, 2026"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400 uppercase font-semibold">Description</label>
                  <textarea 
                    required
                    value={milestoneDesc}
                    onChange={(e) => setMilestoneDesc(e.target.value)}
                    className="w-full bg-[#000000] border border-slate-850 rounded px-3 py-2 text-white focus:outline-none h-16 leading-relaxed"
                    placeholder="Provide description details..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-slate-400 uppercase font-semibold">Sort Order</label>
                    <input 
                      type="number" 
                      value={milestoneOrder}
                      onChange={(e) => setMilestoneOrder(e.target.value)}
                      className="w-full bg-[#000000] border border-slate-850 rounded px-3 py-2 text-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5 flex flex-col justify-end">
                    <div className="flex items-center space-x-2 py-2">
                      <input 
                        type="checkbox" 
                        id="milestoneActive"
                        checked={milestoneActive}
                        onChange={(e) => setMilestoneActive(e.target.checked)}
                        className="w-4 h-4 rounded text-cyber-blue bg-black border-slate-800"
                      />
                      <label htmlFor="milestoneActive" className="font-semibold text-slate-350 cursor-pointer select-none">Active</label>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    type="submit" 
                    className="flex-grow py-2 rounded bg-cyber-blue text-white font-sora font-semibold uppercase tracking-wider text-[10px]"
                  >
                    Save Milestone
                  </button>
                  {editingMilestoneId && (
                    <button 
                      type="button" 
                      onClick={() => {
                        setEditingMilestoneId(null);
                        setMilestoneTitle('');
                        setMilestoneDate('');
                        setMilestoneDesc('');
                        setMilestoneOrder(1);
                        setMilestoneActive(true);
                      }}
                      className="px-4 py-2 rounded bg-slate-800 text-slate-300 font-sora font-semibold uppercase tracking-wider text-[10px]"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>

              {/* Milestones Listing */}
              <div className="lg:col-span-7 glass-panel border border-slate-800 rounded-xl overflow-hidden shadow-glass p-6 space-y-4 text-xs">
                <h3 className="font-sora font-bold text-sm text-white uppercase tracking-wider border-b border-slate-900 pb-2">
                  Current Roadmaps
                </h3>

                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                  {timelineMilestones.map(m => (
                    <div key={m._id} className="p-3 bg-[#000000]/60 border border-slate-900 rounded-lg flex items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-[9px] bg-slate-800 px-1.5 py-0.5 rounded font-bold text-slate-400">ORDER {m.order}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${m.active ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>{m.active ? 'Active' : 'Inactive'}</span>
                        </div>
                        <h4 className="font-sora font-bold text-white mt-1.5">{m.title}</h4>
                        <p className="text-[10px] text-cyber-blue font-semibold">{m.date}</p>
                        <p className="text-[10px] text-slate-450 leading-relaxed mt-1">{m.desc}</p>
                      </div>

                      <div className="flex flex-col gap-1.5 shrink-0">
                        <button
                          onClick={() => handleEditMilestoneClick(m)}
                          className="px-3 py-1 rounded border border-cyber-blue/30 text-cyber-blue hover:bg-cyber-blue/10 text-[9px] uppercase font-bold"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteMilestone(m._id)}
                          className="px-3 py-1 rounded border border-red-500/30 text-red-500 hover:bg-red-500/10 text-[9px] uppercase font-bold"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}

                  {timelineMilestones.length === 0 && (
                    <p className="text-slate-500 italic text-center py-6">No milestones seeded yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PANEL 5: ATTENDANCE QR GENERATOR */}
        {activePanel === 'attendance' && (
          <div className="space-y-6 animate-fadeIn">
            <h2 className="font-sora font-extrabold text-2xl uppercase tracking-wider text-white">
              QR-Based Attendance Manager
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Creator Form */}
              <div className="lg:col-span-5 glass-panel border border-slate-800 p-6 rounded-xl space-y-4 text-xs">
                <h3 className="font-sora font-bold text-sm text-white uppercase tracking-wider border-b border-slate-900 pb-2">
                  Activate Check-In Session
                </h3>

                <div className="space-y-1.5">
                  <label className="text-slate-400 uppercase font-semibold">Select Workshop</label>
                  <select 
                    value={selectedWorkshopForAttendance} 
                    onChange={(e) => setSelectedWorkshopForAttendance(e.target.value)}
                    className="w-full bg-[#000000] border border-slate-850 rounded px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="">-- Choose Workshop --</option>
                    {workshops.map(w => <option key={w.id} value={w.id}>{w.title}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400 uppercase font-semibold">Passcode (Attendance ID)</label>
                  <input 
                    type="text"
                    value={attendanceCode}
                    onChange={(e) => setAttendanceCode(e.target.value.toUpperCase())}
                    className="w-full bg-[#000000] border border-slate-850 rounded px-3 py-2 text-white focus:outline-none uppercase font-mono tracking-wider"
                    placeholder="e.g. ELEVATE_LN_26"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400 uppercase font-semibold">Duration window (Minutes)</label>
                  <input 
                    type="number"
                    value={attendanceDuration}
                    onChange={(e) => setAttendanceDuration(e.target.value)}
                    className="w-full bg-[#000000] border border-slate-850 rounded px-3 py-2 text-white focus:outline-none"
                  />
                </div>

                <button
                  onClick={handleActivateAttendance}
                  disabled={!selectedWorkshopForAttendance || !attendanceCode}
                  className="w-full py-2.5 rounded bg-cyber-blue hover:brightness-110 text-white font-sora font-bold uppercase tracking-wider text-[10px] disabled:opacity-40"
                >
                  Activate Check-In & Generate QR
                </button>
              </div>

              {/* Dynamic QR viewer */}
              <div className="lg:col-span-7 space-y-6">
                <div className="glass-panel border border-slate-800 p-6 rounded-xl space-y-4">
                  <h3 className="font-sora font-bold text-sm text-white uppercase tracking-wider border-b border-slate-900 pb-2">
                    Active Check-In Session
                  </h3>

                  {workshops.filter(w => activeSessions[w.id] || w.status === 'Open').map(wk => {
                    const session = activeSessions[wk.id];
                    if (!session) return null;

                    const checkInLink = `${window.location.origin}/attendance-checkin?w=${wk.id}&t=${session.secureToken}`;
                    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(checkInLink)}`;

                    return (
                      <div key={wk.id} className="p-4 bg-[#000000]/60 border border-slate-900 rounded-lg flex flex-col md:flex-row items-center gap-6">
                        <div className="bg-white p-2 rounded max-w-[120px] shrink-0 border border-slate-205">
                          <img src={qrUrl} alt="Session Attendance QR Code" className="w-24 h-24 object-contain" />
                        </div>
                        <div className="space-y-2 text-xs flex-grow">
                          <h4 className="font-sora font-bold text-white uppercase leading-snug">{wk.title}</h4>
                          <p className="font-mono text-[10px] text-slate-500">ID: <span className="text-cyber-blue font-bold">{session.attendanceId}</span></p>
                          <p className="text-[10px] text-slate-400">Display this QR or passcode to live attendees to allow check-ins.</p>
                          
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleDeactivateAttendance(wk.id)}
                              className="px-3 py-1.5 rounded bg-red-500/10 hover:bg-red-500 border border-red-500/30 hover:text-black text-red-500 uppercase tracking-wider text-[9px] font-bold"
                            >
                              Deactivate
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {Object.keys(activeSessions).length === 0 && (
                    <p className="text-xs text-slate-500 italic text-center py-6">No check-in windows currently active.</p>
                  )}
                </div>

                <div className="glass-panel border border-slate-800 p-6 rounded-xl space-y-4 animate-fadeIn">
                  <h3 className="font-sora font-bold text-sm text-white uppercase tracking-wider border-b border-slate-900 pb-2">
                    Attendance Statistics
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-900 text-slate-500 uppercase tracking-widest font-mono text-[9px]">
                          <th className="pb-2">Workshop</th>
                          <th className="pb-2 text-center">Enrolled</th>
                          <th className="pb-2 text-center">Present</th>
                          <th className="pb-2 text-center">Absent</th>
                          <th className="pb-2 text-right">Rate</th>
                          <th className="pb-2 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attendanceAnalytics.map(att => (
                          <tr key={att.workshopId} className="border-b border-slate-900/40 hover:bg-[#000000]/10">
                            <td className="py-2.5 font-bold text-white truncate max-w-[150px]">{att.title}</td>
                            <td className="py-2.5 text-center font-mono text-slate-300">{att.registeredCount}</td>
                            <td className="py-2.5 text-center font-mono text-green-400">{att.presentCount}</td>
                            <td className="py-2.5 text-center font-mono text-red-400">{att.absentCount}</td>
                            <td className="py-2.5 text-right font-mono font-bold text-cyber-blue">{att.attendancePercentage}%</td>
                            <td className="py-2.5 text-center">
                              <div className="flex items-center justify-center space-x-2">
                                <button
                                  onClick={() => setViewingAttendanceWorkshop({ id: att.workshopId, title: att.title, mentor: att.mentor, dateTime: att.dateTime })}
                                  title="View attendee list"
                                  className="p-1 rounded bg-blue-500/10 hover:bg-blue-600 border border-blue-500/30 hover:text-white text-cyber-blue transition-all"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleExportWorkshopAttendanceCSV(att.workshopId, att.title)}
                                  title="Download attendance CSV"
                                  className="p-1 rounded bg-green-500/10 hover:bg-green-600 border border-green-500/30 hover:text-white text-green-500 transition-all"
                                >
                                  <FileSpreadsheet className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {viewingAttendanceWorkshop && (
                  <div className="glass-panel border border-slate-800 p-6 rounded-xl space-y-4 animate-fadeIn relative">
                    <button 
                      onClick={() => setViewingAttendanceWorkshop(null)}
                      className="absolute top-4 right-4 p-1.5 rounded hover:bg-slate-900 text-slate-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>

                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-900 pb-3">
                      <div>
                        <span className="text-[10px] font-bold text-cyber-blue tracking-widest uppercase font-mono">{viewingAttendanceWorkshop.id}</span>
                        <h4 className="font-sora font-extrabold text-sm text-white uppercase">{viewingAttendanceWorkshop.title}</h4>
                        <p className="text-[10px] text-slate-500">Mentor: {viewingAttendanceWorkshop.mentor} | {viewingAttendanceWorkshop.dateTime}</p>
                      </div>
                      <button
                        onClick={() => handleExportWorkshopAttendanceCSV(viewingAttendanceWorkshop.id, viewingAttendanceWorkshop.title)}
                        className="px-3 py-1.5 rounded bg-cyber-blue hover:brightness-110 text-white font-sora font-bold text-[10px] uppercase tracking-wider transition-all flex items-center space-x-1.5"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                        <span>Export CSV</span>
                      </button>
                    </div>

                    <div className="overflow-x-auto max-h-[300px] overflow-y-auto pr-1">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-slate-900 text-slate-500 uppercase tracking-widest font-mono text-[9px]">
                            <th className="pb-2">Reg ID</th>
                            <th className="pb-2">Name</th>
                            <th className="pb-2">Email</th>
                            <th className="pb-2">College</th>
                            <th className="pb-2 text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {registrations.filter(r => r.selectedWorkshops.includes(viewingAttendanceWorkshop.id) && r.paymentStatus === 'Approved').length === 0 ? (
                            <tr>
                              <td colSpan="5" className="py-4 text-center text-slate-500 italic">No approved registrants for this workshop.</td>
                            </tr>
                          ) : (
                            registrations
                              .filter(r => r.selectedWorkshops.includes(viewingAttendanceWorkshop.id) && r.paymentStatus === 'Approved')
                              .map(reg => {
                                const isPresent = reg.attendance.includes(viewingAttendanceWorkshop.id);
                                return (
                                  <tr key={reg._id} className="border-b border-slate-900/40 hover:bg-[#000000]/10">
                                    <td className="py-2.5 font-mono text-[10px] text-cyber-blue">{reg.registrationId}</td>
                                    <td className="py-2.5 font-semibold text-white uppercase">{reg.fullName}</td>
                                    <td className="py-2.5 text-slate-355">{reg.email}</td>
                                    <td className="py-2.5 text-slate-450 truncate max-w-[150px]">{reg.college}</td>
                                    <td className="py-2.5 text-right">
                                      <span className={`px-2.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                                        isPresent 
                                          ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                      }`}>
                                        {isPresent ? 'Present' : 'Absent'}
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

              </div>

            </div>
          </div>
        )}

        {/* PANEL 6: CONFIGS & PRICES MANAGER */}
        {activePanel === 'settings' && (
          <div className="space-y-6 animate-fadeIn max-w-xl">
            <h2 className="font-sora font-extrabold text-2xl uppercase tracking-wider text-white">
              System Branding & QR Gateway Settings
            </h2>

            <form onSubmit={handleSaveSettings} className="glass-panel border border-slate-800 p-6 rounded-xl space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-400 uppercase font-semibold">Event Title</label>
                  <input 
                    type="text" 
                    value={editSettings.eventTitle || ''}
                    onChange={(e) => setEditSettings({ ...editSettings, eventTitle: e.target.value })}
                    className="w-full bg-[#000000] border border-slate-850 rounded px-3 py-2 text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-slate-400 uppercase font-semibold">Event Mode</label>
                  <input 
                    type="text" 
                    value={editSettings.eventMode || ''}
                    onChange={(e) => setEditSettings({ ...editSettings, eventMode: e.target.value })}
                    className="w-full bg-[#000000] border border-slate-850 rounded px-3 py-2 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 uppercase font-semibold">Event Tagline</label>
                <input 
                  type="text" 
                  value={editSettings.eventTagline || ''}
                  onChange={(e) => setEditSettings({ ...editSettings, eventTagline: e.target.value })}
                  className="w-full bg-[#000000] border border-slate-850 rounded px-3 py-2 text-white focus:outline-none"
                />
              </div>



              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-900 pt-4">
                <div className="space-y-1.5">
                  <label className="text-slate-400 uppercase font-semibold">UPI ID Gateway</label>
                  <input 
                    type="text" 
                    value={editSettings.upiId || ''}
                    onChange={(e) => setEditSettings({ ...editSettings, upiId: e.target.value })}
                    className="w-full bg-[#000000] border border-slate-850 rounded px-3 py-2 text-white focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400 uppercase font-semibold">Full Price (₹)</label>
                  <input 
                    type="number" 
                    value={editSettings.priceFull || 0}
                    onChange={(e) => setEditSettings({ ...editSettings, priceFull: e.target.value })}
                    className="w-full bg-[#000000] border border-slate-850 rounded px-3 py-2 text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400 uppercase font-semibold">Custom Class Price (₹)</label>
                  <input 
                    type="number" 
                    value={editSettings.priceCustom || 0}
                    onChange={(e) => setEditSettings({ ...editSettings, priceCustom: e.target.value })}
                    className="w-full bg-[#000000] border border-slate-850 rounded px-3 py-2 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="border-t border-slate-900 pt-6 mt-6 space-y-6">
                <h3 className="font-sora font-semibold text-sm text-cyber-blue uppercase tracking-wider">
                  Payment QR Codes by Combination Amount
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Full Package QR */}
                  <div className="p-4 bg-[#000000]/60 border border-slate-900 rounded-lg space-y-3 flex flex-col justify-between">
                    <div>
                      <label className="text-xs font-bold text-white block">Full Package QR Code (₹{editSettings.priceFull || 150})</label>
                      <span className="text-[10px] text-slate-500 block mb-2">Used when user registers for the Full Package Plan.</span>
                      <input 
                        type="text" 
                        value={editSettings.qrCodeFull || ''}
                        onChange={(e) => setEditSettings({ ...editSettings, qrCodeFull: e.target.value })}
                        className="w-full bg-[#000000] border border-slate-850 rounded px-3 py-2 text-white focus:outline-none font-mono text-[10px] mb-2"
                        placeholder="Image URL or Base64 string"
                      />
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => handleQRFileChange(e, 'qrCodeFull')}
                        className="w-full text-[10px] text-slate-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-cyber-blue/15 file:text-cyber-blue hover:file:bg-cyber-blue/20"
                      />
                    </div>
                    {editSettings.qrCodeFull && (
                      <div className="mt-2 p-2 bg-white rounded max-w-[100px] border border-slate-200">
                        <img src={editSettings.qrCodeFull} alt="Full Package QR Preview" className="w-20 h-20 object-contain mx-auto" />
                      </div>
                    )}
                  </div>

                  {/* Generic Custom Plan Fallback QR */}
                  <div className="p-4 bg-[#000000]/60 border border-slate-900 rounded-lg space-y-3 flex flex-col justify-between">
                    <div>
                      <label className="text-xs font-bold text-white block">Generic Custom Plan QR Code (Fallback)</label>
                      <span className="text-[10px] text-slate-500 block mb-2">Fallback custom plan payment QR code.</span>
                      <input 
                        type="text" 
                        value={editSettings.qrCodeCustom || ''}
                        onChange={(e) => setEditSettings({ ...editSettings, qrCodeCustom: e.target.value })}
                        className="w-full bg-[#000000] border border-slate-850 rounded px-3 py-2 text-white focus:outline-none font-mono text-[10px] mb-2"
                        placeholder="Image URL or Base64 string"
                      />
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => handleQRFileChange(e, 'qrCodeCustom')}
                        className="w-full text-[10px] text-slate-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-cyber-blue/15 file:text-cyber-blue hover:file:bg-cyber-blue/20"
                      />
                    </div>
                    {editSettings.qrCodeCustom && (
                      <div className="mt-2 p-2 bg-white rounded max-w-[100px] border border-slate-200">
                        <img src={editSettings.qrCodeCustom} alt="Custom Fallback QR Preview" className="w-20 h-20 object-contain mx-auto" />
                      </div>
                    )}
                  </div>

                  {/* 1 to 6 classes QRs */}
                  {[1, 2, 3, 4, 5, 6].map((num) => {
                    const field = `qrCode${num}`;
                    const price = (editSettings.priceCustom || 40) * num;
                    return (
                      <div key={num} className="p-4 bg-[#000000]/60 border border-slate-900 rounded-lg space-y-3 flex flex-col justify-between">
                        <div>
                          <label className="text-xs font-bold text-white block">{num} Class(es) QR Code (₹{price})</label>
                          <span className="text-[10px] text-slate-500 block mb-2">Respective combination payment amount for {num} custom workshop(s).</span>
                          <input 
                            type="text" 
                            value={editSettings[field] || ''}
                            onChange={(e) => setEditSettings({ ...editSettings, [field]: e.target.value })}
                            className="w-full bg-[#000000] border border-slate-850 rounded px-3 py-2 text-white focus:outline-none font-mono text-[10px] mb-2"
                            placeholder="Image URL or Base64 string"
                          />
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={(e) => handleQRFileChange(e, field)}
                            className="w-full text-[10px] text-slate-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-cyber-blue/15 file:text-cyber-blue hover:file:bg-cyber-blue/20"
                          />
                        </div>
                        {editSettings[field] && (
                          <div className="mt-2 p-2 bg-white rounded max-w-[100px] border border-slate-200">
                            <img src={editSettings[field]} alt={`QR Code ${num} Preview`} className="w-20 h-20 object-contain mx-auto" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 rounded bg-cyber-blue hover:brightness-110 text-white font-sora font-extrabold uppercase tracking-widest text-xs transition-all"
              >
                Save Settings
              </button>
            </form>
          </div>
        )}

      </div>



    </div>
  );
};

export default AdminDashboard;
