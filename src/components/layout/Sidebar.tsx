import React from 'react';
import {
  Activity,
  Compass,
  Layers,
  ArrowLeftRight,
  Eye,
  Sparkles,
  Search,
  FileText,
  BookOpen,
  UploadCloud,
  X,
} from 'lucide-react';
import { NavRoute } from './Navbar';
import { AquaLensLogo } from '../common/AquaLensLogo';

interface SidebarProps {
  currentRoute: NavRoute;
  onRouteChange: (route: NavRoute) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRoute,
  onRouteChange,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  // Primary navigation items (exact order and exact labels)
  const primaryNavItems: { id: NavRoute; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <Activity className="w-4 h-4" /> },
    { id: 'map', label: 'Map', icon: <Compass className="w-4 h-4" /> },
    { id: 'sites', label: 'Sites', icon: <Layers className="w-4 h-4" /> },
    { id: 'compare', label: 'Compare', icon: <ArrowLeftRight className="w-4 h-4" /> },
    { id: 'observations', label: 'Observations', icon: <Eye className="w-4 h-4" /> },
    { id: 'insights', label: 'Insights', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'ask', label: 'Ask AquaLens', icon: <Search className="w-4 h-4" /> },
    { id: 'reports', label: 'Reports', icon: <FileText className="w-4 h-4" /> },
    { id: 'methodology', label: 'Methodology', icon: <BookOpen className="w-4 h-4" /> },
  ];

  // Secondary navigation items (exact order and exact labels)
  const secondaryNavItems: { id: NavRoute; label: string; icon: React.ReactNode }[] = [
    { id: 'admin', label: 'Data Upload / CSV Admin', icon: <UploadCloud className="w-4 h-4" /> },
  ];

  const handleItemClick = (route: NavRoute) => {
    onRouteChange(route);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const navContent = (
    <div className="flex flex-col h-full justify-between">
      <div className="space-y-6">
        {/* Primary Navigation */}
        <div className="space-y-1">
          <div className="px-3 pb-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Navigation
          </div>
          {primaryNavItems.map((item) => {
            const isActive = currentRoute === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer text-left ${
                  isActive
                    ? 'bg-teal-50 text-teal-800 font-semibold border-l-2 border-teal-600'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'
                }`}
              >
                <span className={`shrink-0 ${isActive ? 'text-teal-700' : 'text-slate-400'}`}>
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Visual Divider */}
        <div className="border-t border-slate-200 mx-2" />

        {/* Secondary Navigation */}
        <div className="space-y-1">
          <div className="px-3 pb-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Platform & Data
          </div>
          {secondaryNavItems.map((item) => {
            const isActive = currentRoute === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer text-left ${
                  isActive
                    ? 'bg-teal-50 text-teal-800 font-semibold border-l-2 border-teal-600'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'
                }`}
              >
                <span className={`shrink-0 ${isActive ? 'text-teal-700' : 'text-slate-400'}`}>
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sidebar Footer Info */}
      <div className="pt-4 border-t border-slate-100 px-3 text-[11px] text-slate-400 font-mono">
        <div>OneAquaHealth 2026</div>
      </div>
    </div>
  );

  return (
    <>
      {/* Permanent Desktop Sidebar */}
      <aside className="hidden sm:block w-60 lg:w-64 shrink-0 bg-white border-r border-slate-200 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto py-5 px-3 z-20">
        {navContent}
      </aside>

      {/* Mobile Drawer (Only visible on small phone screens < 640px) */}
      {isOpenMobile && (
        <div className="sm:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
            aria-hidden="true"
          />

          {/* Drawer content */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white border-r border-slate-200 py-5 px-4 shadow-xl z-10 animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between pb-4 mb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <AquaLensLogo className="w-5 h-5 shrink-0" />
                <span className="text-sm font-bold text-slate-900">AquaLens Navigation</span>
              </div>
              <button
                onClick={onCloseMobile}
                className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                aria-label="Close navigation sidebar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {navContent}
          </div>
        </div>
      )}
    </>
  );
};
