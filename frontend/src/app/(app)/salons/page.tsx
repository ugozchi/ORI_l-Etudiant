'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Users, Heart, X, Check, Search, Calendar, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { createClient } from '@/utils/supabase/client';

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
  
  const supabase = createClient();

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
    setDirection(dir);
    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
      setDirection(null);
    }, 300);
  };

  const getCardStyle = (index: number) => {
    const isCurrent = index === currentIndex;
    const isNext = index === currentIndex + 1;
    
    if (isCurrent) return "z-20 scale-100 opacity-100";
    if (isNext) return "z-10 scale-[0.92] opacity-70 translate-y-6";
    return "z-0 scale-90 opacity-0 translate-y-12";
  };

  return (
    <div className="flex flex-col h-full overflow-hidden relative">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-400/5 blur-[100px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-slate-900/5 blur-[100px] rounded-full pointer-events-none translate-y-1/3 -translate-x-1/3" />

      {/* Header */}
      <header className="px-6 py-6 border-b border-white/40 bg-white/60 backdrop-blur-xl z-30 shadow-[0_4px_30px_rgba(0,0,0,0.03)]">
        <div className="flex items-center justify-between max-w-lg mx-auto w-full">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">ORI Matcher</h1>
            <p className="text-sm text-slate-500 font-medium mt-1">Découvre les salons qui te correspondent</p>
          </div>
          <Button variant="ghost" size="icon" className="rounded-2xl bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-900 shadow-sm border border-slate-100 transition-colors w-12 h-12">
            <Search className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Main Swiper Area */}
      <div className="flex-1 relative flex items-center justify-center p-4">
        {loading ? (
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin" />
            <p className="text-slate-500 font-bold tracking-wide uppercase text-sm animate-pulse">Recherche des salons...</p>
          </div>
        ) : currentIndex >= fairs.length ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-sm bg-white p-10 rounded-3xl shadow-xl border border-slate-100 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-400 to-orange-600" />
            <div className="w-20 h-20 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-orange-100">
              <Check className="h-10 w-10 text-orange-500" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Tu es à jour !</h2>
            <p className="text-slate-500 leading-relaxed font-medium">Tu as vu tous les salons à venir correspondant à ton profil.</p>
            <Button className="mt-8 bg-slate-900 text-white hover:bg-slate-800 border-none w-full shadow-lg shadow-slate-900/20 rounded-2xl py-7 text-base font-bold transition-transform active:scale-95" onClick={() => setCurrentIndex(0)}>
              Revoir depuis le début
            </Button>
          </motion.div>
        ) : (
          <div className="relative w-full max-w-[380px] h-[620px] perspective-1000">
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
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    className={cn(
                      "absolute inset-0 w-full rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] bg-white border border-white/50",
                      getCardStyle(idx)
                    )}
                  >
                    {/* Background Image */}
                    <div 
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105"
                      style={{ backgroundImage: `url(${fair.image_url})` }}
                    />
                    
                    {/* Rich Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/70 to-transparent opacity-95" />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent h-1/3" />

                    {/* Content */}
                    <div className="absolute inset-x-0 bottom-0 p-8 flex flex-col justify-end h-full pb-28">
                      {fair.match_score && (
                        <div className="absolute top-6 left-6 px-4 py-1.5 bg-white/20 backdrop-blur-xl rounded-full border border-white/30 shadow-lg flex items-center gap-2">
                          <div className={cn(
                            "w-2.5 h-2.5 rounded-full shadow-[0_0_10px_currentColor]",
                            fair.match_score > 80 ? "bg-green-400 text-green-400" : fair.match_score > 50 ? "bg-yellow-400 text-yellow-400" : "bg-red-400 text-red-400",
                          )} />
                          <span className="text-white font-bold text-sm tracking-wide">{Math.round(fair.match_score)}% Match</span>
                        </div>
                      )}

                      <div className="space-y-4 relative z-10">
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
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Floating Action Buttons */}
            {currentIndex < fairs.length && (
              <div className="absolute -bottom-8 left-0 right-0 flex justify-center gap-6 z-40">
                <Button 
                  onClick={() => handleSwipe('left')}
                  className="w-16 h-16 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-400 hover:text-red-500 shadow-xl transition-all hover:scale-110 active:scale-95 flex items-center justify-center"
                >
                  <X className="h-8 w-8" />
                </Button>
                <Button 
                  onClick={() => handleSwipe('right')}
                  className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700 border-none text-white shadow-xl shadow-orange-500/40 transition-all hover:scale-110 active:scale-95 flex items-center justify-center"
                >
                  <Heart className="h-7 w-7 fill-current" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
