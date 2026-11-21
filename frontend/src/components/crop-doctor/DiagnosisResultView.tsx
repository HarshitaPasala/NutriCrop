'use client';

import React from 'react';
import {
  Stethoscope,
  Volume2,
  VolumeX,
  AlertTriangle,
  CheckCircle2,
  Leaf,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Camera,
  Headphones,
  RotateCcw,
  Sparkles,
  Info,
  BookOpen,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useVoice } from '@/context/VoiceContext';
import { DemoBadge } from '@/components/ui/DemoBadge';

interface DiagnosisResultViewProps {
  data: any;
  leafImageUrl?: string | null;
  onNewScan: () => void;
  onOpenExpertModal: () => void;
  onOpenPhotoGuide: () => void;
  onOpenLibrary: () => void;
  onSaveToFarm: () => void;
}

export const DiagnosisResultView: React.FC<DiagnosisResultViewProps> = ({
  data,
  leafImageUrl,
  onNewScan,
  onOpenExpertModal,
  onOpenPhotoGuide,
  onOpenLibrary,
  onSaveToFarm,
}) => {
  const { t } = useLanguage();
  const { speakText, isSpeaking, stopSpeaking } = useVoice();

  const isHigh = data.confidence_tier === 'High';
  const isMedium = data.confidence_tier === 'Medium';
  const isLow = data.confidence_tier === 'Low';

  const handleReadAloud = () => {
    if (isSpeaking) {
      stopSpeaking();
      return;
    }
    const text = `${t('cropDoctor.title')}. ${data.diagnosis}. ${t('cropDoctor.confidence')}: ${data.confidence_percentage} percent. ${t('cropDoctor.symptoms')}: ${data.symptoms}. ${t('cropDoctor.cause')}: ${data.cause}.`;
    speakText(text);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Action Header */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-nutri-cardBorder shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          {leafImageUrl && (
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-emerald-500 shrink-0 shadow-sm bg-nutri-bg">
              <img
                src={leafImageUrl}
                alt={data.diagnosis || 'Scanned Leaf'}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span
                className={`text-xs font-black px-3 py-1 rounded-full ${
                  isHigh
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    : isMedium
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-rose-100 text-rose-900 border border-rose-300'
                }`}
              >
                {isHigh
                  ? t('cropDoctor.highConfidence', 'High Confidence Diagnosis')
                  : isMedium
                  ? t('cropDoctor.medConfidence', 'Tentative Diagnosis')
                  : t('cropDoctor.lowConfidence', 'Low Confidence Alert')}
              </span>
              {data.is_demo && <DemoBadge />}
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-nutri-primary">
              {data.local_name ? `${data.diagnosis} · ${data.local_name}` : data.diagnosis}
            </h2>
            {data.severity && <span className="mt-1 inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-950">{t('cropDoctor.severity', 'Severity')}: {data.severity}</span>}
            <p className="text-xs text-nutri-muted font-semibold mt-0.5">
              Crop: {data.crop} • Confidence Score: {data.confidence_percentage}%
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <button type="button" onClick={() => { localStorage.setItem('nutricrop_library_search', data.diagnosis); onOpenLibrary(); }} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-50 text-sky-900 border border-sky-200 text-xs font-bold min-h-[44px]">
            <BookOpen className="w-4 h-4" /><span>{t('cropDoctor.findInLibrary', 'Find in Problem Library')}</span>
          </button>
          <button type="button" onClick={onSaveToFarm} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-bold min-h-[44px]">
            <Leaf className="w-4 h-4" /><span>{t('cropDoctor.saveToFarm', 'Save to My Farm')}</span>
          </button>
          <button
            type="button"
            onClick={handleReadAloud}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition min-h-[44px] ${
              isSpeaking
                ? 'bg-rose-50 text-rose-700 border-rose-300'
                : 'bg-emerald-50 text-nutri-primary border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-700" />}
            <span>{isSpeaking ? t('dashboard.stopAudio', 'Stop Audio') : t('cropDoctor.listenDiagnosis', 'Listen to Diagnosis')}</span>
          </button>

          <button
            type="button"
            onClick={onNewScan}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-nutri-bg hover:bg-gray-200 text-gray-700 text-xs font-bold transition min-h-[44px]"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{t('cropDoctor.newScan', 'New Scan')}</span>
          </button>
        </div>
      </div>

      {/* Medium Confidence Alert: Photo Retake Guidance */}
      {isMedium && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-950">
          <div className="flex items-start gap-2.5">
            <Camera className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <strong className="text-sm font-bold block mb-0.5">
                {t('cropDoctor.clarityModerate', 'Clarity is moderate (68% confidence)')}
              </strong>
              <p className="text-amber-900 leading-relaxed">
                {t('cropDoctor.retakePrompt')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenPhotoGuide}
            className="px-3.5 py-2 rounded-xl bg-amber-200 hover:bg-amber-300 text-amber-950 font-bold shrink-0 min-h-[40px]"
          >
            {t('cropDoctor.viewPhotoTips', 'View Photography Tips')}
          </button>
        </div>
      )}

      {/* Low Confidence Alert: Dosage Suppressed Safety Rule */}
      {isLow && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 flex items-start gap-3 text-xs text-rose-950">
          <ShieldAlert className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <strong className="text-sm font-black block mb-1">
              {t('cropDoctor.safetyDosageSuppressed', 'Safety Warning: Chemical Dosage Suppressed')}
            </strong>
            <p className="text-rose-900 leading-relaxed font-medium">
              {t('cropDoctor.lowConfidenceAlert')}
            </p>
            <button
              type="button"
              onClick={onOpenExpertModal}
              className="mt-2.5 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs"
            >
              <Headphones className="w-3.5 h-3.5" />
              <span>{t('cropDoctor.talkKvkFree', 'Talk to KVK Expert for Free')}</span>
            </button>
          </div>
        </div>
      )}

      {/* 1. Symptoms & Cause Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-nutri-cardBorder shadow-sm space-y-4">
        <h3 className="text-base sm:text-lg font-black text-nutri-primary">
          {t('cropDoctor.symptoms', 'Observable Symptoms & Cause')}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-nutri-bg border border-nutri-cardBorder space-y-1">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
              {t('cropDoctor.fieldSymptoms', 'Field Symptoms')}
            </span>
            <p className="text-xs sm:text-sm font-medium text-gray-800 leading-relaxed">
              {data.symptoms}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-nutri-bg border border-nutri-cardBorder space-y-1">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
              {t('cropDoctor.biologicalOrigin', 'Biological Origin & Spread')}
            </span>
            <p className="text-xs sm:text-sm font-medium text-gray-800 leading-relaxed">
              {data.cause}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Organic & Natural Treatments First (Safe & Affordable) */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-nutri-cardBorder shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Leaf className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-nutri-primary">
                {t('cropDoctor.organicTitle', 'Organic & Biological Remedies (Natural First)')}
              </h3>
              <p className="text-[11px] text-nutri-muted font-medium">
                {t('cropDoctor.organicSubtitle', 'Eco-friendly, low-cost bio-formulations safe for beneficial pollinating insects.')}
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            {t('cropDoctor.naturalFirstBadge', 'Natural First')}
          </span>
        </div>

        {(data.organic_treatments || []).length === 0 ? <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-950">{t('cropDoctor.noOrganicOption', 'No treatment can be recommended from this photo yet. Retake a clear photo or contact your local KVK.')}</p> : <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(data.organic_treatments || []).map((org: any, idx: number) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-2 flex flex-col justify-between"
            >
              <div>
                {idx === 0 && <span className="mb-1 inline-block rounded-full bg-emerald-700 px-2 py-0.5 text-[10px] font-bold text-white">{t('cropDoctor.mostAffordable', 'Start with this lower-cost option')}</span>}
                <strong className="text-sm font-bold text-emerald-950 block">
                  {org.name}
                </strong>
                <span className="text-xs font-semibold text-emerald-700 block mt-0.5">
                  {t('cropDoctor.dosageLabel', 'Dosage: {dosage}', { dosage: org.dosage })}
                </span>
                {Number.isFinite(org.estimated_cost_inr_per_acre) && <span className="text-xs font-bold text-emerald-800">₹{org.estimated_cost_inr_per_acre}/acre</span>}
              </div>
              <p className="text-[11px] text-gray-600 leading-snug">
                {org.method}
              </p>
            </div>
          ))}
        </div>}
      </div>

      {/* 3. CIBRC Verified Chemical Treatments (Safety Guardrail Enforced) */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-nutri-cardBorder shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-nutri-primary">
                {t('cropDoctor.chemicalTitle', 'CIBRC Verified Chemical Treatments')}
              </h3>
              <p className="text-[11px] text-nutri-muted font-medium">
                {t('cropDoctor.chemicalSubtitle', 'Officially registered product label claims with mandatory Pre-Harvest Waiting Intervals.')}
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold text-sky-900 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
            {t('cropDoctor.govtClaimsBadge', 'Govt Label Claims')}
          </span>
        </div>

        {(data.verified_chemical_treatments || []).length === 0 ? <p className="rounded-xl bg-sky-50 p-3 text-sm text-sky-950">{t('cropDoctor.noVerifiedChemical', 'No verified chemical treatment is available for this result.')}</p> : <div className="space-y-3">
          {(data.verified_chemical_treatments || []).map((chem: any, idx: number) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-nutri-bg border border-nutri-cardBorder space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-gray-200">
                <div>
                  <strong className="text-sm font-black text-nutri-dark">
                    {chem.active_ingredient}
                  </strong>
                  {chem.trade_examples !== 'N/A' && (
                    <span className="text-xs text-gray-500 font-semibold block sm:inline sm:ml-2">
                      {t('cropDoctor.tradeExamples', '(Trade examples: {examples})', { examples: chem.trade_examples })}
                    </span>
                  )}
                </div>

                {chem.phi_days !== null && chem.phi_days !== undefined && (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 bg-amber-100/70 px-2.5 py-1 rounded-xl self-start sm:self-auto">
                    <Clock className="w-3.5 h-3.5 text-amber-700" />
                    <span>{t('cropDoctor.phiWaitingDays', 'PHI Waiting: {days} Days', { days: chem.phi_days })}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-gray-500 font-bold block uppercase text-[10px]">
                    {t('cropDoctor.approvedDosage', 'Approved Label Dosage')}
                  </span>
                  <strong className="text-sm font-black text-nutri-primary block">
                    {chem.dosage_per_acre}
                  </strong>
                  <span className="text-[11px] text-gray-600 block mt-0.5">
                    {t('cropDoctor.concentrationLabel', 'Concentration: {concentration}', { concentration: chem.concentration })}
                  </span>
                </div>
                {Number.isFinite(chem.estimated_cost_inr_per_acre) && <strong className="text-emerald-900">₹{chem.estimated_cost_inr_per_acre}/acre</strong>}

                <div>
                  <span className="text-gray-500 font-bold block uppercase text-[10px]">
                    {t('cropDoctor.applicationSafety', 'Application Method & Safety')}
                  </span>
                  <p className="text-gray-700 leading-snug">
                    {chem.application_method}
                  </p>
                  {chem.ppe_required && chem.ppe_required !== 'N/A' && (
                    <span className="text-[11px] font-semibold text-rose-700 block mt-1">
                      ⚠️ PPE: {chem.ppe_required}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>}
      </div>

      {data.estimated_cost_per_acre != null && <p className="rounded-xl bg-emerald-50 p-3 text-sm font-bold text-emerald-950">{t('cropDoctor.estimatedCost', 'Estimated treatment cost')}: ₹{data.estimated_cost_per_acre}/acre</p>}

      {/* 4. Prevention & Cultural Practices */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-nutri-cardBorder shadow-sm space-y-3">
        <h4 className="text-sm font-black text-nutri-primary">
          {t('cropDoctor.preventionTitle', 'Field Prevention & Cultural Best Practices')}
        </h4>
        <ul className="space-y-2 text-xs text-gray-700 font-medium">
          {(data.prevention || []).map((tip: string, idx: number) => (
            <li key={idx} className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 5. One-Click "Talk to an Expert" Button & AI Advisory Disclaimer */}
      <div className="p-5 rounded-3xl bg-emerald-50 border border-emerald-300 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-nutri-primary text-white flex items-center justify-center shrink-0">
            <Headphones className="w-6 h-6 text-emerald-300" />
          </div>
          <div>
            <strong className="text-sm font-black text-nutri-primary block">
              {t('cropDoctor.stillUnsure', 'Still unsure? Speak directly with agricultural officers')}
            </strong>
            <p className="text-xs text-emerald-900 font-medium">
              {t('cropDoctor.shareKvkDesc', 'Share this diagnosis with district KVK scientists or call the Kisan Call Centre for free.')}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenExpertModal}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-nutri-primary hover:bg-nutri-primaryHover text-white font-black text-xs sm:text-sm transition shadow-sm shrink-0 min-h-[48px] active:scale-95"
        >
          <Headphones className="w-4 h-4 text-emerald-300" />
          <span>{t('cropDoctor.expertBtn', 'Talk to an Agricultural Expert')}</span>
        </button>
      </div>

      {/* AI Advisory Disclaimer */}
      <div className="rounded-2xl p-4 bg-white border border-nutri-cardBorder text-xs text-nutri-muted font-medium flex items-center gap-2">
        <Info className="w-4 h-4 text-gray-500 shrink-0" />
        <p>{data.ai_disclaimer}</p>
      </div>
      {data.chemical_review_required && <p role="note" className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-semibold text-amber-950">{t('cropDoctor.verifyChemicalNote', 'AI-generated chemical options are not shown as verified. Confirm any product, dose and harvest waiting period with its approved label and your local KVK or agriculture officer before use.')}</p>}
      <p role="note" className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-950">{t('cropDoctor.spraySafety', 'Wear label-required protective gear. Do not spray in strong wind, midday heat, or before rain. Follow the product label harvest waiting period and confirm with your local KVK or agriculture officer.')}</p>
    </div>
  );
};
