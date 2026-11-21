'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Bell,
  Calendar,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  CloudRain,
  Compass,
  Droplets,
  Plus,
  RefreshCw,
  Navigation,
  ShieldAlert,
  Sprout,
  Sun,
  Trash2,
  Wind,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useLocation } from '@/context/LocationContext';
import { StageTimelineCard } from './StageTimelineCard';
import { NotificationOptInModal } from './NotificationOptInModal';
import { DemoBadge } from '@/components/ui/DemoBadge';

interface CropCalendarContainerProps {
  onBackToDashboard: () => void;
}

interface Reminder {
  id: string;
  title: string;
  date: string;
  done: boolean;
  custom?: boolean;
}

const SUPPORTED_CROPS = [
  'Chilli',
  'Rice',
  'Wheat',
  'Cotton',
  'Maize',
  'Tomato',
  'Mustard',
  'Potato',
];

const LOCALE: Record<string, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  te: 'te-IN',
  ta: 'ta-IN',
  mr: 'mr-IN',
  pa: 'pa-IN',
  bn: 'bn-IN',
  kn: 'kn-IN',
  ml: 'ml-IN',
  gu: 'gu-IN',
  or: 'or-IN',
};

const isoToday = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

const dateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const apiDateToISO = (value: string) => {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const match = value.match(/^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})$/);
  if (!match) return isoToday();
  const month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].indexOf(match[2]);
  return `${match[3]}-${String(month + 1).padStart(2, '0')}-${String(match[1]).padStart(2, '0')}`;
};

const seasonFor = (dateString: string) => {
  const month = Number(dateString.slice(5, 7));
  return [6, 7, 8, 9, 10].includes(month) ? 'Kharif' : [11, 12, 1, 2, 3].includes(month) ? 'Rabi' : 'Zaid';
};

const getSowingWindow = (crop: string) => {
  const windows: Record<string, { season: string; window: string; recommended: string[] }> = {
    Wheat: {
      season: 'Rabi',
      window: '01 Nov – 25 Nov (Timely), 26 Nov – 15 Dec (Late)',
      recommended: ['Wheat', 'Mustard', 'Gram (Chickpea)', 'Potato', 'Barley'],
    },
    Mustard: {
      season: 'Rabi',
      window: '15 Oct – 15 Nov',
      recommended: ['Mustard', 'Wheat', 'Gram', 'Potato'],
    },
    Potato: {
      season: 'Rabi',
      window: '15 Oct – 15 Nov',
      recommended: ['Potato', 'Mustard', 'Wheat', 'Garlic'],
    },
    Chilli: {
      season: 'Rabi / Kharif',
      window: '15 Jun – 31 Jul (Kharif) / 15 Sep – 31 Oct (Rabi)',
      recommended: ['Chilli', 'Cotton', 'Rice', 'Maize', 'Tomato'],
    },
    Rice: {
      season: 'Kharif / Rabi',
      window: '01 Jun – 15 Jul (Kharif) / 15 Nov – 31 Dec (Rabi/Boro)',
      recommended: ['Rice', 'Cotton', 'Maize', 'Soybean', 'Groundnut'],
    },
    Cotton: {
      season: 'Kharif',
      window: '15 May – 30 Jun',
      recommended: ['Cotton', 'Rice', 'Soybean', 'Chilli', 'Maize'],
    },
    Maize: {
      season: 'Kharif / Rabi',
      window: '15 Jun – 15 Jul (Kharif) / 15 Oct – 20 Nov (Rabi)',
      recommended: ['Maize', 'Wheat', 'Mustard', 'Potato', 'Chilli'],
    },
    Tomato: {
      season: 'Kharif / Rabi',
      window: '01 Jun – 15 Jul (Kharif) / 15 Sep – 31 Oct (Rabi)',
      recommended: ['Tomato', 'Chilli', 'Brinjal', 'Potato'],
    },
  };
  return (
    windows[crop] || {
      season: 'Rabi',
      window: '15 Oct – 30 Nov',
      recommended: ['Wheat', 'Mustard', 'Gram', 'Chilli', 'Potato'],
    }
  );
};

