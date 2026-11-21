'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Camera,
  Upload,
  Sparkles,
  HelpCircle,
  Image as ImageIcon,
  Check,
  ShieldAlert,
  ArrowRight,
  AlertCircle,
  X,
  RefreshCw,
  Sprout,
} from 'lucide-react';
import { useLanguage, translateCrop } from '@/context/LanguageContext';
import { useLocation, ALL_SUPPORTED_CROPS } from '@/context/LocationContext';
import { DemoBadge } from '@/components/ui/DemoBadge';

interface SampleItem {
  id: string;
  crop: string;
  diagnosis: string;
  sample_label: string;
  thumb_url: string;
}

interface PhotoUploadZoneProps {
  samples: SampleItem[];
  onDiagnose: (file: File | null, sampleId: string | null, forceConfidence: string, cropHint?: string) => void;
  isLoading: boolean;
  onOpenPhotoGuide: () => void;
  errorMessage?: string | null;
  onClearError?: () => void;
}

export const PhotoUploadZone: React.FC<PhotoUploadZoneProps> = ({
  samples,
  onDiagnose,
  isLoading,
  onOpenPhotoGuide,
  errorMessage,
  onClearError,
}) => {
  const { t, language } = useLanguage();
  const { location } = useLocation();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedSampleId, setSelectedSampleId] = useState<string | null>('sample-chilli-thrips');
  const [confidenceTier, setConfidenceTier] = useState<string>('high');
  const [selectedCropHint, setSelectedCropHint] = useState<string>(location.crop || 'Chilli');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const processFile = async (file: File) => {
    setValidationError(null);
    if (onClearError) onClearError();

    // 1. Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/heic', 'image/heif'];
    if (!validTypes.includes(file.type.toLowerCase()) && !file.name.match(/\.(jpg|jpeg|png|webp|heic|heif)$/i)) {
      setSelectedFile(null);
      setSelectedSampleId(null);
      setPreviewUrl(null);
      setValidationError(t('cropDoctor.fileTypeError', 'Choose a JPG, PNG, WebP, or HEIC photo.'));
      return;
    }

    // 2. Validate file size (max 10MB)
    if (file.size > 20 * 1024 * 1024) {
      setSelectedFile(null);
      setSelectedSampleId(null);
      setPreviewUrl(null);
      setValidationError(t('cropDoctor.fileSizeError', 'Photo is too large. Choose an image under 20 MB.'));
      return;
    }

    if (file.size === 0) {
      setSelectedFile(null);
      setSelectedSampleId(null);
      setPreviewUrl(null);
      setValidationError(t('cropDoctor.fileEmptyError', 'The selected photo is empty. Choose another image.'));
      return;
    }

    let processedFile = file;
    try {
      const bitmap = await createImageBitmap(file);
      const scale = Math.min(1, 1280 / Math.max(bitmap.width, bitmap.height));
      if (scale < 1 || file.size > 1_500_000 || !/^image\/(jpeg|png|webp)$/i.test(file.type)) {
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(bitmap.width * scale));
        canvas.height = Math.max(1, Math.round(bitmap.height * scale));
        canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
        const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.8));
        if (!blob) throw new Error('Could not compress image');
        processedFile = new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' });
      }
      bitmap.close();
    } catch {
      setSelectedFile(null);
      setSelectedSampleId(null);
      setPreviewUrl(null);
      setValidationError(t('cropDoctor.imageReadError', 'This photo format could not be opened. Convert it to JPG and try again.'));
      return;
    }
    const objectUrl = URL.createObjectURL(processedFile);
    try {
      await new Promise<void>((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve();
        image.onerror = () => reject(new Error('The selected file is not a readable image.'));
        image.src = objectUrl;
      });
      setSelectedFile(processedFile);
      setSelectedSampleId(null);
      setPreviewUrl(objectUrl);
    } catch {
      URL.revokeObjectURL(objectUrl);
      setSelectedFile(null);
      setSelectedSampleId(null);
      setPreviewUrl(null);
      setValidationError('The selected file could not be opened as an image. Please choose a valid JPG, PNG, or WebP photo.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      void processFile(e.target.files[0]);
    }
    // Clear value so re-selecting same file fires onChange
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      void processFile(e.dataTransfer.files[0]);
    }
  };

  const handleSelectSample = (sampleId: string) => {
    setSelectedSampleId(sampleId);
    setSelectedFile(null);
    setPreviewUrl(null);
    setValidationError(null);
    if (onClearError) onClearError();

    const matched = samples.find((s) => s.id === sampleId);
    if (matched) {
      setSelectedCropHint(matched.crop);
    }
  };

  const handleRemovePhoto = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setSelectedSampleId('sample-chilli-thrips');
    setValidationError(null);
    if (onClearError) onClearError();
  };

  const handleStartDiagnosis = () => {
    if (!selectedFile && !selectedSampleId) {
      setValidationError(t('cropDoctor.noPhotoSelected', 'Please upload a leaf photo or select a benchmark sample to diagnose.'));
      return;
    }
    onDiagnose(selectedFile, selectedSampleId, confidenceTier, selectedCropHint);
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-7 border border-nutri-cardBorder shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-nutri-cardBorder">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-nutri-primary text-xs font-bold mb-1.5 border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t('cropDoctor.aiEngine', 'AI Plant Pathology Engine')}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-nutri-primary">
            {t('cropDoctor.title', 'AI Crop Doctor')}
          </h2>
          <p className="text-xs text-nutri-muted font-medium mt-0.5">
            {t(
              'cropDoctor.subtitle',
              'Take or upload a crop leaf photo to identify diseases, pests, and nutrient deficiencies.'
            )}
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenPhotoGuide}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-nutri-bg hover:bg-emerald-100/70 text-nutri-primary border border-nutri-cardBorder text-xs font-bold transition self-start sm:self-auto min-h-[44px]"
        >
          <HelpCircle className="w-4 h-4 text-emerald-600" />
          <span>{t('cropDoctor.photoTips', 'Photography Tips')}</span>
        </button>
      </div>

      {/* Validation or API Error Banner */}
      {(validationError || errorMessage) && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 font-semibold animate-fade-in">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <strong className="block text-rose-950 font-bold mb-0.5">{t('cropDoctor.uploadErrorTitle', 'Upload or diagnosis error')}</strong>
            <span>{validationError || errorMessage}</span>
            {!validationError && selectedFile && (
              <button type="button" onClick={handleStartDiagnosis} disabled={isLoading} className="ml-2 underline font-bold disabled:opacity-50">
                {t('cropDoctor.retry', 'Retry analysis')}
              </button>
            )}
          </div>
          <button
            onClick={() => {
              setValidationError(null);
              if (onClearError) onClearError();
            }}
            className="text-rose-500 hover:text-rose-800 p-1"
            aria-label={t('cropDoctor.dismissError', 'Dismiss error')}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Crop Hint Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200">
        <div className="flex items-center gap-2">
          <Sprout className="w-4 h-4 text-nutri-secondary" />
          <label htmlFor="crop-hint-select" className="text-xs font-bold text-nutri-primary">
            {t('cropDoctor.targetCropCategory', 'Target Crop Category:')}
          </label>
        </div>
        <select
          id="crop-hint-select"
          value={selectedCropHint}
          onChange={(e) => setSelectedCropHint(e.target.value)}
          className="px-3 py-1.5 rounded-xl bg-white border border-emerald-300 text-xs font-bold text-nutri-primary focus:outline-none focus:ring-2 focus:ring-nutri-secondary"
        >
          {ALL_SUPPORTED_CROPS.map((c) => (
            <option key={c} value={c}>
              {translateCrop(c, t)}
            </option>
          ))}
        </select>
      </div>

      {/* Main Upload / Camera Area */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Mobile Camera Shutter Trigger */}
        <label
          htmlFor="camera-leaf-input"
          className="flex flex-col items-center justify-center p-6 rounded-3xl border-2 border-dashed border-emerald-400 bg-emerald-50/40 hover:bg-emerald-50 transition cursor-pointer min-h-[170px] text-center group active:scale-[0.99]"
        >
          <div className="w-14 h-14 rounded-2xl bg-nutri-primary group-hover:scale-105 transition-transform flex items-center justify-center text-white shadow-sm mb-3">
            <Camera className="w-7 h-7 text-emerald-300" />
          </div>
          <strong className="text-sm font-black text-nutri-primary block mb-0.5">
            {t('cropDoctor.cameraBtn', 'Capture with Camera')}
          </strong>
          <span className="text-xs text-nutri-muted font-medium">
            {t('cropDoctor.cameraHint', 'Take live photo of diseased leaf')}
          </span>
          <input
            id="camera-leaf-input"
            ref={cameraInputRef}
            type="file"
            accept="image/*,.heic,.heif"
            capture="environment"
            className="hidden"
            onChange={handleFileChange}
            disabled={isLoading}
          />
        </label>

        {/* Gallery / File Dropzone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={(event) => {
            // Programmatic clicks on the hidden input bubble to this container.
            // Ignore that bubbled event so the picker is only opened once.
            if (event.target !== fileInputRef.current) fileInputRef.current?.click();
          }}
          className={`flex flex-col items-center justify-center p-6 rounded-3xl border-2 border-dashed transition cursor-pointer min-h-[170px] text-center group active:scale-[0.99] ${
            isDragging
              ? 'border-nutri-secondary bg-emerald-100/70 scale-102'
              : 'border-gray-300 bg-nutri-bg hover:bg-gray-100'
          }`}
        >
          <div className="w-14 h-14 rounded-2xl bg-gray-200 group-hover:scale-105 transition-transform flex items-center justify-center text-gray-700 shadow-xs mb-3">
            <Upload className="w-7 h-7 text-emerald-700" />
          </div>
          <strong className="text-sm font-black text-gray-800 block mb-0.5">
            {t('cropDoctor.uploadBtn', 'Upload from Gallery or Drop Photo')}
          </strong>
          <span className="text-xs text-nutri-muted font-medium">
            {t('cropDoctor.galleryHint', 'Drag & drop or browse JPG, PNG, WebP (Max 20MB)')}
          </span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.heic,.heif"
            className="hidden"
            onChange={handleFileChange}
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Selected Image Preview (if user uploaded a custom file) */}
      {previewUrl && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-3">
            <img
              src={previewUrl}
              alt={t('cropDoctor.uploadedPhotoReady', 'Uploaded Leaf Preview')}
              className="w-16 h-16 rounded-xl object-cover border border-emerald-300 shadow-xs"
            />
            <div>
              <strong className="text-xs font-black text-emerald-950 block">
                {t('cropDoctor.uploadedPhotoReady', 'Uploaded Custom Leaf Photo Ready')}
              </strong>
              <span className="text-[11px] text-emerald-800 font-medium">
                {selectedFile?.name} ({(selectedFile ? selectedFile.size / 1024 : 0).toFixed(1)} KB)
              </span>
              <span className="text-[10px] text-emerald-700 block mt-0.5">
                {t('cropDoctor.targetCropLabel', 'Target Crop:')} <strong>{translateCrop(selectedCropHint, t)}</strong>
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemovePhoto}
            className="text-xs font-bold text-rose-600 hover:text-rose-800 hover:underline px-2 py-1"
          >
            {t('cropDoctor.removePhoto', 'Remove')}
          </button>
        </div>
      )}

      {/* Sample Leaf Photos from Dataset */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-nutri-primary">
              {t('cropDoctor.sampleTitle', 'Test With Curated Field Leaf Photos')}
            </h3>
            <p className="text-[11px] text-nutri-muted font-medium">
              {t(
                'cropDoctor.sampleSubtitle',
                'Tap any benchmark sample from our expert dataset to test instant diagnosis'
              )}
            </p>
          </div>
          <DemoBadge />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {samples.map((sample) => {
            const isSelected = selectedSampleId === sample.id;
            return (
              <button
                type="button"
                key={sample.id}
                onClick={() => handleSelectSample(sample.id)}
                className={`p-3 rounded-2xl border-2 transition text-left flex flex-col justify-between ${
                  isSelected
                    ? 'border-nutri-secondary bg-emerald-50/70 shadow-sm ring-2 ring-emerald-500/20'
                    : 'border-nutri-cardBorder bg-white hover:border-emerald-300'
                }`}
              >
                <div>
                  <div className="relative w-full h-24 rounded-xl overflow-hidden bg-gray-100 mb-2 border border-gray-200">
                    <img
                      src={sample.thumb_url}
                      alt={sample.sample_label}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-nutri-secondary text-white flex items-center justify-center shadow-xs">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                  <strong className="text-xs font-black text-nutri-dark block truncate">
                    {translateCrop(sample.crop, t)}
                  </strong>
                  <span className="text-[11px] text-gray-500 line-clamp-1 font-medium">
                    {sample.diagnosis}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Confidence Scenario Simulation Toggles */}
      <div className="p-4 rounded-2xl bg-nutri-bg border border-nutri-cardBorder space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-gray-700 uppercase tracking-wider">
            {t('cropDoctor.testAiScenario', 'Test AI Diagnosis Scenario:')}
          </span>
          <span className="text-[10px] text-gray-500 font-semibold">
            {t('cropDoctor.scenarioDesc', 'Demonstrates CIBRC safety guidelines & healthy leaf detection')}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            type="button"
            onClick={() => setConfidenceTier('high')}
            className={`py-2 px-2.5 rounded-xl text-xs font-bold transition ${
              confidenceTier === 'high'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-gray-700 border border-gray-200'
            }`}
          >
            {t('cropDoctor.scenarioHigh', 'High (92% - CIBRC)')}
          </button>

          <button
            type="button"
            onClick={() => setConfidenceTier('medium')}
            className={`py-2 px-2.5 rounded-xl text-xs font-bold transition ${
              confidenceTier === 'medium'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white text-gray-700 border border-gray-200'
            }`}
          >
            {t('cropDoctor.scenarioMedium', 'Medium (68% - Retake)')}
          </button>

          <button
            type="button"
            onClick={() => setConfidenceTier('low')}
            className={`py-2 px-2.5 rounded-xl text-xs font-bold transition ${
              confidenceTier === 'low'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-white text-gray-700 border border-gray-200'
            }`}
          >
            {t('cropDoctor.scenarioLow', 'Low (42% - Hold)')}
          </button>

          <button
            type="button"
            onClick={() => setConfidenceTier('none')}
            className={`py-2 px-2.5 rounded-xl text-xs font-bold transition ${
              confidenceTier === 'none'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-white text-gray-700 border border-gray-200'
            }`}
          >
            {t('cropDoctor.scenarioHealthy', 'Healthy (No Disease)')}
          </button>
        </div>
      </div>

      {/* Action Button with Loading Indicator */}
      <button
        type="button"
        onClick={handleStartDiagnosis}
        disabled={isLoading || (!selectedFile && !selectedSampleId)}
        className="w-full flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl bg-nutri-primary hover:bg-nutri-primaryHover disabled:opacity-50 text-white font-extrabold text-sm sm:text-base min-h-touch transition shadow-md active:scale-98"
      >
        {isLoading ? (
          <>
            <RefreshCw className="w-5 h-5 animate-spin text-emerald-300" />
            <span>{t('cropDoctor.analyzing', 'Analyzing Leaf Photo with AI Pathology Engine...')}</span>
          </>
        ) : (
          <>
            <span>{t('cropDoctor.analyzeBtn', 'Analyze Photo & Prescribe Treatment')}</span>
            <ArrowRight className="w-5 h-5" />
          </>
        )}
      </button>
    </div>
  );
};
