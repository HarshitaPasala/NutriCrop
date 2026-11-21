'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, BookOpen, CheckCircle, ChevronDown, ChevronUp, ExternalLink, Heart, Search, Share2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { DemoBadge } from '@/components/ui/DemoBadge';

interface Problem { id: string; title: string; symptoms: string; causes: string; reclamation: string[]; prevention?: string; severity_indicator: string; category?: string; crops?: string[]; image_url?: string; }
const CATEGORIES = ['all', 'pest', 'disease', 'nutrient', 'weather', 'soil'];

export const SoilProblemLibrary: React.FC = () => {
  const { t } = useLanguage();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [crop, setCrop] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    try {
      setFavorites(JSON.parse(localStorage.getItem('nutricrop_problem_favorites') || '[]'));
      const diagnosis = localStorage.getItem('nutricrop_library_search');
      if (diagnosis) { setSearchQuery(diagnosis); localStorage.removeItem('nutricrop_library_search'); }
    } catch { setFavorites([]); }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    const load = async () => {
      setLoading(true); setError('');
      try {
        const response = await fetch('/api/v1/soil/library', { signal: controller.signal });
        if (!response.ok) throw new Error(t('problemLibrary.loadError', 'The problem library could not be loaded. Try again.'));
        const data = await response.json();
        if (active) setProblems(data.problems || []);
      } catch (err) {
        if (active && !(err instanceof DOMException && err.name === 'AbortError')) setError(err instanceof Error ? err.message : t('problemLibrary.loadError', 'The problem library could not be loaded. Try again.'));
      } finally { if (active) setLoading(false); }
    };
    load();
    return () => { active = false; controller.abort(); };
  }, [retry]);

  const crops = useMemo(() => Array.from(new Set(problems.flatMap((problem) => problem.crops || []))).sort(), [problems]);
  const filtered = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase();
    return problems.filter((problem) => {
      const categoryMatch = category === 'all' || (category === 'soil' ? !problem.category || problem.category === 'soil' : problem.category === category);
      const cropMatch = crop === 'all' || (problem.crops || []).some((item) => item.toLocaleLowerCase() === crop.toLocaleLowerCase());
      const text = [problem.title, problem.symptoms, problem.causes, problem.prevention, ...(problem.reclamation || []), ...(problem.crops || [])].join(' ').toLocaleLowerCase();
      return categoryMatch && cropMatch && (!query || text.includes(query));
    });
  }, [problems, category, crop, searchQuery]);

  const toggleFavorite = (id: string) => {
    const next = favorites.includes(id) ? favorites.filter((item) => item !== id) : [...favorites, id];
    setFavorites(next); localStorage.setItem('nutricrop_problem_favorites', JSON.stringify(next));
  };
  const share = async (problem: Problem) => {
    const url = new URL(window.location.href); url.searchParams.set('tab', 'soilHealth'); url.searchParams.set('subtab', 'library'); url.searchParams.set('problem', problem.id);
    try { if (navigator.share) await navigator.share({ title: problem.title, url: url.toString() }); else { await navigator.clipboard.writeText(url.toString()); setNotice(t('problemLibrary.linkCopied', 'Link copied to clipboard.')); } }
    catch { setNotice(t('problemLibrary.shareError', 'Could not share this entry.')); }
  };

  useEffect(() => {
    const problemId = new URLSearchParams(window.location.search).get('problem');
    if (problemId) setExpandedId(problemId);
  }, [problems]);

  return (
    <div className="space-y-5">
      <section className="bg-white rounded-3xl p-5 sm:p-6 border border-nutri-cardBorder shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"><div><div className="flex items-center gap-2 mb-1"><span className="text-xs font-bold text-nutri-secondary bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">{t('problemLibrary.knowledgeBase', 'Agronomic Knowledge Base')}</span><DemoBadge /></div><h2 className="text-xl sm:text-2xl font-black text-nutri-primary">{t('soil.problemLibraryTitle', 'Crop and Soil Problem Library')}</h2><p className="text-xs text-nutri-muted mt-1">{t('problemLibrary.description', 'Search crop and soil problems for symptoms, causes, treatment and prevention.')}</p></div><label className="relative w-full sm:w-72"><Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" /><input aria-label={t('problemLibrary.search', 'Search problems')} value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder={t('problemLibrary.searchPlaceholder', 'Search crop, problem or symptom')} className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 bg-nutri-bg text-xs font-bold min-h-[44px]" /></label></div>
        <div className="flex gap-2 overflow-x-auto border-t border-nutri-cardBorder pt-3">{CATEGORIES.map((item) => <button key={item} onClick={() => setCategory(item)} className={`px-3.5 py-2 rounded-full border text-xs font-bold capitalize whitespace-nowrap min-h-[40px] ${category === item ? 'bg-nutri-primary text-white' : 'bg-white text-nutri-primary border-nutri-cardBorder'}`}>{t(`problemLibrary.category.${item}`, item === 'all' ? 'All problems' : item)}</button>)}</div>
        <label className="block text-xs font-bold">{t('problemLibrary.cropFilter', 'Filter by crop')}<select value={crop} onChange={(event) => setCrop(event.target.value)} className="ml-2 rounded-xl border border-nutri-cardBorder bg-white px-3 py-2 min-h-[40px]"><option value="all">{t('problemLibrary.allCrops', 'All crops')}</option>{crops.map((item) => <option key={item}>{item}</option>)}</select></label>
      </section>
      {notice && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-900">{notice}<button onClick={() => setNotice('')} className="ml-3 underline">{t('common.close', 'Close')}</button></p>}
      {loading && <p role="status" className="rounded-2xl bg-white p-5 text-sm text-nutri-muted">{t('common.loading', 'Loading problem guides…')}</p>}
      {error && <p role="alert" className="rounded-2xl bg-rose-50 border border-rose-200 p-4 text-sm text-rose-800">{error}<button onClick={() => setRetry((value) => value + 1)} className="ml-3 underline">{t('common.retry', 'Retry')}</button></p>}
      {!loading && !error && filtered.length === 0 && <p className="rounded-2xl bg-white p-6 text-sm text-nutri-muted">{t('problemLibrary.empty', 'No problems match these filters.')}</p>}
      <div className="space-y-3.5">{filtered.map((problem) => {
        const expanded = expandedId === problem.id;
        const favorite = favorites.includes(problem.id);
        return <article key={problem.id} className="bg-white rounded-3xl border border-nutri-cardBorder shadow-xs overflow-hidden"><div className="p-4 sm:p-5 flex items-start gap-3"><button onClick={() => setExpandedId(expanded ? null : problem.id)} aria-expanded={expanded} className="flex-1 min-w-0 text-left flex items-center gap-3"><span className="w-10 h-10 rounded-2xl bg-emerald-100 text-nutri-primary flex items-center justify-center shrink-0"><AlertTriangle className="w-5 h-5" /></span><span className="min-w-0"><span className="block font-black text-nutri-dark">{problem.title}</span><span className="block text-xs text-nutri-muted line-clamp-1 mt-0.5">{problem.symptoms}</span><span className="mt-1 block text-[10px] uppercase font-bold text-emerald-800">{t(`problemLibrary.category.${problem.category || 'soil'}`, problem.category || 'Soil')} · {problem.crops?.join(', ') || t('problemLibrary.soilHealth', 'Soil health')}</span></span></button><div className="flex items-center gap-1"><button aria-label={favorite ? t('problemLibrary.removeFavorite', 'Remove favorite') : t('problemLibrary.saveFavorite', 'Save favorite')} onClick={() => toggleFavorite(problem.id)} className={`p-2 rounded-xl min-h-[40px] ${favorite ? 'text-rose-700 bg-rose-50' : 'text-slate-500 bg-slate-50'}`}><Heart className="w-4 h-4" fill={favorite ? 'currentColor' : 'none'} /></button><button aria-label={t('problemLibrary.share', 'Share problem')} onClick={() => share(problem)} className="p-2 rounded-xl bg-slate-50 min-h-[40px]"><Share2 className="w-4 h-4" /></button><button aria-label={expanded ? t('common.close', 'Close details') : t('problemLibrary.viewDetails', 'View details')} onClick={() => setExpandedId(expanded ? null : problem.id)} className="p-2 rounded-xl bg-slate-50 min-h-[40px]">{expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}</button></div></div>
          {expanded && <div className="p-4 sm:p-5 pt-0 border-t border-slate-100 space-y-3 text-xs"><div className="grid grid-cols-1 sm:grid-cols-2 gap-3"><section className="p-3 rounded-2xl bg-rose-50 border border-rose-200"><h3 className="font-black mb-1">{t('problemLibrary.symptoms', 'Symptoms')}</h3><p>{problem.symptoms}</p></section><section className="p-3 rounded-2xl bg-amber-50 border border-amber-200"><h3 className="font-black mb-1">{t('problemLibrary.causes', 'Causes')}</h3><p>{problem.causes}</p></section></div><section className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200"><h3 className="font-black mb-2">{t('problemLibrary.treatment', 'Treatment and field actions')}</h3><ul className="space-y-1.5">{problem.reclamation.map((step, index) => <li key={`${problem.id}-${index}`} className="flex gap-2"><CheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />{step}</li>)}</ul></section>{problem.prevention && <section className="p-3 rounded-2xl bg-sky-50 border border-sky-200"><h3 className="font-black mb-1">{t('problemLibrary.prevention', 'Prevention')}</h3><p>{problem.prevention}</p></section>}{problem.image_url && <img src={problem.image_url} alt={problem.title} className="max-h-64 rounded-2xl object-contain" />}<a href="tel:18001801551" className="inline-flex items-center gap-2 rounded-xl bg-nutri-primary px-4 py-2.5 text-white font-bold min-h-[44px]">{t('problemLibrary.askExpert', 'Ask an agricultural expert')}<ExternalLink className="w-4 h-4" /></a></div>}
        </article>;
      })}</div>
    </div>
  );
};
