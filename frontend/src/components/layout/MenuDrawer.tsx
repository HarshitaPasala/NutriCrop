'use client';

import React from 'react';
import {
  X,
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
  PhoneCall,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { ActiveTab } from './BottomNav';

interface MenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export const MenuDrawer: React.FC<MenuDrawerProps> = ({ isOpen, onClose, activeTab, setActiveTab }) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  const menuItems = [
    { id: 'dashboard' as ActiveTab, label: t('nav.dashboard', 'Home'), icon: Home },
    { id: 'cropDoctor' as ActiveTab, label: t('nav.cropDoctor', 'Crop Doctor'), icon: Stethoscope, badge: 'AI' },
    { id: 'soilHealth' as ActiveTab, label: t('nav.soilHealth', 'Soil Health'), icon: FlaskConical, badge: 'Core' },
    { id: 'fieldMonitor' as ActiveTab, label: t('nav.fieldMonitor', 'Field Monitor (NDVI)'), icon: Satellite },
    { id: 'cropCalendar' as ActiveTab, label: t('nav.cropCalendar', 'Crop Calendar'), icon: Calendar },
    { id: 'weather' as ActiveTab, label: t('nav.weather', 'Weather & Spraying'), icon: CloudSun },
    { id: 'mandiPrices' as ActiveTab, label: t('nav.mandiPrices', 'Live Mandi Prices'), icon: TrendingUp },
    { id: 'expertHelp' as ActiveTab, label: t('nav.expertHelp', 'Expert & KVK Assistance'), icon: Headphones },
    { id: 'schemes' as ActiveTab, label: t('nav.schemes', 'Government Schemes'), icon: Award },
    { id: 'community' as ActiveTab, label: t('nav.community', 'Farmer Community'), icon: Users },
    { id: 'myFarm' as ActiveTab, label: t('nav.myFarm', 'My Farm Long-Term Platform'), icon: Sprout },
  ];

  const handleSelect = (id: ActiveTab) => {
    setActiveTab(id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 md:hidden flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-4/5 max-w-sm bg-white h-full shadow-2xl flex flex-col z-10 overflow-y-auto p-5">
        <div className="flex items-center justify-between pb-4 border-b border-nutri-cardBorder">
          <div>
            <span className="text-base font-black text-nutri-primary block">NutriCrop Menu</span>
            <span className="text-[11px] text-nutri-muted font-semibold">{t('nav.menuSubtitle', 'All Farming Tools & Services')}</span>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"
            aria-label={t('common.close', 'Close')}
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <nav className="py-3 space-y-1.5 flex-1" aria-label="Mobile Menu Navigation">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isCurrent = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between p-3 rounded-2xl text-sm font-semibold transition min-h-touch ${
                  isCurrent
                    ? 'bg-nutri-primary text-white shadow-sm'
                    : 'text-gray-700 hover:bg-nutri-bg'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-xl ${
                      isCurrent ? 'bg-white/10 text-white' : 'bg-emerald-50 text-nutri-primary'
                    }`}
                  >
                    <Icon className="w-4 h-4 stroke-[2]" />
                  </div>
                  <span className="text-sm font-bold text-left">{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.badge && (
                    <span
                      className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                        isCurrent
                          ? 'bg-emerald-500 text-white'
                          : 'bg-emerald-100 text-nutri-primary'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  <ChevronRight className={`w-4 h-4 ${isCurrent ? 'text-white' : 'text-gray-400'}`} />
                </div>
              </button>
            );
          })}
        </nav>

        {/* Emergency Kisan Call Center Call Out */}
        <div className="pt-4 border-t border-nutri-cardBorder space-y-2">
          <a
            href="tel:18001801551"
            className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-emerald-50 text-nutri-primary border border-emerald-200 font-bold text-xs"
          >
            <PhoneCall className="w-4 h-4 text-emerald-600" />
            <span>{t('header.kisanHelpline', 'Kisan Helpline: 1800-180-1551')}</span>
          </a>
        </div>
      </div>
    </div>
  );
};
