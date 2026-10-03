import React, { useState, useRef, useEffect } from 'react';
import { Menu, PlusCircle, User as UserIcon, LogOut, ChevronDown, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AquaLensLogo } from '../common/AquaLensLogo';

export type NavRoute =
  | 'home'
  | 'dashboard'
  | 'map'
  | 'sites'
  | 'compare'
  | 'observations'
  | 'insights'
  | 'ask'
  | 'reports'
  | 'methodology'
  | 'admin'
  | 'login';

interface NavbarProps {
  currentRoute: NavRoute;
  onRouteChange: (route: NavRoute) => void;
  onOpenAddObservation: () => void;
  onToggleMobileMenu?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onRouteChange,
  onOpenAddObservation,
  onToggleMobileMenu,
}) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
        {/* Brand Zone */}
        <button
          onClick={() => onRouteChange('home')}
          className="flex items-center gap-2.5 group text-left cursor-pointer focus-visible:outline-hidden"
        >
          <AquaLensLogo className="w-7 h-7 shrink-0 transition-transform group-hover:scale-105" />
          <span className="text-lg font-bold tracking-tight text-slate-900 group-hover:text-teal-700 transition-colors">
            AquaLens
          </span>
        </button>

        {/* Action Zone */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Telemetry Calibrated</span>
          </div>

          <button
            onClick={onOpenAddObservation}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-md transition-colors shadow-xs whitespace-nowrap cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add Observation</span>
          </button>

          {/* User / Account Area */}
          {isAuthenticated && user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-1.5 py-1 px-2 rounded-md hover:bg-slate-100 text-slate-700 text-xs font-medium transition-colors border border-slate-200 cursor-pointer"
                title={`Signed in as ${user.email}`}
              >
                <div className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-[10px]">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden md:inline truncate max-w-[110px] text-[11px]">{user.name}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {/* User Dropdown */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-1.5 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-1.5 text-xs z-50 animate-in fade-in duration-100">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                      Signed in as:
                    </div>
                    <div className="font-semibold text-slate-800 truncate mt-0.5" title={user.email}>
                      {user.email}
                    </div>
                    <div className="text-[10px] text-teal-700 font-medium flex items-center gap-1 mt-0.5">
                      <Shield className="w-2.5 h-2.5" />
                      <span>{user.role}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="w-full px-3 py-2 text-left text-slate-700 hover:text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors cursor-pointer text-xs mt-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => onRouteChange('login')}
              className="text-xs font-medium text-slate-700 hover:text-teal-700 px-2.5 py-1.5 rounded-md hover:bg-slate-100 transition-colors border border-slate-200 cursor-pointer flex items-center gap-1"
            >
              <UserIcon className="w-3.5 h-3.5 text-slate-500" />
              <span>Sign In</span>
            </button>
          )}

          {/* Mobile hamburger toggle (hidden on desktop) */}
          <button
            onClick={onToggleMobileMenu}
            className="sm:hidden p-1.5 text-slate-600 hover:text-slate-900 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
