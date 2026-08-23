import { useState } from 'react';
import { X, Loader2, Sparkles, Mail, Lock, User, CheckCircle2, AlertCircle } from 'lucide-react';
import useAgentStore from '../store/useAgentStore';
import { login, register } from '../api/auth';

export default function AuthModal() {
  const isOpen = useAgentStore((s) => s.authModalOpen);
  const tab = useAgentStore((s) => s.authModalTab);
  const closeAuthModal = useAgentStore((s) => s.closeAuthModal);
  const openAuthModal = useAgentStore((s) => s.openAuthModal);
  const setUser = useAgentStore((s) => s.setUser);
  const syncCloudHistory = useAgentStore((s) => s.syncCloudHistory);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (tab === 'signup') {
        const res = await register(email, password, name);
        if (res.user) {
          setUser(res.user);
          setSuccessMsg('Account created successfully!');
          syncCloudHistory();
          setTimeout(() => closeAuthModal(), 1000);
        }
      } else {
        const res = await login(email, password);
        if (res.user) {
          setUser(res.user);
          syncCloudHistory();
          closeAuthModal();
        }
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-dark/60 backdrop-blur-sm" onClick={closeAuthModal} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl border border-border w-full max-w-md overflow-hidden z-10">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface-alt">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <h3 className="font-bold text-dark text-lg">
              {tab === 'signup' ? 'Create an Account' : 'Welcome Back'}
            </h3>
          </div>
          <button
            onClick={closeAuthModal}
            className="p-2 rounded-lg hover:bg-surface text-text-muted hover:text-dark transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          <button
            type="button"
            onClick={() => { openAuthModal('login'); setError(''); setSuccessMsg(''); }}
            className={`flex-1 py-3 text-sm font-semibold transition-colors cursor-pointer ${
              tab === 'login'
                ? 'text-primary border-b-2 border-primary bg-primary/5'
                : 'text-text-secondary hover:text-dark hover:bg-surface-alt'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { openAuthModal('signup'); setError(''); setSuccessMsg(''); }}
            className={`flex-1 py-3 text-sm font-semibold transition-colors cursor-pointer ${
              tab === 'signup'
                ? 'text-primary border-b-2 border-primary bg-primary/5'
                : 'text-text-secondary hover:text-dark hover:bg-surface-alt'
            }`}
          >
            Sign Up
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-danger/10 border border-danger/20 flex items-start gap-2 text-danger text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-xl bg-success/10 border border-success/20 flex items-start gap-2 text-success text-sm">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            {tab === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex Smith"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-surface-alt focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm text-dark outline-none transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-surface-alt focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm text-dark outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-surface-alt focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm text-dark outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#1E40AF] hover:bg-[#1D4ED8] text-white font-bold rounded-xl transition-all shadow-md shadow-blue-900/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2 text-sm"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin text-white" />
              ) : tab === 'signup' ? (
                'Create Account'
              ) : (
                'Sign In'
              )}
            </button>

            <p className="text-center text-xs text-text-muted pt-1">
              Your analysis history and custom roadmaps will be stored securely in your private account.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