export const CropCalendarContainer: React.FC<CropCalendarContainerProps> = ({ onBackToDashboard }) => {
  const { t, language } = useLanguage();
  const { location, detectLocationGPS, isDetecting } = useLocation();
  const [selectedCrop, setSelectedCrop] = useState(
    location.crop?.includes('Rice') ? 'Rice' : location.crop || 'Chilli'
  );
  const [varietyDuration, setVarietyDuration] = useState('medium');
  const [sowingDate, setSowingDate] = useState(isoToday());
  const [selectedDistrict, setSelectedDistrict] = useState(location.district || 'Guntur');
  const [calendarData, setCalendarData] = useState<any | null>(null);
  const [weatherData, setWeatherData] = useState<any | null>(null);
  const [isWeatherLoading, setIsWeatherLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);
  const [currentTimeStr, setCurrentTimeStr] = useState('');
  const [monthView, setMonthView] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [plots, setPlots] = useState<any[]>([]);
  const [selectedPlot, setSelectedPlot] = useState('');
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [reminderTitle, setReminderTitle] = useState('');
  const [reminderDate, setReminderDate] = useState(isoToday());

  const locale = LOCALE[language] || 'en-IN';
  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric' }).format(date);

  // Live date/time ticker
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeStr(
        new Intl.DateTimeFormat(locale, {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        }).format(now)
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [locale]);

  // Load reminders and plots on mount
  useEffect(() => {
    try {
      setReminders(JSON.parse(localStorage.getItem('nutricrop_calendar_reminders') || '[]'));
    } catch {
      setReminders([]);
    }
    let active = true;
    fetch('/api/v1/farm/overview')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && Array.isArray(data?.plots)) setPlots(data.plots);
      })
      .catch(() => { });
    return () => {
      active = false;
    };
  }, []);

  // Sync selectedDistrict when location.district changes
  useEffect(() => {
    if (location.district && location.district !== selectedDistrict) {
      setSelectedDistrict(location.district);
    }
  }, [location.district]);

  // Fetch weather forecast
  useEffect(() => {
    let active = true;
    const fetchWeather = async () => {
      setIsWeatherLoading(true);
      try {
        const params = new URLSearchParams({
          district: selectedDistrict || location.district || 'Guntur',
          village: location.village || '',
        });
        if (location.latitude != null && location.longitude != null) {
          params.append('lat', String(location.latitude));
          params.append('lon', String(location.longitude));
        }
        const res = await fetch(`/api/v1/weather/forecast?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          if (active) setWeatherData(data);
        }
      } catch {
        // Soft fallback
      } finally {
        if (active) setIsWeatherLoading(false);
      }
    };
    fetchWeather();
    return () => {
      active = false;
    };
  }, [selectedDistrict, location.village, location.latitude, location.longitude, refreshKey]);

  // Generate crop calendar
  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const generate = async () => {
      setIsLoading(true);
      setError('');
      try {
        const res = await fetch('/api/v1/crop-calendar/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            crop: selectedCrop,
            variety_duration: varietyDuration,
            sowing_date: sowingDate,
            district: selectedDistrict || location.district || 'Guntur',
          }),
        });
        if (!res.ok) throw new Error(t('cropCalendar.loadError', 'The crop calendar could not be loaded. Please retry.'));
        const data = await res.json();
        if (active) setCalendarData(data);
      } catch (err) {
        if (active && !(err instanceof DOMException && err.name === 'AbortError')) {
          setError(
            err instanceof Error
              ? err.message
              : t('cropCalendar.loadError', 'The crop calendar could not be loaded. Please retry.')
          );
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };
    generate();
    return () => {
      active = false;
      controller.abort();
    };
  }, [selectedCrop, varietyDuration, sowingDate, selectedDistrict, location.district, refreshKey]);

  const calendarTasks: Reminder[] = useMemo(
    () =>
      (calendarData?.stages || []).flatMap((stage: any) =>
        (stage.key_activities || []).slice(0, 2).map((title: string, index: number) => {
          const id = `stage:${calendarData.calendar_id}:${stage.stage_id}:${index}`;
          return {
            id,
            title,
            date: apiDateToISO(stage.target_start_date),
            done: reminders.some((item) => item.id === id && item.done),
          };
        })
      ),
    [calendarData, reminders]
  );

  const allTasks = useMemo(
    () => [...calendarTasks, ...reminders.filter((task) => task.custom)],
    [calendarTasks, reminders]
  );
  const today = isoToday();
  const upcoming = allTasks
    .filter((task) => !task.done && task.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date));
  const overdue = allTasks
    .filter((task) => !task.done && task.date < today)
    .sort((a, b) => a.date.localeCompare(b.date));

  const saveReminders = (next: Reminder[]) => {
    setReminders(next);
    localStorage.setItem('nutricrop_calendar_reminders', JSON.stringify(next));
  };

  const toggleTask = (task: Reminder) => {
    if (task.custom) {
      saveReminders(reminders.map((item) => (item.id === task.id ? { ...item, done: !item.done } : item)));
    } else {
      saveReminders([
        ...reminders.filter((item) => item.id !== task.id),
        { ...task, done: !task.done, custom: false },
      ]);
    }
  };

  const addReminder = (event: React.FormEvent) => {
    event.preventDefault();
    if (!reminderTitle.trim() || !reminderDate) return;
    saveReminders([
      ...reminders,
      {
        id: `custom:${Date.now()}`,
        title: reminderTitle.trim(),
        date: reminderDate,
        done: false,
        custom: true,
      },
    ]);
    setReminderTitle('');
  };

  const editReminder = (task: Reminder) => {
    const title = window.prompt(t('cropCalendar.editReminder', 'Edit reminder'), task.title);
    if (title === null || !title.trim()) return;
    const date = window.prompt(t('cropCalendar.reminderDate', 'Date (YYYY-MM-DD)'), task.date);
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return;
    saveReminders(
      reminders.map((item) => (item.id === task.id ? { ...item, title: title.trim(), date } : item))
    );
  };

  const selectFarmPlot = (plotId: string) => {
    setSelectedPlot(plotId);
    const plot = plots.find((item) => item.plot_id === plotId);
    if (!plot) return;
    const norm = plot.current_crop.toLowerCase();
    const matched =
      norm.includes('rice') || norm.includes('paddy')
        ? 'Rice'
        : SUPPORTED_CROPS.find((c) => c.toLowerCase() === norm) || plot.current_crop;
    setSelectedCrop(matched);
    setSowingDate(apiDateToISO(plot.sowing_date));
    if (plot.district) setSelectedDistrict(plot.district);
  };

  const sowingGuidance = useMemo(() => getSowingWindow(selectedCrop), [selectedCrop]);

  const firstOfMonth = new Date(monthView.getFullYear(), monthView.getMonth(), 1);
  const daysInMonth = new Date(monthView.getFullYear(), monthView.getMonth() + 1, 0).getDate();
  const weekdayNames = Array.from({ length: 7 }, (_, day) =>
    new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(new Date(2024, 0, 7 + day))
  );
  const monthName = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(monthView);
  const days = [
    ...Array(firstOfMonth.getDay()).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  const remindersByDay = new Set(allTasks.map((item) => item.date));

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      {/* Top action bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={onBackToDashboard}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-nutri-cardBorder text-xs sm:text-sm font-bold text-nutri-primary min-h-[44px] shadow-sm hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('common.backToDashboard', 'Back to Dashboard')}
        </button>

        <div className="flex items-center gap-2">
          {currentTimeStr && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 shadow-sm">
              <Clock className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              <span>{currentTimeStr}</span>
            </div>
          )}
          <button
            onClick={() => setIsNotifyModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 text-white text-xs sm:text-sm font-bold min-h-[44px] shadow-sm hover:bg-emerald-700 transition-colors"
          >
            <Bell className="w-4 h-4" />
            {t('cropCalendar.enableAlerts', 'Get Reminders')}
          </button>
        </div>
      </div>

      {/* Inputs & Configuration Card */}
      <section className="bg-white rounded-3xl p-5 sm:p-6 border border-nutri-cardBorder shadow-sm space-y-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-xs font-black uppercase px-3 py-1 rounded-full bg-emerald-100 text-emerald-900">
              {t('cropCalendar.season', 'Season')}: {seasonFor(sowingDate)}
            </span>
            <DemoBadge />
          </div>
          <h1 className="text-xl sm:text-2xl font-black flex items-center gap-2 text-nutri-primary">
            <Calendar className="w-6 h-6 text-nutri-secondary" />
            {t('cropCalendar.title', 'Interactive Crop Calendar')}
          </h1>
          <p className="text-xs sm:text-sm text-nutri-muted">
            {t('cropCalendar.subtitle', 'Crop tasks calculated from your crop, location, and sowing date.')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 border-t border-nutri-cardBorder pt-4">
          {/* Plot selector */}
          {plots.length > 0 && (
            <label className="text-xs font-bold text-nutri-primary col-span-1 sm:col-span-2 md:col-span-4">
              {t('cropCalendar.myFarmPlot', 'Use crop from My Farm')}
              <select
                value={selectedPlot}
                onChange={(e) => selectFarmPlot(e.target.value)}
                className="mt-1 w-full px-3 py-2.5 rounded-xl border border-nutri-cardBorder bg-white min-h-[44px] text-sm text-nutri-primary"
              >
                <option value="">{t('cropCalendar.manualCrop', 'Choose crop manually')}</option>
                {plots.map((plot) => (
                  <option key={plot.plot_id} value={plot.plot_id}>
                    {plot.name} · {plot.current_crop} ({plot.area_acres} ac)
                  </option>
                ))}
              </select>
            </label>
          )}

          {/* Automatic GPS Location Badge & Update */}
          <div className="flex flex-col justify-end">
            <span className="text-xs font-bold text-nutri-primary block mb-1">
              {t('header.location', 'Farm Location (GPS)')}
            </span>
            <button
              type="button"
              onClick={() => detectLocationGPS()}
              disabled={isDetecting}
              title={t('header.updateLocation', 'Update Location via GPS')}
              className="w-full flex items-center justify-between gap-1.5 px-3 py-2.5 rounded-xl border border-emerald-300 bg-emerald-50/60 hover:bg-emerald-100 min-h-[44px] text-xs font-bold text-emerald-900 transition active:scale-98 disabled:opacity-70 text-left"
            >
              <div className="flex items-center gap-1.5 truncate">
                {isDetecting ? (
                  <RefreshCw className="w-3.5 h-3.5 text-emerald-700 animate-spin shrink-0" />
                ) : (
                  <Navigation className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                )}
                <span className="truncate">
                  {location.village ? `${location.village}, ` : ''}{selectedDistrict || location.district || 'Guntur'}
                  {location.pincode ? ` (${location.pincode})` : ''}
                </span>
              </div>
              <span className="text-[10px] uppercase font-black px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-900 shrink-0">
                GPS
              </span>
            </button>
          </div>

          {/* Crop selector */}
          <label className="text-xs font-bold text-nutri-primary">
            {t('cropCalendar.cropSelect', 'Crop')}
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="mt-1 w-full px-3 py-2.5 rounded-xl border border-nutri-cardBorder bg-white min-h-[44px] text-sm text-nutri-primary"
            >
              {SUPPORTED_CROPS.map((crop) => (
                <option key={crop} value={crop}>
                  {crop}
                </option>
              ))}
            </select>
          </label>

          {/* Variety duration */}
          <label className="text-xs font-bold text-nutri-primary">
            {t('cropCalendar.varietyDuration', 'Variety duration')}
            <select
              value={varietyDuration}
              onChange={(e) => setVarietyDuration(e.target.value)}
              className="mt-1 w-full px-3 py-2.5 rounded-xl border border-nutri-cardBorder bg-white min-h-[44px] text-sm text-nutri-primary"
            >
              <option value="short">{t('cropCalendar.shortDuration', 'Short duration')}</option>
              <option value="medium">{t('cropCalendar.mediumDuration', 'Medium duration')}</option>
              <option value="long">{t('cropCalendar.longDuration', 'Long duration')}</option>
            </select>
          </label>

          {/* Sowing date */}
          <label className="text-xs font-bold text-nutri-primary">
            {t('cropCalendar.sowingDate', 'Sowing date')}
            <input
              type="date"
              value={sowingDate}
              onChange={(e) => setSowingDate(e.target.value)}
              required
              className="mt-1 w-full px-3 py-2.5 rounded-xl border border-nutri-cardBorder min-h-[44px] text-sm text-nutri-primary"
            />
          </label>
        </div>

        <div className="flex flex-wrap items-center justify-between text-xs text-nutri-muted pt-2 border-t border-slate-100">
          <span className="flex items-center gap-1.5 font-medium">
            <Compass className="w-3.5 h-3.5 text-emerald-600" />
            {location.village ? `${location.village}, ` : ''}
            {selectedDistrict || location.district}, {location.state}
          </span>
          <button
            onClick={() => setRefreshKey((k) => k + 1)}
            className="inline-flex items-center gap-1 text-xs text-emerald-700 hover:underline font-bold"
          >
            <RefreshCw className="w-3 h-3" />
            {t('common.refresh', 'Refresh')}
          </button>
        </div>
      </section>

      {/* Weather Forecast Integration */}
      {weatherData && weatherData.current && (
        <section className="bg-gradient-to-br from-emerald-900 to-teal-950 text-white rounded-3xl p-5 sm:p-6 shadow-md space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
            <div>
              <span className="text-xs uppercase font-bold text-emerald-300 tracking-wider">
                {t('cropCalendar.currentWeather', 'Current Weather')}
              </span>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Sun className="w-5 h-5 text-amber-300" />
                {selectedDistrict} · {weatherData.current.condition}
              </h2>
            </div>
            <div className="text-right">
              <span className="text-3xl font-black text-white">{weatherData.current.temperature_c}°C</span>
              <p className="text-xs text-emerald-200">
                {t('cropCalendar.temp', 'Temperature')} (feels {weatherData.current.feels_like_c}°C)
              </p>
            </div>
          </div>

          {/* Current weather metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/10">
              <span className="text-[11px] font-semibold text-emerald-200 flex items-center gap-1">
                <Droplets className="w-3.5 h-3.5 text-sky-300" />
                {t('cropCalendar.humidity', 'Humidity')}
              </span>
              <p className="text-base font-black text-white mt-0.5">{weatherData.current.humidity_percent}%</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/10">
              <span className="text-[11px] font-semibold text-emerald-200 flex items-center gap-1">
                <CloudRain className="w-3.5 h-3.5 text-blue-300" />
                {t('cropCalendar.rainChance', 'Rain Chance')}
              </span>
              <p className="text-base font-black text-white mt-0.5">{weatherData.current.rain_probability_percent}%</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/10">
              <span className="text-[11px] font-semibold text-emerald-200 flex items-center gap-1">
                <Wind className="w-3.5 h-3.5 text-teal-300" />
                {t('cropCalendar.windSpeed', 'Wind Speed')}
              </span>
              <p className="text-base font-black text-white mt-0.5">{weatherData.current.wind_speed_kmh} km/h</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/10">
              <span className="text-[11px] font-semibold text-emerald-200 flex items-center gap-1">
                <Sprout className="w-3.5 h-3.5 text-emerald-300" />
                Spray Advisory
              </span>
              <p className="text-xs font-bold text-amber-200 mt-0.5 truncate">
                {weatherData.current.spray_advisory?.status || 'Favourable'}
              </p>
            </div>
          </div>

          {/* 7-Day Forecast Strip */}
          {Array.isArray(weatherData.daily_forecast) && weatherData.daily_forecast.length > 0 && (
            <div className="pt-2">
              <h3 className="text-xs font-bold text-emerald-200 mb-2 flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5" />
                {t('cropCalendar.weatherForecast', '7-Day Weather Forecast')}
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-7 gap-2 overflow-x-auto pb-1">
                {weatherData.daily_forecast.map((day: any, idx: number) => (
                  <div
                    key={`${day.date}-${idx}`}
                    className="bg-white/10 backdrop-blur-sm rounded-xl p-2.5 text-center border border-white/5 flex flex-col items-center justify-between min-w-[76px]"
                  >
                    <span className="text-xs font-bold text-white">{day.day_name}</span>
                    <span className="text-[10px] text-emerald-200">{day.date}</span>
                    <div className="my-1">
                      <Sun className="w-5 h-5 text-amber-300 mx-auto" />
                    </div>
                    <span className="text-xs font-extrabold text-white">
                      {Math.round(day.temp_max_c)}° / {Math.round(day.temp_min_c)}°
                    </span>
                    <span className="text-[10px] text-sky-200 mt-0.5">
                      {day.rain_prob_percent}% rain
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Sowing Guidance & Weather Warnings Card */}
      <section className="bg-white rounded-3xl p-5 sm:p-6 border border-nutri-cardBorder shadow-sm space-y-4">
        <h2 className="font-black text-lg text-nutri-primary flex items-center gap-2">
          <Sprout className="w-5 h-5 text-emerald-600" />
          {t('cropCalendar.sowingGuidance', 'Sowing Guidance & Best Window')}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl p-4 bg-emerald-50 border border-emerald-200 space-y-2">
            <span className="text-xs uppercase font-extrabold text-emerald-800">
              {t('cropCalendar.bestSowingWindow', 'Best Sowing Window')} · {selectedCrop}
            </span>
            <p className="text-base font-black text-emerald-950">{sowingGuidance.window}</p>
            <p className="text-xs text-emerald-700">
              Season: <strong className="font-bold">{sowingGuidance.season}</strong>. Ensure adequate basal soil moisture and treated certified seed.
            </p>
          </div>

          <div className="rounded-2xl p-4 bg-amber-50 border border-amber-200 space-y-2">
            <span className="text-xs uppercase font-extrabold text-amber-800">
              {t('cropCalendar.recommendedCrops', 'Recommended Crops for Current Season & Area')}
            </span>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {sowingGuidance.recommended.map((cropName) => (
                <button
                  key={cropName}
                  type="button"
                  onClick={() => {
                    const norm = cropName.split(' ')[0];
                    if (SUPPORTED_CROPS.includes(norm)) setSelectedCrop(norm);
                  }}
                  className={`text-xs px-2.5 py-1 rounded-lg font-bold border transition-colors ${selectedCrop === cropName.split(' ')[0]
                    ? 'bg-amber-600 text-white border-amber-700'
                    : 'bg-white text-amber-900 border-amber-300 hover:bg-amber-100'
                    }`}
                >
                  {cropName}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Weather warnings & precautions */}
        {weatherData?.current?.alerts && weatherData.current.alerts.length > 0 && (
          <div className="rounded-2xl p-4 bg-rose-50 border border-rose-200 space-y-2">
            <div className="flex items-center gap-2 text-xs font-black uppercase text-rose-800">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              {t('cropCalendar.weatherWarnings', 'Weather Warnings & Precautions')}
            </div>
            {weatherData.current.alerts.map((alert: any, idx: number) => (
              <div key={idx} className="text-xs text-rose-900 border-t border-rose-200 pt-2 first:border-0 first:pt-0">
                <strong className="font-black">{alert.title}:</strong> {alert.description}{' '}
                <span className="font-semibold text-rose-700 underline block mt-0.5">{alert.action_item}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Error and loading banners */}
      {error && (
        <p role="alert" className="rounded-2xl bg-rose-50 border border-rose-200 p-4 text-sm text-rose-800">
          {error}
          <button onClick={() => setRefreshKey((key) => key + 1)} className="ml-3 underline font-bold">
            {t('common.retry', 'Retry')}
          </button>
        </p>
      )}

      {isLoading && (
        <p role="status" className="rounded-2xl bg-white p-4 text-sm text-nutri-muted shadow-sm">
          {t('common.loading', 'Updating crop tasks…')}
        </p>
      )}

      {/* Calendar Metrics & Timeline */}
      {calendarData && !isLoading && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <article className="rounded-2xl p-4 bg-emerald-50 border border-emerald-200 shadow-sm">
              <span className="text-xs font-bold text-emerald-800">{t('cropCalendar.currentStage', 'Current growth stage')}</span>
              <p className="font-black text-lg text-emerald-950 mt-1">{calendarData.current_stage_name}</p>
              <span className="text-xs text-emerald-700">
                {calendarData.current_das} {t('cropCalendar.daysAfterSowing', 'days after sowing')}
              </span>
            </article>
            <article className="rounded-2xl p-4 bg-white border border-nutri-cardBorder shadow-sm">
              <span className="text-xs font-bold text-nutri-muted">{t('cropCalendar.expectedHarvest', 'Estimated harvest')}</span>
              <p className="font-black text-lg text-nutri-primary mt-1">{calendarData.expected_harvest_date}</p>
              <span className="text-xs text-nutri-muted">
                {calendarData.total_duration_days} {t('common.days', 'days')}
              </span>
            </article>
            <article className="rounded-2xl p-4 bg-sky-50 border border-sky-200 shadow-sm">
              <span className="text-xs font-bold text-sky-800">{t('cropCalendar.nextTask', 'Next task')}</span>
              <p className="font-black mt-1 text-sm text-sky-950">{calendarData.next_key_activity}</p>
            </article>
          </div>

          {/* Month Calendar View */}
          <section className="rounded-3xl bg-white p-5 border border-nutri-cardBorder shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-black flex items-center gap-2 text-nutri-primary">
                <CalendarDays className="w-5 h-5 text-nutri-secondary" />
                {monthName}
              </h2>
              <div className="flex gap-2">
                <button
                  aria-label={t('common.previousMonth', 'Previous month')}
                  onClick={() => setMonthView(new Date(monthView.getFullYear(), monthView.getMonth() - 1, 1))}
                  className="p-2 rounded-xl bg-nutri-bg hover:bg-slate-200 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  aria-label={t('common.nextMonth', 'Next month')}
                  onClick={() => setMonthView(new Date(monthView.getFullYear(), monthView.getMonth() + 1, 1))}
                  className="p-2 rounded-xl bg-nutri-bg hover:bg-slate-200 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    const now = new Date();
                    setMonthView(new Date(now.getFullYear(), now.getMonth(), 1));
                  }}
                  className="px-3 rounded-xl bg-nutri-bg text-xs font-bold hover:bg-slate-200 transition-colors"
                >
                  {t('common.today', 'Today')}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
              {weekdayNames.map((day, index) => (
                <span key={`${day}-${index}`} className="py-2 text-[11px] font-bold text-nutri-muted">
                  {day}
                </span>
              ))}
              {days.map((day, index) => {
                const key = day
                  ? dateKey(new Date(monthView.getFullYear(), monthView.getMonth(), day))
                  : `empty-${index}`;
                const isToday = key === today;
                return (
                  <div
                    key={key}
                    className={`min-h-11 rounded-xl flex items-center justify-center text-sm transition-all ${isToday
                      ? 'bg-nutri-primary text-white font-black shadow-sm'
                      : remindersByDay.has(key)
                        ? 'bg-emerald-100 text-emerald-900 font-bold'
                        : 'text-nutri-primary hover:bg-slate-50'
                      }`}
                  >
                    {day || ''}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Tasks & Custom Reminders */}
          <section className="rounded-3xl bg-white p-5 border border-nutri-cardBorder shadow-sm space-y-4">
            <h2 className="font-black flex gap-2 items-center text-nutri-primary">
              <Clock className="w-5 h-5 text-nutri-secondary" />
              {t('cropCalendar.tasksTitle', 'Upcoming and overdue tasks')}
            </h2>

            {overdue.length > 0 && (
              <div>
                <h3 className="text-xs uppercase font-black text-rose-700 mb-2">
                  {t('cropCalendar.overdue', 'Overdue')}
                </h3>
                {overdue.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    formatDate={formatDate}
                    onToggle={toggleTask}
                    onEdit={editReminder}
                    onDelete={() => saveReminders(reminders.filter((item) => item.id !== task.id))}
                    t={t}
                  />
                ))}
              </div>
            )}

            {upcoming.slice(0, 12).map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                formatDate={formatDate}
                onToggle={toggleTask}
                onEdit={editReminder}
                onDelete={() => saveReminders(reminders.filter((item) => item.id !== task.id))}
                t={t}
              />
            ))}

            {upcoming.length === 0 && overdue.length === 0 && (
              <p className="text-sm text-nutri-muted">{t('cropCalendar.noTasks', 'No upcoming tasks.')}</p>
            )}

            {/* Add custom reminder form */}
            <form onSubmit={addReminder} className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-2 border-t pt-3">
              <input
                required
                value={reminderTitle}
                onChange={(e) => setReminderTitle(e.target.value)}
                placeholder={t('cropCalendar.reminderTitle', 'Reminder title')}
                className="rounded-xl border border-nutri-cardBorder px-3 py-2 text-sm text-nutri-primary min-h-[44px]"
              />
              <input
                required
                type="date"
                value={reminderDate}
                onChange={(e) => setReminderDate(e.target.value)}
                className="rounded-xl border border-nutri-cardBorder px-3 py-2 text-sm text-nutri-primary min-h-[44px]"
              />
              <button
                type="submit"
                className="inline-flex gap-1.5 items-center justify-center rounded-xl bg-nutri-primary text-white px-4 py-2 text-xs font-bold min-h-[44px] hover:bg-nutri-primary/90 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                {t('cropCalendar.addReminder', 'Add reminder')}
              </button>
            </form>
          </section>

          {/* Growth Milestones & Field Operations Timeline */}
          <section className="bg-white rounded-3xl p-5 sm:p-7 border border-nutri-cardBorder shadow-sm">
            <h2 className="font-black flex items-center gap-2 mb-4 text-nutri-primary">
              <Sprout className="w-5 h-5 text-nutri-secondary" />
              {t('cropCalendar.timelineTitle', 'Crop growth milestones and field operations')}
            </h2>
            {calendarData.stages.map((stage: any, index: number) => (
              <StageTimelineCard
                key={`${calendarData.calendar_id}-${stage.stage_id}`}
                stage={stage}
                isFirst={index === 0}
                isLast={index === calendarData.stages.length - 1}
              />
            ))}
          </section>
        </>
      )}

      <NotificationOptInModal
        isOpen={isNotifyModalOpen}
        onClose={() => setIsNotifyModalOpen(false)}
        cropName={selectedCrop}
      />
    </div>
  );
};

function TaskRow({
  task,
  formatDate,
  onToggle,
  onEdit,
  onDelete,
  t,
}: {
  task: Reminder;
  formatDate: (date: Date) => string;
  onToggle: (task: Reminder) => void;
  onEdit: (task: Reminder) => void;
  onDelete: () => void;
  t: (path: string, fallback?: string) => string;
}) {
  const [year, month, day] = task.date.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return (
    <div className="flex items-center gap-2 py-2 border-b border-slate-100 last:border-0">
      <button
        onClick={() => onToggle(task)}
        aria-label={
          task.done
            ? t('cropCalendar.markPending', 'Mark incomplete')
            : t('cropCalendar.markDone', 'Mark done')
        }
        className={`w-7 h-7 rounded-full border flex items-center justify-center transition-colors ${task.done ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 text-transparent hover:border-emerald-600'
          }`}
      >
        <CheckCircle2 className="w-4 h-4" />
      </button>
      <p className={`flex-1 text-sm ${task.done ? 'line-through text-slate-400 font-normal' : 'text-nutri-primary font-medium'}`}>
        {task.title}
      </p>
      <time className="text-xs text-nutri-muted">{formatDate(date)}</time>
      {task.custom && (
        <div className="flex items-center gap-1.5 ml-2">
          <button onClick={() => onEdit(task)} className="text-xs text-nutri-primary underline font-bold">
            {t('common.edit', 'Edit')}
          </button>
          <button
            onClick={onDelete}
            aria-label={t('common.delete', 'Delete')}
            className="p-1 text-rose-600 hover:text-rose-800 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
