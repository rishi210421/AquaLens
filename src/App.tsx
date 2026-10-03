import React, { useState, useEffect } from 'react';
import { NavRoute, Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { Footer } from './components/layout/Footer';
import { ObservationModal } from './components/observations/ObservationModal';
import { HomeView } from './components/views/HomeView';
import { DashboardView } from './components/views/DashboardView';
import { MapView } from './components/views/MapView';
import { SitesView } from './components/views/SitesView';
import { SiteDetailView } from './components/views/SiteDetailView';
import { CompareView } from './components/views/CompareView';
import { ObservationsView } from './components/views/ObservationsView';
import { InsightsView } from './components/views/InsightsView';
import { AskView } from './components/views/AskView';
import { ReportsView } from './components/views/ReportsView';
import { MethodologyView } from './components/views/MethodologyView';
import { AdminView } from './components/views/AdminView';
import { LoginView } from './components/views/LoginView';
import { AuthProvider, useAuth } from './context/AuthContext';

import {
  getSites,
  getCities,
  getStreams,
  getObservations,
} from './lib/data/dataLayer';
import { MonitoringSite, CitizenObservation } from './types';

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [currentRoute, setCurrentRoute] = useState<NavRoute>('home');
  const [previousRoute, setPreviousRoute] = useState<NavRoute>('home');
  const [pendingAction, setPendingAction] = useState<'add-observation' | 'admin' | null>(null);
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);
  const [isObsModalOpen, setIsObsModalOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // App data state
  const [sites, setSites] = useState<MonitoringSite[]>(() => getSites());
  const [observations, setObservations] = useState<CitizenObservation[]>(() => getObservations());
  const cities = getCities();
  const streams = getStreams();

  // Selected site object
  const selectedSite = selectedSiteId
    ? sites.find((s) => s.id === selectedSiteId) || sites[0]
    : sites[0];

  // If user logs out while on protected route, redirect to dashboard
  useEffect(() => {
    if (!isAuthenticated && currentRoute === 'admin') {
      setCurrentRoute('dashboard');
    }
  }, [isAuthenticated, currentRoute]);

  // Sync state if an observation is added
  const handleObservationAdded = (_newObs: CitizenObservation) => {
    setSites(getSites());
    setObservations(getObservations());
  };

  const handleSelectSite = (site: MonitoringSite) => {
    setSelectedSiteId(site.id);
  };

  const handleViewSite = (siteId: string) => {
    setSelectedSiteId(siteId);
    setCurrentRoute('sites');
  };

  // Protected trigger for adding observations
  const handleTriggerAddObservation = () => {
    if (!isAuthenticated) {
      setPendingAction('add-observation');
      setPreviousRoute(currentRoute !== 'login' ? currentRoute : 'home');
      setCurrentRoute('login');
    } else {
      setIsObsModalOpen(true);
    }
  };

  // Navigation handler with protection for admin route
  const handleNavigate = (route: NavRoute) => {
    if (route === 'admin' && !isAuthenticated) {
      setPendingAction('admin');
      setPreviousRoute(currentRoute !== 'login' ? currentRoute : 'home');
      setCurrentRoute('login');
      return;
    }

    if (route === 'sites') {
      setSelectedSiteId(null);
    }
    if (route !== 'login') {
      setPreviousRoute(route);
    }
    setCurrentRoute(route);
  };

  // Login success redirection handler
  const handleLoginSuccess = () => {
    if (pendingAction === 'add-observation') {
      setPendingAction(null);
      setCurrentRoute(previousRoute !== 'login' ? previousRoute : 'observations');
      setIsObsModalOpen(true);
    } else if (pendingAction === 'admin') {
      setPendingAction(null);
      setCurrentRoute('admin');
    } else {
      setCurrentRoute(previousRoute !== 'login' ? previousRoute : 'dashboard');
    }
  };

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentRoute, selectedSiteId]);

  // Synchronize browser tab / page title
  useEffect(() => {
    const routeTitles: Record<NavRoute, string> = {
      home: 'AquaLens — One Health Stream Intelligence',
      dashboard: 'AquaLens — Dashboard',
      map: 'AquaLens — Map',
      sites: 'AquaLens — Sites',
      compare: 'AquaLens — Compare',
      observations: 'AquaLens — Observations',
      insights: 'AquaLens — Insights',
      ask: 'AquaLens — Ask AquaLens',
      reports: 'AquaLens — Reports',
      methodology: 'AquaLens — Methodology',
      admin: 'AquaLens — Data Upload / CSV Admin',
      login: 'AquaLens — Login',
    };
    document.title = routeTitles[currentRoute] || 'AquaLens';
  }, [currentRoute]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900">
      {/* Header */}
      <Navbar
        currentRoute={currentRoute}
        onRouteChange={handleNavigate}
        onOpenAddObservation={handleTriggerAddObservation}
        onToggleMobileMenu={() => setIsMobileDrawerOpen(!isMobileDrawerOpen)}
      />

      {/* Main Layout: Left Sidebar + Content Area */}
      <div className="flex-1 flex w-full">
        {/* Permanent Left Sidebar on desktop, responsive drawer on mobile */}
        <Sidebar
          currentRoute={currentRoute}
          onRouteChange={handleNavigate}
          isOpenMobile={isMobileDrawerOpen}
          onCloseMobile={() => setIsMobileDrawerOpen(false)}
        />

        {/* Content Area occupying space to the right of the sidebar */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {currentRoute === 'home' && (
              <HomeView
                onRouteChange={handleNavigate}
                featuredSites={sites}
                onSelectSite={handleSelectSite}
              />
            )}

            {currentRoute === 'dashboard' && (
              <DashboardView
                sites={sites}
                cities={cities}
                streams={streams}
                observations={observations}
                onSelectSite={(site) => {
                  handleSelectSite(site);
                  setCurrentRoute('sites');
                }}
                onRouteChange={handleNavigate}
              />
            )}

            {currentRoute === 'map' && (
              <MapView
                sites={sites}
                selectedSite={selectedSite}
                onSelectSite={(site) => {
                  handleSelectSite(site);
                }}
                onRouteChange={handleNavigate}
              />
            )}

            {currentRoute === 'sites' && (
              selectedSiteId ? (
                <SiteDetailView
                  site={selectedSite}
                  allSites={sites}
                  onBack={() => setSelectedSiteId(null)}
                  onRouteChange={handleNavigate}
                  onOpenAddObservation={handleTriggerAddObservation}
                />
              ) : (
                <SitesView
                  sites={sites}
                  selectedSite={selectedSite}
                  onSelectSite={(site) => {
                    handleSelectSite(site);
                  }}
                  onRouteChange={handleNavigate}
                />
              )
            )}

            {currentRoute === 'compare' && (
              <CompareView
                sites={sites}
                onRouteChange={handleNavigate}
                onSelectSite={(site) => {
                  handleSelectSite(site);
                  setCurrentRoute('sites');
                }}
              />
            )}

            {currentRoute === 'observations' && (
              <ObservationsView
                observations={observations}
                sites={sites}
                onOpenAddObservation={handleTriggerAddObservation}
                onSelectSite={handleSelectSite}
                onViewSite={handleViewSite}
              />
            )}

            {currentRoute === 'insights' && (
              <InsightsView
                sites={sites}
                onSelectSite={(site) => {
                  handleSelectSite(site);
                  setCurrentRoute('sites');
                }}
                onRouteChange={handleNavigate}
              />
            )}

            {currentRoute === 'ask' && (
              <AskView
                sites={sites}
                onSelectSite={handleSelectSite}
                onViewSite={handleViewSite}
              />
            )}

            {currentRoute === 'reports' && (
              <ReportsView sites={sites} cities={cities} />
            )}

            {currentRoute === 'methodology' && <MethodologyView />}

            {currentRoute === 'admin' && (
              <AdminView sites={sites} />
            )}

            {currentRoute === 'login' && (
              <LoginView
                onSuccess={handleLoginSuccess}
                onCancel={() => handleNavigate(previousRoute !== 'login' ? previousRoute : 'home')}
                intendedActionLabel={
                  pendingAction === 'add-observation'
                    ? 'Log Stream Observation'
                    : pendingAction === 'admin'
                    ? 'Data Upload / CSV Admin'
                    : undefined
                }
                onRouteChange={handleNavigate}
              />
            )}
          </main>

          {/* Quiet Global Footer */}
          <Footer onRouteChange={handleNavigate} />
        </div>
      </div>

      {/* Global Citizen Science Observation Modal */}
      <ObservationModal
        isOpen={isObsModalOpen}
        onClose={() => setIsObsModalOpen(false)}
        sites={sites}
        onObservationAdded={handleObservationAdded}
        defaultSiteId={selectedSite?.id}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
