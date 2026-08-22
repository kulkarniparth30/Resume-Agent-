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
      <nav className="bg-dark sticky top-0 z-40 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center group-hover:bg-primary-light transition-colors">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-white font-bold text-xl tracking-tight">
                Resume<span className="text-primary-light">Agent</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {visibleNavLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-primary text-white shadow-lg shadow-primary/25'
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>

            {/* Auth Buttons / User Profile */}
            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 text-white text-xs font-medium border border-white/15">
                    <UserCheck className="w-3.5 h-3.5 text-success" />
                    <span className="max-w-[140px] truncate">{user.name || user.email}</span>
                  </div>
                  <button
                    onClick={logout}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-gray-300 hover:text-danger hover:bg-danger/10 rounded-lg transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Logout
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => openAuthModal('login')}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors cursor-pointer"
                  >
                    <LogIn className="w-4 h-4" />
                    Login
                  </button>
                  <button
                    onClick={() => openAuthModal('signup')}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-primary hover:bg-primary-light text-white rounded-lg transition-colors cursor-pointer shadow-sm shadow-primary/20"
                  >
                    <UserPlus className="w-4 h-4" />
                    Sign Up
                  </button>
                </>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-2 text-gray-300 hover:text-white cursor-pointer"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden bg-dark-light border-t border-white/10 animate-fade-in">
            <div className="px-4 py-3 space-y-1">
              {visibleNavLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileOpen(false)}
                    className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary text-white'
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
              
              <div className="pt-3 border-t border-white/10">
                {user ? (
                  <div className="flex items-center justify-between py-2">
                    <span className="text-xs text-gray-300 font-medium truncate">{user.name || user.email}</span>
                    <button
                      onClick={() => { logout(); setMobileOpen(false); }}
                      className="text-xs font-semibold text-danger px-3 py-1 bg-danger/10 rounded-lg"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => { openAuthModal('login'); setMobileOpen(false); }}
                      className="flex-1 py-2.5 text-sm font-medium text-gray-300 hover:text-white transition-colors rounded-lg border border-white/20 cursor-pointer"
                    >
                      Login
                    </button>
                    <button
                      onClick={() => { openAuthModal('signup'); setMobileOpen(false); }}
                      className="flex-1 py-2.5 text-sm font-medium bg-primary text-white rounded-lg cursor-pointer"
                    >
                      Sign Up
                    </button>
                  </div>
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
