import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './components/Toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import { SocketProvider } from './contexts/SocketContext';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Home from './pages/Home';
import Jobs from './pages/Jobs';
import JobDetail from './pages/JobDetail';
import EmployerDashboard from './pages/employer/EmployerDashboard';
import EmployerJobs from './pages/employer/EmployerJobs';
import PostJob from './pages/employer/PostJob';
import EmployerApplications from './pages/employer/EmployerApplications';
import EmployerInterviews from './pages/employer/EmployerInterviews';
import EmployerReports from './pages/employer/EmployerReports';
import CandidateApplications from './pages/candidate/CandidateApplications';
import CandidateInterviews from './pages/candidate/CandidateInterviews';
import CandidateSavedJobs from './pages/candidate/CandidateSavedJobs';
import CandidateProfile from './pages/candidate/CandidateProfile';
import CompanyProfile from './pages/employer/CompanyProfile';
import Notifications from './pages/Notifications';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminJobs from './pages/admin/AdminJobs';
import AdminReports from './pages/admin/AdminReports';
import AdminOTPs from './pages/Admin/OTPManagement';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/" element={<><Navbar /><Home /><Footer /></>} />
              <Route path="/jobs" element={<><Navbar /><Jobs /><Footer /></>} />
              <Route path="/jobs/:id" element={<><Navbar /><JobDetail /><Footer /></>} />

              {/* Employer routes */}
              <Route path="/employer/dashboard" element={<ProtectedRoute roles={['employer']}><Navbar /><EmployerDashboard /><Footer /></ProtectedRoute>} />
              <Route path="/employer/jobs" element={<ProtectedRoute roles={['employer']}><Navbar /><EmployerJobs /><Footer /></ProtectedRoute>} />
              <Route path="/employer/jobs/new" element={<ProtectedRoute roles={['employer']}><Navbar /><PostJob /><Footer /></ProtectedRoute>} />
              <Route path="/employer/jobs/edit/:id" element={<ProtectedRoute roles={['employer']}><Navbar /><PostJob /><Footer /></ProtectedRoute>} />
              <Route path="/employer/applications" element={<ProtectedRoute roles={['employer']}><Navbar /><EmployerApplications /><Footer /></ProtectedRoute>} />
              <Route path="/employer/interviews" element={<ProtectedRoute roles={['employer']}><Navbar /><EmployerInterviews /><Footer /></ProtectedRoute>} />
              <Route path="/employer/reports" element={<ProtectedRoute roles={['employer']}><Navbar /><EmployerReports /><Footer /></ProtectedRoute>} />
              <Route path="/employer/company-profile" element={<ProtectedRoute roles={['employer']}><Navbar /><CompanyProfile /><Footer /></ProtectedRoute>} />

              {/* Candidate routes */}
              <Route path="/candidate/applications" element={<ProtectedRoute roles={['candidate']}><Navbar /><CandidateApplications /><Footer /></ProtectedRoute>} />
              <Route path="/candidate/interviews" element={<ProtectedRoute roles={['candidate']}><Navbar /><CandidateInterviews /><Footer /></ProtectedRoute>} />
              <Route path="/candidate/saved-jobs" element={<ProtectedRoute roles={['candidate']}><Navbar /><CandidateSavedJobs /><Footer /></ProtectedRoute>} />
              <Route path="/candidate/profile" element={<ProtectedRoute roles={['candidate']}><Navbar /><CandidateProfile /><Footer /></ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute><Navbar /><Notifications /><Footer /></ProtectedRoute>} />

              {/* Admin routes */}
              <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><AdminUsers /></ProtectedRoute>} />
              <Route path="/admin/jobs" element={<ProtectedRoute roles={['admin']}><AdminJobs /></ProtectedRoute>} />
              <Route path="/admin/reports" element={<ProtectedRoute roles={['admin']}><AdminReports /></ProtectedRoute>} />
              <Route path="/admin/otps" element={<ProtectedRoute roles={['admin']}><AdminOTPs /></ProtectedRoute>} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
