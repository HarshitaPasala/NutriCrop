'use client';

import React from 'react';
import {
  Home,
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
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { ActiveTab } from './BottomNav';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { t } = useLanguage();

  const navigationItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: t('nav.dashboard', 'Dashboard'),
      icon: Home,
      highlight: false,
    },
    {
      id: 'cropDoctor' as ActiveTab,
      label: t('nav.cropDoctor', 'Crop Doctor'),
      icon: Stethoscope,
      highlight: true,
      badge: 'AI Vision',
    },
    {
      id: 'soilHealth' as ActiveTab,
      label: t('nav.soilHealth', 'Soil Health'),
      icon: FlaskConical,
      highlight: true,
      badge: 'Core Engine',
    },
    {
      id: 'fieldMonitor' as ActiveTab,
      label: t('nav.fieldMonitor', 'Field Monitor (NDVI)'),
      icon: Satellite,
      highlight: true,
      badge: 'Sentinel-2',
    },
    {
      id: 'cropCalendar' as ActiveTab,
      label: t('nav.cropCalendar', 'Crop Calendar'),
      icon: Calendar,
      highlight: false,
    },
    {
      id: 'weather' as ActiveTab,
      label: t('nav.weather', 'Weather & Spray'),
      icon: CloudSun,
      highlight: false,
    },
    {
      id: 'mandiPrices' as ActiveTab,
      label: t('nav.mandiPrices', 'Live Mandi Prices'),
      icon: TrendingUp,
      highlight: false,
    },
    {
      id: 'expertHelp' as ActiveTab,
      label: t('nav.expertHelp', 'Expert & KVK Help'),
      icon: Headphones,
      highlight: false,
    },
    {
      id: 'schemes' as ActiveTab,
      label: t('nav.schemes', 'Govt Schemes'),
      icon: Award,
      highlight: false,
    },
    {
      id: 'community' as ActiveTab,
      label: t('nav.community', 'Farmer Community'),
      icon: Users,
      highlight: false,
    },
    {
      id: 'myFarm' as ActiveTab,
      label: t('nav.myFarm', 'My Farm Platform'),
      icon: Sprout,
      highlight: false,
    },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 lg:w-72 bg-white border-r border-nutri-cardBorder shrink-0 min-h-[calc(100vh-65px)] p-4">
      <div className="mb-4 px-2">
        <span className="text-[11px] font-bold text-nutri-muted uppercase tracking-wider">
          {t('dashboard.quickActions', 'Key Farming Services')}
        </span>
      </div>

      <nav className="flex-1 space-y-1.5" aria-label="Main Navigation">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition min-h-touch ${
                isActive
                  ? 'bg-nutri-primary text-white shadow-md'
                  : 'text-gray-700 hover:bg-nutri-bg hover:text-nutri-primary'
              }`}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-1.5 rounded-lg ${
                    isActive
                      ? 'bg-white/10 text-white'
                      : item.highlight
                      ? 'bg-emerald-100 text-nutri-primary'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <Icon className="w-4 h-4 stroke-[2]" />
                </div>
                <span className="text-sm truncate">{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-emerald-500 text-white'
                      : 'bg-emerald-100 text-nutri-primary'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Advisory & Support Trust Badge */}
      <div className="mt-6 p-3.5 rounded-2xl bg-nutri-bg border border-nutri-cardBorder text-xs text-nutri-muted space-y-2">
        <div className="flex items-center gap-1.5 font-bold text-nutri-primary">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>{t('nav.icarAligned', 'ICAR & KVK Aligned')}</span>
        </div>
        <p className="text-[11px] leading-relaxed">
          {t('nav.icarAlignedDesc', 'Recommendations strictly follow Indian Council of Agricultural Research guidelines.')}
        </p>
      </div>
    </aside>
  );
};
