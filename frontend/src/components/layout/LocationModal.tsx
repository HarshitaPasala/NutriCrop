'use client';

import React from 'react';
import { X, MapPin, Navigation, AlertCircle, RefreshCw, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useLocation } from '@/context/LocationContext';
import { useLanguage } from '@/context/LanguageContext';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LocationModal: React.FC<LocationModalProps> = ({ isOpen, onClose }) => {
  const { location, detectLocationGPS, isDetecting, statusMessage } = useLocation();
  const { t } = useLanguage();

  if (!isOpen) return null;

  const handleUpdate = async () => {
    await detectLocationGPS();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-nutri-cardBorder p-5 sm:p-7 overflow-hidden z-10 max-h-[90vh] overflow-y-auto space-y-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 flex items-center justify-center transition min-h-[40px]"
          aria-label={t('common.close', 'Close')}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 mb-2">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span>{t('header.automaticGps', 'Automatic Browser GPS Location')}</span>
          </div>
          <h3 className="text-xl font-black text-nutri-primary">
            {t('header.locationDetails', 'Detected Farm Location')}
          </h3>
          <p className="text-xs text-nutri-muted mt-1 leading-relaxed">
            {t(
              'header.gpsDesc',
              'Location is detected automatically via your browser GPS for accurate mandi prices, weather forecasts, and agronomic guidance.'
            )}
          </p>
        </div>

        {/* GPS Coordinates Bar */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">GPS Coordinates</span>
            <span className="font-mono font-bold text-slate-800">
              {location.latitude !== null && location.longitude !== null
                ? `${location.latitude.toFixed(5)}° N, ${location.longitude.toFixed(5)}° E`
                : 'Detecting coordinates...'}
            </span>
          </div>
          {location.isAutoDetected ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>GPS Locked</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-bold text-[11px]">
              <span>Pending GPS</span>
            </span>
          )}
        </div>

        {/* Status Message */}
        {statusMessage && (
          <div
            role="status"
            className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold"
          >
            <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Detailed Geographical Breakdown Grid */}
        <div className="space-y-2.5 pt-2 border-t border-slate-100">
          <span className="text-xs font-bold text-nutri-muted uppercase tracking-wider block">
            Identified Geography
          </span>

          <div className="grid grid-cols-2 gap-2.5 text-xs">
            {/* Village */}
            <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100">
              <span className="text-[10px] uppercase font-bold text-emerald-800 block">Village / Locality</span>
              <span className="font-bold text-nutri-primary text-sm mt-0.5 block truncate">
                {location.village || 'Unavailable'}
              </span>
            </div>

            {/* Mandal / Taluk */}
            <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100">
              <span className="text-[10px] uppercase font-bold text-emerald-800 block">Mandal / Taluk</span>
              <span className="font-bold text-nutri-primary text-sm mt-0.5 block truncate">
                {location.mandal || 'Unavailable'}
              </span>
            </div>

            {/* District */}
            <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100">
              <span className="text-[10px] uppercase font-bold text-emerald-800 block">District</span>
              <span className="font-bold text-nutri-primary text-sm mt-0.5 block truncate">
                {location.district || 'Unavailable'}
              </span>
            </div>

            {/* State */}
            <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100">
              <span className="text-[10px] uppercase font-bold text-emerald-800 block">State</span>
              <span className="font-bold text-nutri-primary text-sm mt-0.5 block truncate">
                {location.state || 'Unavailable'}
              </span>
            </div>
          </div>

          {/* PIN Code Highlighted Card */}
          <div className="p-3.5 rounded-2xl bg-emerald-100/70 border-2 border-emerald-400 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-black text-emerald-900 block tracking-wider">
                Postal PIN Code
              </span>
              <span className="text-lg font-black text-emerald-950 font-mono">
                {location.pincode || 'Unavailable'}
              </span>
            </div>
            <span className="text-[11px] font-bold text-emerald-800 px-2 py-0.5 rounded-md bg-white/70">
              {location.country || 'India'}
            </span>
          </div>
        </div>

        {/* Action Buttons: Update Location & Retry */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={handleUpdate}
            disabled={isDetecting}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-nutri-primary hover:bg-nutri-secondary text-white font-bold text-sm min-h-[48px] transition shadow-md active:scale-98 disabled:opacity-70"
          >
            {isDetecting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>{t('header.detectingGps', 'Detecting GPS location...')}</span>
              </>
            ) : (
              <>
                <Navigation className="w-4 h-4 text-white" />
                <span>{t('header.updateLocation', 'Update Location via GPS')}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl border border-gray-300 text-gray-700 font-bold text-xs hover:bg-gray-100 transition min-h-[44px]"
          >
            {t('common.close', 'Close')}
          </button>
        </div>
      </div>
    </div>
  );
};
