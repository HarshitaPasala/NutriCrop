'use client';

import React from 'react';
import { LucideIcon, ArrowLeft, Sparkles, ShieldAlert, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { DemoBadge } from '@/components/ui/DemoBadge';

interface GenericPagePlaceholderProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  phaseNumber: number;
  phaseName: string;
  highlights: string[];
  onBackToDashboard: () => void;
}

export const GenericPagePlaceholder: React.FC<GenericPagePlaceholderProps> = ({
  title,
  subtitle,
  icon: Icon,
  phaseNumber,
  phaseName,
  highlights,
  onBackToDashboard,
}) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToDashboard}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white hover:bg-nutri-bg border border-nutri-cardBorder text-xs sm:text-sm font-bold text-nutri-primary transition min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('common.backToDashboard', 'Back to Dashboard')}</span>
        </button>

        <DemoBadge />
      </div>

      {/* Hero Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-nutri-cardBorder shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-nutri-primary border border-emerald-200 flex items-center justify-center shrink-0">
            <Icon className="w-8 h-8 stroke-[2]" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-nutri-primary text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t('common.serviceModule', 'NutriCrop Service Module')}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-nutri-primary">
              {title}
            </h1>
            <p className="text-sm text-nutri-muted mt-1 leading-relaxed">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-8 pt-6 border-t border-nutri-cardBorder">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
            Key Agricultural Capabilities
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {highlights.map((h, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3.5 rounded-2xl bg-nutri-bg border border-nutri-cardBorder"
              >
                <CheckCircle className="w-5 h-5 text-nutri-secondary shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm font-semibold text-gray-800 leading-snug">
                  {h}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Phase Notification Box */}
        <div className="mt-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-emerald-700 shrink-0" />
            <div className="text-xs text-emerald-950">
              <span className="font-bold">Next in Pipeline: Phase {phaseNumber} ({phaseName})</span>
              <p className="text-emerald-800 mt-0.5">
                Foundation (Phase 1) is currently active. Full interactive forms and calculation engines unlock in Phase {phaseNumber}.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
