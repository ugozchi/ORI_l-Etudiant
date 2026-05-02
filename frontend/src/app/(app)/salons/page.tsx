'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Users, Heart, X, Check, Search, Calendar, GraduationCap, Sparkles, RefreshCcw, LayoutGrid, Layers, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { createClient } from '@/utils/supabase/client';
import { useProfile } from '@/contexts/ProfileContext';
import { LockedOverlay } from '@/components/layout/LockedOverlay';

type Fair = {
  id: string;
  name: string;
  date: string;
  city: string;
  region: string;
  address: string;
  topics: string[];
  target_levels: string[];
  schools_count: number;
  description: string;
  image_url: string;
  match_score?: number;
};

export default function SalonsPage() {
  const [fairs, setFairs] = useState<Fair[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  
  // Dashboard & Tracking States
  const [view, setView] = useState<'swipe' | 'list'>('swipe');
  const [likedFairs, setLikedFairs] = useState<Set<string>>(new Set());
  const [dislikedFairs, setDislikedFairs] = useState<Set<string>>(new Set());
  const [listFilter, setListFilter] = useState<'all' | 'liked' | 'disliked' | 'top'>('all');
  
  const supabase = createClient();
  const { isProfileComplete } = useProfile();

  useEffect(() => {
    const fetchFairs = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id;
        
        let url = `${process.env.NEXT_PUBLIC_API_URL}/api/fairs`;
        if (userId) {
           url = `${process.env.NEXT_PUBLIC_API_URL}/api/fairs/recommended/${userId}`;
        }
        
        const res = await fetch(url);
        const json = await res.json();
        
        if (json.status === 'success') {
          setFairs(json.data);
        }
      } catch (err) {
        console.error("Failed to fetch fairs", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFairs();
  }, [supabase]);

  const handleSwipe = (dir: 'left' | 'right') => {
    // Record preference
    if (currentIndex < fairs.length) {
      const fairId = fairs[currentIndex].id;
      if (dir === 'right') {
        setLikedFairs(prev => {
          const next = new Set(prev);
          next.add(fairId);
          return next;
        });
      } else {
        setDislikedFairs(prev => {
          const next = new Set(prev);
          next.add(fairId);
          return next;
        });
      }
    }

    if (isFlipped) {
      setIsFlipped(false);
      setTimeout(() => executeSwipe(dir), 150);
    } else {
      executeSwipe(dir);
    }
  };

  const executeSwipe = (dir: 'left' | 'right') => {
    setDirection(dir);
    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
      setDirection(null);
    }, 300);
  }

  const getCardStyle = (index: number) => {
    const isCurrent = index === currentIndex;
    const isNext = index === currentIndex + 1;
    
    if (isCurrent) return "z-20";
    if (isNext) return "z-10";
    return "z-0";
  };

  const filteredFairs = fairs.filter(f => {
    if (listFilter === 'liked') return likedFairs.has(f.id);
    if (listFilter === 'disliked') return dislikedFairs.has(f.id);
    if (listFilter === 'top') return (f.match_score || 0) >= 80;
    return true; // 'all'
  });

  return (
    <div className="flex flex-col h-full overflow-y-auto relative pb-24">
      {!isProfileComplete && <LockedOverlay />}
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-400/5 blur-[100px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-slate-900/5 blur-[100px] rounded-full pointer-events-none translate-y-1/3 -translate-x-1/3" />

      {/* Header */}
      <header className="px-6 py-6 border-b border-white/40 bg-white/60 backdrop-blur-xl z-30 shadow-[0_4px_30px_rgba(0,0,0,0.03)] sticky top-0">
        <div className="flex items-center justify-between max-w-4xl mx-auto w-full gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">ORI Matcher</h1>
            <p className="text-sm text-slate-500 font-medium mt-1">Découvre les salons qui te correspondent</p>
          </div>
          
          {/* View Toggle */}
          <div className="hidden sm:flex bg-slate-100 p-1 rounded-xl items-center gap-1">
            <button 
              onClick={() => setView('swipe')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all",
                view === 'swipe' ? "bg-white text-orange-500 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              <Layers className="w-4 h-4" /> Swipe
            </button>
            <button 
              onClick={() => setView('list')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all",
                view === 'list' ? "bg-white text-orange-500 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              <LayoutGrid className="w-4 h-4" /> Dashboard
            </button>
          </div>

          <Button variant="ghost" size="icon" className="sm:hidden rounded-2xl bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-900 shadow-sm border border-slate-100 transition-colors w-12 h-12" onClick={() => setView(view === 'swipe' ? 'list' : 'swipe')}>
            {view === 'swipe' ? <LayoutGrid className="h-5 w-5" /> : <Layers className="h-5 w-5" />}
          </Button>
        </div>
      </header>

      {/* Main Area */}
      <div className={cn(
        "flex-1 relative flex flex-col items-center p-4 mt-4 w-full max-w-5xl mx-auto",
        view === 'swipe' ? "justify-start min-h-[750px]" : "justify-start"
      )}>
        {loading ? (
          <div className="flex flex-col items-center gap-4 mt-20">
            <div className="w-12 h-12 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin" />
            <p className="text-slate-500 font-bold tracking-wide uppercase text-sm animate-pulse">Recherche des salons...</p>
          </div>
        ) : view === 'swipe' ? (
          /* SWIPE VIEW */
          currentIndex >= fairs.length ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center max-w-sm bg-white p-10 rounded-3xl shadow-xl border border-slate-100 relative overflow-hidden mt-10"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-400 to-orange-600" />
              <div className="w-20 h-20 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-orange-100">
                <Check className="h-10 w-10 text-orange-500" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Tu es à jour !</h2>
              <p className="text-slate-500 leading-relaxed font-medium">Tu as vu tous les salons à venir correspondant à ton profil.</p>
              
              <div className="flex flex-col gap-3 mt-8">
                <Button className="bg-slate-900 text-white hover:bg-slate-800 border-none w-full shadow-lg rounded-2xl py-6 text-base font-bold transition-transform active:scale-95" onClick={() => setCurrentIndex(0)}>
                  Revoir depuis le début
                </Button>
                <Button variant="outline" className="w-full rounded-2xl py-6 text-base font-bold transition-transform active:scale-95 text-slate-700 border-slate-200" onClick={() => setView('list')}>
                  Voir mon Dashboard
                </Button>
              </div>
            </motion.div>
          ) : (
            <div className="relative w-full max-w-[380px] h-[620px] perspective-1000 mx-auto mt-4">
              <AnimatePresence>
                {fairs.map((fair, idx) => {
                  if (idx < currentIndex || idx > currentIndex + 1) return null;
                  const isCurrent = idx === currentIndex;
                  
                  return (
                    <motion.div
                      key={fair.id}
                      initial={isCurrent ? { scale: 0.95, opacity: 0, y: 20 } : false}
                      animate={{
                        scale: isCurrent ? 1 : 0.92,
                        opacity: isCurrent ? 1 : 0.7,
                        y: isCurrent ? 0 : 24,
                        x: isCurrent && direction === 'left' ? -350 : isCurrent && direction === 'right' ? 350 : 0,
                        rotate: isCurrent && direction === 'left' ? -20 : isCurrent && direction === 'right' ? 20 : 0,
                        rotateY: isCurrent && isFlipped ? 180 : 0,
                      }}
                      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                      style={{ transformStyle: 'preserve-3d' }}
                      onClick={() => isCurrent && setIsFlipped(!isFlipped)}
                      className={cn(
                        "absolute inset-0 w-full cursor-pointer",
                        getCardStyle(idx)
                      )}
                    >
                      {/* FRONT FACE */}
                      <div 
                        className="absolute inset-0 w-full h-full rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] bg-white border border-white/50 flex flex-col justify-end"
                        style={{ backfaceVisibility: 'hidden' }}
                      >
                        {/* Background Image */}
                        <div 
                          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105"
                          style={{ backgroundImage: `url(${fair.image_url})` }}
                        />
                        
                        {/* Rich Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/70 to-transparent opacity-95" />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent h-1/3" />

                        {/* Flip Hint */}
                        {isCurrent && (
                          <div className="absolute top-6 right-6 px-3 py-2 bg-white/20 backdrop-blur-xl rounded-full border border-white/30 flex items-center gap-2 animate-bounce">
                            <RefreshCcw className="w-4 h-4 text-white" />
                            <span className="text-white text-xs font-bold uppercase tracking-wider">Analyse IA</span>
                          </div>
                        )}

                        {/* Content */}
                        <div className="relative z-10 p-8 pb-28 space-y-4">
                          {fair.match_score && (
                            <div className="inline-flex px-4 py-1.5 bg-white/20 backdrop-blur-xl rounded-full border border-white/30 shadow-lg items-center gap-2 mb-2">
                              <div className={cn(
                                "w-2.5 h-2.5 rounded-full shadow-[0_0_10px_currentColor]",
                                fair.match_score > 80 ? "bg-green-400 text-green-400" : fair.match_score > 50 ? "bg-yellow-400 text-yellow-400" : "bg-red-400 text-red-400",
                              )} />
                              <span className="text-white font-bold text-sm tracking-wide">{Math.round(fair.match_score)}% Match</span>
                            </div>
                          )}

                          <div>
                            <h2 className="text-3xl font-black text-white leading-tight mb-2 tracking-tight drop-shadow-md">
                              {fair.name}
                            </h2>
                            <div className="flex items-center gap-2 text-slate-200 font-medium">
                              <MapPin className="h-4 w-4 text-orange-400" />
                              {fair.city}, {fair.region}
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-sm text-white font-semibold">
                            <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md py-2 px-3.5 rounded-xl border border-white/10">
                              <Calendar className="h-4 w-4 text-orange-400" />
                              {fair.date}
                            </div>
                            <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md py-2 px-3.5 rounded-xl border border-white/10">
                              <GraduationCap className="h-4 w-4 text-orange-400" />
                              {fair.schools_count} écoles
                            </div>
                          </div>

                          <p className="text-sm text-slate-300 leading-relaxed line-clamp-3 font-medium">
                            {fair.description}
                          </p>

                          <div className="flex flex-wrap gap-2 pt-2">
                            {fair.topics.slice(0, 3).map(topic => (
                              <span key={topic} className="px-3 py-1.5 bg-white/10 backdrop-blur-md text-white text-xs font-bold rounded-full border border-white/5 uppercase tracking-wider">
                                {topic}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* BACK FACE (IA Analysis) */}
                      <div 
                        className="absolute inset-0 w-full h-full rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] bg-slate-900 border border-slate-700 flex flex-col p-8"
                        style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                      >
                        {/* Inner Glow */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/20 blur-[60px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2" />
                        
                        <div className="flex items-center gap-3 mb-8 relative z-10">
                          <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
                            <Sparkles className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl font-black text-white">Analyse de l'IA</h3>
                            <p className="text-orange-400 text-sm font-bold">Pourquoi ce salon ?</p>
                          </div>
                        </div>

                        <div className="space-y-6 relative z-10 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm">
                            <h4 className="text-white font-bold mb-2 flex items-center gap-2">
                              <Heart className="w-4 h-4 text-pink-400" /> Ton Profil
                            </h4>
                            <p className="text-slate-300 text-sm leading-relaxed">
                              Ton Persona indique un fort intérêt pour <strong className="text-white">l'Innovation et la Logique</strong>. Ce salon propose plus de 15 conférences exclusives sur l'avenir de l'IA et de l'ingénierie, en plein dans ta zone de génie.
                            </p>
                          </div>

                          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm">
                            <h4 className="text-white font-bold mb-2 flex items-center gap-2">
                              <GraduationCap className="w-4 h-4 text-blue-400" /> Écoles à voir absolument
                            </h4>
                            <ul className="text-slate-300 text-sm space-y-3">
                              <li className="flex items-start gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                                <span><strong className="text-white">EPITA :</strong> Parfaite pour ton côté technique et logique mathématique.</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                                <span><strong className="text-white">Rubika :</strong> Idéale si tu veux combiner tes compétences techniques avec ta créativité (Jeux Vidéo).</span>
                              </li>
                            </ul>
                          </div>
                        </div>

                        <div className="mt-auto pt-6 text-center">
                          <Button 
                            onClick={(e) => { e.stopPropagation(); setIsFlipped(false); }}
                            variant="ghost" 
                            className="text-slate-400 hover:text-white hover:bg-white/10"
                          >
                            <RefreshCcw className="w-4 h-4 mr-2" /> Retour à la carte
                          </Button>
                        </div>
                      </div>

                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {/* Floating Action Buttons */}
              {currentIndex < fairs.length && (
                <div className="absolute -bottom-8 left-0 right-0 flex justify-center gap-6 z-40">
                  <Button 
                    onClick={(e) => { e.stopPropagation(); handleSwipe('left'); }}
                    className="w-16 h-16 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-400 hover:text-red-500 shadow-xl transition-all hover:scale-110 active:scale-95 flex items-center justify-center"
                  >
                    <X className="h-8 w-8" />
                  </Button>
                  <Button 
                    onClick={(e) => { e.stopPropagation(); handleSwipe('right'); }}
                    className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700 border-none text-white shadow-xl shadow-orange-500/40 transition-all hover:scale-110 active:scale-95 flex items-center justify-center"
                  >
                    <Heart className="h-7 w-7 fill-current" />
                  </Button>
                </div>
              )}
            </div>
          )
        ) : (
          /* LIST / DASHBOARD VIEW */
          <div className="w-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Filter className="w-6 h-6 text-orange-500" /> Filtres
              </h2>
              
              {/* Filter Badges */}
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => setListFilter('all')}
                  className={cn("px-4 py-2 rounded-full text-sm font-bold transition-all border", listFilter === 'all' ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50")}
                >
                  Tous
                </button>
                <button 
                  onClick={() => setListFilter('liked')}
                  className={cn("px-4 py-2 rounded-full text-sm font-bold transition-all border flex items-center gap-1.5", listFilter === 'liked' ? "bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/20" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50")}
                >
                  <Heart className={cn("w-4 h-4", listFilter === 'liked' ? "fill-white text-white" : "text-orange-500")} /> Favoris ({likedFairs.size})
                </button>
                <button 
                  onClick={() => setListFilter('disliked')}
                  className={cn("px-4 py-2 rounded-full text-sm font-bold transition-all border flex items-center gap-1.5", listFilter === 'disliked' ? "bg-slate-200 text-slate-800 border-slate-300" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50")}
                >
                  <X className="w-4 h-4 text-slate-400" /> Ignorés ({dislikedFairs.size})
                </button>
                <button 
                  onClick={() => setListFilter('top')}
                  className={cn("px-4 py-2 rounded-full text-sm font-bold transition-all border flex items-center gap-1.5", listFilter === 'top' ? "bg-yellow-400 text-yellow-950 border-yellow-400 shadow-md shadow-yellow-400/20" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50")}
                >
                  <Sparkles className="w-4 h-4 text-yellow-600" /> Top Match
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFairs.length === 0 ? (
                <div className="col-span-full py-12 text-center bg-white rounded-3xl border border-slate-200 border-dashed">
                  <p className="text-slate-500 font-medium">Aucun salon ne correspond à ce filtre.</p>
                </div>
              ) : (
                filteredFairs.map((fair, i) => {
                  const isLiked = likedFairs.has(fair.id);
                  const isDisliked = dislikedFairs.has(fair.id);
                  const match = Math.round(fair.match_score || 0);

                  return (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      key={fair.id} 
                      className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all group"
                    >
                      <div className="relative h-40">
                        <div 
                          className="absolute inset-0 bg-cover bg-center"
                          style={{ backgroundImage: `url(${fair.image_url})` }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                        
                        {/* Status Badge */}
                        {isLiked && (
                          <div className="absolute top-4 left-4 w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center shadow-lg">
                            <Heart className="w-4 h-4 text-white fill-white" />
                          </div>
                        )}
                        {isDisliked && (
                          <div className="absolute top-4 left-4 w-8 h-8 rounded-full bg-slate-800/80 backdrop-blur-md flex items-center justify-center">
                            <X className="w-4 h-4 text-white" />
                          </div>
                        )}

                        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                          <div>
                            <div className="flex items-center gap-1.5 text-white/80 text-xs font-bold mb-1 uppercase tracking-wider">
                              <MapPin className="w-3.5 h-3.5 text-orange-400" /> {fair.city}
                            </div>
                            <h3 className="text-white font-black leading-tight line-clamp-1">{fair.name}</h3>
                          </div>
                          
                          {fair.match_score && (
                            <div className="bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/20 flex flex-col items-center shrink-0">
                              <span className={cn(
                                "text-xs font-black",
                                match > 80 ? "text-green-400" : match > 50 ? "text-yellow-400" : "text-red-400"
                              )}>{match}%</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="p-5">
                        <div className="flex items-center gap-4 text-sm font-medium text-slate-500 mb-4">
                          <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                            <Calendar className="w-4 h-4 text-slate-400" /> {fair.date}
                          </div>
                        </div>
                        <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                          {fair.description}
                        </p>
                      </div>
                    </motion.div>
                  )
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
