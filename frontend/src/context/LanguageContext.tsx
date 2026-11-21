'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import en from '../i18n/en.json';
import te from '../i18n/te.json';
import hi from '../i18n/hi.json';
import ta from '../i18n/ta.json';
import mr from '../i18n/mr.json';
import pa from '../i18n/pa.json';
import bn from '../i18n/bn.json';
import kn from '../i18n/kn.json';
import ml from '../i18n/ml.json';
import gu from '../i18n/gu.json';
import or from '../i18n/or.json';

export type LanguageCode = 'en' | 'te' | 'hi' | 'ta' | 'mr' | 'pa' | 'bn' | 'kn' | 'ml' | 'gu' | 'or';

export interface LanguageOption {
  code: LanguageCode;
  label: string;
  nativeName: string;
  speechCode: string;
  fontClass: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', nativeName: 'English', speechCode: 'en-IN', fontClass: 'font-sans' },
  { code: 'te', label: 'Telugu', nativeName: 'తెలుగు', speechCode: 'te-IN', fontClass: 'font-telugu' },
  { code: 'hi', label: 'Hindi', nativeName: 'हिंदी', speechCode: 'hi-IN', fontClass: 'font-devanagari' },
  { code: 'ta', label: 'Tamil', nativeName: 'தமிழ்', speechCode: 'ta-IN', fontClass: 'font-tamil' },
  { code: 'mr', label: 'Marathi', nativeName: 'मराठी', speechCode: 'mr-IN', fontClass: 'font-devanagari' },
  { code: 'pa', label: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', speechCode: 'pa-IN', fontClass: 'font-gurmukhi' },
  { code: 'bn', label: 'Bengali', nativeName: 'বাংলা', speechCode: 'bn-IN', fontClass: 'font-bengali' },
  { code: 'kn', label: 'Kannada', nativeName: 'ಕನ್ನಡ', speechCode: 'kn-IN', fontClass: 'font-kannada' },
  { code: 'ml', label: 'Malayalam', nativeName: 'മലയാളം', speechCode: 'ml-IN', fontClass: 'font-malayalam' },
  { code: 'gu', label: 'Gujarati', nativeName: 'ગુજરાતી', speechCode: 'gu-IN', fontClass: 'font-gujarati' },
  { code: 'or', label: 'Odia', nativeName: 'ଓଡ଼ିଆ', speechCode: 'or-IN', fontClass: 'font-odia' },
];

const translations: Record<LanguageCode, any> = {
  en,
  te,
  hi,
  ta,
  mr,
  pa,
  bn,
  kn,
  ml,
  gu,
  or,
};

const warnedFallbackKeys = new Set<string>();

export type InterpolationParams = Record<string, string | number>;

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  currentLangOption: LanguageOption;
  t: (path: string, fallbackOrParams?: string | InterpolationParams, params?: InterpolationParams) => string;
}

const interpolate = (template: string, vars?: InterpolationParams): string => {
  if (!vars || typeof template !== 'string') return template;
  let result = template;
  for (const [k, v] of Object.entries(vars)) {
    result = result.replace(new RegExp(`\\{\\{\\s*${k}\\s*\\}\\}|\\{\\s*${k}\\s*\\}`, 'g'), String(v));
  }
  return result;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>('en');

  useEffect(() => {
    // Check URL query param first (e.g. ?lang=te or ?lang=hi), then localStorage
    if (typeof window !== 'undefined') {
      const urlLang = new URLSearchParams(window.location.search).get('lang') as LanguageCode;
      if (urlLang && translations[urlLang]) {
        setLanguageState(urlLang);
        document.documentElement.lang = urlLang;
        return;
      }
    }
    const saved = localStorage.getItem('nutricrop_language') as LanguageCode;
    if (saved && translations[saved]) {
      setLanguageState(saved);
      document.documentElement.lang = saved;
    }
  }, []);

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('nutricrop_language', lang);
      document.documentElement.lang = lang;
    }
  };

  const currentLangOption = SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  const t = (
    path: string,
    fallbackOrParams?: string | InterpolationParams,
    params?: InterpolationParams
  ): string => {
    let fallback: string | undefined;
    let vars: InterpolationParams | undefined;

    if (typeof fallbackOrParams === 'object' && fallbackOrParams !== null) {
      vars = fallbackOrParams;
      fallback = undefined;
    } else {
      fallback = fallbackOrParams;
      vars = params;
    }

    const keys = path.split('.');
    let current: any = translations[language];

    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        if (process.env.NODE_ENV === 'development' && !warnedFallbackKeys.has(`${language}:${path}`)) {
          warnedFallbackKeys.add(`${language}:${path}`);
          console.warn(`[i18n] Missing ${language} translation for "${path}"; using English fallback.`);
        }
        // Fallback to English
        let fallbackVal: any = translations.en;
        for (const fbKey of keys) {
          if (fallbackVal && typeof fallbackVal === 'object' && fbKey in fallbackVal) {
            fallbackVal = fallbackVal[fbKey];
          } else {
            return interpolate(fallback || path, vars);
          }
        }
        return typeof fallbackVal === 'string'
          ? interpolate(fallbackVal, vars)
          : interpolate(fallback || path, vars);
      }
    }

    return typeof current === 'string'
      ? interpolate(current, vars)
      : interpolate(fallback || path, vars);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, currentLangOption, t }}>
      <div className={currentLangOption.fontClass}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
};

