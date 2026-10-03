import React from 'react';
import { NavRoute } from './Navbar';
import { AquaLensLogo } from '../common/AquaLensLogo';

interface FooterProps {
  onRouteChange: (route: NavRoute) => void;
}

export const Footer: React.FC<FooterProps> = ({ onRouteChange }) => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand & Tagline */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <AquaLensLogo className="w-6 h-6 shrink-0" />
              <span className="text-base font-bold text-white tracking-tight">AquaLens</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[13px]">
              From stream data to actionable One Health intelligence. Transforming citizen observations
              and environmental indicators into confidence-aware ecosystem intelligence.
            </p>
            <div className="text-[11px] text-teal-400 font-mono">
              Data-to-Insight Platform
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div className="space-y-2">
            <div className="text-slate-200 font-semibold uppercase tracking-wider text-[11px]">
              Platform Navigation
            </div>
            <ul className="space-y-1.5">
              <li>
                <button
                  onClick={() => onRouteChange('dashboard')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Stream Health Dashboard
                </button>
              </li>
              <li>
                <button
                  onClick={() => onRouteChange('map')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Geospatial Reach Map
                </button>
              </li>
              <li>
                <button
                  onClick={() => onRouteChange('sites')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Monitoring Sites Directory
                </button>
              </li>
              <li>
                <button
                  onClick={() => onRouteChange('compare')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Multi-Site Comparison
                </button>
              </li>
              <li>
                <button
                  onClick={() => onRouteChange('observations')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Citizen Science Feed
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Intelligence & Methodology */}
          <div className="space-y-2">
            <div className="text-slate-200 font-semibold uppercase tracking-wider text-[11px]">
              Science & Research
            </div>
            <ul className="space-y-1.5">
              <li>
                <button
                  onClick={() => onRouteChange('insights')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Automated Insight Engine
                </button>
              </li>
              <li>
                <button
                  onClick={() => onRouteChange('ask')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Ask AquaLens Q&A
                </button>
              </li>
              <li>
                <button
                  onClick={() => onRouteChange('reports')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Executive Reach Reports
                </button>
              </li>
              <li>
                <button
                  onClick={() => onRouteChange('methodology')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Indicator Weighting & Math
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Synthetic Data Notice & Disclaimer */}
          <div className="space-y-2 text-[11px] leading-relaxed text-slate-400">
            <div className="text-slate-200 font-semibold uppercase tracking-wider">
              Synthetic Data Disclosure
            </div>
            <p>
              AquaLens prototype uses simulated environmental time series. Telemetry and citizen reports are calibrated
              against European freshwater benchmarks.
            </p>
            <p className="text-slate-400">
              Not intended for clinical medical diagnoses. Environmental indicators reflect ecosystem condition.
            </p>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <div>
            © 2026 AquaLens
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => onRouteChange('methodology')} className="hover:text-slate-200">
              Methodology
            </button>
            <span>·</span>
            <button onClick={() => onRouteChange('admin')} className="hover:text-slate-200">
              Data Management
            </button>
            <span>·</span>
            <span className="font-mono text-teal-400">v1.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
