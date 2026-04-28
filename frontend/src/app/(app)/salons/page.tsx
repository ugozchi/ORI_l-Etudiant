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
    if (isNext) return "z-10 scale-95 opacity-80 translate-y-4";
    return "z-0 scale-90 opacity-0 translate-y-8";
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden">
      {/* Header */}
      <header className="px-6 py-6 border-b border-slate-200 bg-white/80 backdrop-blur-xl z-30 shadow-sm">
        <div className="flex items-center justify-between max-w-lg mx-auto w-full">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">ORI Matcher</h1>
            <p className="text-sm text-slate-500 font-medium mt-0.5">Découvre les salons qui te correspondent</p>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 border border-slate-200 shadow-sm transition-colors">
            <Search className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Main Swiper Area */}
      <div className="flex-1 relative flex items-center justify-center p-4">
        {loading ? (
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
            <p className="text-slate-600 font-medium animate-pulse">Recherche des meilleurs salons...</p>
          </div>
        ) : currentIndex >= fairs.length ? (
          <div className="text-center max-w-sm">
            <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
              <Check className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Tu es à jour !</h2>
            <p className="text-slate-500 leading-relaxed">Tu as vu tous les salons à venir correspondant à ton profil.</p>
            <Button className="mt-8 bg-slate-900 text-white hover:bg-slate-800 border-none w-full shadow-md rounded-xl py-6 text-lg font-semibold transition-transform active:scale-95" onClick={() => setCurrentIndex(0)}>
              Revoir depuis le début
            </Button>
          </div>
        ) : (
          <div className="relative w-full max-w-sm h-[600px] perspective-1000">
            <AnimatePresence>
              {fairs.map((fair, idx) => {
                if (idx < currentIndex || idx > currentIndex + 1) return null;
                const isCurrent = idx === currentIndex;
                
                return (
                  <motion.div
                    key={fair.id}
                    initial={isCurrent ? { scale: 0.95, opacity: 0, y: 20 } : false}
                    animate={{
                      scale: isCurrent ? 1 : 0.95,
                      opacity: isCurrent ? 1 : 0.8,
                      y: isCurrent ? 0 : 20,
                      x: isCurrent && direction === 'left' ? -300 : isCurrent && direction === 'right' ? 300 : 0,
                      rotate: isCurrent && direction === 'left' ? -15 : isCurrent && direction === 'right' ? 15 : 0,
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className={cn(
                      "absolute inset-0 w-full rounded-[2rem] overflow-hidden shadow-2xl bg-white border border-slate-200",
                      getCardStyle(idx)
                    )}
                  >
                    {/* Background Image */}
                    <div 
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url(${fair.image_url})` }}
                    />
                    
                    {/* Light Glass Overlay (Gradient) - Adjusted for light theme legibility */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent opacity-90" />

                    {/* Content */}
                    <div className="absolute inset-x-0 bottom-0 p-6 flex flex-col justify-end h-full">
                      {fair.match_score && (
                        <div className="absolute top-6 left-6 px-4 py-1.5 bg-white/90 backdrop-blur-md rounded-full shadow-md flex items-center gap-2">
                          <div className={cn(
                            "w-2.5 h-2.5 rounded-full",
                            fair.match_score > 80 ? "bg-green-500" : fair.match_score > 50 ? "bg-yellow-500" : "bg-red-500",
                          )} />
                          <span className="text-slate-900 font-bold text-sm tracking-tight">{Math.round(fair.match_score)}% Match</span>
                        </div>
                      )}

                      <div className="space-y-4 relative z-10">
                        <div>
                          <h2 className="text-3xl font-extrabold text-white leading-tight mb-2 drop-shadow-md">
                            {fair.name}
                          </h2>
                          <div className="flex items-center gap-2 text-slate-200 font-medium">
                            <MapPin className="h-4 w-4 text-orange-400" />
                            {fair.city}, {fair.region}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 text-sm text-slate-200 font-medium">
                          <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-md py-1.5 px-3 rounded-xl">
                            <Calendar className="h-4 w-4 text-orange-300" />
                            {fair.date}
                          </div>
                          <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-md py-1.5 px-3 rounded-xl">
                            <GraduationCap className="h-4 w-4 text-orange-300" />
                            {fair.schools_count} écoles
                          </div>
                        </div>

                        <p className="text-sm text-slate-300 leading-relaxed line-clamp-3 font-medium">
                          {fair.description}
                        </p>

                        <div className="flex flex-wrap gap-2 pt-2">
                          {fair.topics.slice(0, 3).map(topic => (
                            <span key={topic} className="px-3 py-1.5 bg-white/20 backdrop-blur-md text-white text-xs font-bold rounded-full">
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

            {/* Action Buttons */}
            <div className="absolute -bottom-24 left-0 right-0 flex justify-center gap-6">
              <Button 
                onClick={() => handleSwipe('left')}
                className="w-16 h-16 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-400 hover:text-red-500 shadow-lg transition-all hover:scale-110 active:scale-95"
              >
                <X className="h-8 w-8" />
              </Button>
              <Button 
                onClick={() => handleSwipe('right')}
                className="w-16 h-16 rounded-full bg-orange-500 hover:bg-orange-600 border-none text-white shadow-lg shadow-orange-500/30 transition-all hover:scale-110 active:scale-95"
              >
                <Heart className="h-7 w-7 fill-current" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
