import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Sparkles, LogIn, UserPlus, LogOut, UserCheck } from 'lucide-react';
import useAgentStore from '../store/useAgentStore';
import AuthModal from './AuthModal';

const allNavLinks = [
  { name: 'Home', path: '/' },
  { name: 'Upload', path: '/upload', protected: true },
  { name: 'Dashboard', path: '/dashboard', protected: true },
  { name: 'Resume Builder', path: '/resume-builder', protected: true },
  { name: 'Roadmap', path: '/roadmap', protected: true },
  { name: 'Jobs', path: '/jobs', protected: true },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  
  const user = useAgentStore((s) => s.user);
  const logout = useAgentStore((s) => s.logout);
  const openAuthModal = useAgentStore((s) => s.openAuthModal);
  const initAuth = useAgentStore((s) => s.initAuth);

  useEffect(() => {
    initAuth();
  }, []);

  // Filter links based on login status: if not logged in, only show Home
  const visibleNavLinks = allNavLinks.filter(link => !link.protected || user);

  return (
    <>
      <nav className="fixed top-0 w-full z-50 pt-4 pb-4 bg-[#F3F0EE] border-b border-black/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center">
          <div className="nav-pill-container w-full lg:w-auto px-4 sm:px-10 py-3 flex items-center justify-between lg:justify-center gap-12">
            
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-full bg-[#141413] flex items-center justify-center transition-colors">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-[#141413] font-bold text-xl tracking-tight leading-none">
                ResumeAgent
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-8">
              {visibleNavLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`nav-link transition-colors ${
                      isActive
                        ? 'text-[#141413]'
                        : 'text-[#696969] hover:text-[#141413]'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>

            {/* Auth Buttons / User Profile */}
            <div className="hidden lg:flex items-center gap-3">
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F3F0EE] text-[#141413] text-sm font-medium border border-[#D1CDC7]">
                    <UserCheck className="w-4 h-4 text-success" />
                    <span className="max-w-[140px] truncate">{user.name || user.email}</span>
                  </div>
                  <button
                    onClick={logout}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm font-semibold text-[#696969] hover:text-danger hover:bg-danger/10 rounded-lg transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => openAuthModal('login')}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-[#141413] hover:text-[#696969] transition-colors cursor-pointer"
                  >
                    <LogIn className="w-4 h-4" />
                    Login
                  </button>
                  <button
                    onClick={() => openAuthModal('signup')}
                    className="btn-ink"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className="lg:hidden p-2 text-[#141413] cursor-pointer"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="lg:hidden absolute top-full left-4 right-4 mt-2 bg-white rounded-3xl p-6 shadow-2xl border border-black/5 animate-fade-in">
            <div className="space-y-4">
              {visibleNavLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileOpen(false)}
                    className={`block text-lg font-medium transition-colors ${
                      isActive
                        ? 'text-[#141413]'
                        : 'text-[#696969]'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
              
              <div className="pt-6 mt-4 border-t border-black/5 flex flex-col gap-3">
                {user ? (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#696969] font-medium truncate">{user.name || user.email}</span>
                    </div>
                    <button
                      onClick={() => { logout(); setMobileOpen(false); }}
                      className="w-full btn-outline border-danger text-danger hover:bg-danger hover:text-white"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => { openAuthModal('login'); setMobileOpen(false); }}
                      className="w-full btn-outline"
                    >
                      Login
                    </button>
                    <button
                      onClick={() => { openAuthModal('signup'); setMobileOpen(false); }}
                      className="w-full btn-ink"
                    >
                      Sign Up
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Auth Modal */}
      <AuthModal />
    </>
  );
}
