'use client';

import React, { useState } from 'react';
import {
  FlaskConical,
  DollarSign,
  History,
  BookOpen,
  ArrowLeft,
  Sparkles,
  Info,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useLocation } from '@/context/LocationContext';
import { SoilCardForm, SoilCardFormValues } from './SoilCardForm';
import { FertilizerResultsView } from './FertilizerResultsView';
import { SoilReportPdfModal } from './SoilReportPdfModal';
import { SoilHistoryView } from './SoilHistoryView';
import { SoilProblemLibrary } from './SoilProblemLibrary';
import { DemoBadge } from '@/components/ui/DemoBadge';

interface SoilHealthContainerProps {
  onBackToDashboard: () => void;
}

type SoilSubTab = 'calculator' | 'history' | 'library';

export const SoilHealthContainer: React.FC<SoilHealthContainerProps> = ({ onBackToDashboard }) => {
  const { t } = useLanguage();
  const { location } = useLocation();

  const [activeSubTab, setActiveSubTab] = useState<SoilSubTab>('calculator');
  const [calculationResult, setCalculationResult] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [calculationError, setCalculationError] = useState('');

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const sub = new URLSearchParams(window.location.search).get('subtab') as SoilSubTab;
      if (sub && ['calculator', 'history', 'library'].includes(sub)) {
        setActiveSubTab(sub);
      }
      const prefill = new URLSearchParams(window.location.search).get('autoCalculate');
      if (prefill === 'true') {
        handleCalculate({
          n: 210,
          p: 12,
          k: 95,
          ph: 6.4,
          farm_size: 2.5,
          crop: 'Paddy (Rice)',
          soil_type: 'Alluvial (Loamy)',
          unit: 'acre',
          oc: 0.48,
        });
      }
    }
  }, []);

  const handleCalculate = async (values: SoilCardFormValues) => {
    setIsLoading(true);
    setCalculationError('');
    try {
      const res = await fetch('/api/v1/soil/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          n: values.n,
          p: values.p,
          k: values.k,
          ph: values.ph,
          farm_size: values.farm_size,
          crop: values.crop,
          soil_type: values.soil_type,
          unit: values.unit,
          oc: values.oc,
          farmer_name: 'Farmer',
          village: location.village,
          district: location.district,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setCalculationResult(data);
      } else {
        throw new Error('API failed');
      }
    } catch {
      setCalculationResult(null);
      setCalculationError(t('soil.calculateError', 'Could not calculate the soil recommendation. Check your connection and try again.'));
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          onClick={onBackToDashboard}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-nutri-bg border border-nutri-cardBorder text-xs sm:text-sm font-bold text-nutri-primary transition min-h-[44px] self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('common.backToDashboard', 'Back to Dashboard')}</span>
        </button>

        {/* Sub-Tab Navigation Bar */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white border border-nutri-cardBorder shadow-2xs overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveSubTab('calculator')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition min-h-[40px] whitespace-nowrap ${
              activeSubTab === 'calculator'
                ? 'bg-nutri-primary text-white shadow-xs'
                : 'text-gray-600 hover:text-nutri-primary'
            }`}
          >
            <FlaskConical className="w-4 h-4" />
            <span>{t('soil.tabCalculator', 'Fertilizer Calculator')}</span>
          </button>

          <button
            onClick={() => setActiveSubTab('history')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition min-h-[40px] whitespace-nowrap ${
              activeSubTab === 'history'
                ? 'bg-nutri-primary text-white shadow-xs'
                : 'text-gray-600 hover:text-nutri-primary'
            }`}
          >
            <History className="w-4 h-4" />
            <span>{t('soil.tabHistory', 'Soil History')}</span>
          </button>

          <button
            onClick={() => setActiveSubTab('library')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition min-h-[40px] whitespace-nowrap ${
              activeSubTab === 'library'
                ? 'bg-nutri-primary text-white shadow-xs'
                : 'text-gray-600 hover:text-nutri-primary'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>{t('soil.tabLibrary', 'Problem Library')}</span>
          </button>
        </div>
      </div>

      {/* Sub-Tab Content */}
      {activeSubTab === 'calculator' && (
        <div className="space-y-6">
          {calculationError && <p role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{calculationError}</p>}
          {calculationResult ? (
            <FertilizerResultsView
              data={calculationResult}
              onOpenPdfReport={() => setIsPdfModalOpen(true)}
              onRecalculate={() => setCalculationResult(null)}
            />
          ) : (
            <SoilCardForm onSubmit={handleCalculate} isLoading={isLoading} />
          )}
        </div>
      )}

      {activeSubTab === 'history' && <SoilHistoryView />}

      {activeSubTab === 'library' && <SoilProblemLibrary />}

      {/* Downloadable / Printable PDF Modal */}
      {calculationResult && (
        <SoilReportPdfModal
          isOpen={isPdfModalOpen}
          onClose={() => setIsPdfModalOpen(false)}
          data={calculationResult}
        />
      )}
    </div>
  );
};
