'use client';

import React, { useState } from 'react';
import { Sprout, Globe, MapPin, Mic, User as UserIcon, LogOut, ChevronDown, Sparkles } from 'lucide-react';
import { useLanguage, SUPPORTED_LANGUAGES, LanguageCode } from '@/context/LanguageContext';
import { useLocation } from '@/context/LocationContext';
import { useAuth } from '@/context/AuthContext';
import { useVoice } from '@/context/VoiceContext';

interface HeaderProps {
  onOpenLocationModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenLocationModal }) => {
  const { language, setLanguage, currentLangOption, t } = useLanguage();
  const { location } = useLocation();
  const { user, isAuthenticated, openLoginModal, logout } = useAuth();
  const { openVoiceModal } = useVoice();
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-nutri-card border-b border-nutri-cardBorder shadow-sm">
      {/* Top Alert Bar / Positioning */}
      <div className="bg-nutri-primary text-white text-xs px-4 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5 font-medium truncate">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span>{t('positioning', 'Soil Health First – Smart Farming Platform')}</span>
        </div>
        <div className="hidden sm:flex items-center gap-3 text-emerald-100 text-xs">
          <span>{t('header.kisanHelpline', 'Kisan Helpline: 1800-180-1551')}</span>
        </div>
      </div>

      {/* Main Header Row */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand & Logo */}
        <div className="flex items-center gap-2.5 min-w-max">
          <div className="w-11 h-11 rounded-xl bg-nutri-primary flex items-center justify-center text-white shadow-sm ring-2 ring-emerald-600/30">
            <Sprout className="w-7 h-7 text-emerald-300" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl sm:text-2xl font-black text-nutri-primary tracking-tight font-sans">
                {t('brandName', 'NutriCrop')}
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-nutri-secondary font-semibold -mt-1 truncate max-w-[170px] sm:max-w-none">
              {t('tagline', 'Grow healthy. Harvest better.')}
            </p>
          </div>
        </div>

        {/* Center / Location Selector */}
        <div className="hidden md:flex items-center">
          <button
            onClick={onOpenLocationModal}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-nutri-bg hover:bg-emerald-100/70 border border-nutri-cardBorder transition text-nutri-dark min-h-touch text-sm font-medium"
            aria-label={t('header.enterVillage', 'Select farm location')}
          >
            <MapPin className="w-4 h-4 text-nutri-secondary shrink-0" />
            <div className="text-left leading-tight">
              <span className="text-[10px] text-nutri-muted block uppercase tracking-wider font-bold">
                {t('header.location', 'Farm Location')}
              </span>
              <span className="text-xs font-semibold text-nutri-primary truncate block max-w-[150px]">
                {location.village ? `${location.village}, ${location.district}` : location.district}
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-nutri-muted ml-1" />
          </button>
        </div>

        {/* Right Actions: Voice, Language, Auth */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Mobile Location Pill */}
          <button
            onClick={onOpenLocationModal}
            className="md:hidden flex items-center gap-1 px-2 py-1.5 rounded-lg bg-nutri-bg text-nutri-dark border border-nutri-cardBorder text-xs min-h-[44px]"
            aria-label={t('header.enterVillage', 'Change farm location')}
          >
            <MapPin className="w-3.5 h-3.5 text-nutri-secondary shrink-0" />
            <span className="font-semibold text-nutri-primary truncate max-w-[85px]">
              {location.district}
            </span>
          </button>

          {/* Voice Assistant Button */}
          <button
            onClick={openVoiceModal}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-nutri-primary border border-emerald-300 font-semibold text-xs sm:text-sm min-h-touch transition shadow-sm active:scale-95"
            aria-label={t('header.voiceAssist', 'Voice Assistant')}
          >
            <Mic className="w-4 h-4 text-nutri-secondary animate-pulse" />
            <span className="hidden sm:inline">{t('header.voiceAssist', 'Voice Assistant')}</span>
          </button>

          {/* Language Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl bg-white hover:bg-nutri-bg border border-nutri-cardBorder text-xs sm:text-sm font-semibold text-nutri-primary min-h-touch transition shadow-sm"
              aria-label={t('header.selectLanguage', 'Change regional language')}
              aria-expanded={isLangDropdownOpen}
            >
              <Globe className="w-4 h-4 text-nutri-secondary" />
              <span className="font-bold">{currentLangOption.nativeName}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-nutri-muted transition-transform ${isLangDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isLangDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsLangDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-1.5 w-56 bg-white rounded-2xl shadow-xl border border-nutri-cardBorder py-2 z-50 divide-y divide-gray-100">
                  <div className="px-3 py-1.5 text-[11px] font-bold text-nutri-muted uppercase tracking-wider">
                    {t('header.selectLanguage', 'Select Language')}
                  </div>
                  <div className="max-h-72 overflow-y-auto py-1">
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code);
                          setIsLangDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between text-sm transition min-h-[44px] ${
                          language === lang.code
                            ? 'bg-emerald-50 text-nutri-primary font-bold'
                            : 'hover:bg-nutri-bg text-gray-700'
                        }`}
                      >
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm">{lang.nativeName}</span>
                          <span className="text-[11px] text-nutri-muted">{lang.label}</span>
                        </div>
                        {language === lang.code && (
                          <span className="w-2 h-2 rounded-full bg-nutri-secondary"></span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User Auth / Login Button */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-1.5">
              <div className="hidden lg:flex flex-col text-right leading-tight">
                <span className="text-xs font-bold text-nutri-primary truncate max-w-[110px]">
                  {user.name || t('header.welcomeFarmer', 'Farmer')}
                </span>
                <span className="text-[10px] text-nutri-muted">{user.phone}</span>
              </div>
              <button
                onClick={logout}
                className="flex items-center justify-center w-11 h-11 rounded-xl bg-gray-100 hover:bg-rose-50 text-gray-600 hover:text-rose-600 transition border border-gray-200"
                title={t('header.logout', 'Logout')}
                aria-label={t('header.logout', 'Logout')}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={openLoginModal}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-nutri-primary hover:bg-nutri-primaryHover text-white font-semibold text-xs sm:text-sm min-h-touch transition shadow-sm active:scale-95"
              aria-label={t('header.login', 'Farmer Login')}
            >
              <UserIcon className="w-4 h-4 text-emerald-300" />
              <span>{t('header.login', 'Login')}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
