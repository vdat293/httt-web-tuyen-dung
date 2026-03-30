import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './components/Toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
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
            <Route path="/" element={<><Navbar /><Home /><Footer /></>} />
            <Route path="/jobs" element={<><Navbar /><Home /><Footer /></>} />
            <Route path="/jobs/:id" element={<><Navbar /><JobDetail /><Footer /></>} />

            {/* Employer routes */}
            <Route path="/employer/dashboard" element={<ProtectedRoute roles={['employer']}><Navbar /><EmployerDashboard /><Footer /></ProtectedRoute>} />
            <Route path="/employer/jobs" element={<ProtectedRoute roles={['employer']}><Navbar /><EmployerJobs /><Footer /></ProtectedRoute>} />
            <Route path="/employer/applications" element={<ProtectedRoute roles={['employer']}><Navbar /><EmployerApplications /><Footer /></ProtectedRoute>} />
            <Route path="/employer/interviews" element={<ProtectedRoute roles={['employer']}><Navbar /><EmployerInterviews /><Footer /></ProtectedRoute>} />
            <Route path="/employer/reports" element={<ProtectedRoute roles={['employer']}><Navbar /><EmployerReports /><Footer /></ProtectedRoute>} />

            {/* Candidate routes */}
            <Route path="/candidate/applications" element={<ProtectedRoute roles={['candidate']}><Navbar /><CandidateApplications /><Footer /></ProtectedRoute>} />
            <Route path="/candidate/interviews" element={<ProtectedRoute roles={['candidate']}><Navbar /><CandidateInterviews /><Footer /></ProtectedRoute>} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
