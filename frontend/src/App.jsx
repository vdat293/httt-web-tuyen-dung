import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './components/Toast';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import JobDetail from './pages/JobDetail';
import EmployerDashboard from './pages/employer/EmployerDashboard';
import EmployerJobs from './pages/employer/EmployerJobs';
import EmployerApplications from './pages/employer/EmployerApplications';
import EmployerInterviews from './pages/employer/EmployerInterviews';
import EmployerReports from './pages/employer/EmployerReports';
import CandidateApplications from './pages/candidate/CandidateApplications';
import CandidateInterviews from './pages/candidate/CandidateInterviews';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<><Navbar /><Home /></>} />
            <Route path="/jobs" element={<><Navbar /><Home /></>} />
            <Route path="/jobs/:id" element={<><Navbar /><JobDetail /></>} />

            {/* Employer routes */}
            <Route path="/employer/dashboard" element={<ProtectedRoute roles={['employer']}><Navbar /><EmployerDashboard /></ProtectedRoute>} />
            <Route path="/employer/jobs" element={<ProtectedRoute roles={['employer']}><Navbar /><EmployerJobs /></ProtectedRoute>} />
            <Route path="/employer/applications" element={<ProtectedRoute roles={['employer']}><Navbar /><EmployerApplications /></ProtectedRoute>} />
            <Route path="/employer/interviews" element={<ProtectedRoute roles={['employer']}><Navbar /><EmployerInterviews /></ProtectedRoute>} />
            <Route path="/employer/reports" element={<ProtectedRoute roles={['employer']}><Navbar /><EmployerReports /></ProtectedRoute>} />

            {/* Candidate routes */}
            <Route path="/candidate/applications" element={<ProtectedRoute roles={['candidate']}><Navbar /><CandidateApplications /></ProtectedRoute>} />
            <Route path="/candidate/interviews" element={<ProtectedRoute roles={['candidate']}><Navbar /><CandidateInterviews /></ProtectedRoute>} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
