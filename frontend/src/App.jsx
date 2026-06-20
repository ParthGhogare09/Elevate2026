import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ParticleBg from './components/ParticleBg';
import AnnouncementPopup from './components/AnnouncementPopup';

// Page Imports
import LandingPage from './pages/LandingPage';
import Registration from './pages/Registration';
import StudentDashboard from './pages/StudentDashboard';
import AttendanceCheckin from './pages/AttendanceCheckin';
import WorkshopDetail from './pages/WorkshopDetail';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

// Layout wrapper to conditionally show public header/footer
const AppContent = () => {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin');

  return (
    <div className="flex flex-col min-h-screen">
      {/* Show public header elements only if not on admin paths */}
      {!isAdminPath && (
        <>
          <ParticleBg />
          <Navbar />
          <AnnouncementPopup />
        </>
      )}

      <main className="flex-grow">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<Registration />} />
          <Route path="/dashboard" element={<StudentDashboard />} />
          <Route path="/attendance-checkin" element={<AttendanceCheckin />} />
          <Route path="/workshops/:id" element={<WorkshopDetail />} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/*" element={<AdminDashboard />} />
        </Routes>
      </main>

      {!isAdminPath && <Footer />}
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
