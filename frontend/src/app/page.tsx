'use client';

import React, { useState } from 'react';
import {
  Stethoscope,
  FlaskConical,
  Satellite,
  Calendar,
  CloudSun,
  TrendingUp,
  Headphones,
  Award,
  Users,
  Sprout,
  Info,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { BottomNav, ActiveTab } from '@/components/layout/BottomNav';
import { Sidebar } from '@/components/layout/Sidebar';
import { MenuDrawer } from '@/components/layout/MenuDrawer';
import { LocationModal } from '@/components/layout/LocationModal';
import { FarmerGreeting } from '@/components/dashboard/FarmerGreeting';
import { WeatherCard } from '@/components/dashboard/WeatherCard';
import { ServiceShortcuts } from '@/components/dashboard/ServiceShortcuts';
import { DashboardMetrics } from '@/components/dashboard/DashboardMetrics';
import { OtpLoginModal } from '@/components/auth/OtpLoginModal';
import { VoiceAssistantModal } from '@/components/voice/VoiceAssistantModal';
import { GenericPagePlaceholder } from '@/components/pages/GenericPagePlaceholder';
import { SoilHealthContainer } from '@/components/soil/SoilHealthContainer';
import { CropDoctorContainer } from '@/components/crop-doctor/CropDoctorContainer';
import { FieldMonitorContainer } from '@/components/field-monitor/FieldMonitorContainer';
import { CropCalendarContainer } from '@/components/crop-calendar/CropCalendarContainer';
import { WeatherForecastContainer } from '@/components/weather/WeatherForecastContainer';
import { MandiPricesContainer } from '@/components/mandi/MandiPricesContainer';
import { ExpertHelpContainer } from '@/components/expert-help/ExpertHelpContainer';
import { SchemesContainer } from '@/components/schemes/SchemesContainer';
import { CommunityContainer } from '@/components/community/CommunityContainer';
import { MyFarmContainer } from '@/components/my-farm/MyFarmContainer';
import { useLanguage } from '@/context/LanguageContext';
import { SectionErrorBoundary } from '@/components/ui/SectionErrorBoundary';

export default function Home() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isMenuDrawerOpen, setIsMenuDrawerOpen] = useState(false);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const tabParam = new URLSearchParams(window.location.search).get('tab') as ActiveTab;
      if (tabParam) {
        setActiveTab(tabParam);
      }
    }
  }, []);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-5 sm:space-y-6">
            {/* 1. Translated Farmer Greeting & Status Strip */}
            <FarmerGreeting />

            {/* 2. Reactive Area & Crop Dashboard Metrics */}
            <DashboardMetrics onNavigateTab={(tab) => setActiveTab(tab)} />

            {/* 3. Weather & Actionable Spraying Advisory Card */}
            <WeatherCard />

            {/* 3. Six Large Farming Service Shortcuts (Top 3 Prominent) */}
            <ServiceShortcuts onSelectService={(id) => setActiveTab(id)} />

            {/* Advisory Safety Disclaimer Banner */}
            <div className="rounded-2xl p-4 bg-emerald-100/60 border border-emerald-300 flex items-start gap-3 text-xs text-nutri-primary font-medium">
              <Info className="w-4 h-4 text-emerald-800 shrink-0 mt-0.5" />
              <p>
                <strong>{t('dashboard.advisoryNote', 'Advisory Note')}:</strong> {t('common.advisoryDisclaimer', 'AI & calculator recommendations are advisory. Always verify with your local KVK or Agriculture Officer before large-scale application.')}
              </p>
            </div>
          </div>
        );

      case 'cropDoctor':
        return (
          <CropDoctorContainer onBackToDashboard={() => setActiveTab('dashboard')} onOpenLibrary={() => {
            const query = new URLSearchParams(window.location.search);
            query.set('tab', 'soilHealth');
            query.set('subtab', 'library');
            window.history.replaceState({}, '', `${window.location.pathname}?${query.toString()}`);
            setActiveTab('soilHealth');
          }} />
        );

      case 'soilHealth':
        return (
          <SoilHealthContainer onBackToDashboard={() => setActiveTab('dashboard')} />
        );

      case 'fieldMonitor':
        return (
          <FieldMonitorContainer onBackToDashboard={() => setActiveTab('dashboard')} />
        );

      case 'cropCalendar':
        return (
          <CropCalendarContainer onBackToDashboard={() => setActiveTab('dashboard')} />
        );

      case 'weather':
        return (
          <WeatherForecastContainer onBackToDashboard={() => setActiveTab('dashboard')} />
        );

      case 'mandiPrices':
        return (
          <MandiPricesContainer onBackToDashboard={() => setActiveTab('dashboard')} />
        );

      case 'expertHelp':
        return (
          <ExpertHelpContainer onBackToDashboard={() => setActiveTab('dashboard')} />
        );

      case 'schemes':
        return (
          <SchemesContainer onBackToDashboard={() => setActiveTab('dashboard')} />
        );

      case 'community':
        return (
          <CommunityContainer onBackToDashboard={() => setActiveTab('dashboard')} />
        );

      case 'myFarm':
        return (
          <MyFarmContainer onBackToDashboard={() => setActiveTab('dashboard')} />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-nutri-bg">
      {/* 1. Global Header */}
      <Header onOpenLocationModal={() => setIsLocationModalOpen(true)} />

      {/* 2. Main Content Layout (Sidebar on Desktop, Content in Center) */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex">
        {/* Desktop Sidebar Navigation */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Content Area */}
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 pb-24 md:pb-8 max-w-5xl overflow-x-hidden">
          <SectionErrorBoundary
            key={activeTab}
            onReturnHome={() => setActiveTab('dashboard')}
            title={t('common.sectionErrorTitle', 'This section could not be displayed.')}
            message={t('common.sectionErrorMessage', 'Return to the dashboard and try opening it again.')}
            action={t('common.returnToDashboard', 'Return to dashboard')}
          >
            {renderActiveView()}
          </SectionErrorBoundary>
        </main>
      </div>

      {/* 3. Mobile Bottom Tab Navigation */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenMenuDrawer={() => setIsMenuDrawerOpen(true)}
      />

      {/* 4. Modals and Overlays */}
      <OtpLoginModal />
      <VoiceAssistantModal />
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
      />
      <MenuDrawer
        isOpen={isMenuDrawerOpen}
        onClose={() => setIsMenuDrawerOpen(false)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
    </div>
  );
}
