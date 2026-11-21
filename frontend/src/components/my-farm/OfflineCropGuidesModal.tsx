'use client';

import React, { useState } from 'react';
import { BookOpen, Printer, Download, CheckCircle2, Droplets, Sprout, ShieldAlert, Sparkles } from 'lucide-react';
import { useLanguage, translateCrop } from '@/context/LanguageContext';

interface OfflineCropGuide {
  crop_name: string;
  scientific_name: string;
  ideal_season: string;
  duration_days: number;
  seed_rate: string;
  spacing: string;
  water_requirement_mm: string;
  critical_stages: string[];
  harvest_indicator: string;
  storage_tips: string;
}

interface OfflineCropGuidesModalProps {
  guides: OfflineCropGuide[];
}

export const OfflineCropGuidesModal: React.FC<OfflineCropGuidesModalProps> = ({ guides }) => {
  const { t } = useLanguage();
  const [selectedIdx, setSelectedIdx] = useState(0);

  const activeGuide = guides[selectedIdx] || guides[0];

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-nutri-cardBorder shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-black text-nutri-primary flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-nutri-secondary" />
            <span>{t('myFarm.tabGuides', 'Offline Crop Cultivation SOP Guides')}</span>
          </h2>
          <p className="text-xs text-nutri-muted font-semibold mt-0.5">
            {t('myFarm.sopGuidesSubtitle', 'Standard agronomic practices, seed rates, critical stages, and storage guidelines (Works offline)')}
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition self-start sm:self-auto min-h-[44px]"
        >
          <Printer className="w-4 h-4" />
          <span>{t('myFarm.offlineGuideDownload', 'Print / Save Offline')}</span>
        </button>
      </div>

      {/* Crop Selection Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-nutri-cardBorder pb-3">
        {guides.map((g, idx) => (
          <button
            key={g.crop_name}
            onClick={() => setSelectedIdx(idx)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition min-h-[40px] flex items-center gap-1.5 ${
              selectedIdx === idx
                ? 'bg-nutri-primary text-white shadow-xs'
                : 'bg-nutri-bg hover:bg-slate-200/60 text-nutri-primary'
            }`}
          >
            <Sprout className="w-3.5 h-3.5" />
            <span>{translateCrop(g.crop_name.split('(')[0].trim(), t)}</span>
          </button>
        ))}
      </div>

      {/* Guide Content Display */}
      {activeGuide && (
        <div className="space-y-4 text-xs sm:text-sm">
          <div className="p-4 rounded-2xl bg-nutri-bg/60 border border-nutri-cardBorder flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-black uppercase text-nutri-secondary tracking-wider">
                {t('myFarm.packagePractices', 'ICAR Package of Practices')}
              </span>
              <h3 className="text-lg font-black text-nutri-primary mt-0.5">
                {translateCrop(activeGuide.crop_name, t)}
              </h3>
              <p className="text-xs text-nutri-muted italic">
                {activeGuide.scientific_name} • Duration: ~{activeGuide.duration_days} Days
              </p>
            </div>
            <div className="text-xs font-bold text-nutri-primary bg-white px-3 py-1.5 rounded-xl border border-nutri-cardBorder self-start sm:self-auto">
              Season: {activeGuide.ideal_season}
            </div>
          </div>

          {/* Key Agronomic Specifications Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-white border border-nutri-cardBorder space-y-1">
              <span className="font-bold text-nutri-muted uppercase text-[10px]">{t('myFarm.seedRate', 'Seed Rate')}</span>
              <div className="font-black text-nutri-primary">{activeGuide.seed_rate}</div>
            </div>

            <div className="p-3 rounded-2xl bg-white border border-nutri-cardBorder space-y-1">
              <span className="font-bold text-nutri-muted uppercase text-[10px]">{t('myFarm.rowSpacing', 'Row Spacing')}</span>
              <div className="font-black text-nutri-primary">{activeGuide.spacing}</div>
            </div>

            <div className="p-3 rounded-2xl bg-white border border-nutri-cardBorder space-y-1">
              <span className="font-bold text-nutri-muted uppercase text-[10px]">{t('myFarm.waterReq', 'Water Requirement')}</span>
              <div className="font-black text-nutri-primary">{activeGuide.water_requirement_mm}</div>
            </div>
          </div>

          {/* Critical Growth Stages */}
          <div className="space-y-2 pt-1">
            <h4 className="font-black text-nutri-primary uppercase tracking-wider text-xs">
              {t('myFarm.criticalStages', 'Critical Irrigation & Nutrient Stages:')}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {activeGuide.critical_stages.map((st, i) => (
                <div key={i} className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-200 flex items-center gap-2 text-xs font-bold text-nutri-primary">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>{st}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Harvest & Storage */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-1 text-xs">
              <span className="font-black text-amber-950 uppercase text-[11px] block">
                {t('myFarm.harvestIndicator', 'Harvest Indicator')}
              </span>
              <p className="text-amber-900 font-medium leading-relaxed">
                {activeGuide.harvest_indicator}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-sky-50/60 border border-sky-200 space-y-1 text-xs">
              <span className="font-black text-sky-950 uppercase text-[11px] block">
                {t('myFarm.storageTips', 'Post-Harvest & Storage Tips')}
              </span>
              <p className="text-sky-900 font-medium leading-relaxed">
                {activeGuide.storage_tips}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
