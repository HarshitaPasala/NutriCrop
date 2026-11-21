'use client';

import React, { useState } from 'react';
import {
  FlaskConical,
  Sparkles,
  Info,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  ArrowRight,
} from 'lucide-react';
import { useLanguage, translateCrop, translateSoilType } from '@/context/LanguageContext';
import { useLocation } from '@/context/LocationContext';

export interface SoilCardFormValues {
  n: number;
  p: number;
  k: number;
  ph: number;
  farm_size: number;
  crop: string;
  soil_type: string;
  unit: string;
  oc: number;
}

interface SoilCardFormProps {
  onSubmit: (values: SoilCardFormValues) => void;
  isLoading: boolean;
}

const CROPS = [
  { id: 'paddy', name: 'Paddy (Rice)' },
  { id: 'cotton', name: 'Cotton' },
  { id: 'chilli', name: 'Chilli' },
  { id: 'wheat', name: 'Wheat' },
  { id: 'maize', name: 'Maize' },
  { id: 'pigeon_pea', name: 'Pigeon Pea (Redgram)' },
  { id: 'groundnut', name: 'Groundnut' },
  { id: 'sugarcane', name: 'Sugarcane' },
  { id: 'potato', name: 'Potato' },
  { id: 'tomato', name: 'Tomato' },
];

const SOIL_TYPES = [
  'Alluvial (Loamy)',
  'Black / Vertisol (Heavy Clay)',
  'Red Soil (Sandy Loam)',
  'Laterite (Acidic)',
  'Coastal Sandy Soil',
];

export const OC_MIN_PERCENT = 0.01;
export const OC_MAX_PERCENT = 5.0;

