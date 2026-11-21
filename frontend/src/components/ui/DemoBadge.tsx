'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface DemoBadgeProps {
  className?: string;
}

export const DemoBadge: React.FC<DemoBadgeProps> = ({ className = '' }) => {
  const { t } = useLanguage();
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300 shadow-sm ${className}`}
      title="This component is currently displaying realistic simulated data from a mock adapter"
    >
      <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
      <span>{t('common.demoData', 'Demo data')}</span>
    </span>
  );
};
