'use client';

import React from 'react';
import { Info, HelpCircle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export const NdviLegendCard: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="bg-white rounded-3xl p-5 border border-nutri-cardBorder shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-black text-nutri-primary flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-nutri-secondary" />
          <span>{t('fieldMonitor.legendTitle', 'NDVI Greenness Index Scale')}</span>
        </h4>
        <span className="text-[11px] font-bold text-nutri-muted bg-nutri-bg px-2.5 py-1 rounded-full">
          Copernicus Sentinel-2
        </span>
      </div>

      {/* Multi-gradient scale bar */}
      <div className="space-y-1.5">
        <div className="h-4 rounded-full w-full bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-600 shadow-inner" />
        <div className="flex justify-between text-[10px] font-bold text-nutri-muted px-1">
          <span>{t('fieldMonitor.legendBare', '< 0.20 (Bare / Water)')}</span>
          <span>{t('fieldMonitor.legendModerate', '0.30 - 0.50 (Moderate)')}</span>
          <span>{t('fieldMonitor.legendDense', '> 0.70 (Dense Canopy)')}</span>
        </div>
      </div>

      {/* Legend Bins */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
        <div className="p-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5">
          <span className="w-3.5 h-3.5 rounded-full bg-emerald-600 shrink-0" />
          <div>
            <div className="font-bold text-emerald-950">{t('fieldMonitor.healthyCanopy', 'Healthy Vegetative Canopy')}</div>
            <div className="text-[11px] text-emerald-800">NDVI ≥ 0.60</div>
          </div>
        </div>

        <div className="p-2.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-center gap-2.5">
          <span className="w-3.5 h-3.5 rounded-full bg-amber-500 shrink-0" />
          <div>
            <div className="font-bold text-amber-950">{t('fieldMonitor.moderateBiomass', 'Moderate Biomass')}</div>
            <div className="text-[11px] text-amber-800">0.30 to 0.59</div>
          </div>
        </div>

        <div className="p-2.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-2.5">
          <span className="w-3.5 h-3.5 rounded-full bg-rose-500 shrink-0" />
          <div>
            <div className="font-bold text-rose-950">{t('fieldMonitor.stressedBiomass', 'Stressed / Sparse')}</div>
            <div className="text-[11px] text-rose-800">&lt; 0.30</div>
          </div>
        </div>
      </div>

      {/* Crucial Scientific Guardrail Banner */}
      <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-300 flex items-start gap-2.5 text-xs text-amber-950 font-medium">
        <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <p>
          <strong>{t('fieldMonitor.scientificGuardrailLabel', 'Scientific Guardrail')}:</strong> {t('fieldMonitor.scientificDisclaimer', 'Sentinel-2 NDVI calculates optical leaf chlorophyll and canopy biomass. It does NOT measure soil nitrogen, phosphorus, potash, or chemical fertility directly. Use Soil Health Card tests for nutrient status.')}
        </p>
      </div>
    </div>
  );
};
