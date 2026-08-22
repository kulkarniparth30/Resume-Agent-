import { useState } from 'react';
import { X, Loader2, Sparkles, Mail, Lock, User, CheckCircle2, AlertCircle } from 'lucide-react';
import useAgentStore from '../store/useAgentStore';
import { login, register } from '../api/auth';

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
  </svg>
);

const MicrosoftIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 23 23">
    <path fill="#f35325" d="M1 1h10v10H1z"/>
    <path fill="#81bc06" d="M12 1h10v10H12z"/>
    <path fill="#05a6f0" d="M1 12h10v10H1z"/>
    <path fill="#ffba08" d="M12 12h10v10H12z"/>
  </svg>
);

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
  const [oauthLoading, setOauthLoading] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleOAuth = (provider) => {
    setOauthLoading(provider);
    setError('');
    
    // Supabase standard OAuth authorization redirect URL
    const supabaseUrl = 'https://wtdujcmiipeoohpitznu.supabase.co';
    const redirectUrl = window.location.origin;
    const authEndpoint = `${supabaseUrl}/auth/v1/authorize?provider=${provider}&redirect_to=${encodeURIComponent(redirectUrl)}`;
    
    // Redirect user to OAuth provider
    window.location.href = authEndpoint;
  };

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-dark/60 backdrop-blur-sm" onClick={closeAuthModal} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl border border-border w-full max-w-md overflow-hidden animate-fade-in z-10">
        
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
          
          {/* Social OAuth Providers */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleOAuth('google')}
              disabled={Boolean(oauthLoading)}
              className="flex items-center justify-center gap-2.5 py-2.5 px-3 border border-border rounded-xl hover:bg-surface-alt transition-colors text-xs font-semibold text-dark cursor-pointer disabled:opacity-50"
            >
              {oauthLoading === 'google' ? <Loader2 className="w-4 h-4 animate-spin" /> : <GoogleIcon />}
              Google
            </button>
            <button
              type="button"
              onClick={() => handleOAuth('azure')}
              disabled={Boolean(oauthLoading)}
              className="flex items-center justify-center gap-2.5 py-2.5 px-3 border border-border rounded-xl hover:bg-surface-alt transition-colors text-xs font-semibold text-dark cursor-pointer disabled:opacity-50"
            >
              {oauthLoading === 'azure' ? <Loader2 className="w-4 h-4 animate-spin" /> : <MicrosoftIcon />}
              Microsoft
            </button>
          </div>

          <div className="flex items-center gap-3 my-2">
            <div className="flex-1 h-px bg-border"></div>
            <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">or with email</span>
            <div className="flex-1 h-px bg-border"></div>
          </div>

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
              className="w-full py-3 bg-primary hover:bg-primary-light text-white font-semibold rounded-xl transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : tab === 'signup' ? (
                'Create Account'
              ) : (
                'Sign In'
              )}
            </button>

            <p className="text-center text-xs text-text-muted pt-1">
              Your analysis history and custom roadmaps will be stored securely in your private cloud account.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
