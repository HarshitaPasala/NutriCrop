'use client';

import React from 'react';
import { X, Mic, Volume2, VolumeX, Sparkles, AlertCircle } from 'lucide-react';
import { useVoice } from '@/context/VoiceContext';
import { useLanguage } from '@/context/LanguageContext';

export const VoiceAssistantModal: React.FC = () => {
  const {
    isVoiceModalOpen,
    closeVoiceModal,
    isListening,
    isSpeaking,
    transcript,
    startListening,
    stopListening,
    stopSpeaking,
    responseMessage,
  } = useVoice();
  const { currentLangOption, t } = useLanguage();

  if (!isVoiceModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="fixed inset-0" onClick={closeVoiceModal} />

      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-nutri-cardBorder p-6 sm:p-8 overflow-hidden z-10 text-center">
        {/* Close */}
        <button
          onClick={closeVoiceModal}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 flex items-center justify-center transition"
          aria-label={t('voice.closeAssistantAria', 'Close Voice Assistant')}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title & Language Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-nutri-primary text-xs font-bold mb-3">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>{currentLangOption.nativeName} ({currentLangOption.speechCode})</span>
        </div>

        <h3 className="text-xl sm:text-2xl font-black text-nutri-primary mb-2">
          {t('voice.title', 'NutriCrop Voice Assistant')}
        </h3>
        <p className="text-xs text-nutri-muted max-w-sm mx-auto mb-6">
          {isListening
            ? t('voice.statusListening', 'Listening... Speak your farming question now.')
            : t('voice.statusIdle', 'Tap the microphone and ask your farming question.')}
        </p>

        {/* Microphone Visualizer */}
        <div className="my-6 flex justify-center">
          <div className="relative">
            {isListening && (
              <>
                <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-40"></div>
                <div className="absolute -inset-3 rounded-full bg-emerald-200 animate-pulse opacity-60"></div>
              </>
            )}
            <button
              onClick={isListening ? stopListening : startListening}
              className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 ${
                isListening
                  ? 'bg-rose-500 text-white ring-8 ring-rose-100'
                  : 'bg-nutri-primary text-white hover:bg-nutri-primaryHover ring-8 ring-emerald-100'
              }`}
              aria-label={isListening ? t('voice.stop', 'Stop Listening') : t('voice.speakNow', 'Start Speaking')}
            >
              <Mic className={`w-10 h-10 ${isListening ? 'animate-bounce' : ''}`} />
            </button>
          </div>
        </div>

        {/* Live Transcript Box */}
        <div className="bg-nutri-bg rounded-2xl p-4 border border-nutri-cardBorder min-h-[90px] flex flex-col justify-center text-left mb-4">
          <span className="text-[10px] font-bold text-nutri-muted uppercase tracking-wider block mb-1">
            {t('voice.farmerSpeech', 'Farmer Speech')}
          </span>
          <p className="text-sm font-semibold text-gray-800 italic">
            {transcript ? `"${transcript}"` : t('voice.exampleQuestion', 'Say: "How is the weather for spraying today?" or "Check crop doctor"')}
          </p>
        </div>

        {/* Assistant Response Box */}
        {responseMessage && (
          <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200 text-left mb-5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                {t('voice.aiVoiceResponse', 'NutriCrop AI Voice Response')}
              </span>
              {isSpeaking && (
                <button
                  onClick={stopSpeaking}
                  className="text-xs text-rose-700 font-bold hover:underline"
                >
                  {t('cropDoctor.stopAudio', 'Stop Audio')}
                </button>
              )}
            </div>
            <p className="text-xs sm:text-sm font-medium text-emerald-950 leading-relaxed">
              {responseMessage}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={isListening ? stopListening : startListening}
            className={`px-6 py-3 rounded-2xl font-bold text-sm min-h-touch transition shadow-sm ${
              isListening
                ? 'bg-rose-100 text-rose-800 border border-rose-300'
                : 'bg-nutri-secondary text-white hover:bg-nutri-primary'
            }`}
          >
            {isListening ? t('voice.stop', 'Stop Listening') : t('voice.speakNow', 'Start Speaking')}
          </button>
          <button
            onClick={closeVoiceModal}
            className="px-5 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm min-h-touch transition"
          >
            {t('voice.close', 'Close')}
          </button>
        </div>
      </div>
    </div>
  );
};
