'use client';

import React from 'react';
import { X, Camera, Sun, Focus, CheckCircle2, XCircle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface PhotoGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PhotoGuideModal: React.FC<PhotoGuideModalProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-nutri-cardBorder p-6 z-10 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-nutri-primary flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <h3 className="text-base sm:text-lg font-black text-nutri-primary">
              {t('cropDoctor.photoTips', 'How to Photograph Crop Leaves')}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3.5 text-xs">
          {/* Tip 1: Natural Light */}
          <div className="p-3.5 rounded-2xl bg-nutri-bg border border-nutri-cardBorder flex items-start gap-3">
            <Sun className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <strong className="text-sm font-bold text-nutri-dark block mb-0.5">
                {t('cropDoctor.naturalLightTitle', 'Use Natural Daylight')}
              </strong>
              <p className="text-gray-600 leading-relaxed">
                {t('cropDoctor.naturalLightDesc', 'Photograph outside during morning or late afternoon. Avoid using phone flashlight which creates bright glare and distorts leaf colors.')}
              </p>
            </div>
          </div>

          {/* Tip 2: Lesion Focus */}
          <div className="p-3.5 rounded-2xl bg-nutri-bg border border-nutri-cardBorder flex items-start gap-3">
            <Focus className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-sm font-bold text-nutri-dark block mb-0.5">
                {t('cropDoctor.lesionFocusTitle', 'Focus on the Lesion Boundary')}
              </strong>
              <p className="text-gray-600 leading-relaxed">
                {t('cropDoctor.lesionFocusDesc', 'Center the camera where diseased tissue meets healthy green leaf. This border contains the freshest fungal spores and distinct symptom patterns.')}
              </p>
            </div>
          </div>

          {/* Do vs Don't */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
              <div className="flex items-center gap-1 font-bold text-emerald-900 mb-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{t('cropDoctor.goodPhoto', 'Good Photo')}</span>
              </div>
              <ul className="text-[11px] text-emerald-950 space-y-1">
                <li>• {t('cropDoctor.tipSteady', 'Steady hands')}</li>
                <li>• {t('cropDoctor.tipDistance', '15–20 cm distance')}</li>
                <li>• {t('cropDoctor.tipSingleLeaf', 'Single leaf filling frame')}</li>
              </ul>
            </div>

            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200">
              <div className="flex items-center gap-1 font-bold text-rose-900 mb-1">
                <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{t('cropDoctor.avoidPhoto', 'Avoid')}</span>
              </div>
              <ul className="text-[11px] text-rose-950 space-y-1">
                <li>• {t('cropDoctor.tipShaky', 'Shaky or blurry photo')}</li>
                <li>• {t('cropDoctor.tipAfar', 'Entire field from afar')}</li>
                <li>• {t('cropDoctor.tipShadows', 'Dark heavy shadows')}</li>
              </ul>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-nutri-primary hover:bg-nutri-primaryHover text-white text-xs font-bold transition shadow-xs"
        >
          {t('cropDoctor.closeGuide', 'Understood, Close Guide')}
        </button>
      </div>
    </div>
  );
};
