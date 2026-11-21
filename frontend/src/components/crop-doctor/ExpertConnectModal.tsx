'use client';

import React, { useState } from 'react';
import { X, Headphones, PhoneCall, CheckCircle, Clock, ShieldCheck, Send } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useLocation } from '@/context/LocationContext';

interface ExpertConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  diagnosisContext?: string;
}

export const ExpertConnectModal: React.FC<ExpertConnectModalProps> = ({
  isOpen,
  onClose,
  diagnosisContext,
}) => {
  const { t } = useLanguage();
  const { location } = useLocation();

  const [phone, setPhone] = useState('9876543210');
  const [problemDesc, setProblemDesc] = useState(
    diagnosisContext ? `Need expert verification for: ${diagnosisContext}` : ''
  );
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmitCallback = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-nutri-cardBorder p-6 z-10 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-nutri-primary flex items-center justify-center">
              <Headphones className="w-4 h-4" />
            </div>
            <h3 className="text-base sm:text-lg font-black text-nutri-primary">
              {t('cropDoctor.expertBtn', 'Talk to an Agricultural Expert')}
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label={t('common.close', 'Close')}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Direct Toll-Free Helpline Button */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-800 to-nutri-secondary text-white space-y-2">
          <div className="flex items-center gap-2">
            <PhoneCall className="w-5 h-5 text-emerald-300 animate-pulse" />
            <strong className="text-sm font-black tracking-wide">
              {t('cropDoctor.kccTollFree', 'Kisan Call Centre (Toll-Free)')}
            </strong>
          </div>
          <p className="text-xs text-emerald-100">
            {t('cropDoctor.kccFreeAdvice', 'Free advice from ICAR / State Agriculture Department scientists.')}
          </p>
          <a
            href="tel:18001801551"
            className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-white text-nutri-primary font-black text-sm transition hover:bg-emerald-50 min-h-[44px]"
          >
            <PhoneCall className="w-4 h-4 text-emerald-700" />
            <span>{t('cropDoctor.callKcc', 'Call 1800-180-1551')}</span>
          </a>
        </div>

        {/* Request Callback from District KVK */}
        <div className="pt-1">
          <h4 className="text-xs font-black uppercase tracking-wider text-gray-700 mb-2">
            {t('cropDoctor.scheduleKvkCall', 'Schedule a Call with District KVK Scientist')} ({location.district})
          </h4>

          {submitted ? (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-1">
              <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto" />
              <strong className="text-sm font-bold text-emerald-950 block">
                {t('expertHelp.requestCallback', 'Callback Requested!')}
              </strong>
              <p className="text-xs text-emerald-800">
                {t('expertHelp.subtitle', 'A KVK subject matter specialist will contact you within 24 hours.')}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmitCallback} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                  {t('auth.mobileNumber', 'Your Mobile Number')}
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-nutri-bg text-xs font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                  {t('cropDoctor.symptoms', 'Describe Problem / Query')}
                </label>
                <textarea
                  value={problemDesc}
                  onChange={(e) => setProblemDesc(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-nutri-bg text-xs font-medium"
                  placeholder={t('cropDoctor.expertPlaceholder', 'e.g. Curling leaves with yellow spots on chilli crop')}
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-nutri-primary hover:bg-nutri-primaryHover text-white text-xs font-bold transition shadow-xs min-h-[44px]"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{t('cropDoctor.submitCallback', 'Submit Callback Request')}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
