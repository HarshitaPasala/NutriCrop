'use client';

import React from 'react';
import {
  Stethoscope,
  FlaskConical,
  Satellite,
  Calendar,
  TrendingUp,
  Headphones,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { ActiveTab } from '@/components/layout/BottomNav';

interface ServiceShortcutsProps {
  onSelectService: (serviceId: ActiveTab) => void;
}

export const ServiceShortcuts: React.FC<ServiceShortcutsProps> = ({ onSelectService }) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-nutri-primary">
            {t('dashboard.quickActions', 'Key Farming Services')}
          </h2>
          <p className="text-xs text-nutri-muted font-medium">
            {t('services.tapToOpen', 'Tap a service to open its tools')}
          </p>
        </div>
      </div>

      {/* Row 1: The Three Most Prominent Hero Services */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
        {/* 1. Crop Doctor (Visually Hero Prominent) */}
        <div
          onClick={() => onSelectService('cropDoctor')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onSelectService('cropDoctor')}
          className="group relative bg-gradient-to-br from-emerald-900 to-nutri-primary text-white rounded-3xl p-5 sm:p-6 shadow-md hover:shadow-xl transition-all duration-300 border-2 border-emerald-700/50 cursor-pointer flex flex-col justify-between overflow-hidden active:scale-[0.99]"
          aria-label={t('services.cropDoctor.title')}
        >
          {/* Subtle nature leaf glow background */}
          <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl group-hover:scale-125 transition-transform" />

          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-13 h-13 rounded-2xl bg-white/15 backdrop-blur-md p-3 flex items-center justify-center text-emerald-300 ring-2 ring-white/20">
                <Stethoscope className="w-7 h-7" />
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-emerald-400 text-emerald-950 shadow-sm">
                <Sparkles className="w-3 h-3" />
                {t('services.cropDoctor.badge', 'AI Doctor')}
              </span>
            </div>

            <h3 className="text-xl font-black tracking-tight mb-1.5 flex items-center gap-2">
              <span>{t('services.cropDoctor.title', 'Crop Doctor')}</span>
            </h3>
            <p className="text-emerald-100 text-xs sm:text-sm leading-relaxed mb-4">
              {t('services.cropDoctor.desc')}
            </p>
          </div>

          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs font-bold text-emerald-200 group-hover:text-white transition">
            <span className="flex items-center gap-1.5 min-h-[44px]">
              <span>{t('services.diagnoseLeafAction', 'Diagnose Leaf Photo')}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
        </div>

        {/* 2. Soil Health (Visually Hero Prominent) */}
        <div
          onClick={() => onSelectService('soilHealth')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onSelectService('soilHealth')}
          className="group relative bg-gradient-to-br from-nutri-primary to-nutri-secondary text-white rounded-3xl p-5 sm:p-6 shadow-md hover:shadow-xl transition-all duration-300 border-2 border-emerald-600/50 cursor-pointer flex flex-col justify-between overflow-hidden active:scale-[0.99]"
          aria-label={t('services.soilHealth.title')}
        >
          <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-amber-400/10 rounded-full blur-2xl group-hover:scale-125 transition-transform" />

          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-13 h-13 rounded-2xl bg-white/15 backdrop-blur-md p-3 flex items-center justify-center text-amber-300 ring-2 ring-white/20">
                <FlaskConical className="w-7 h-7" />
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-amber-400 text-amber-950 shadow-sm">
                <Sparkles className="w-3 h-3" />
                {t('services.soilHealth.badge', 'Core Engine')}
              </span>
            </div>

            <h3 className="text-xl font-black tracking-tight mb-1.5 flex items-center gap-2">
              <span>{t('services.soilHealth.title', 'Soil Health')}</span>
            </h3>
            <p className="text-emerald-100 text-xs sm:text-sm leading-relaxed mb-4">
              {t('services.soilHealth.desc')}
            </p>
          </div>

          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs font-bold text-amber-200 group-hover:text-white transition">
            <span className="flex items-center gap-1.5 min-h-[44px]">
              <span>{t('services.calculateNpkAction', 'Calculate NPK & pH')}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
        </div>

        {/* 3. Field Monitor (Visually Hero Prominent) */}
        <div
          onClick={() => onSelectService('fieldMonitor')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onSelectService('fieldMonitor')}
          className="group relative bg-gradient-to-br from-teal-900 to-nutri-secondary text-white rounded-3xl p-5 sm:p-6 shadow-md hover:shadow-xl transition-all duration-300 border-2 border-teal-600/50 cursor-pointer flex flex-col justify-between overflow-hidden active:scale-[0.99]"
          aria-label={t('services.fieldMonitor.title')}
        >
          <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-cyan-400/10 rounded-full blur-2xl group-hover:scale-125 transition-transform" />

          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-13 h-13 rounded-2xl bg-white/15 backdrop-blur-md p-3 flex items-center justify-center text-cyan-300 ring-2 ring-white/20">
                <Satellite className="w-7 h-7" />
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-cyan-300 text-cyan-950 shadow-sm">
                <Sparkles className="w-3 h-3" />
                {t('services.fieldMonitor.badge', 'Sentinel-2')}
              </span>
            </div>

            <h3 className="text-xl font-black tracking-tight mb-1.5 flex items-center gap-2">
              <span>{t('services.fieldMonitor.title', 'Field Monitor')}</span>
            </h3>
            <p className="text-emerald-100 text-xs sm:text-sm leading-relaxed mb-4">
              {t('services.fieldMonitor.desc')}
            </p>
          </div>

          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs font-bold text-cyan-200 group-hover:text-white transition">
            <span className="flex items-center gap-1.5 min-h-[44px]">
              <span>{t('services.viewNdviAction', 'View NDVI Vegetation Map')}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
        </div>
      </div>

      {/* Row 2: Secondary Farming Services (3 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4 pt-1">
        {/* 4. Crop Calendar */}
        <div
          onClick={() => onSelectService('cropCalendar')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onSelectService('cropCalendar')}
          className="group bg-white rounded-3xl p-5 border border-nutri-cardBorder shadow-xs hover:shadow-md hover:border-emerald-300 transition cursor-pointer flex flex-col justify-between active:scale-[0.99]"
          aria-label={t('services.cropCalendar.title')}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
                <Calendar className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/70 px-2.5 py-0.5 rounded-full">
                {t('services.cropCalendar.badge', 'Planning')}
              </span>
            </div>

            <h4 className="text-base font-extrabold text-nutri-dark mb-1">
              {t('services.cropCalendar.title', 'Crop Calendar')}
            </h4>
            <p className="text-xs text-nutri-muted leading-relaxed line-clamp-3 mb-3 font-medium">
              {t('services.cropCalendar.desc')}
            </p>
          </div>

          <div className="flex items-center gap-1 text-xs font-bold text-nutri-primary group-hover:text-nutri-secondary transition min-h-[40px]">
            <span>{t('services.viewTimelineAction', 'View Timeline')}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* 5. Mandi Prices */}
        <div
          onClick={() => onSelectService('mandiPrices')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onSelectService('mandiPrices')}
          className="group bg-white rounded-3xl p-5 border border-nutri-cardBorder shadow-xs hover:shadow-md hover:border-emerald-300 transition cursor-pointer flex flex-col justify-between active:scale-[0.99]"
          aria-label={t('services.mandiPrices.title')}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
                <TrendingUp className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className="text-[11px] font-bold text-amber-700 bg-amber-100/70 px-2.5 py-0.5 rounded-full">
                {t('services.mandiPrices.badge', 'Market')}
              </span>
            </div>

            <h4 className="text-base font-extrabold text-nutri-dark mb-1">
              {t('services.mandiPrices.title', 'Mandi Prices')}
            </h4>
            <p className="text-xs text-nutri-muted leading-relaxed line-clamp-3 mb-3 font-medium">
              {t('services.mandiPrices.desc')}
            </p>
          </div>

          <div className="flex items-center gap-1 text-xs font-bold text-nutri-primary group-hover:text-nutri-secondary transition min-h-[40px]">
            <span>{t('services.checkRatesAction', 'Check Wholesale Rates')}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* 6. Expert Help */}
        <div
          onClick={() => onSelectService('expertHelp')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onSelectService('expertHelp')}
          className="group bg-white rounded-3xl p-5 border border-nutri-cardBorder shadow-xs hover:shadow-md hover:border-emerald-300 transition cursor-pointer flex flex-col justify-between active:scale-[0.99]"
          aria-label={t('services.expertHelp.title')}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-11 h-11 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center border border-sky-200">
                <Headphones className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className="text-[11px] font-bold text-sky-700 bg-sky-100/70 px-2.5 py-0.5 rounded-full">
                {t('services.expertHelp.badge', 'Support')}
              </span>
            </div>

            <h4 className="text-base font-extrabold text-nutri-dark mb-1">
              {t('services.expertHelp.title', 'Expert Help')}
            </h4>
            <p className="text-xs text-nutri-muted leading-relaxed line-clamp-3 mb-3 font-medium">
              {t('services.expertHelp.desc')}
            </p>
          </div>

          <div className="flex items-center gap-1 text-xs font-bold text-nutri-primary group-hover:text-nutri-secondary transition min-h-[40px]">
            <span>{t('services.contactKvkAction', 'Contact KVK Scientists')}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
};
