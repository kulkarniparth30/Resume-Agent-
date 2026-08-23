import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Lock, Sparkles } from 'lucide-react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Upload from './pages/Upload';
import Dashboard from './pages/Dashboard';
import ResumeBuilder from './pages/ResumeBuilder';
import Roadmap from './pages/Roadmap';
import JobFinder from './pages/JobFinder';
import useAgentStore from './store/useAgentStore';

function ProtectedRoute({ children }) {
  const user = useAgentStore((s) => s.user);
  const openAuthModal = useAgentStore((s) => s.openAuthModal);

  if (!user) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 text-center animate-fade-in">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 text-primary">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-dark mb-2">Sign In Required</h2>
        <p className="text-text-secondary max-w-md mb-6 text-sm">
          Please log in or create a free account to access resume analysis, tailored recommendations, and the AI Resume Builder.
        </p>
        <button
          onClick={() => openAuthModal('signup')}
          className="flex items-center gap-2 px-6 py-3 bg-[#1E40AF] hover:bg-[#1D4ED8] text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-white" />
          Sign In / Create Account
        </button>
      </div>
    );
  }

  return children;
}

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 w-full max-w-[100vw] pt-32">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/resume-builder" element={<ProtectedRoute><ResumeBuilder /></ProtectedRoute>} />
            <Route path="/roadmap" element={<ProtectedRoute><Roadmap /></ProtectedRoute>} />
            <Route path="/jobs" element={<ProtectedRoute><JobFinder /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
