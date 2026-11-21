'use client';

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  History,
  Calendar,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Award,
} from 'lucide-react';
import { useLanguage, translateCrop } from '@/context/LanguageContext';
import { DemoBadge } from '@/components/ui/DemoBadge';

export const SoilHistoryView: React.FC = () => {
  const { t } = useLanguage();
  const [historyData, setHistoryData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch('/api/v1/soil/history');
        if (res.ok) {
          const data = await res.json();
          setHistoryData(data);
        } else {
          throw new Error('API error');
        }
      } catch (e) {
        // Fallback demo data
        setHistoryData({
          farm_name: 'Main Field Plot A',
          district: 'Guntur, Andhra Pradesh',
          seasons: [
            {
              season: 'Kharif 2025',
              test_date: '15 July 2025',
              crop: 'Paddy',
              n_kg_ha: 230,
              p_kg_ha: 12,
              k_kg_ha: 140,
              ph: 6.2,
              oc_pct: 0.42,
              health_grade: 'C+',
              notes: 'Low Organic Carbon and Nitrogen before compost intervention.',
            },
            {
              season: 'Rabi 2025-26',
              test_date: '10 Nov 2025',
              crop: 'Maize',
              n_kg_ha: 275,
              p_kg_ha: 16,
              k_kg_ha: 165,
              ph: 6.5,
              oc_pct: 0.52,
              health_grade: 'B',
              notes: 'Incorporate FYM and green manure (Dhaincha). Noticeable microbial rebound.',
            },
            {
              season: 'Kharif 2026',
              test_date: '12 Oct 2026',
              crop: 'Paddy (Rice)',
              n_kg_ha: 340,
              p_kg_ha: 21,
              k_kg_ha: 195,
              ph: 6.8,
              oc_pct: 0.64,
              health_grade: 'A-',
              notes: 'Balanced STCR fertilizer regime + Biofertilizers achieved optimal soil health.',
            },
          ],
          trends: {
            nitrogen_trend: '+47.8% (Improving)',
            phosphorus_trend: '+75.0% (Optimal)',
            potassium_trend: '+39.2% (Steady)',
            organic_carbon_trend: '+52.3% (Regenerating)',
            ph_status: 'Ideal Neutral (6.8)',
          },
          is_demo: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (loading || !historyData) {
    return (
      <div className="bg-white rounded-3xl p-6 border border-nutri-cardBorder animate-pulse space-y-4">
        <div className="h-6 bg-gray-200 rounded w-1/4"></div>
        <div className="h-40 bg-gray-100 rounded-2xl"></div>
      </div>
    );
  }

  const seasons = historyData.seasons || [];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-nutri-cardBorder shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-nutri-secondary bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              {t('soil.fertilityTracker', 'Long-Term Fertility Tracker')}
            </span>
            <DemoBadge />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-nutri-primary">
            {t('soil.tabHistory', 'Soil Health History & Trend Analysis')}
          </h2>
          <p className="text-xs text-nutri-muted font-medium mt-0.5">
            Plot: {historyData.farm_name} • {historyData.district}
          </p>
        </div>

        <div className="inline-flex items-center gap-2 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 self-start sm:self-auto">
          <Award className="w-5 h-5 text-emerald-700" />
          <div className="text-left leading-tight">
            <span className="text-[10px] text-gray-500 font-bold uppercase">{t('soil.overallGrade', 'Overall Grade')}</span>
            <strong className="text-sm font-black text-emerald-900 block">{t('soil.gradeRegen', 'Grade A- (Regenerating)')}</strong>
          </div>
        </div>
      </div>

      {/* Multi-Season Trend Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-nutri-cardBorder shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-gray-500 uppercase">{t('soil.nitrogen', 'Nitrogen (N)')}</span>
          <div className="flex items-center gap-1.5 text-emerald-700 font-black text-base sm:text-lg">
            <ArrowUpRight className="w-4 h-4" />
            <span>{historyData.trends.nitrogen_trend}</span>
          </div>
          <span className="text-[10px] text-gray-500 block">230 → 340 kg/ha</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-nutri-cardBorder shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-gray-500 uppercase">{t('soil.phosphorus', 'Phosphorus (P)')}</span>
          <div className="flex items-center gap-1.5 text-emerald-700 font-black text-base sm:text-lg">
            <ArrowUpRight className="w-4 h-4" />
            <span>{historyData.trends.phosphorus_trend}</span>
          </div>
          <span className="text-[10px] text-gray-500 block">12 → 21 kg/ha</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-nutri-cardBorder shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-gray-500 uppercase">{t('soil.potassium', 'Potassium (K)')}</span>
          <div className="flex items-center gap-1.5 text-emerald-700 font-black text-base sm:text-lg">
            <ArrowUpRight className="w-4 h-4" />
            <span>{historyData.trends.potassium_trend}</span>
          </div>
          <span className="text-[10px] text-gray-500 block">140 → 195 kg/ha</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-nutri-cardBorder shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-gray-500 uppercase">{t('soil.organicCarbon', 'Organic Carbon')}</span>
          <div className="flex items-center gap-1.5 text-emerald-700 font-black text-base sm:text-lg">
            <ArrowUpRight className="w-4 h-4" />
            <span>{historyData.trends.organic_carbon_trend}</span>
          </div>
          <span className="text-[10px] text-gray-500 block">0.42% → 0.64%</span>
        </div>
      </div>

      {/* Visual Progression Chart */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-nutri-cardBorder shadow-sm space-y-4">
        <h3 className="text-base sm:text-lg font-black text-nutri-primary">
          {t('soil.fertilityAcrossSeasons', 'Fertility Trend Across 3 Crop Seasons')}
        </h3>

        <div className="space-y-4">
          {seasons.map((s: any, idx: number) => {
            // Percent progress bar for visual fertility
            const nPct = Math.min(100, Math.round((s.n_kg_ha / 560) * 100));
            const ocPct = Math.min(100, Math.round((s.oc_pct / 0.8) * 100));

            return (
              <div key={idx} className="p-4 rounded-2xl bg-nutri-bg border border-nutri-cardBorder space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-900 font-black text-xs flex items-center justify-center">
                      S{idx + 1}
                    </div>
                    <div>
                      <strong className="text-sm font-black text-nutri-dark block">
                        {s.season} • {translateCrop(s.crop, t)}
                      </strong>
                      <span className="text-[11px] text-gray-500">{t('myFarm.testedDate', 'Tested')}: {s.test_date}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black px-2.5 py-1 rounded-full bg-white border border-emerald-300 text-emerald-800">
                      Score: {s.health_grade}
                    </span>
                    <span className="text-xs font-bold text-gray-600">
                      pH: {s.ph}
                    </span>
                  </div>
                </div>

                {/* Progress Visual Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <div className="flex justify-between text-[11px] font-bold text-gray-600 mb-1">
                      <span>{t('soil.nitrogen', 'Available Nitrogen')}: {s.n_kg_ha} kg/ha</span>
                      <span>{t('soil.optimumPercent', '{percent}% of optimum', { percent: nPct })}</span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-nutri-secondary rounded-full transition-all duration-500"
                        style={{ width: `${nPct}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] font-bold text-gray-600 mb-1">
                      <span>{t('soil.organicCarbon', 'Organic Carbon')}: {s.oc_pct}%</span>
                      <span>{t('soil.optimumPercent', '{percent}% of optimum', { percent: ocPct })}</span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                        style={{ width: `${ocPct}%` }}
                      />
                    </div>
                  </div>
                </div>

                <p className="text-xs text-gray-600 italic font-medium pt-1">
                  💡 {s.notes}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
