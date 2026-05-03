import React, { useState } from 'react';
import { Download, Link as LinkIcon, User, Play, Music, Share2, Heart, MessageSquare, Eye, ExternalLink, Clipboard, Sparkles, Image as ImageIcon, Ghost, X, Zap, RefreshCcw, ChevronDown, ChevronUp, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Author {
  username: string;
  nickname: string;
  avatar: string;
}

interface Stats {
  views: number;
  likes: number;
  comments: number;
  shares: number;
}

interface VideoData {
  platform: 'tiktok' | 'snapchat';
  id: string;
  title: string;
  duration?: string;
  author: Author;
  stats: Stats;
  video: {
    noWatermark: string;
    sd?: string;
    watermark: string | null;
    hd: string;
    cover: string;
  };
  images: string[] | null;
  music: {
    title: string;
    author: string;
    play: string;
  } | null;
}

const LANGUAGES = [
  { code: 'en', name: 'English', dir: 'ltr', flag: '🇺🇸' },
] as const;

type LanguageCode = typeof LANGUAGES[number]['code'];

const TRANSLATIONS: Record<LanguageCode, any> = {
  en: {
    home: "Home", tiktok: "TikTok", snapchat: "Snapchat", video: "Video", photo: "Photo", downloader: "Downloader",
    noWatermark: "The best place to download TikTok and Snapchat videos without watermark", fast: "Fast", allDevices: "All devices",
    tiktokVideoPlaceholder: "Paste TikTok video link here",
    tiktokPhotoPlaceholder: "Paste TikTok photo link here",
    snapchatPlaceholder: "Paste Snapchat Spotlight link here",
    clear: "Clear", paste: "Paste", extract: "Extract", loading: "Processing...",
    downloadMp4: "Download MP4 Video", downloadSpotlight: "Download Spotlight Video",
    getAudio: "Get Audio", downloadAnother: "Download Another Content",
    downloadAllPhotos: "Download All Photos", highResImages: "High-Res Images",
    duration: "Duration", likes: "Likes", comments: "Comments", views: "Views",
    backToHome: "Back to Home", terms: "Terms of Service", privacy: "Privacy Policy",
    howTo: "How to Download?", features: "Features",
    noWatermarkFeatureTitle: "No Watermark", noWatermarkFeatureDesc: "Download TikTok and Snapchat videos without any logo or watermark.",
    highSpeedTitle: "High Speed", highSpeedDesc: "Our servers process your links in seconds.",
    multiDeviceTitle: "Multi-Device", multiDeviceDesc: "Works on iPhone, Android, PC, and tablets.",
    step1Title: "Copy Link", step1Desc: "Find your favorite content and copy the link.",
    step2Title: "Paste Link", step2Desc: "Paste the URL in the box above.",
    step3Title: "Enjoy", step3Desc: "Click download and get your file instantly.",
    footerAbout: "The best place to download TikTok and Snapchat videos with high quality and speed. Fast, secure, and always free.",
    legal: "Legal", support: "Support", supportDesc: "Have issues? Our team is available 24/7.",
    contactUs: "Contact Us", mp4: "Video", hd: "Quality", mp3: "Audio",
    copyright: "DownPro",
    finalCopyright: "© 2024 DownPro. All rights reserved.",
    termsIntro: "By using DownPro, you agree to the following terms:",
    termsTitle1: "1. Personal & Educational Use",
    termsBody1: "This tool is designed strictly for personal and educational purposes. You may not use this service to download protected or copyrighted material for commercial gain.",
    termsTitle2: "2. User Responsibility",
    termsBody2: "Users are solely responsible for the content they download. You must respect the intellectual property rights of creators. We do not host or store any of the content downloaded through our service.",
    termsTitle3: "3. Changes to Service",
    termsBody3: "We reserve the right to modify or terminate the service at any time without prior notice.",
    privacyIntro: "Your privacy is our priority. Here is how we handle your information:",
    privacyTitle1: "1. Data Collection",
    privacyBody1: "We do not collect or store any personal data from our users. You can use our service without creating an account or providing any personal information.",
    privacyTitle2: "2. Link Processing",
    privacyBody2: "We only process the links you provide to generate temporary download paths. We do not keep a history of the videos or links processed.",
    privacyTitle3: "3. No Databases",
    privacyBody3: "Our site does not have a database for users, downloads, or IP addresses. Every usage is private and anonymous.",
    privacyTitle4: "4. User Tracking",
    privacyBody4: "We may use minor local storage techniques only to improve user experience (e.g., remembering your platform choice), but never for tracking or advertising purposes.",
    siteLang: "Change Language"
  }
};

export default function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'terms' | 'privacy'>('home');
  const [platform, setPlatform] = useState<'tiktok' | 'snapchat'>('tiktok');
  const [language, setLanguage] = useState<LanguageCode>('en');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [videoInput, setVideoInput] = useState('');
  const [photoInput, setPhotoInput] = useState('');
  const [snapchatInput, setSnapchatInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [result, setResult] = useState<VideoData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'video' | 'photo'>('video');

  React.useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) setShowScrollTop(true);
      else setShowScrollTop(false);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const t = TRANSLATIONS[language];

  const input = platform === 'snapchat' ? snapchatInput : (mode === 'video' ? videoInput : photoInput);
  
  const setInput = (val: string) => {
    if (platform === 'snapchat') setSnapchatInput(val);
    else if (mode === 'video') setVideoInput(val);
    else setPhotoInput(val);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInput(text);
    } catch (err) {
      console.error('Failed to read clipboard');
    }
  };

  const handleClear = () => {
    setInput('');
    setError(null);
  };

  const triggerDownload = (url: string, filename: string) => {
    if (isDownloading || !url) return;
    setIsDownloading(true);

    const proxyUrl = `/api/proxy-download?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename)}`;
    const link = document.createElement('a');
    link.href = proxyUrl;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      setIsDownloading(false);
    }, 2000);
  };

  const handleExtract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    setError(null);
    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: input.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to extract media');
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setInput('');
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <div 
      className="min-h-screen p-4 md:p-8 flex flex-col items-center relative overflow-x-hidden transition-all duration-500 overflow-y-auto bg-[#833ab4] text-white"
      dir="ltr"
      style={{
        background: 'linear-gradient(135deg, #833ab4 0%, #fd1d1d 100%)'
      }}
    >
      {/* Persistent Minimal Header */}
      <div className="fixed top-4 left-4 right-4 z-[100] pointer-events-none" dir="ltr">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          {/* Menu Icon - Visible on mobile only */}
          <button 
            onClick={() => {
              setIsMobileMenuOpen(true);
            }}
            className="md:hidden glass px-3 py-2 rounded-xl border border-white/20 flex items-center justify-center backdrop-blur-3xl hover:bg-white/10 transition-all shadow-2xl active:scale-95 pointer-events-auto"
          >
            <span className="text-[10px] font-black tracking-widest text-white uppercase">Menu</span>
          </button>

          {/* Platform Switcher - Compact Header Version (Mobile Only) */}
          <div className="md:hidden glass p-1 rounded-xl flex items-center backdrop-blur-3xl transition-all border bg-black/20 border-white/10 pointer-events-auto shadow-xl">
            <button
              onClick={() => { setPlatform('tiktok'); setResult(null); setError(null); }}
              className={`flex items-center gap-2 px-4 md:px-5 py-2 rounded-lg text-xs font-black transition-all duration-300 ${platform === 'tiktok' ? 'bg-white text-black shadow-md scale-105' : 'text-white/40 hover:text-white/60'}`}
            >
              <span>{t.tiktok}</span>
            </button>
            <button
              onClick={() => { setPlatform('snapchat'); setResult(null); setError(null); }}
              className={`flex items-center gap-2 px-4 md:px-5 py-2 rounded-lg text-xs font-black transition-all duration-300 ${platform === 'snapchat' ? 'bg-white text-black shadow-md scale-105' : 'text-white/40 hover:text-white/60'}`}
            >
              <span>{t.snapchat}</span>
            </button>
          </div>

          {/* Desktop Balanced Spacer */}
          <div className="relative flex items-center justify-end">
            <div className="w-10 md:w-12 md:hidden" /> 
          </div>
        </div>
      </div>

      {/* Full-screen Mobile Menu Sidebar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-md z-[190] md:hidden"
            />
            
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 bottom-0 left-0 border-r w-[280px] md:hidden z-[200] glass backdrop-blur-3xl bg-black/40 border-white/10 shadow-2xl flex flex-col p-6 pt-20"
              dir="ltr"
            >
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="absolute top-6 right-6 glass px-3 py-1.5 rounded-lg border border-white/10 active:scale-90"
              >
                <span className="text-[10px] font-black tracking-widest text-white/70 uppercase">Close</span>
              </button>

              <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-1">
                {/* Home Link */}
                <button 
                  onClick={() => { setCurrentPage('home'); setIsMobileMenuOpen(false); }}
                  className="w-full flex items-center gap-4 px-5 py-4 rounded-xl hover:bg-white/5 transition-all text-white font-bold group border border-transparent hover:border-white/5"
                >
                  <span className="text-base">{t.home}</span>
                </button>

                {/* Separator */}
                <div className="h-px bg-white/5 w-full my-4" />

                {/* Legal Links */}
                <button 
                  onClick={() => { setCurrentPage('privacy'); setIsMobileMenuOpen(false); }}
                  className="w-full flex items-center gap-4 px-5 py-4 rounded-xl hover:bg-white/5 transition-all text-white/80 font-bold group border border-transparent hover:border-white/5"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-pink-400/50" />
                  <span className="text-base">{t.privacy}</span>
                </button>
                <button 
                  onClick={() => { setCurrentPage('terms'); setIsMobileMenuOpen(false); }}
                  className="w-full flex items-center gap-4 px-5 py-4 rounded-xl hover:bg-white/5 transition-all text-white/80 font-bold group border border-transparent hover:border-white/5"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400/50" />
                  <span className="text-base">{t.terms}</span>
                </button>
              </div>

              {/* Sidebar Mini Footer */}
              <div className="pt-6 border-t border-white/5 text-center">
                <p className="text-[10px] uppercase font-black tracking-widest text-white/20">
                  {t.finalCopyright.replace('© 2024 ', '')}
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="w-full max-w-4xl pt-4 md:pt-8 space-y-8 relative z-10" dir="ltr">
        
        {currentPage === 'home' && (
          <>

        {/* Desktop-only Platform Switcher (Since navbar is hidden on md) */}
        <div className="hidden md:flex justify-center gap-4 mb-6">
          <button
            onClick={() => { setPlatform('tiktok'); setResult(null); setError(null); }}
            className={`flex items-center gap-3 px-8 py-2.5 rounded-2xl text-sm font-black transition-all duration-300 border ${platform === 'tiktok' ? 'bg-white text-black shadow-xl scale-105 border-white' : 'bg-white/5 text-white/40 border-white/10 hover:bg-white/10 hover:text-white'}`}
          >
            {t.tiktok}
          </button>
          <button
            onClick={() => { setPlatform('snapchat'); setResult(null); setError(null); }}
            className={`flex items-center gap-3 px-8 py-2.5 rounded-2xl text-sm font-black transition-all duration-300 border ${platform === 'snapchat' ? 'bg-white text-black shadow-xl scale-105 border-white' : 'bg-white/5 text-white/40 border-white/10 hover:bg-white/10 hover:text-white'}`}
          >
            {t.snapchat}
          </button>
        </div>

        {/* Header Section */}
        <div className="text-center space-y-3">
          <motion.h1 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            key={`title-${platform}-${mode}-${language}`}
            className="text-4xl md:text-7xl font-extrabold tracking-tighter drop-shadow-2xl text-white"
          >
            DownPro
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-lg md:text-xl font-medium transition-colors duration-400 text-white/80"
          >
            {t.noWatermark.replace('TikTok and Snapchat', platform === 'tiktok' ? 'TikTok' : 'Snapchat')}
          </motion.p>
        </div>

        {/* Navigation Toggle (Only for TikTok) */}
        {platform === 'tiktok' && (
          <div className="flex justify-center">
            <div className="glass p-1 rounded-2xl flex relative overflow-hidden bg-white/5 border border-white/10">
              <motion.div
                layoutId="nav-glow"
                className="absolute inset-0 bg-white/10 blur-xl opacity-50"
                animate={{ x: mode === 'video' ? '0%' : '50%' }}
              />
              <button
                onClick={() => setMode('video')}
                className={`relative z-10 flex items-center gap-2 px-8 py-2 rounded-xl text-sm font-bold transition-all ${mode === 'video' ? 'text-white' : 'text-white/40 hover:text-white/60'}`}
              >
                {t.video}
                {mode === 'video' && (
                  <motion.div layoutId="nav-bg" className="absolute inset-0 bg-white/10 rounded-xl -z-10 border border-white/20" />
                )}
              </button>
              <button
                onClick={() => setMode('photo')}
                className={`relative z-10 flex items-center gap-2 px-8 py-2 rounded-xl text-sm font-bold transition-all ${mode === 'photo' ? 'text-white' : 'text-white/40 hover:text-white/60'}`}
              >
                {t.photo}
                {mode === 'photo' && (
                  <motion.div layoutId="nav-bg" className="absolute inset-0 bg-white/10 rounded-xl -z-10 border border-white/20" />
                )}
              </button>
            </div>
          </div>
        )}

        {/* Input Section */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="glass p-4 rounded-3xl shadow-2xl transition-all duration-500 border border-white/20"
        >
          <form onSubmit={handleExtract} className="relative flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <input 
                type="text" 
                placeholder={platform === 'tiktok' ? (mode === 'video' ? t.tiktokVideoPlaceholder : t.tiktokPhotoPlaceholder) : t.snapchatPlaceholder}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full border rounded-2xl py-4 px-6 outline-none focus:ring-2 transition-all duration-400 text-sm md:text-base bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:ring-white/30 cursor-default focus:cursor-text"
              />
              {input ? (
                <button 
                  type="button"
                  onClick={handleClear}
                  className="absolute end-2 top-1/2 -translate-y-1/2 px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all shadow-inner bg-black/20 hover:bg-black/40 text-white/90 border-white/5"
                >
                  <span>{t.clear}</span>
                </button>
              ) : (
                <button 
                  type="button"
                  onClick={handlePaste}
                  className="absolute end-2 top-1/2 -translate-y-1/2 px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-colors border bg-white/10 hover:bg-white/20 text-white/90 border-white/10"
                >
                  <span>{t.paste}</span>
                </button>
              )}
            </div>
            <button 
              type="submit"
              disabled={isLoading || !input.trim()}
              className="font-black py-4 px-12 rounded-2xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg uppercase tracking-wider w-full md:w-auto bg-green-500 hover:bg-green-400 text-white glow-green"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-3 rounded-full animate-spin border-white/30 border-t-white" />
              ) : (
                t.extract
              )}
            </button>
          </form>
        </motion.div>

        {/* Error State */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-red-500/20 border border-red-500/50 p-4 rounded-2xl text-center text-red-100 text-sm font-medium backdrop-blur-md"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result Area */}
        <AnimatePresence>
          {result && (
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Refined Caption Card (Professional Style) */}
              <div className="rounded-3xl overflow-hidden shadow-2xl relative group bg-white">
                {/* Header Title */}
                <div className="py-2 text-center border-b border-gray-100">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{platform === 'tiktok' ? (mode === 'video' ? t.video : t.photo) : 'SPOTLIGHT'}</span>
                </div>
                
                <div className="flex">
                  {/* Scrollable Text Area */}
                  <div className="flex-1 p-6 pr-4">
                    <div className="max-h-[150px] overflow-y-auto custom-scrollbar-light">
                      <p className="font-medium leading-relaxed whitespace-pre-wrap text-sm md:text-base text-gray-800">
                        {result.title || "No caption found for this content."}
                      </p>
                    </div>
                  </div>

                  {/* Vertical Gradient Copy Button */}
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(result.title);
                      // Simple feedback
                      const btn = document.activeElement as HTMLElement;
                      if (btn) btn.innerHTML = 'COPIED';
                      setTimeout(() => { if (btn) btn.innerHTML = 'COPY'; }, 2000);
                    }}
                    className="w-16 flex flex-col items-center justify-center gap-3 hover:brightness-110 active:scale-95 transition-all font-black text-[10px] uppercase tracking-widest px-2 bg-gradient-to-b from-[#833ab4] to-[#fd1d1d] text-white"
                  >
                    <div className="rotate-90 flex items-center gap-2">
                      <span>COPY</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Media Controls Card */}
              <div className="glass p-6 md:p-8 rounded-3xl shadow-2xl relative overflow-hidden">
                <div className="flex flex-col md:flex-row gap-8 relative z-10">
                  {/* Media Preview Section */}
                  <div className="shrink-0 flex justify-center">
                    {mode === 'video' || platform === 'snapchat' ? (
                      <div className="relative group rounded-2xl overflow-hidden shadow-2xl w-48 aspect-[3/4]">
                        <img 
                          src={result.video.cover || (result.images && result.images[0]) || 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?q=80&w=200&auto=format&fit=crop'} 
                          alt="Thumbnail" 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        {(result.video.noWatermark) && (
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-center justify-center">
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2 w-48 max-h-64 overflow-y-auto custom-scrollbar pr-1">
                        {result.images && result.images.length > 0 ? (
                          result.images.slice(0, 4).map((img, i) => (
                            <img 
                              key={i} 
                              src={img} 
                              className="w-full aspect-square object-cover rounded-lg border border-white/10" 
                              alt="" 
                            />
                          ))
                        ) : (
                          <div className="col-span-2 aspect-[3/4] bg-white/5 rounded-2xl flex flex-col items-center justify-center text-white/20 text-xs font-black uppercase tracking-widest">
                            No Photos
                          </div>
                        )}
                        {(result.images?.length || 0) > 4 && (
                          <div className="col-span-2 text-center text-[10px] text-white/40 font-bold uppercase py-1">
                            + {result.images!.length - 4} more
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Info & Controls Section */}
                  <div className="flex-1 space-y-6">
                    {/* Author Header & Badge */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {result.author.avatar ? (
                          <img src={result.author.avatar} className="w-10 h-10 rounded-full border border-white/20" alt="" />
                        ) : (
                          <div className="w-10 h-10 rounded-full flex items-center justify-center border bg-white/10 border-white/20">
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-base leading-none text-white">@{result.author.username}</p>
                          <p className="text-[10px] font-medium uppercase tracking-wider mt-1 text-white/60">{result.author.nickname}</p>
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-1 rounded-lg border uppercase font-black tracking-widest border-pink-400 text-pink-400 bg-pink-400/10">
                        {result.platform}
                      </span>
                    </div>

                    {/* Stats Row */}
                    <div className="flex flex-wrap gap-5 py-4 border-y uppercase tracking-tighter text-white/70 border-white/10">
                      {result.duration && <div className="flex items-center gap-1.5 text-xs font-bold">{t.duration}: {result.duration}</div>}
                      <div className="flex items-center gap-1.5 text-xs font-bold">{formatNumber(result.stats.likes)} {t.likes}</div>
                      <div className="flex items-center gap-1.5 text-xs font-bold">{formatNumber(result.stats.comments)} {t.comments}</div>
                      <div className="flex items-center gap-1.5 text-xs font-bold">{formatNumber(result.stats.views)} {t.views}</div>
                    </div>

                    {/* Download Controls */}
                    <div className="space-y-4">
                        {mode === 'photo' && result.images && result.images.length > 0 ? (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">{result.images.length} {t.highResImages}</p>
                            </div>
                            <button 
                              onClick={() => {
                                result.images?.forEach((img, idx) => {
                                  setTimeout(() => {
                                    triggerDownload(img, `${result.platform}_photo_${result.id}_${idx + 1}.jpg`);
                                  }, idx * 400);
                                });
                              }}
                              className="w-full bg-white text-[#833ab4] hover:bg-white/90 font-black py-4 px-6 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl uppercase tracking-wider"
                            >
                              {t.downloadAllPhotos}
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => triggerDownload(result.video.noWatermark, `${result.platform}_video_${result.id}.mp4`)}
                            disabled={isDownloading}
                            className="w-full bg-green-500 hover:bg-green-400 text-white font-black py-4 px-6 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-50 shadow-lg uppercase tracking-wider"
                          >
                            {isDownloading ? (
                              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                              platform === 'snapchat' ? t.downloadSpotlight : t.downloadMp4
                            )}
                          </button>
                        )}
                        
                        <div className="grid grid-cols-2 gap-3">
                          {(result.music?.play && platform === 'tiktok') && (
                            <button 
                              onClick={() => triggerDownload(result.music!.play, `audio_${result.id}.mp3`)}
                              className={`bg-white/10 hover:bg-white/20 text-white font-black py-3 rounded-2xl flex items-center justify-center gap-2 transition-colors border border-white/10 text-xs ${mode === 'photo' ? 'col-span-2' : ''}`}
                            >
                              {t.getAudio}
                            </button>
                          )}

                          <button 
                            onClick={handleReset}
                            className="col-span-2 bg-white/10 hover:bg-white/20 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 transition-colors border border-white/20 text-sm uppercase tracking-widest mt-2"
                          >
                            {t.downloadAnother}
                          </button>
                        </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

          </>
        )}

        {currentPage === 'terms' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass p-8 md:p-12 rounded-[40px] border border-white/20 backdrop-blur-3xl bg-black/20 space-y-8"
          >
            <button 
              onClick={() => setCurrentPage('home')}
              className="flex items-center gap-2 text-white/60 hover:text-white transition-colors font-black uppercase tracking-widest text-xs"
            >
              {t.backToHome}
            </button>
            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-4 custom-scrollbar">
              <h1 className="text-3xl font-black uppercase tracking-tighter">{t.terms}</h1>
              <div className="space-y-4 text-white/80 leading-relaxed text-left">
                <p>{t.termsIntro}</p>
                <h3 className="font-bold text-white uppercase tracking-wider text-sm mt-6">{t.termsTitle1}</h3>
                <p>{t.termsBody1}</p>
                <h3 className="font-bold text-white uppercase tracking-wider text-sm mt-6">{t.termsTitle2}</h3>
                <p>{t.termsBody2}</p>
                <h3 className="font-bold text-white uppercase tracking-wider text-sm mt-6">{t.termsTitle3}</h3>
                <p>{t.termsBody3}</p>
              </div>
            </div>
          </motion.div>
        )}

        {currentPage === 'privacy' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass p-8 md:p-12 rounded-[40px] border border-white/20 backdrop-blur-3xl bg-black/20 space-y-8"
          >
            <button 
              onClick={() => setCurrentPage('home')}
              className="flex items-center gap-2 text-white/60 hover:text-white transition-colors font-black uppercase tracking-widest text-xs"
            >
              {t.backToHome}
            </button>
            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-4 custom-scrollbar">
              <h1 className="text-3xl font-black uppercase tracking-tighter">{t.privacy}</h1>
              <div className="space-y-4 text-white/80 leading-relaxed text-left">
                <p>{t.privacyIntro}</p>
                <h3 className="font-bold text-white uppercase tracking-wider text-sm mt-6">{t.privacyTitle1}</h3>
                <p>{t.privacyBody1}</p>
                <h3 className="font-bold text-white uppercase tracking-wider text-sm mt-6">{t.privacyTitle2}</h3>
                <p>{t.privacyBody2}</p>
                <h3 className="font-bold text-white uppercase tracking-wider text-sm mt-6">{t.privacyTitle3}</h3>
                <p>{t.privacyBody3}</p>
                <h3 className="font-bold text-white uppercase tracking-wider text-sm mt-6">{t.privacyTitle4}</h3>
                <p>{t.privacyBody4}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Informational Sections (Only on Home) */}
        {currentPage === 'home' && (
          <div className="pt-20 space-y-24">
            
            {/* Features Section */}
            <section className={`grid grid-cols-1 gap-6 ${[t.noWatermarkFeatureTitle, t.highSpeedTitle].filter(Boolean).length === 2 ? 'md:grid-cols-2 max-w-4xl mx-auto' : 'md:grid-cols-2'}`}>
              {t.noWatermarkFeatureTitle && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="glass p-8 rounded-3xl border border-white/10 backdrop-blur-2xl flex flex-col items-center text-center space-y-4 hover:scale-105 transition-transform bg-black/10"
                >
                  <h3 className="text-xl font-black text-white uppercase tracking-wider">{t.noWatermarkFeatureTitle}</h3>
                  <p className="text-white/60 text-sm leading-relaxed">
                    {t.noWatermarkFeatureDesc.replace('TikTok and Snapchat', platform === 'tiktok' ? 'TikTok' : 'Snapchat')}
                  </p>
                </motion.div>
              )}
              
              {t.highSpeedTitle && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="glass p-8 rounded-3xl border border-white/10 backdrop-blur-2xl flex flex-col items-center text-center space-y-4 hover:scale-105 transition-transform bg-black/10"
                >
                  <h3 className="text-xl font-black text-white uppercase tracking-wider">{t.highSpeedTitle}</h3>
                  <p className="text-white/60 text-sm leading-relaxed">{t.highSpeedDesc}</p>
                </motion.div>
              )}
          </section>

          {/* How-To Guide */}
          <section className="space-y-12 text-center">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white drop-shadow-lg">{t.howTo}</h2>
              <div className="h-1.5 w-24 bg-white/30 mx-auto rounded-full" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
              {/* Connector lines (Desktop) */}
              <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-white/5 -z-10" />
              
              <div className="space-y-6 group">
                <div className="w-20 h-20 rounded-full bg-white text-black flex items-center justify-center text-3xl font-black mx-auto shadow-2xl group-hover:scale-110 transition-transform">1</div>
                <div className="space-y-2">
                  <h4 className="text-white font-black uppercase tracking-widest">{t.step1Title}</h4>
                  <p className="text-white/40 text-sm">{t.step1Desc}</p>
                </div>
              </div>

              <div className="space-y-6 group">
                <div className="w-20 h-20 rounded-full bg-white text-black flex items-center justify-center text-3xl font-black mx-auto shadow-2xl group-hover:scale-110 transition-transform">2</div>
                <div className="space-y-2">
                  <h4 className="text-white font-black uppercase tracking-widest">{t.step2Title}</h4>
                  <p className="text-white/40 text-sm">{t.step2Desc}</p>
                </div>
              </div>

              <div className="space-y-6 group">
                <div className="w-20 h-20 rounded-full bg-green-500 text-white flex items-center justify-center text-3xl font-black mx-auto shadow-2xl group-hover:scale-110 transition-transform">3</div>
                <div className="space-y-2">
                  <h4 className="text-white font-black uppercase tracking-widest">{t.step3Title}</h4>
                  <p className="text-white/40 text-sm">{t.step3Desc}</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Global Footer (Always visible) */}
      <footer className="glass p-10 md:p-16 rounded-[40px] border border-white/10 backdrop-blur-3xl bg-black/20 mt-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-left rtl:text-right">
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-white">
                  <span className="font-black text-xl tracking-tighter uppercase">DownPro</span>
                </div>
                <p className="text-white/40 text-sm leading-relaxed">
                  {t.footerAbout}
                </p>
                <div className="flex gap-4">
                </div>
              </div>

              <div className="space-y-6">
                <h4 className="text-white font-black uppercase tracking-widest text-xs">{t.legal}</h4>
                <ul className="space-y-4 text-sm font-medium">
                  <li><button onClick={() => setCurrentPage('terms')} className="text-white/40 hover:text-white transition-colors flex items-center gap-2 outline-none">{t.terms}</button></li>
                  <li><button onClick={() => setCurrentPage('privacy')} className="text-white/40 hover:text-white transition-colors flex items-center gap-2 outline-none">{t.privacy}</button></li>
                </ul>
              </div>

              <div className="space-y-6">
                <h4 className="text-white font-black uppercase tracking-widest text-xs">{t.support}</h4>
                <div className="p-6 rounded-2xl bg-white/5 border border-white/5 space-y-4">
                  <p className="text-white/40 text-xs leading-relaxed font-medium">{t.supportDesc}</p>
                  <button className="w-full py-3 bg-white text-black font-black rounded-xl text-xs uppercase tracking-widest hover:scale-[0.98] transition-transform">
                    {t.contactUs}
                  </button>
                </div>
              </div>
            </div>
            
            <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-white/20 text-[10px] font-bold uppercase tracking-widest">
                &copy; 2024 {t.copyright}
              </p>
              <div className="flex gap-8 text-white/20 text-[10px] font-black uppercase tracking-[0.3em]">
                <span>{t.mp4}</span>
                <span>{t.hd}</span>
                <span>{t.mp3}</span>
              </div>
            </div>
          </footer>

          {/* Back to Top */}
          <AnimatePresence>
            {showScrollTop && (
              <motion.button
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="fixed bottom-8 right-8 z-[100] w-14 h-14 rounded-full glass border border-white/20 backdrop-blur-3xl bg-black/40 text-white flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all text-pink-300"
              >
                <ChevronUp size={28} strokeWidth={3} />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Final Subtle Copyright */}
          <div className="mt-8 text-center pb-8 opacity-30 select-none">
            <p className="text-[10px] uppercase tracking-[0.4em] font-medium text-white/50">
              {t.finalCopyright}
            </p>
          </div>
      </div>
    </div>
  );
}
