'use client';

import React from 'react';
import { Activity, TrendingUp, Sparkles, CheckCircle2, ShieldCheck, HelpCircle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface SoilTrendPoint {
  season_label: string;
  year: number;
  organic_carbon_pct: number;
  nitrogen_kg_ha: number;
  phosphorus_kg_ha: number;
  potassium_kg_ha: number;
  ph: number;
}

interface SoilTrendChartProps {
  trends: SoilTrendPoint[];
}

export const SoilTrendChart: React.FC<SoilTrendChartProps> = ({ trends }) => {
  const { t } = useLanguage();

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-nutri-cardBorder shadow-sm space-y-5">
      <div>
        <h2 className="text-base sm:text-lg font-black text-nutri-primary flex items-center gap-2">
          <Activity className="w-5 h-5 text-nutri-secondary" />
          <span>{t('myFarm.tabSoilTrends', 'Soil Health Trajectory (Multi-Season)')}</span>
        </h2>
        <p className="text-xs text-nutri-muted font-semibold mt-0.5">
          Track organic carbon regeneration, N-P-K nutrient buildup, and pH stabilization over consecutive harvests
        </p>
      </div>

      {/* Season Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {trends.map((pt, idx) => {
          const isLatest = idx === trends.length - 1;

          return (
            <div
              key={pt.season_label}
              className={`p-4 rounded-2xl border transition ${
                isLatest
                  ? 'bg-emerald-50/70 border-emerald-400 ring-2 ring-emerald-500/20 shadow-xs'
                  : 'bg-slate-50/60 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-nutri-primary">{pt.season_label}</span>
                {isLatest && (
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                    {t('common.current', 'Current')}
                  </span>
                )}
              </div>

              {/* Organic Carbon KPI */}
              <div className="mt-3 pt-2 border-t border-slate-200/60 space-y-1">
                <div className="text-[10px] font-bold text-nutri-muted uppercase">{t('myFarm.organicCarbon', 'Organic Carbon (OC)')}</div>
                <div className="text-xl font-black text-nutri-primary">
                  {pt.organic_carbon_pct}%
                </div>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    pt.organic_carbon_pct >= 0.50
                      ? 'bg-emerald-100 text-emerald-900'
                      : 'bg-amber-100 text-amber-900'
                  }`}
                >
                  {pt.organic_carbon_pct >= 0.50 ? 'Medium (Target Reached)' : 'Low (Deficient)'}
                </span>
              </div>

              {/* Macronutrient mini stats */}
              <div className="grid grid-cols-2 gap-1.5 pt-3 mt-3 border-t border-slate-200/60 text-[10px] font-semibold text-nutri-muted">
                <div>
                  <span className="font-bold text-nutri-primary">N:</span> {pt.nitrogen_kg_ha.toFixed(0)} kg
                </div>
                <div>
                  <span className="font-bold text-nutri-primary">P:</span> {pt.phosphorus_kg_ha.toFixed(1)} kg
                </div>
                <div>
                  <span className="font-bold text-nutri-primary">K:</span> {pt.potassium_kg_ha.toFixed(0)} kg
                </div>
                <div>
                  <span className="font-bold text-nutri-primary">pH:</span> {pt.ph.toFixed(1)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Regeneration Insight Box */}
      <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 flex items-start gap-3 text-xs text-nutri-primary font-medium">
        <Sparkles className="w-5 h-5 text-emerald-800 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-black text-emerald-950">{t('myFarm.soilRegenConfirmed', 'Soil Regeneration Confirmed')}</h4>
          <p className="mt-0.5 leading-relaxed text-emerald-900">
            {t('myFarm.soilRegenMessage', 'Across 4 consecutive cropping cycles, incorporating Farm Yard Manure (FYM) alongside balanced STCR fertilizer applications has increased Soil Organic Carbon by +48%, restoring beneficial earthworm and microbial biomass.')}
          </p>
        </div>
      </div>
    </div>
  );
};
