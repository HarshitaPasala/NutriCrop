'use client';

import React, { useState, useEffect } from 'react';
import {
  Sprout,
  ArrowLeft,
  Wallet,
  Activity,
  BookOpen,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { DemoBadge } from '@/components/ui/DemoBadge';
import { PlotManagementCard } from './PlotManagementCard';
import { ExpenseYieldLedger } from './ExpenseYieldLedger';
import { SoilTrendChart } from './SoilTrendChart';
import { OfflineCropGuidesModal } from './OfflineCropGuidesModal';

interface MyFarmContainerProps {
  onBackToDashboard: () => void;
}

export const MyFarmContainer: React.FC<MyFarmContainerProps> = ({
  onBackToDashboard,
}) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const userPhone = user?.phone;

  const [activeTab, setActiveTab] = useState<'plots' | 'expenses' | 'trends' | 'guides'>('plots');
  const [activePlotId, setActivePlotId] = useState<string>('plot-1');
  const [farmData, setFarmData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState('');
  const [savedDiagnoses, setSavedDiagnoses] = useState<any[]>([]);

  useEffect(() => {
    try { setSavedDiagnoses(JSON.parse(localStorage.getItem('nutricrop_saved_diagnoses') || '[]')); } catch { setSavedDiagnoses([]); }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const sub = new URLSearchParams(window.location.search).get('subtab') as any;
      if (sub && ['plots', 'expenses', 'trends', 'guides'].includes(sub)) {
        setActiveTab(sub);
      }
    }
  }, []);

  useEffect(() => {
    fetchFarmData(activePlotId);
  }, [activePlotId, userPhone]);

  const fetchFarmData = async (plotId: string) => {
    setIsLoading(true);
    setLoadError('');
    try {
      const query = new URLSearchParams({ plot_id: plotId });
      if (userPhone) {
        query.set('phone', userPhone);
      }
      const res = await fetch(`/api/v1/farm/overview?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setFarmData(data);
      } else {
        setLoadError('Farm service is unavailable. Showing saved sample data.');
        loadFallback();
      }
    } catch (e) {
      setLoadError('Farm service is unavailable. Showing saved sample data.');
      loadFallback();
    } finally {
      setIsLoading(false);
    }
  };

  const loadFallback = () => {
    setFarmData({
      plots: [
        {
          plot_id: 'plot-1',
          name: 'Main Chilli Parcel (Plot 2A)',
          area_acres: 2.45,
          current_crop: 'Chilli',
          variety: 'Guntur Teja (Dry Red)',
          soil_type: 'Clay Loam',
          sowing_date: '15 Sep 2026',
          last_soil_test_date: '12 Oct 2026',
          soil_health_score: 76,
        },
        {
          plot_id: 'plot-2',
          name: 'North Wetland (Plot 1B)',
          area_acres: 1.80,
          current_crop: 'Paddy (Rice)',
          variety: 'BPT 5204 (Sona Masuri)',
          soil_type: 'Alluvial Clay',
          sowing_date: '01 Aug 2026',
          last_soil_test_date: '20 Jul 2026',
          soil_health_score: 82,
        },
      ],
      active_plot_id: 'plot-1',
      expense_summary: {
        total_expense_inr: 22000.0,
        category_breakdown: {
          Seeds: 2400.0,
          Fertilizers: 4800.0,
          Pesticides: 3200.0,
          Labor: 8500.0,
          Machinery: 3100.0,
        },
        gross_revenue_inr: 71344.0,
        net_profit_inr: 49344.0,
        profit_per_acre_inr: 20140.41,
        entries: [
          { id: 'e1', date: '15 Sep 2026', category: 'Seeds', amount_inr: 2400.0, note: 'Chilli hybrid seeds' },
          { id: 'e2', date: '25 Sep 2026', category: 'Fertilizers', amount_inr: 4800.0, note: 'INM DAP+FYM+Biofertilizer' },
          { id: 'e3', date: '10 Oct 2026', category: 'Pesticides', amount_inr: 3200.0, note: 'Neem oil and sticky traps' },
        ],
      },
      soil_trends: [
        { season_label: 'Kharif 2024', year: 2024, organic_carbon_pct: 0.42, nitrogen_kg_ha: 185.0, phosphorus_kg_ha: 12.0, potassium_kg_ha: 190.0, ph: 7.8 },
        { season_label: 'Rabi 2024', year: 2024, organic_carbon_pct: 0.48, nitrogen_kg_ha: 198.0, phosphorus_kg_ha: 14.5, potassium_kg_ha: 205.0, ph: 7.6 },
        { season_label: 'Kharif 2025', year: 2025, organic_carbon_pct: 0.55, nitrogen_kg_ha: 218.0, phosphorus_kg_ha: 17.2, potassium_kg_ha: 222.0, ph: 7.4 },
        { season_label: 'Rabi 2025', year: 2025, organic_carbon_pct: 0.62, nitrogen_kg_ha: 242.0, phosphorus_kg_ha: 20.4, potassium_kg_ha: 245.0, ph: 7.2 },
      ],
      crop_guides: [
        {
          crop_name: 'Chilli (Capsicum annuum)',
          scientific_name: 'Capsicum annuum L.',
          ideal_season: 'Kharif / Rabi',
          duration_days: 150,
          seed_rate: '1.0 to 1.5 kg / ha',
          spacing: '60 cm x 45 cm',
          water_requirement_mm: '600 to 800 mm',
          critical_stages: ['Transplanting (0 DAS)', 'Branching (35 DAS)', 'Flowering (65 DAS)', 'Fruit Picking (110 DAS)'],
          harvest_indicator: 'Bright uniform red pods for dry chilli; deep glossy green for fresh.',
          storage_tips: 'Sun-dry to <10% moisture content on clean tarpaulins.',
        },
      ],
      is_demo: true,
    });
  };

  const currentPlot = farmData?.plots?.find((p: any) => p.plot_id === activePlotId) || farmData?.plots?.[0];

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      {/* Top Header & Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToDashboard}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-nutri-bg border border-nutri-cardBorder text-xs sm:text-sm font-bold text-nutri-primary transition min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('common.backToDashboard', 'Back to Dashboard')}</span>
        </button>
      </div>

      {/* Main Title Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-nutri-cardBorder shadow-sm space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
              Long-Term Platform
            </span>
            <DemoBadge />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-nutri-primary flex items-center gap-2">
            <Sprout className="w-6 h-6 text-nutri-secondary" />
            <span>{t('myFarm.title', 'My Farm Long-Term Platform')}</span>
          </h1>
          <p className="text-xs sm:text-sm text-nutri-muted mt-1">
            {t(
              'myFarm.subtitle',
              'Multi-plot parcel management, seasonal expense & yield ledger, multi-year soil health trends, and offline crop guides.'
            )}
          </p>
        </div>

        {/* Sub-module Navigation Tabs */}
        <div className="pt-2 border-t border-nutri-cardBorder flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('plots')}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition min-h-[42px] flex items-center gap-1.5 ${
              activeTab === 'plots'
                ? 'bg-nutri-primary text-white border-nutri-primary shadow-xs'
                : 'bg-white hover:bg-nutri-bg text-nutri-primary border-nutri-cardBorder'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{t('myFarm.tabPlots', 'Farm Plots')}</span>
          </button>

          <button
            onClick={() => setActiveTab('expenses')}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition min-h-[42px] flex items-center gap-1.5 ${
              activeTab === 'expenses'
                ? 'bg-nutri-primary text-white border-nutri-primary shadow-xs'
                : 'bg-white hover:bg-nutri-bg text-nutri-primary border-nutri-cardBorder'
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>{t('myFarm.tabExpenses', 'Expense & Yield Ledger')}</span>
          </button>

          <button
            onClick={() => setActiveTab('trends')}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition min-h-[42px] flex items-center gap-1.5 ${
              activeTab === 'trends'
                ? 'bg-nutri-primary text-white border-nutri-primary shadow-xs'
                : 'bg-white hover:bg-nutri-bg text-nutri-primary border-nutri-cardBorder'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>{t('myFarm.tabSoilTrends', 'Soil Trajectory')}</span>
          </button>

          <button
            onClick={() => setActiveTab('guides')}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition min-h-[42px] flex items-center gap-1.5 ${
              activeTab === 'guides'
                ? 'bg-nutri-primary text-white border-nutri-primary shadow-xs'
                : 'bg-white hover:bg-nutri-bg text-nutri-primary border-nutri-cardBorder'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{t('myFarm.tabGuides', 'Offline Guides')}</span>
          </button>
        </div>
      </div>

      {/* Render Active View */}
      {farmData && (
        <div className="space-y-5">
          {activeTab === 'plots' && (
            <div className="space-y-5">
            {savedDiagnoses.length > 0 && <section className="rounded-2xl border border-sky-200 bg-sky-50 p-4 space-y-2"><h3 className="font-black text-sky-950">{t('myFarm.savedDiagnoses', 'Saved Crop Doctor Checks')}</h3>{savedDiagnoses.map((item) => <p key={item.id} className="text-sm text-sky-950">{item.crop}: {item.diagnosis} · {item.severity} · {new Date(item.createdAt).toLocaleDateString()}</p>)}</section>}
            <PlotManagementCard
              plots={farmData.plots}
              activePlotId={activePlotId}
              onSelectPlot={(id) => setActivePlotId(id)}
              onPlotAdded={(id) => {
                const targetId = id || activePlotId;
                setActivePlotId(targetId);
                fetchFarmData(targetId);
              }}
              onPlotDeleted={(id) => {
                const remaining = farmData.plots.filter((plot: any) => plot.plot_id !== id);
                const nextId = remaining[0]?.plot_id || 'plot-1';
                setActivePlotId(nextId);
                fetchFarmData(nextId);
              }}
              onPlotUpdated={() => fetchFarmData(activePlotId)}
            />
            </div>
          )}

          {activeTab === 'expenses' && (
            <ExpenseYieldLedger
              summary={farmData.expense_summary}
              activePlotId={activePlotId}
              onExpenseAdded={() => fetchFarmData(activePlotId)}
            />
          )}

          {activeTab === 'trends' && (
            <SoilTrendChart trends={farmData.soil_trends} />
          )}

          {activeTab === 'guides' && (
            <OfflineCropGuidesModal guides={farmData.crop_guides} />
          )}
        </div>
      )}
      {isLoading && <p role="status" className="text-sm text-nutri-muted">{t('common.loadingFarm', 'Loading farm details…')}</p>}
      {loadError && <p role="status" className="rounded-xl bg-amber-50 text-amber-900 p-3 text-sm">{loadError}</p>}
    </div>
  );
};
