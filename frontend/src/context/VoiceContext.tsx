'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLanguage } from './LanguageContext';

interface VoiceContextType {
  isListening: boolean;
  isSpeaking: boolean;
  transcript: string;
  isVoiceModalOpen: boolean;
  openVoiceModal: () => void;
  closeVoiceModal: () => void;
  startListening: () => void;
  stopListening: () => void;
  speakText: (text: string) => void;
  stopSpeaking: () => void;
  responseMessage: string | null;
}

const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

export const VoiceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentLangOption, t } = useLanguage();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [responseMessage, setResponseMessage] = useState<string | null>(null);
  const [recognitionInstance, setRecognitionInstance] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = currentLangOption.speechCode;

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event: any) => {
          const current = event.resultIndex;
          const text = event.results[current][0].transcript;
          setTranscript(text);
          if (event.results[current].isFinal) {
            handleVoiceCommand(text);
          }
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition event:', event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        setRecognitionInstance(recognition);
      }
    }
  }, [currentLangOption]);

  const handleVoiceCommand = (query: string) => {
    const q = query.toLowerCase();
    let reply = '';

    if (q.includes('weather') || q.includes('వాతావరణ') || q.includes('मौसम') || q.includes('spray') || q.includes('వర్ష')) {
      reply = t('weather.advisoryNote', 'Current weather: 28.5 degrees with gentle winds. Spray conditions are favourable today.');
    } else if (q.includes('doctor') || q.includes('disease') || q.includes('రోగం') || q.includes('कीट')) {
      reply = t('services.cropDoctor.desc', 'Open Crop Doctor to take a photo of infected leaves for disease identification.');
    } else if (q.includes('soil') || q.includes('మట్టి') || q.includes('fertilizer') || q.includes('ఎరువు')) {
      reply = t('services.soilHealth.desc', 'Open Soil Health to calculate required NPK fertilizers from your Soil Health Card.');
    } else {
      reply = `${t('dashboard.greetingTitle')}. ${t('dashboard.greetingSubtitle')}`;
    }

    setResponseMessage(reply);
    speakText(reply);
  };

  const openVoiceModal = () => {
    setIsVoiceModalOpen(true);
    setTranscript('');
    setResponseMessage(null);
    startListening();
  };

  const closeVoiceModal = () => {
    stopListening();
    stopSpeaking();
    setIsVoiceModalOpen(false);
  };

  const startListening = () => {
    if (recognitionInstance) {
      try {
        recognitionInstance.lang = currentLangOption.speechCode;
        recognitionInstance.start();
      } catch (e) {
        console.warn('Recognition already started or unavailable', e);
      }
    } else {
      setTranscript('Speech recognition is active in Chrome/Edge browsers.');
      setIsListening(true);
      setTimeout(() => {
        handleVoiceCommand('weather');
        setIsListening(false);
      }, 2000);
    }
  };

  const stopListening = () => {
    if (recognitionInstance) {
      try {
        recognitionInstance.stop();
      } catch (e) {}
    }
    setIsListening(false);
  };

  const speakText = (text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = currentLangOption.speechCode;
    utterance.rate = 0.9; // Slightly slower pace for maximum clarity to rural farmers
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  return (
    <VoiceContext.Provider
      value={{
        isListening,
        isSpeaking,
        transcript,
        isVoiceModalOpen,
        openVoiceModal,
        closeVoiceModal,
        startListening,
        stopListening,
        speakText,
        stopSpeaking,
        responseMessage,
      }}
    >
      {children}
    </VoiceContext.Provider>
  );
};

export const useVoice = () => {
  const context = useContext(VoiceContext);
  if (!context) {
    throw new Error('useVoice must be used within a VoiceProvider');
  }
  return context;
};
