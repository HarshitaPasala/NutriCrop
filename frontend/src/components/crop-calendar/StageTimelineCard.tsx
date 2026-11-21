'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Circle,
  ChevronDown,
  ChevronUp,
  Droplets,
  FlaskConical,
  Bug,
  AlertTriangle,
  Calendar,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface CropStage {
  stage_id: string;
  stage_number: number;
  name: string;
  das_range: string;
  start_das: number;
  end_das: number;
  target_start_date: string;
  target_end_date: string;
  status: 'completed' | 'current' | 'upcoming';
  description: string;
  key_activities: string[];
  nutrient_application?: string;
  irrigation_advisory: string;
  pest_monitoring: string;
  weather_risk_alert?: string;
}

interface StageTimelineCardProps {
  stage: CropStage;
  isFirst: boolean;
  isLast: boolean;
}

export const StageTimelineCard: React.FC<StageTimelineCardProps> = ({
  stage,
  isFirst,
  isLast,
}) => {
  const { t, language } = useLanguage();
  const [isExpanded, setIsExpanded] = useState<boolean>(stage.status === 'current');

  const formatStageDate = (value: string) => {
    const match = value.match(/^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})$/);
    if (!match) return value;
    const month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].indexOf(match[2]);
    if (month < 0) return value;
    const parsed = new Date(Number(match[3]), month, Number(match[1]), 12);
    return Number.isNaN(parsed.getTime())
      ? value
      : new Intl.DateTimeFormat(`${language}-IN`, { day: 'numeric', month: 'short', year: 'numeric' }).format(parsed);
  };

  const isCurrent = stage.status === 'current';
  const isCompleted = stage.status === 'completed';

  return (
    <div className="relative pl-8 sm:pl-10 pb-6 group">
      {/* Vertical connection line */}
      {!isLast && (
        <div
          className={`absolute left-3.5 sm:left-4.5 top-8 bottom-0 w-0.5 ${
            isCompleted ? 'bg-emerald-500' : 'bg-slate-200'
          }`}
        />
      )}

      {/* Stage status node icon */}
      <div
        className={`absolute left-0 sm:left-1 top-1.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all ${
          isCurrent
            ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 shadow-md scale-110'
            : isCompleted
            ? 'bg-emerald-100 text-emerald-800 border-2 border-emerald-500'
            : 'bg-slate-100 text-slate-400 border border-slate-300'
        }`}
      >
        {isCompleted ? (
          <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
        ) : isCurrent ? (
          <Clock className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
        ) : (
          <Circle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        )}
      </div>

      {/* Main Stage Card Content */}
      <div
        className={`rounded-3xl p-5 border transition-all ${
          isCurrent
            ? 'bg-emerald-50/40 border-emerald-300 shadow-sm'
            : isCompleted
            ? 'bg-white border-nutri-cardBorder hover:border-emerald-200'
            : 'bg-white/80 border-nutri-cardBorder opacity-80 hover:opacity-100'
        }`}
      >
        {/* Card Header & Toggle */}
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setIsExpanded((expanded) => !expanded); } }}
          className="flex items-center justify-between cursor-pointer select-none"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-black uppercase tracking-wider text-nutri-muted">
                Stage {stage.stage_number} • {stage.das_range}
              </span>
              {isCurrent && (
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-600 text-white shadow-xs">
                  Active Now
                </span>
              )}
              {isCompleted && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Completed
                </span>
              )}
            </div>
            <h3 className="text-base sm:text-lg font-black text-nutri-primary">
              {stage.name}
            </h3>
            <p className="text-xs text-nutri-muted font-semibold flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-nutri-secondary" />
              <span>
                {formatStageDate(stage.target_start_date)} – {formatStageDate(stage.target_end_date)}
              </span>
            </p>
          </div>

          <div aria-hidden="true" className="w-8 h-8 rounded-full hover:bg-white flex items-center justify-center text-nutri-muted transition shrink-0">
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </div>

        {/* Collapsible Details */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-nutri-cardBorder space-y-4 animate-fade-in text-xs sm:text-sm">
            <p className="text-xs text-nutri-primary font-medium leading-relaxed">
              {stage.description}
            </p>

            {/* Key Recommended Activities */}
            {stage.key_activities && stage.key_activities.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-nutri-primary uppercase tracking-wider">
                  {t('cropCalendar.keyTasks', 'Recommended Farming Operations')}:
                </span>
                <ul className="space-y-1 pl-1">
                  {stage.key_activities.map((act, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs font-semibold text-nutri-primary">
                      <span className="w-1.5 h-1.5 rounded-full bg-nutri-secondary mt-1.5 shrink-0" />
                      <span>{act}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Nutrient & Irrigation Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {stage.nutrient_application && (
                <div className="p-3 rounded-2xl bg-white border border-nutri-cardBorder space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                    <FlaskConical className="w-4 h-4 text-emerald-700" />
                    <span>{t('cropCalendar.fertilizerTiming', 'Fertilizer & Nutrition')}</span>
                  </div>
                  <p className="text-[11px] text-nutri-primary font-medium">
                    {stage.nutrient_application}
                  </p>
                </div>
              )}

              <div className="p-3 rounded-2xl bg-white border border-nutri-cardBorder space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-sky-900">
                  <Droplets className="w-4 h-4 text-sky-700" />
                  <span>{t('cropCalendar.irrigationTiming', 'Irrigation Guidance')}</span>
                </div>
                <p className="text-[11px] text-nutri-primary font-medium">
                  {stage.irrigation_advisory}
                </p>
              </div>
            </div>

            {/* Pest Scouting Alert */}
            <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-950 font-medium">
              <Bug className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong>{t('cropCalendar.pestScouting', 'Pest & Disease Surveillance')}:</strong>{' '}
                {stage.pest_monitoring}
              </div>
            </div>

            {/* Weather Risk Note */}
            {stage.weather_risk_alert && (
              <div className="p-3 rounded-2xl bg-rose-50/70 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-950 font-medium">
                <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
                <div>
                  <strong>{t('cropCalendar.weatherRisk', 'Weather Risk')}:</strong>{' '}
                  {stage.weather_risk_alert}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
