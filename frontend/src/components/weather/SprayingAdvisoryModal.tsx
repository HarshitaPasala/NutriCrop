'use client';

import React from 'react';
import { X, ShieldCheck, Wind, Droplets, Sun, AlertTriangle, CheckSquare } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface SprayingAdvisoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SprayingAdvisoryModal: React.FC<SprayingAdvisoryModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-nutri-cardBorder space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h3 className="text-base sm:text-lg font-black text-nutri-primary">
              {t('weatherForecast.sprayGuide', 'Safe Chemical & Nutrient Spraying Guidelines')}
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label={t('common.close', 'Close')}
            className="w-8 h-8 rounded-full hover:bg-nutri-bg flex items-center justify-center text-nutri-muted transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs sm:text-sm">
          {/* Rule 1: Wind velocity */}
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
            <Wind className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-emerald-950">{t('weather.optimalWindSpeedTitle', 'Optimal Wind Speed: 3 to 10 km/h')}</h4>
              <p className="text-xs text-emerald-900 mt-0.5 leading-relaxed">
                {t('weather.optimalWindSpeedDesc', 'Winds below 3 km/h risk temperature inversion drift. Winds above 15 km/h cause chemical spray drift into neighboring plots or water bodies.')}
              </p>
            </div>
          </div>

          {/* Rule 2: Rain & Canopy */}
          <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-200 flex items-start gap-3">
            <Droplets className="w-5 h-5 text-sky-700 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sky-950">{t('weather.dryFoliageTitle', 'Dry Foliage & Rain-Free Window')}</h4>
              <p className="text-xs text-sky-900 mt-0.5 leading-relaxed">
                {t('weather.dryFoliageDesc', 'Ensure at least 4 to 6 hours of rain-free weather following systemic chemical spray. Do not spray while leaves are dripping with morning dew.')}
              </p>
            </div>
          </div>

          {/* Rule 3: Temperature */}
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
            <Sun className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-amber-950">{t('weather.tempEvapTitle', 'Temperature & Evaporation')}</h4>
              <p className="text-xs text-amber-900 mt-0.5 leading-relaxed">
                {t('weather.tempEvapDesc', 'Avoid spraying when temperature exceeds 33°C. High heat accelerates droplet evaporation and risks leaf scorching.')}
              </p>
            </div>
          </div>

          {/* Mandatory PPE Checklist */}
          <div className="space-y-2 pt-2 border-t border-nutri-cardBorder">
            <h4 className="font-black text-nutri-primary uppercase tracking-wider text-xs">
              {t('weather.ppeChecklistTitle', 'Mandatory Protective Gear (PPE)')}
            </h4>
            <div className="space-y-1.5 text-xs">
              <label className="flex items-center gap-2 text-nutri-primary font-medium">
                <CheckSquare className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>{t('weather.ppeMask', 'N95 / Carbon filter face mask against aerosol vapor inhalation')}</span>
              </label>
              <label className="flex items-center gap-2 text-nutri-primary font-medium">
                <CheckSquare className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>{t('weather.ppeGloves', 'Nitrile chemical gloves and full-sleeve shirt')}</span>
              </label>
              <label className="flex items-center gap-2 text-nutri-primary font-medium">
                <CheckSquare className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>{t('weather.ppeWash', 'Wash spray equipment and rinse hands thoroughly after application')}</span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-nutri-primary text-white text-xs font-bold hover:bg-nutri-secondary transition"
          >
            {t('cropDoctor.closeGuide', 'I Understand')}
          </button>
        </div>
      </div>
    </div>
  );
};