export const SoilCardForm: React.FC<SoilCardFormProps> = ({ onSubmit, isLoading }) => {
  const { t } = useLanguage();
  const { location } = useLocation();

  const [n, setN] = useState<number>(240);
  const [p, setP] = useState<number>(14);
  const [k, setK] = useState<number>(130);
  const [ph, setPh] = useState<number>(6.5);
  const [farmSize, setFarmSize] = useState<number>(2.5);
  const [unit, setUnit] = useState<string>('acre');
  const [crop, setCrop] = useState<string>('Paddy (Rice)');
  const [soilType, setSoilType] = useState<string>('Alluvial (Loamy)');
  const [oc, setOc] = useState<string>('0.52');
  const [formError, setFormError] = useState('');

  const handlePrefillDemo = () => {
    setN(210); // Low N
    setP(12);  // Medium P
    setK(95);  // Low K
    setPh(6.4);
    setFarmSize(2.5);
    setUnit('acre');
    setCrop('Paddy (Rice)');
    setSoilType('Alluvial (Loamy)');
    setOc('0.48');
    setFormError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedOc = Number(oc.trim().replace(',', '.'));
    if (!Number.isFinite(normalizedOc) || normalizedOc < OC_MIN_PERCENT || normalizedOc > OC_MAX_PERCENT) {
      setFormError(t('soil.ocInvalid', 'Enter an Organic Carbon value between 0.01 and 5.0%.'));
      return;
    }
    if (!Number.isFinite(farmSize) || farmSize < 0.1 || farmSize > 100) {
      setFormError(t('soil.farmSizeInvalid', 'Enter a farm size between 0.1 and 100.'));
      return;
    }
    if (![n, p, k, ph].every(Number.isFinite) || n < 0 || n > 1000 || p < 0 || p > 300 || k < 0 || k > 1000 || ph < 3 || ph > 11) {
      setFormError(t('soil.valuesInvalid', 'Check that all soil values are within their allowed ranges.'));
      return;
    }
    setFormError('');
    onSubmit({
      n: Number(n),
      p: Number(p),
      k: Number(k),
      ph: Number(ph),
      farm_size: Number(farmSize),
      crop,
      soil_type: soilType,
      unit,
      oc: normalizedOc,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-5 sm:p-7 border border-nutri-cardBorder shadow-sm space-y-6">
      {/* Form Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-nutri-cardBorder">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-nutri-primary text-xs font-bold mb-1.5 border border-emerald-200">
            <FlaskConical className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t('soil.stcrModel', 'Soil Test Crop Response (STCR)')}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-nutri-primary">
            {t('soil.cardInputs', 'Soil Health Card Parameters')}
          </h2>
          <p className="text-xs text-nutri-muted font-medium mt-0.5">
            {t('soil.enterValuesDesc', 'Enter values directly from your Soil Health Card test report.')}
          </p>
        </div>

        {/* Demo Auto-fill Button */}
        <button
          type="button"
          onClick={handlePrefillDemo}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold transition shadow-2xs self-start sm:self-auto min-h-[44px]"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>{t('soil.prefillDemo', 'Pre-fill Demo Soil Card')}</span>
        </button>
      </div>

      {/* Row 1: Crop and Farm Size */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Crop Selection */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
            {t('soil.crop', 'Target Crop')}
          </label>
          <select
            value={crop}
            onChange={(e) => setCrop(e.target.value)}
            className="w-full px-3.5 py-3 rounded-2xl border-2 border-gray-200 focus:border-nutri-primary bg-nutri-bg text-sm font-bold text-gray-900 outline-none min-h-[48px]"
          >
            {CROPS.map((c) => (
              <option key={c.id} value={c.name}>
                {translateCrop(c.name, t)}
              </option>
            ))}
          </select>
        </div>

        {/* Farm Size */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-gray-700 uppercase">
              {t('soil.farmSize', 'Farm Size')}
            </label>
            <div className="flex items-center gap-1 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setUnit('acre')}
                className={`px-2 py-0.5 rounded-md ${unit === 'acre' ? 'bg-nutri-primary text-white' : 'text-gray-500'}`}
              >
                {t('dashboard.acres', 'Acres')}
              </button>
              <button
                type="button"
                onClick={() => setUnit('hectare')}
                className={`px-2 py-0.5 rounded-md ${unit === 'hectare' ? 'bg-nutri-primary text-white' : 'text-gray-500'}`}
              >
                {t('soil.hectares', 'Hectares')}
              </button>
            </div>
          </div>
          <input
            type="number"
            step="0.1"
            min="0.1"
            max="100"
            value={farmSize}
            onChange={(e) => setFarmSize(Number(e.target.value))}
            className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-gray-200 focus:border-nutri-primary bg-nutri-bg text-sm font-bold text-gray-900 outline-none min-h-[48px]"
          />
        </div>

        {/* Soil Type */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
            {t('soil.soilType', 'Soil Type')}
          </label>
          <select
            value={soilType}
            onChange={(e) => setSoilType(e.target.value)}
            className="w-full px-3.5 py-3 rounded-2xl border-2 border-gray-200 focus:border-nutri-primary bg-nutri-bg text-sm font-bold text-gray-900 outline-none min-h-[48px]"
          >
            {SOIL_TYPES.map((s) => (
              <option key={s} value={s}>
                {translateSoilType(s, t)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Row 2: Macronutrients (N, P, K) with Visual Status Gauge Preview */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            {t('soil.primaryLabValues', 'Primary Soil Test Lab Values (kg/ha)')}
          </span>
          <span className="text-[11px] text-nutri-muted font-semibold">
            {t('soil.standardLabRanges', 'Standard ICAR Benchmarks')}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Nitrogen (N) */}
          <div className="bg-nutri-bg p-4 rounded-2xl border border-nutri-cardBorder space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-nutri-dark">
                {t('soil.nitrogen', 'Available Nitrogen (N)')}
              </span>
              <span
                className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                  n < 280
                    ? 'bg-rose-100 text-rose-800'
                    : n <= 560
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {n < 280 ? 'Low (<280)' : n <= 560 ? 'Medium (280-560)' : 'High (>560)'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="900"
                value={n}
                onChange={(e) => setN(Number(e.target.value))}
                className="w-24 px-3 py-1.5 rounded-xl border border-gray-300 font-black text-sm bg-white"
              />
              <span className="text-xs text-gray-500 font-semibold">kg/ha</span>
            </div>

            <input
              type="range"
              min="50"
              max="750"
              step="10"
              value={n}
              onChange={(e) => setN(Number(e.target.value))}
              className="w-full accent-nutri-primary cursor-pointer"
            />
          </div>

          {/* Phosphorus (P) */}
          <div className="bg-nutri-bg p-4 rounded-2xl border border-nutri-cardBorder space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-nutri-dark">
                {t('soil.phosphorus', 'Available Phosphorus (P)')}
              </span>
              <span
                className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                  p < 10
                    ? 'bg-rose-100 text-rose-800'
                    : p <= 25
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {p < 10 ? 'Low (<10)' : p <= 25 ? 'Medium (10-25)' : 'High (>25)'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="150"
                value={p}
                onChange={(e) => setP(Number(e.target.value))}
                className="w-24 px-3 py-1.5 rounded-xl border border-gray-300 font-black text-sm bg-white"
              />
              <span className="text-xs text-gray-500 font-semibold">kg/ha</span>
            </div>

            <input
              type="range"
              min="2"
              max="60"
              step="1"
              value={p}
              onChange={(e) => setP(Number(e.target.value))}
              className="w-full accent-nutri-primary cursor-pointer"
            />
          </div>

          {/* Potassium (K) */}
          <div className="bg-nutri-bg p-4 rounded-2xl border border-nutri-cardBorder space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-nutri-dark">
                {t('soil.potassium', 'Available Potassium (K)')}
              </span>
              <span
                className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                  k < 108
                    ? 'bg-rose-100 text-rose-800'
                    : k <= 280
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {k < 108 ? 'Low (<108)' : k <= 280 ? 'Medium (108-280)' : 'High (>280)'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="600"
                value={k}
                onChange={(e) => setK(Number(e.target.value))}
                className="w-24 px-3 py-1.5 rounded-xl border border-gray-300 font-black text-sm bg-white"
              />
              <span className="text-xs text-gray-500 font-semibold">kg/ha</span>
            </div>

            <input
              type="range"
              min="30"
              max="450"
              step="5"
              value={k}
              onChange={(e) => setK(Number(e.target.value))}
              className="w-full accent-nutri-primary cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Row 3: pH Reaction and Organic Carbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Soil pH */}
        <div className="bg-nutri-bg p-4 rounded-2xl border border-nutri-cardBorder space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-nutri-dark">
              {t('soil.ph', 'Soil pH')}
            </span>
            <span
              className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                ph < 5.8
                  ? 'bg-amber-100 text-amber-900'
                  : ph <= 7.8
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-purple-100 text-purple-900'
              }`}
            >
              {ph < 5.8 ? 'Acidic (<5.8)' : ph <= 7.8 ? 'Neutral (5.8-7.8)' : 'Alkaline (>7.8)'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="number"
              step="0.1"
              min="3.5"
              max="10.5"
              value={ph}
              onChange={(e) => setPh(Number(e.target.value))}
              className="w-24 px-3 py-1.5 rounded-xl border border-gray-300 font-black text-sm bg-white"
            />
            <span className="text-xs text-gray-500 font-semibold">{t('soil.scaleRange', 'scale 3.5 – 10.5')}</span>
          </div>

          <input
            type="range"
            min="4.5"
            max="9.5"
            step="0.1"
            value={ph}
            onChange={(e) => setPh(Number(e.target.value))}
            className="w-full accent-nutri-primary cursor-pointer"
          />
        </div>

        {/* Organic Carbon (%) */}
        <div className="bg-nutri-bg p-4 rounded-2xl border border-nutri-cardBorder space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-nutri-dark">
              {t('soil.organicCarbon', 'Organic Carbon (%)')}
            </span>
            <span
              className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                Number(oc.replace(',', '.')) < 0.5
                  ? 'bg-rose-100 text-rose-800'
                : Number(oc.replace(',', '.')) <= 0.75
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-teal-100 text-teal-800'
              }`}
            >
              {Number(oc.replace(',', '.')) < 0.5 ? 'Low (<0.50%)' : Number(oc.replace(',', '.')) <= 0.75 ? 'Medium (0.50–0.75%)' : 'High (>0.75%)'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              inputMode="decimal"
              autoComplete="off"
              aria-describedby="oc-help oc-error"
              value={oc}
              onChange={(e) => { setOc(e.target.value); setFormError(''); }}
              className="w-24 px-3 py-1.5 rounded-xl border border-gray-300 font-black text-sm bg-white"
            />
            <span id="oc-help" className="text-xs text-gray-500 font-semibold">{t('soil.ocRange', '% OC · 0.01–5.0')}</span>
          </div>

          <input
            type="range"
            min={OC_MIN_PERCENT}
            max={OC_MAX_PERCENT}
            step="0.01"
            value={Number(oc.replace(',', '.')) >= OC_MIN_PERCENT && Number(oc.replace(',', '.')) <= OC_MAX_PERCENT ? Number(oc.replace(',', '.')) : 0.52}
            onChange={(e) => { setOc(e.target.value); setFormError(''); }}
            className="w-full accent-nutri-primary cursor-pointer"
          />
        </div>
      </div>

      {formError && <p id="oc-error" role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">{formError}</p>}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl bg-nutri-primary hover:bg-nutri-primaryHover disabled:opacity-50 text-white font-extrabold text-sm sm:text-base min-h-touch transition shadow-md active:scale-98"
      >
        {isLoading ? (
          <>
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span>{t('soil.calculating', 'Calculating Prescription...')}</span>
          </>
        ) : (
          <>
            <span>{t('soil.calculateBtn', 'Calculate Fertilizer Prescription')}</span>
            <ArrowRight className="w-5 h-5" />
          </>
        )}
      </button>
    </form>
  );
};
