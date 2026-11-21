'use client';

import React from 'react';
import { Sprout, Volume2, VolumeX, ShieldCheck, CheckCircle2, Calendar, Droplets } from 'lucide-react';
import { useLanguage, translateCrop } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { useVoice } from '@/context/VoiceContext';
import { useLocation } from '@/context/LocationContext';

export const FarmerGreeting: React.FC = () => {
  const { t } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const { speakText, isSpeaking, stopSpeaking } = useVoice();
  const { location } = useLocation();
  const areaAcres = Number.isFinite(Number(location.areaAcres)) && Number(location.areaAcres) > 0
    ? Number(location.areaAcres)
    : 0;

  const handleSpeakGreeting = () => {
    if (isSpeaking) {
      stopSpeaking();
      return;
    }
    const farmerName = isAuthenticated && user?.name ? user.name : '';
    const activeFarm = `${location.village || location.district}, ${location.crop}, ${areaAcres.toFixed(2)} acres`;
    const textToRead = `${t('dashboard.greetingTitle')} ${farmerName}. ${t('dashboard.greetingSubtitle')} ${activeFarm}. ${t('dashboard.lastTested')}. ${t('dashboard.sprayWindow')}.`;
    speakText(textToRead);
  };

  return (
    <div className="relative bg-gradient-to-r from-emerald-900 via-nutri-primary to-nutri-secondary text-white rounded-3xl p-5 sm:p-7 shadow-lg overflow-hidden border border-emerald-700/60">
      {/* Background ambient plant leaves */}
      <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-emerald-500/10 pointer-events-none rounded-l-full blur-xl" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left Column: Greeting & Summary */}
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-emerald-200 text-xs font-bold mb-3 border border-white/20">
            <Sprout className="w-3.5 h-3.5 text-emerald-300" />
            <span>{t('positioning', 'Soil Health First – Smart Farming Platform')}</span>
          </div>

          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight leading-snug">
            {t('dashboard.greetingTitle', "Namaste, Farmer! Your farm's health starts here.")}
          </h1>

          <p className="text-xs sm:text-sm text-emerald-100/90 mt-2 leading-relaxed font-normal">
            {t(
              'dashboard.greetingSubtitle',
              'Check your soil nutrition status, inspect crop leaves for diseases, and plan field sprays with real-time advisories.'
            )}
          </p>

          {/* Quick Status Strip */}
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-white/15 text-xs text-emerald-100 font-semibold">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/10 border border-white/15">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              {location.village || location.district} · {translateCrop(location.crop, t)} · {areaAcres.toFixed(2)} {t('dashboard.acres', 'acres')}
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/10 border border-white/15">
              <Calendar className="w-3.5 h-3.5 text-amber-300" />
              {t('dashboard.lastTested', 'Soil Tested: 12 Oct 2026')}
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/10 border border-white/15">
              <Droplets className="w-3.5 h-3.5 text-sky-300" />
              {t('dashboard.sprayWindow', 'Spray Status: Favourable Window Open')}
            </span>
          </div>
        </div>

        {/* Right Column: Audio Listen Action Button */}
        <div className="shrink-0 flex items-center md:flex-col justify-end gap-2">
          <button
            onClick={handleSpeakGreeting}
            className={`flex items-center gap-2 px-4 py-3 rounded-2xl font-bold text-xs sm:text-sm min-h-touch transition shadow-md active:scale-95 ${
              isSpeaking
                ? 'bg-rose-500 hover:bg-rose-600 text-white'
                : 'bg-white hover:bg-emerald-50 text-nutri-primary'
            }`}
            aria-label={t('dashboard.listenGreeting', 'Listen to dashboard advisory')}
          >
            {isSpeaking ? (
              <>
                <VolumeX className="w-5 h-5 text-white" />
                <span>{t('dashboard.stopAudio', 'Stop Audio')}</span>
              </>
            ) : (
              <>
                <Volume2 className="w-5 h-5 text-emerald-700" />
                <span>{t('dashboard.listenGreeting', 'Listen to Advisory')}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
