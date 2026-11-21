'use client';

import React from 'react';
import { Home, Stethoscope, FlaskConical, Satellite, Menu } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export type ActiveTab =
  | 'dashboard'
  | 'cropDoctor'
  | 'soilHealth'
  | 'fieldMonitor'
  | 'cropCalendar'
  | 'weather'
  | 'mandiPrices'
  | 'expertHelp'
  | 'schemes'
  | 'community'
  | 'myFarm';

interface BottomNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenMenuDrawer: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab, onOpenMenuDrawer }) => {
  const { t } = useLanguage();

  const navItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: t('nav.dashboard', 'Home'),
      icon: Home,
    },
    {
      id: 'cropDoctor' as ActiveTab,
      label: t('nav.cropDoctor', 'Crop Doctor'),
      icon: Stethoscope,
      badge: 'AI',
    },
    {
      id: 'soilHealth' as ActiveTab,
      label: t('nav.soilHealth', 'Soil Health'),
      icon: FlaskConical,
      badge: 'Core',
    },
    {
      id: 'fieldMonitor' as ActiveTab,
      label: t('nav.fieldMonitor', 'Satellite'),
      icon: Satellite,
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-nutri-cardBorder shadow-2xl safe-area-pb">
      <div className="grid grid-cols-5 h-[62px] px-1 items-stretch">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center min-h-[48px] py-1 px-1 transition relative ${
                isActive
                  ? 'text-nutri-primary font-bold'
                  : 'text-gray-500 hover:text-nutri-primary'
              }`}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              {item.badge && (
                <span className="absolute top-1 right-2 bg-emerald-600 text-[9px] font-extrabold text-white px-1 rounded-full uppercase">
                  {item.badge}
                </span>
              )}
              <div
                className={`p-1 rounded-xl transition ${
                  isActive ? 'bg-emerald-100/80 scale-105' : ''
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-nutri-primary stroke-[2.4]' : 'stroke-[1.8]'}`} />
              </div>
              <span className={`text-[10px] leading-tight truncate w-full text-center ${isActive ? 'font-bold text-nutri-primary' : 'font-medium'}`}>
                {item.label}
              </span>
              {isActive && (
                <span className="w-6 h-0.5 bg-nutri-primary rounded-full mt-0.5"></span>
              )}
            </button>
          );
        })}

        {/* Menu / Drawer Toggle */}
        <button
          onClick={onOpenMenuDrawer}
          className="flex flex-col items-center justify-center min-h-[48px] py-1 px-1 text-gray-500 hover:text-nutri-primary transition"
          aria-label={t('nav.menu', 'Menu')}
        >
          <div className="p-1 rounded-xl">
            <Menu className="w-5 h-5 stroke-[1.8]" />
          </div>
          <span className="text-[10px] leading-tight truncate w-full text-center font-medium">
            {t('nav.menu', 'Menu')}
          </span>
        </button>
      </div>
    </nav>
  );
};
