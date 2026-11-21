'use client';

import React, { useState, useRef } from 'react';
import {
  Sprout,
  Plus,
  MapPin,
  Calendar,
  Activity,
  CheckCircle2,
  X,
  Edit2,
  Trash2,
  Camera,
  Image as ImageIcon,
  Droplets,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useLanguage, translateCrop, translateSoilType } from '@/context/LanguageContext';
import { useLocation, ALL_SUPPORTED_CROPS } from '@/context/LocationContext';
import { useAuth } from '@/context/AuthContext';

export interface FarmPlot {
  plot_id: string;
  name: string;
  area_acres: number;
  area_unit?: string;
  current_crop: string;
  variety: string;
  soil_type: string;
  sowing_date: string;
  last_soil_test_date: string;
  soil_health_score: number;
  irrigation_type?: string;
  village?: string;
  mandal?: string;
  district?: string;
  state?: string;
  pincode?: string;
  image_url?: string;
}

interface PlotManagementCardProps {
  plots: FarmPlot[];
  activePlotId: string;
  onSelectPlot: (id: string) => void;
  onPlotAdded: (id?: string) => void;
  onPlotDeleted: (id: string) => void;
  onPlotUpdated: () => void;
}

export const PlotManagementCard: React.FC<PlotManagementCardProps> = ({
  plots,
  activePlotId,
  onSelectPlot,
  onPlotAdded,
  onPlotDeleted,
  onPlotUpdated,
}) => {
  const { t } = useLanguage();
  const { location } = useLocation();
  const { user } = useAuth();
  const userPhone = user?.phone;

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingPlot, setEditingPlot] = useState<FarmPlot | null>(null);

  // Form states for Add / Edit
  const [name, setName] = useState('');
  const [areaValue, setAreaValue] = useState<string>('2.0');
  const [areaUnit, setAreaUnit] = useState<'acres' | 'hectares'>('acres');
  const [crop, setCrop] = useState('Chilli');
  const [variety, setVariety] = useState('Guntur Teja (Dry Red)');
  const [soilType, setSoilType] = useState('Clay Loam');
  const [sowingDate, setSowingDate] = useState('2026-09-15');
  const [irrigationType, setIrrigationType] = useState('Canal / Furrow');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Field-specific validation errors
  const [errors, setErrors] = useState<{
    name?: string;
    area?: string;
    crop?: string;
    sowingDate?: string;
    form?: string;
  }>({});

  const formRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setName('');
    setAreaValue('2.0');
    setAreaUnit('acres');
    setCrop(location.crop || 'Chilli');
    setVariety('Standard Hybrid');
    setSoilType('Clay Loam');
    setSowingDate(new Date().toISOString().slice(0, 10));
    setIrrigationType('Canal / Furrow');
    setPhotoPreview(null);
    setUploadedImageUrl(null);
    setErrors({});
  };

  const handleOpenAdd = () => {
    resetForm();
    setEditingPlot(null);
    setIsAddOpen(true);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const handleOpenEdit = (plot: FarmPlot) => {
    setEditingPlot(plot);
    setName(plot.name);
    setAreaValue(String(plot.area_acres));
    setAreaUnit((plot.area_unit as 'acres' | 'hectares') || 'acres');
    setCrop(plot.current_crop);
    setVariety(plot.variety || 'Standard');
    setSoilType(plot.soil_type || 'Clay Loam');
    setSowingDate(
      plot.sowing_date && /^\d{4}-\d{2}-\d{2}$/.test(plot.sowing_date)
        ? plot.sowing_date
        : new Date().toISOString().slice(0, 10)
    );
    setIrrigationType(plot.irrigation_type || 'Canal / Furrow');
    setPhotoPreview(plot.image_url || null);
    setUploadedImageUrl(plot.image_url || null);
    setErrors({});
    setIsAddOpen(true);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, form: 'Photo is too large. Please choose an image under 20 MB.' }));
      return;
    }

    const localUrl = URL.createObjectURL(file);
    setPhotoPreview(localUrl);
    setIsUploadingPhoto(true);
    setErrors((prev) => ({ ...prev, form: undefined }));

    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/v1/farm/upload-photo', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setUploadedImageUrl(data.image_url);
        setPhotoPreview(data.image_url);
      } else {
        const body = await res.json().catch(() => ({}));
        setErrors((prev) => ({ ...prev, form: body.detail || 'Photo upload failed. Please try again.' }));
      }
    } catch {
      setErrors((prev) => ({ ...prev, form: 'Photo upload failed. Please check your network connection.' }));
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const validate = (): boolean => {
    const newErrors: {
      name?: string;
      area?: string;
      crop?: string;
      sowingDate?: string;
    } = {};

    if (!name.trim()) {
      newErrors.name = 'Please enter a farm / plot name.';
    }

    const parsedArea = parseFloat(areaValue);
    if (isNaN(parsedArea) || parsedArea <= 0) {
      newErrors.area = 'Farm area must be a valid number greater than 0.';
    }

    if (!crop.trim()) {
      newErrors.crop = 'Please select a crop.';
    }

    if (!sowingDate) {
      newErrors.sowingDate = 'Please select a sowing date.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    const parsedArea = parseFloat(areaValue);
    const finalImageUrl = uploadedImageUrl || (photoPreview && !photoPreview.startsWith('blob:') ? photoPreview : undefined);

    const payload = {
      name: name.trim(),
      area_acres: parsedArea,
      area_unit: areaUnit,
      current_crop: crop,
      variety: variety.trim() || 'Standard',
      soil_type: soilType,
      sowing_date: sowingDate,
      irrigation_type: irrigationType,
      village: location.village,
      mandal: location.mandal,
      district: location.district,
      state: location.state,
      pincode: location.pincode,
      image_url: finalImageUrl,
    };

    try {
      const phoneParam = userPhone ? `?phone=${encodeURIComponent(userPhone)}` : '';
      if (editingPlot) {
        // Edit existing plot
        const res = await fetch(`/api/v1/farm/plots/${editingPlot.plot_id}${phoneParam}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          setIsAddOpen(false);
          setEditingPlot(null);
          onPlotUpdated();
        } else {
          const body = await res.json().catch(() => ({}));
          setErrors({ form: body.detail || 'Could not update this farm parcel.' });
        }
      } else {
        // Add new plot
        const res = await fetch(`/api/v1/farm/plots${phoneParam}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const created = await res.json();
          setIsAddOpen(false);
          resetForm();
          onPlotAdded(created.plot_id);
        } else {
          const body = await res.json().catch(() => ({}));
          setErrors({ form: body.detail || 'Could not save this farm parcel.' });
        }
      }
    } catch {
      setErrors({ form: 'Farm service is unavailable. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (plot: FarmPlot) => {
    if (plots.length <= 1) {
      alert(t('myFarm.keepOneParcel', 'Keep at least one parcel. You cannot delete the only parcel.'));
      return;
    }
    if (!window.confirm(`${t('myFarm.deleteConfirm', 'Are you sure you want to delete this parcel?')} (${plot.name})`)) {
      return;
    }

    try {
      const phoneParam = userPhone ? `?phone=${encodeURIComponent(userPhone)}` : '';
      const res = await fetch(`/api/v1/farm/plots/${plot.plot_id}${phoneParam}`, { method: 'DELETE' });
      if (res.ok) {
        onPlotDeleted(plot.plot_id);
      } else {
        alert(t('myFarm.keepOneParcel', 'Keep at least one parcel. The plot could not be deleted.'));
      }
    } catch {
      alert('Farm service is unavailable. Please try again.');
    }
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-nutri-cardBorder shadow-sm space-y-4">
      {/* Header with Title and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-black text-nutri-primary flex items-center gap-2">
            <Sprout className="w-5 h-5 text-nutri-secondary" />
            <span>{t('myFarm.tabPlots', 'Farm Plots & Parcels')}</span>
          </h2>
          <p className="text-xs text-nutri-muted font-semibold mt-0.5">
            {t('myFarm.subtitle', 'Manage multi-plot land parcels, standing crops, and soil testing dates')}
          </p>
          <div className="inline-flex items-center gap-1.5 text-xs text-emerald-800 font-bold mt-1">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            <span>
              {location.village ? `${location.village}, ` : ''}
              {location.mandal ? `${location.mandal}, ` : ''}
              {location.district}, {location.state}
              {location.pincode ? ` (${location.pincode})` : ''}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-nutri-primary hover:bg-nutri-secondary text-white text-xs sm:text-sm font-bold transition shadow-xs self-start sm:self-auto min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          <span>{t('myFarm.addPlot', 'Add Farm Parcel')}</span>
        </button>
      </div>

      {/* Add / Edit Parcel Form */}
      {isAddOpen && (
        <div
          ref={formRef}
          className="rounded-2xl border-2 border-emerald-500 bg-emerald-50/50 p-5 sm:p-6 space-y-4 shadow-sm animate-fade-in"
        >
          <div className="flex items-center justify-between border-b border-emerald-200 pb-3">
            <div>
              <h3 className="text-base font-black text-nutri-primary">
                {editingPlot
                  ? t('myFarm.editParcelTitle', 'Edit Farm Parcel')
                  : t('myFarm.addNewParcel', 'Add New Land Parcel')}
              </h3>
              <p className="text-xs text-emerald-800 font-semibold mt-0.5">
                Automatically tied to GPS Location: {location.village ? `${location.village}, ` : ''}
                {location.district}, {location.state}
                {location.pincode ? ` - ${location.pincode}` : ''}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsAddOpen(false);
                setEditingPlot(null);
                setErrors({});
              }}
              aria-label={t('common.close', 'Close')}
              className="w-8 h-8 rounded-full hover:bg-emerald-100 flex items-center justify-center text-nutri-primary min-h-[36px]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.form && (
              <div role="alert" className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-red-800 text-xs font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errors.form}</span>
              </div>
            )}

            {/* Farm / Parcel Name */}
            <div>
              <label className="block font-bold text-nutri-primary mb-1 text-xs">
                {t('myFarm.parcelName', 'Parcel / Plot Name')} *
              </label>
              <input
                type="text"
                placeholder={t('myFarm.parcelNamePlaceholder', 'e.g. South Canal Plot')}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                }}
                className={`w-full px-3.5 py-2.5 rounded-xl border-2 bg-white font-bold text-nutri-primary text-sm outline-none ${errors.name ? 'border-rose-500 focus:border-rose-600' : 'border-slate-300 focus:border-nutri-primary'
                  }`}
              />
              {errors.name && <p className="text-rose-600 text-[11px] font-bold mt-1">{errors.name}</p>}
            </div>

            {/* Area & Area Unit */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block font-bold text-nutri-primary mb-1 text-xs">
                  {t('myFarm.areaAcres', 'Farm Land Area')} *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={areaValue}
                  onChange={(e) => {
                    setAreaValue(e.target.value);
                    if (errors.area) setErrors((prev) => ({ ...prev, area: undefined }));
                  }}
                  placeholder="e.g. 2.45"
                  className={`w-full px-3.5 py-2.5 rounded-xl border-2 bg-white font-bold text-nutri-primary text-sm outline-none ${errors.area ? 'border-rose-500 focus:border-rose-600' : 'border-slate-300 focus:border-nutri-primary'
                    }`}
                />
                {errors.area && <p className="text-rose-600 text-[11px] font-bold mt-1">{errors.area}</p>}
              </div>

              <div>
                <label className="block font-bold text-nutri-primary mb-1 text-xs">
                  Area Unit
                </label>
                <select
                  value={areaUnit}
                  onChange={(e) => setAreaUnit(e.target.value as 'acres' | 'hectares')}
                  className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-300 focus:border-nutri-primary bg-white font-bold text-nutri-primary text-sm outline-none min-h-[44px]"
                >
                  <option value="acres">{t('dashboard.acres', 'Acres')}</option>
                  <option value="hectares">Hectares</option>
                </select>
              </div>
            </div>

            {/* Standing Crop & Variety */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-nutri-primary mb-1 text-xs">
                  {t('myFarm.standingCrop', 'Standing Crop')} *
                </label>
                <select
                  value={crop}
                  onChange={(e) => {
                    setCrop(e.target.value);
                    if (errors.crop) setErrors((prev) => ({ ...prev, crop: undefined }));
                  }}
                  className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-300 focus:border-nutri-primary bg-white font-bold text-nutri-primary text-sm outline-none min-h-[44px]"
                >
                  {ALL_SUPPORTED_CROPS.map((c) => (
                    <option key={c} value={c}>
                      {translateCrop(c, t)}
                    </option>
                  ))}
                </select>
                {errors.crop && <p className="text-rose-600 text-[11px] font-bold mt-1">{errors.crop}</p>}
              </div>

              <div>
                <label className="block font-bold text-nutri-primary mb-1 text-xs">
                  {t('myFarm.variety', 'Variety')}
                </label>
                <input
                  type="text"
                  value={variety}
                  onChange={(e) => setVariety(e.target.value)}
                  placeholder="e.g. BPT 5204 / Hybrid"
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-300 focus:border-nutri-primary bg-white font-bold text-nutri-primary text-sm outline-none"
                />
              </div>
            </div>

            {/* Agricultural Land / Soil Type & Irrigation Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-nutri-primary mb-1 text-xs">
                  {t('myFarm.soilType', 'Agricultural Soil Type')}
                </label>
                <select
                  value={soilType}
                  onChange={(e) => setSoilType(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-300 focus:border-nutri-primary bg-white font-bold text-nutri-primary text-sm outline-none min-h-[44px]"
                >
                  <option value="Clay Loam">Clay Loam</option>
                  <option value="Red Sandy Loam">Red Sandy Loam</option>
                  <option value="Black Soil">Black Cotton Soil</option>
                  <option value="Alluvial Clay">Alluvial Clay</option>
                  <option value="Laterite Soil">Laterite Soil</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-nutri-primary mb-1 text-xs">
                  {t('myFarm.irrigationType', 'Irrigation Details')}
                </label>
                <select
                  value={irrigationType}
                  onChange={(e) => setIrrigationType(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-300 focus:border-nutri-primary bg-white font-bold text-nutri-primary text-sm outline-none min-h-[44px]"
                >
                  <option value="Canal / Furrow">Canal / Furrow</option>
                  <option value="Drip Irrigation">Drip Irrigation</option>
                  <option value="Sprinkler">Sprinkler</option>
                  <option value="Rainfed / Borewell">Rainfed / Borewell</option>
                </select>
              </div>
            </div>

            {/* Sowing Date */}
            <div>
              <label className="block font-bold text-nutri-primary mb-1 text-xs">
                {t('myFarm.sowingDate', 'Sowing Date')} *
              </label>
              <input
                type="date"
                value={sowingDate}
                onChange={(e) => {
                  setSowingDate(e.target.value);
                  if (errors.sowingDate) setErrors((prev) => ({ ...prev, sowingDate: undefined }));
                }}
                className={`w-full px-3.5 py-2.5 rounded-xl border-2 bg-white font-bold text-nutri-primary text-sm outline-none ${errors.sowingDate ? 'border-rose-500 focus:border-rose-600' : 'border-slate-300 focus:border-nutri-primary'
                  }`}
              />
              {errors.sowingDate && <p className="text-rose-600 text-[11px] font-bold mt-1">{errors.sowingDate}</p>}
            </div>

            {/* Photo Upload Zone (File Picker & Mobile Camera) */}
            <div>
              <label className="block font-bold text-nutri-primary mb-1 text-xs">
                {t('myFarm.plotPhoto', 'Field / Crop Photo')}
              </label>

              {photoPreview ? (
                <div className="relative rounded-2xl overflow-hidden border border-slate-300 h-36 w-full bg-slate-100">
                  <img src={photoPreview} alt="Parcel Preview" className="w-full h-full object-cover" />
                  {isUploadingPhoto && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs font-bold gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{t('myFarm.uploadingPhoto', 'Uploading photo...')}</span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoPreview(null);
                      setUploadedImageUrl(null);
                    }}
                    className="absolute top-2 right-2 px-2.5 py-1 bg-black/75 hover:bg-black text-white text-[10px] font-bold rounded-lg transition min-h-[30px]"
                  >
                    {t('myFarm.removePhoto', 'Remove Photo')}
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 flex items-center justify-center gap-1.5 py-3 px-3 rounded-xl border-2 border-dashed border-gray-300 hover:border-nutri-primary bg-white text-nutri-primary font-bold text-xs transition min-h-[44px]"
                  >
                    <ImageIcon className="w-4 h-4 text-emerald-600" />
                    <span>{t('myFarm.uploadPhoto', 'Upload Photo')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="flex-1 flex items-center justify-center gap-1.5 py-3 px-3 rounded-xl border-2 border-dashed border-emerald-300 hover:border-nutri-primary bg-emerald-50 text-nutri-primary font-bold text-xs transition min-h-[44px]"
                  >
                    <Camera className="w-4 h-4 text-emerald-600" />
                    <span>{t('cropDoctor.cameraBtn', 'Camera')}</span>
                  </button>
                </div>
              )}

              {/* Hidden File Inputs */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePhotoSelect}
                className="hidden"
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoSelect}
                className="hidden"
              />
            </div>

            {/* Form Buttons */}
            <div className="flex justify-end gap-2 pt-3 border-t border-emerald-200">
              <button
                type="button"
                onClick={() => {
                  setIsAddOpen(false);
                  setEditingPlot(null);
                  setErrors({});
                }}
                className="px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-700 font-bold hover:bg-gray-100 min-h-[44px]"
              >
                {t('common.cancel', 'Cancel')}
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isUploadingPhoto}
                className="px-5 py-2.5 rounded-xl bg-nutri-primary text-white font-bold hover:bg-nutri-secondary transition shadow-sm min-h-[44px] disabled:opacity-60"
              >
                {isSubmitting
                  ? t('common.saving', 'Saving...')
                  : editingPlot
                    ? t('myFarm.saveChanges', 'Save Changes')
                    : t('myFarm.addPlot', 'Add Farm Parcel')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid of Plots */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {plots.map((p) => {
          const isActive = p.plot_id === activePlotId;

          return (
            <div
              key={p.plot_id}
              className={`p-4 rounded-2xl border transition select-none flex flex-col justify-between ${isActive
                ? 'bg-emerald-50/60 border-emerald-400 ring-2 ring-emerald-500/20 shadow-xs'
                : 'bg-white hover:bg-nutri-bg border-nutri-cardBorder'
                }`}
            >
              <div>
                <button
                  type="button"
                  onClick={() => onSelectPlot(p.plot_id)}
                  className="w-full text-left flex items-start justify-between gap-2"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-black text-nutri-primary">{p.name}</h3>
                      {isActive && (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                          {t('common.active', 'Active')}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-nutri-muted font-semibold mt-0.5">
                      {translateCrop(p.current_crop, t)} ({p.variety || 'Standard'}) • {p.area_acres} {p.area_unit || t('dashboard.acres', 'Acres')}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-bold text-nutri-muted uppercase">
                      {t('myFarm.healthScore', 'Health Score')}
                    </span>
                    <div className="text-base font-black text-emerald-800">{p.soil_health_score}/100</div>
                  </div>
                </button>

                {p.image_url && (
                  <div className="mt-2.5 rounded-xl overflow-hidden h-28 w-full border border-slate-200">
                    <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-3 mt-3 border-t border-slate-100 text-nutri-muted">
                  <div>
                    <span className="font-bold text-nutri-primary">{t('myFarm.soilLabel', 'Soil:')}</span>{' '}
                    {translateSoilType(p.soil_type, t)}
                  </div>
                  <div>
                    <span className="font-bold text-nutri-primary">{t('myFarm.testedLabel', 'Tested:')}</span>{' '}
                    {p.last_soil_test_date}
                  </div>
                  <div>
                    <span className="font-bold text-nutri-primary">{t('myFarm.sowingDate', 'Sowing Date')}:</span>{' '}
                    {p.sowing_date}
                  </div>
                  <div>
                    <span className="font-bold text-nutri-primary">{t('myFarm.irrigationType', 'Irrigation')}:</span>{' '}
                    {p.irrigation_type || 'Canal / Furrow'}
                  </div>
                </div>
              </div>

              {/* Actions: Edit & Delete */}
              <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(p)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-nutri-primary hover:text-nutri-secondary min-h-[36px]"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>{t('myFarm.editParcel', 'Edit parcel')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(p)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 hover:text-rose-900 min-h-[36px]"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{t('myFarm.deleteParcel', 'Delete parcel')}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
