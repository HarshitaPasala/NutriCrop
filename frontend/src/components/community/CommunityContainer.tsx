'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  ArrowLeft,
  MessageSquare,
  ThumbsUp,
  AlertTriangle,
  CheckCircle2,
  PlusCircle,
  Tag,
  MapPin,
  Clock,
  Sparkles,
  X,
  ShieldCheck,
  Bookmark,
  Share2,
  Trash2,
  Flag,
  Search,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { useLocation } from '@/context/LocationContext';
import { DemoBadge } from '@/components/ui/DemoBadge';

interface CommunityContainerProps {
  onBackToDashboard: () => void;
}

export const CommunityContainer: React.FC<CommunityContainerProps> = ({
  onBackToDashboard,
}) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { location } = useLocation();

  const [posts, setPosts] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState<boolean>(false);

  // New question form state initialized with authenticated farmer & GPS location
  const [authorName, setAuthorName] = useState(user?.name || 'Subba Rao');
  const [authorLoc, setAuthorLoc] = useState(
    location.village ? `${location.village}, ${location.district}` : location.district || 'Tenali, Guntur'
  );
  const [category, setCategory] = useState('Crop Protection');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [crop, setCrop] = useState(location.crop || 'Chilli');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [image, setImage] = useState('');
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [following, setFollowing] = useState<string[]>([]);

  const categories = ['all', 'Crop Protection', 'Soil Health', 'Market Advice'];

  useEffect(() => {
    try {
      setBookmarks(JSON.parse(localStorage.getItem('nutricrop_community_bookmarks') || '[]'));
      setFollowing(JSON.parse(localStorage.getItem('nutricrop_community_following') || '[]'));
      const savedPosts = JSON.parse(localStorage.getItem('nutricrop_community_posts') || '[]');
      if (savedPosts.length) setPosts(savedPosts);
    } catch { /* Ignore corrupt browser cache and load the server feed. */ }
    fetchPosts(selectedCategory);
    fetchAlerts();
  }, [selectedCategory]);

  const persistPosts = (next: any[]) => {
    setPosts(next);
    try { localStorage.setItem('nutricrop_community_posts', JSON.stringify(next)); } catch { setError('Could not save this post on this device.'); }
  };
  const toggleSaved = (key: 'nutricrop_community_bookmarks' | 'nutricrop_community_following', value: string, current: string[], update: (v: string[]) => void) => {
    const next = current.includes(value) ? current.filter((item) => item !== value) : [...current, value];
    update(next);
    localStorage.setItem(key, JSON.stringify(next));
  };

  const fetchPosts = async (cat: string) => {
    try {
      const url = cat === 'all' ? '/api/v1/community/posts' : `/api/v1/community/posts?category=${cat}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const local = JSON.parse(localStorage.getItem('nutricrop_community_posts') || '[]');
        setPosts([...local, ...(data || []).filter((post: any) => !local.some((saved: any) => saved.id === post.id))]);
      } else {
        loadFallback();
      }
    } catch (e) {
      loadFallback();
    }
  };

  const fetchAlerts = async () => {
    try {
      const res = await fetch('/api/v1/community/pest-alerts');
      if (res.ok) {
        const data = await res.json();
        setAlerts(data || []);
      }
    } catch (e) {
      // Ignored
    }
  };

  const loadFallback = () => {
    setPosts([
      {
        id: 'p1',
        author_name: 'Ramesh Reddy',
        author_location: 'Tenali, Guntur (AP)',
        category: 'Crop Protection',
        title: 'Severe upward leaf curling in 40-day Chilli crop - What organic solution works best?',
        content: 'My chilli plants show upward cup-shaped leaves and stunted shoots. I sprayed garlic extract last week but thrips are still present. Should I spray Neem oil or spinosad?',
        crop: 'Chilli',
        tags: ['Chilli', 'Thrips', 'Organic'],
        created_at: '2 hours ago',
        upvotes: 14,
        comments: [
          {
            id: 'c1',
            author_name: 'Dr. K. Srinivasa Rao',
            author_role: 'Verified Agronomist',
            content: 'Upward leaf curling is caused by Scirtothrips dorsalis. Install blue sticky traps @ 20-25 traps/acre. Spray Neem Oil (10,000 ppm) @ 3 ml/L targeting undersides of leaves.',
            created_at: '1 hour ago',
            upvotes: 22,
          },
        ],
      },
      {
        id: 'p2',
        author_name: 'Sukhwinder Singh',
        author_location: 'Samrala, Ludhiana (PB)',
        category: 'Soil Health',
        title: 'Direct Seeded Rice (DSR) iron chlorosis in light sandy soil',
        content: 'My 25-day old DSR crop is showing yellowing of younger leaves. Soil pH is 8.1. How should I apply ferrous sulphate?',
        crop: 'Rice',
        tags: ['Rice', 'DSR', 'Micronutrients'],
        created_at: '5 hours ago',
        upvotes: 9,
        comments: [
          {
            id: 'c2',
            author_name: 'Dr. Gurdeep Singh',
            author_role: 'KVK Scientist',
            content: 'In high pH soil, do not apply ferrous sulphate to the ground. Apply foliar spray of 1% Ferrous Sulphate (1 kg in 100 L water) with 1 kg Urea on a sunny morning.',
            created_at: '3 hours ago',
            upvotes: 18,
          },
        ],
      },
    ]);
  };

  const handleUpvote = async (postId: string) => {
    const before = posts;
    const optimistic = posts.map((p) => p.id === postId ? { ...p, upvotes: (p.upvotes || 0) + 1 } : p);
    persistPosts(optimistic);
    try {
      const res = await fetch(`/api/v1/community/posts/${postId}/upvote`, { method: 'POST' });
      if (res.ok) {
        const updated = await res.json();
        persistPosts(optimistic.map((p) => (p.id === postId ? updated : p)));
      }
    } catch {
      // Keep the optimistic update locally so the control remains useful offline.
      persistPosts(optimistic);
    }
  };

  const addComment = (postId: string) => {
    const value = (commentDrafts[postId] || '').trim();
    if (!value) return;
    persistPosts(posts.map((p) => p.id === postId ? { ...p, comments: [...(p.comments || []), { id: `local-${Date.now()}`, author_name: authorName || 'Farmer', author_role: 'Farmer', content: value, created_at: 'Just now', upvotes: 0 }] } : p));
    setCommentDrafts((state) => ({ ...state, [postId]: '' }));
  };

  const editPost = (post: any) => {
    const titleValue = window.prompt('Edit question title', post.title);
    if (titleValue === null) return;
    const contentValue = window.prompt('Edit question details', post.content);
    if (contentValue === null) return;
    persistPosts(posts.map((entry) => entry.id === post.id ? { ...entry, title: titleValue.trim() || entry.title, content: contentValue.trim() || entry.content } : entry));
  };

  const handleImage = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) { setError('Choose an image smaller than 5 MB.'); return; }
    const reader = new FileReader();
    reader.onload = () => setImage(String(reader.result || ''));
    reader.onerror = () => setError('This image could not be read.');
    reader.readAsDataURL(file);
  };

  const handleQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/v1/community/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author_name: authorName,
          author_location: authorLoc,
          category,
          title,
          content,
          crop,
        }),
      });
      if (res.ok) {
        const newPost = await res.json();
        persistPosts([{ ...newPost, image, is_mine: true }, ...posts]);
        setIsQuestionModalOpen(false);
        setTitle('');
        setContent('');
        setImage('');
      } else {
        const payload = await res.json().catch(() => ({}));
        setError(payload.detail || 'Your post could not be submitted. Please try again.');
      }
    } catch {
      const localPost = { id: `post-local-${Date.now()}`, author_name: authorName, author_location: authorLoc, category, title, content, crop, tags: [category, crop], created_at: 'Just now', upvotes: 0, comments: [], image, is_mine: true };
      persistPosts([localPost, ...posts]);
      setIsQuestionModalOpen(false);
      setTitle(''); setContent(''); setImage('');
      setError('Saved on this device. It will be available here when you return.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const visiblePosts = posts.filter((post) => {
    const query = search.trim().toLocaleLowerCase();
    return (!query || [post.title, post.content, post.crop, post.author_name, ...(post.tags || [])].some((value) => String(value || '').toLocaleLowerCase().includes(query))) &&
      (selectedCategory === 'all' || post.category?.toLocaleLowerCase() === selectedCategory.toLocaleLowerCase());
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      {/* Top Header & Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToDashboard}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-nutri-bg border border-nutri-cardBorder text-xs sm:text-sm font-bold text-nutri-primary transition min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('common.backToDashboard', 'Back to Dashboard')}</span>
        </button>

        <button
          onClick={() => setIsQuestionModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-nutri-primary hover:bg-nutri-secondary text-white text-xs sm:text-sm font-bold transition min-h-[44px]"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{t('community.askQuestion', 'Ask a Question')}</span>
        </button>
      </div>

      {/* Main Title Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-nutri-cardBorder shadow-sm space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
              Farmer Forum
            </span>
            <DemoBadge />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-nutri-primary flex items-center gap-2">
            <Users className="w-6 h-6 text-nutri-secondary" />
            <span>{t('community.title', 'Farmer Community & Outbreak Alerts')}</span>
          </h1>
          <p className="text-xs sm:text-sm text-nutri-muted mt-1">
            {t(
              'community.subtitle',
              'Share field challenges, discover verified agronomist solutions, and monitor local pest outbreaks.'
            )}
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="pt-2 border-t border-nutri-cardBorder flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition min-h-[40px] ${
                selectedCategory === cat
                  ? 'bg-nutri-primary text-white border-nutri-primary shadow-xs'
                  : 'bg-white hover:bg-nutri-bg text-nutri-primary border-nutri-cardBorder'
              }`}
            >
              {cat === 'all' ? 'All Discussions' : cat}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 rounded-xl border border-nutri-cardBorder bg-white px-3 py-2">
          <Search className="w-4 h-4 text-nutri-muted" />
          <input aria-label="Search community posts" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search posts, crops, or topics" className="w-full text-sm outline-none" />
        </label>
      </div>

      {/* Local Pest & Disease Outbreak Alert Ticker */}
      <div className="bg-amber-50 rounded-3xl p-5 border border-amber-300 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-700 animate-pulse" />
          <h2 className="text-sm font-black text-amber-950 uppercase tracking-wider">
            {t('community.outbreakAlerts', 'Active Pest Outbreak Bulletins')}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(alerts.length > 0
            ? alerts
            : [
                {
                  id: 'a1',
                  pest_name: 'Fall Armyworm (Spodoptera frugiperda)',
                  crop_affected: 'Maize',
                  district: 'Guntur',
                  severity: 'high',
                  advisory_summary: 'Larvae scraping whorl leaves in Tenali mandal. Apply Metarhizium @ 5g/L.',
                  reported_date: '18 Nov 2026',
                  verified_by: 'KVK Lam Farm Scientists',
                },
                {
                  id: 'a2',
                  pest_name: 'Pink Bollworm Rosette Flowers',
                  crop_affected: 'Cotton',
                  district: 'Solapur',
                  severity: 'medium',
                  advisory_summary: 'Rosette flowers in 70-day cotton. Erect 5 pheromone traps/acre.',
                  reported_date: '16 Nov 2026',
                  verified_by: 'MPKV Entomology Division',
                },
              ]
          ).map((a: any) => (
            <div
              key={a.id}
              className="p-3.5 rounded-2xl bg-white border border-amber-200 space-y-1.5 shadow-2xs"
            >
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-black text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full">
                  {a.crop_affected} • {a.district}
                </span>
                <span className="text-nutri-muted font-bold">{a.reported_date}</span>
              </div>
              <h3 className="text-xs sm:text-sm font-black text-nutri-primary">
                {a.pest_name}
              </h3>
              <p className="text-[11px] text-nutri-primary font-medium leading-relaxed">
                {a.advisory_summary}
              </p>
              <div className="text-[10px] text-emerald-800 font-bold flex items-center gap-1 pt-1 border-t border-slate-100">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified by {a.verified_by}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Discussion Threads Feed */}
      <div className="space-y-4">
        {visiblePosts.map((post) => (
          <div
            key={post.id}
            className="bg-white rounded-3xl p-5 sm:p-6 border border-nutri-cardBorder shadow-sm space-y-4 hover:border-emerald-300 transition"
          >
            {/* Post Header */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-xs text-nutri-muted font-bold mb-1">
                  <span>{post.author_name}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-[11px]">
                    <MapPin className="w-3 h-3" />
                    {post.author_location}
                  </span>
                  <span>•</span>
                  <span>{post.created_at}</span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-nutri-primary">
                  {post.title}
                </h3>
              </div>

              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 shrink-0">
                {post.category}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-nutri-primary font-medium leading-relaxed">
              {post.content}
            </p>
            {post.image && <img src={post.image} alt="Image attached to farmer post" className="max-h-72 rounded-xl object-contain bg-slate-50" />}

            {/* Tags and Upvote Row */}
            <div className="flex items-center justify-between pt-2 border-t border-nutri-cardBorder flex-wrap gap-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                {post.tags?.map((tag: string, i: number) => (
                  <span
                    key={i}
                    className="text-[10px] font-bold text-nutri-muted bg-nutri-bg px-2 py-0.5 rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => handleUpvote(post.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-nutri-bg hover:bg-emerald-100 text-nutri-primary text-xs font-bold transition min-h-[40px]"
              >
                <ThumbsUp className="w-3.5 h-3.5 text-emerald-700" />
                <span>Helpful ({post.upvotes})</span>
              </button>
              <button onClick={() => toggleSaved('nutricrop_community_bookmarks', post.id, bookmarks, setBookmarks)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-nutri-bg text-xs font-bold min-h-[40px]" aria-label="Bookmark post"><Bookmark className="w-3.5 h-3.5" />{bookmarks.includes(post.id) ? 'Saved' : 'Save'}</button>
              <button onClick={() => { navigator.clipboard?.writeText(`${window.location.origin}/?tab=community#${post.id}`).then(() => setError('Link copied.')).catch(() => setError('Copy this page URL to share the post.')); }} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-nutri-bg text-xs font-bold min-h-[40px]"><Share2 className="w-3.5 h-3.5" />Share</button>
              <button onClick={() => toggleSaved('nutricrop_community_following', post.author_name, following, setFollowing)} className="text-xs px-3 py-1.5 rounded-xl bg-nutri-bg font-bold min-h-[40px]">{following.includes(post.author_name) ? 'Following' : 'Follow'}</button>
              <button onClick={() => { if (window.confirm('Report this post to the community moderators?')) { const reports = JSON.parse(localStorage.getItem('nutricrop_community_reports') || '[]'); localStorage.setItem('nutricrop_community_reports', JSON.stringify([...reports, { postId: post.id, createdAt: new Date().toISOString() }])); setError('Report saved on this device for moderator review.'); } }} aria-label="Report post" className="p-2 rounded-xl bg-nutri-bg min-h-[40px]"><Flag className="w-3.5 h-3.5" /></button>
              {post.is_mine && <><button onClick={() => editPost(post)} aria-label="Edit my post" className="p-2 rounded-xl bg-nutri-bg min-h-[40px]"><span className="text-xs">Edit</span></button><button onClick={() => { const next = posts.filter((entry) => entry.id !== post.id); persistPosts(next); }} aria-label="Delete my post" className="p-2 rounded-xl bg-red-50 text-red-700 min-h-[40px]"><Trash2 className="w-3.5 h-3.5" /></button></>}
              </div>
            </div>

            <form onSubmit={(event) => { event.preventDefault(); addComment(post.id); }} className="flex gap-2">
              <input aria-label="Write a reply" value={commentDrafts[post.id] || ''} onChange={(event) => setCommentDrafts((state) => ({ ...state, [post.id]: event.target.value }))} placeholder="Write a reply" className="flex-1 min-w-0 rounded-xl border border-nutri-cardBorder px-3 py-2 text-sm" />
              <button className="rounded-xl bg-nutri-primary text-white px-3 text-xs font-bold">Reply</button>
            </form>

            {/* Comments & Verified Answers */}
            {post.comments && post.comments.length > 0 && (
              <div className="space-y-2.5 pt-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-nutri-muted block">
                  Expert & Peer Solutions ({post.comments.length}):
                </span>
                {post.comments.map((comm: any) => {
                  const isVerified =
                    comm.author_role.includes('Agronomist') ||
                    comm.author_role.includes('Scientist');

                  return (
                    <div
                      key={comm.id}
                      className={`p-3.5 rounded-2xl border text-xs space-y-1.5 ${
                        isVerified
                          ? 'bg-emerald-50/70 border-emerald-300'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-nutri-primary">{comm.author_name}</span>
                          {isVerified && (
                            <span className="flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-600 text-white shadow-2xs">
                              <ShieldCheck className="w-3 h-3" />
                              {comm.author_role}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-nutri-muted font-bold">
                          {comm.created_at}
                        </span>
                      </div>
                      <p className="text-xs text-nutri-primary font-medium leading-relaxed">
                        {comm.content}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Ask Question Modal */}
      {isQuestionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-nutri-cardBorder space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-nutri-primary flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-nutri-secondary" />
                <span>Ask the Farmer Community & Scientists</span>
              </h3>
              <button
                onClick={() => setIsQuestionModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-nutri-bg flex items-center justify-center text-nutri-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleQuestionSubmit} className="space-y-3 text-xs">
              {error && <p role="alert" className="rounded-xl bg-red-50 text-red-800 p-3">{error}</p>}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-nutri-primary mb-1">Your Name</label>
                  <input
                    type="text"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-nutri-cardBorder text-xs font-bold text-nutri-primary"
                  />
                </div>
                <div>
                  <label className="block font-bold text-nutri-primary mb-1">Village & District</label>
                  <input
                    type="text"
                    value={authorLoc}
                    onChange={(e) => setAuthorLoc(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-nutri-cardBorder text-xs font-bold text-nutri-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-nutri-primary mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-nutri-cardBorder text-xs font-bold text-nutri-primary"
                  >
                    <option value="Crop Protection">Crop Protection</option>
                    <option value="Soil Health">Soil Health</option>
                    <option value="Market Advice">Market Advice</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-nutri-primary mb-1">Target Crop</label>
                  <input
                    type="text"
                    value={crop}
                    onChange={(e) => setCrop(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-nutri-cardBorder text-xs font-bold text-nutri-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-nutri-primary mb-1">Question Title</label>
                <input
                  type="text"
                  placeholder="e.g. How to control stem borer in paddy without chemical spray?"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-nutri-cardBorder text-xs font-bold text-nutri-primary"
                />
              </div>

              <div>
                <label className="block font-bold text-nutri-primary mb-1">Detailed Field Problem</label>
                <textarea
                  placeholder="Describe crop symptoms, age of the crop, and previous treatments..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={3}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-nutri-cardBorder text-xs font-medium text-nutri-primary"
                />
              </div>
              <div><label className="block font-bold text-nutri-primary mb-1">Attach a field photo (optional)</label><input type="file" accept="image/*" capture="environment" onChange={(event) => handleImage(event.target.files?.[0])} className="w-full" />{image && <img src={image} alt="Post image preview" className="mt-2 max-h-36 rounded-xl" />}</div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-nutri-primary text-white text-xs font-bold hover:bg-nutri-secondary"
                >
                  {isSubmitting ? 'Posting...' : 'Post Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {error && !isQuestionModalOpen && <div role="status" className="fixed bottom-24 right-4 z-40 rounded-xl bg-slate-900 px-4 py-3 text-sm text-white shadow-lg">{error}<button onClick={() => setError('')} className="ml-3 underline">Dismiss</button></div>}
    </div>
  );
};