// Domain translation helpers for backend strings
export const translateCrop = (cropName: string | undefined | null, t: (k: string, fb?: any) => string): string => {
  if (!cropName) return '';
  const normalized = cropName.toLowerCase().replace(/[^a-z]/g, '');
  if (normalized.includes('chilli') || normalized.includes('chili') || normalized.includes('mirchi')) return t('crops.chilli', cropName);
  if (normalized.includes('wheat') || normalized.includes('gehu')) return t('crops.wheat', cropName);
  if (normalized.includes('cotton') || normalized.includes('kapas')) return t('crops.cotton', cropName);
  if (normalized.includes('paddy') || normalized.includes('rice') || normalized.includes('dhan')) return t('crops.paddy', cropName);
  if (normalized.includes('tomato')) return t('crops.tomato', cropName);
  if (normalized.includes('brinjal') || normalized.includes('eggplant')) return t('crops.brinjal', cropName);
  if (normalized.includes('potato') || normalized.includes('aalu') || normalized.includes('aloo')) return t('crops.potato', cropName);
  if (normalized.includes('onion') || normalized.includes('pyaz')) return t('crops.onion', cropName);
  if (normalized.includes('maize') || normalized.includes('corn') || normalized.includes('makka')) return t('crops.maize', cropName);
  if (normalized.includes('soybean') || normalized.includes('soya')) return t('crops.soybean', cropName);
  if (normalized.includes('sugarcane') || normalized.includes('ganna')) return t('crops.sugarcane', cropName);
  return cropName;
};

export const translateSoilType = (soilName: string | undefined | null, t: (k: string, fb?: any) => string): string => {
  if (!soilName) return '';
  const normalized = soilName.toLowerCase();
  if (normalized.includes('black')) return t('soilTypes.blackClay', soilName);
  if (normalized.includes('red')) return t('soilTypes.redSandyLoam', soilName);
  if (normalized.includes('alluvial')) return t('soilTypes.alluvial', soilName);
  if (normalized.includes('laterite')) return t('soilTypes.laterite', soilName);
  if (normalized.includes('sandy')) return t('soilTypes.sandyLoam', soilName);
  return soilName;
};

export const translateWeatherCondition = (condition: string | undefined | null, t: (k: string, fb?: any) => string): string => {
  if (!condition) return '';
  const normalized = condition.toLowerCase();
  if (normalized.includes('pleasant') || normalized.includes('sunny')) return t('weatherConditions.sunny', condition);
  if (normalized.includes('partly cloudy')) return t('weatherConditions.partlyCloudy', condition);
  if (normalized.includes('cloudy') || normalized.includes('overcast')) return t('weatherConditions.cloudy', condition);
  if (normalized.includes('thunder')) return t('weatherConditions.thunderstorm', condition);
  if (normalized.includes('rain') || normalized.includes('shower')) return t('weatherConditions.rainy', condition);
  if (normalized.includes('clear')) return t('weatherConditions.clear', condition);
  if (normalized.includes('fog') || normalized.includes('mist')) return t('weatherConditions.foggy', condition);
  return condition;
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
