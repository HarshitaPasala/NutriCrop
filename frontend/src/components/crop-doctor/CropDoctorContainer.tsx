'use client';

import React, { useState, useEffect } from 'react';
import { Stethoscope, ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { PhotoUploadZone } from './PhotoUploadZone';
import { DiagnosisResultView } from './DiagnosisResultView';
import { PhotoGuideModal } from './PhotoGuideModal';
import { ExpertConnectModal } from './ExpertConnectModal';

interface CropDoctorContainerProps {
  onBackToDashboard: () => void;
  onOpenLibrary: () => void;
}

export const CropDoctorContainer: React.FC<CropDoctorContainerProps> = ({ onBackToDashboard, onOpenLibrary }) => {
  const { t, language } = useLanguage();

  const [samples, setSamples] = useState<any[]>([]);
  const [diagnosisResult, setDiagnosisResult] = useState<any | null>(null);
  const [leafImageUrl, setLeafImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPhotoGuideOpen, setIsPhotoGuideOpen] = useState(false);
  const [isExpertModalOpen, setIsExpertModalOpen] = useState(false);
  const [diagnosisError, setDiagnosisError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState('');

  const saveDiagnosisToFarm = () => {
    if (!diagnosisResult) return;
    try {
      const saved = JSON.parse(localStorage.getItem('nutricrop_saved_diagnoses') || '[]');
      const entry = {
        id: `${Date.now()}`,
        crop: diagnosisResult.crop,
        diagnosis: diagnosisResult.diagnosis,
        severity: diagnosisResult.severity || diagnosisResult.confidence_tier,
        confidence: diagnosisResult.confidence_percentage,
        imageUrl: leafImageUrl,
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem('nutricrop_saved_diagnoses', JSON.stringify([entry, ...saved]));
      setSavedMessage(t('cropDoctor.savedToFarm', 'Diagnosis saved to My Farm on this device.'));
    } catch {
      setSavedMessage(t('cropDoctor.saveToFarmError', 'Could not save this diagnosis on this device.'));
    }
  };

  useEffect(() => {
    // Restore persisted last diagnosis if available
    try {
      const cached = localStorage.getItem('nutricrop_last_diagnosis');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.result) {
          setDiagnosisResult(parsed.result);
          if (parsed.imageUrl) setLeafImageUrl(parsed.imageUrl);
        }
      }
    } catch {
      // ignore
    }

    const fetchSamples = async () => {
      try {
        const res = await fetch('/api/v1/crop-doctor/samples');
        if (res.ok) {
          const data = await res.json();
          setSamples(data.samples || []);
        }
      } catch (e) {
        console.warn('Failed to load sample leaves', e);
      }
    };
    fetchSamples();

    // Check deep link param e.g. autoDiagnose=true
    if (typeof window !== 'undefined') {
      const auto = new URLSearchParams(window.location.search).get('autoDiagnose');
      if (auto === 'true') {
        handleDiagnose(null, 'sample-chilli-thrips', 'high');
      }
    }
  }, []);

  const handleDiagnose = async (
    file: File | null,
    sampleId: string | null,
    confidenceTier: string,
    cropHint?: string
  ) => {
    setIsLoading(true);
    setDiagnosisError(null);
    let tempPreview: string | null = null;
    if (file) {
      tempPreview = URL.createObjectURL(file);
      setLeafImageUrl(tempPreview);
    } else if (sampleId) {
      const match = samples.find((s) => s.id === sampleId);
      tempPreview = match?.thumb_url || null;
      setLeafImageUrl(tempPreview);
    } else {
      setLeafImageUrl(null);
    }

    try {
      const formData = new FormData();
      if (file) {
        formData.append('file', file);
        formData.append('image', file);
      }
      if (sampleId) {
        formData.append('sample_id', sampleId);
      }
      if (cropHint) formData.append('crop_hint', cropHint);
      formData.append('language', language);
      formData.append('force_confidence', confidenceTier);

      const res = await fetch('/api/v1/crop-doctor/diagnose', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        const effectiveImageUrl = data.image_url || tempPreview;
        setDiagnosisResult(data);
        if (effectiveImageUrl) setLeafImageUrl(effectiveImageUrl);
        try {
          localStorage.setItem(
            'nutricrop_last_diagnosis',
            JSON.stringify({
              diagnosis: data.diagnosis,
              crop: data.crop,
              imageUrl: effectiveImageUrl,
              result: data,
              createdAt: new Date().toISOString(),
            })
          );
        } catch {
          // localStorage full or private mode
        }
      } else {
        const errorBody = await res.json().catch(() => null);
        throw new Error(errorBody?.detail || `Diagnosis request failed (${res.status}). Please try again.`);
      }
    } catch (e) {
      setDiagnosisError(e instanceof Error ? e.message : 'Unable to analyze this image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewScan = () => {
    setDiagnosisResult(null);
    setLeafImageUrl(null);
    try {
      localStorage.removeItem('nutricrop_last_diagnosis');
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back to Dashboard Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToDashboard}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-nutri-bg border border-nutri-cardBorder text-xs sm:text-sm font-bold text-nutri-primary transition min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('common.backToDashboard', 'Back to Dashboard')}</span>
        </button>
      </div>

      {/* Main View: Result or Upload */}
      {diagnosisResult ? (
        <>
          {savedMessage && (
            <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-900">
              {savedMessage}
            </p>
          )}
          <DiagnosisResultView
            data={diagnosisResult}
            leafImageUrl={leafImageUrl}
            onNewScan={handleNewScan}
            onOpenExpertModal={() => setIsExpertModalOpen(true)}
            onOpenPhotoGuide={() => setIsPhotoGuideOpen(true)}
            onOpenLibrary={onOpenLibrary}
            onSaveToFarm={saveDiagnosisToFarm}
          />
        </>
      ) : (
        <PhotoUploadZone
          samples={samples}
          onDiagnose={handleDiagnose}
          isLoading={isLoading}
          onOpenPhotoGuide={() => setIsPhotoGuideOpen(true)}
          errorMessage={diagnosisError}
          onClearError={() => setDiagnosisError(null)}
        />
      )}

      {/* Photography Guide Modal */}
      <PhotoGuideModal isOpen={isPhotoGuideOpen} onClose={() => setIsPhotoGuideOpen(false)} />

      {/* Talk to Expert Modal */}
      <ExpertConnectModal
        isOpen={isExpertModalOpen}
        onClose={() => setIsExpertModalOpen(false)}
        diagnosisContext={diagnosisResult?.diagnosis}
      />
    </div>
  );
};
