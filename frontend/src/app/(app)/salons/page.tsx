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
    <div className="flex flex-col h-full bg-[#0A0A0A] overflow-hidden">
      {/* Header */}
      <header className="px-6 py-6 border-b border-[#222222] bg-[#0A0A0A]/50 backdrop-blur-xl z-30">
        <div className="flex items-center justify-between max-w-lg mx-auto w-full">
          <div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">ORI Matcher</h1>
            <p className="text-sm text-zinc-400">Découvre les salons qui te correspondent</p>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full bg-[#1A1A1A] text-zinc-400 hover:text-white border border-[#2C2C2C]">
            <Search className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Main Swiper Area */}
      <div className="flex-1 relative flex items-center justify-center p-4">
        {loading ? (
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
            <p className="text-zinc-400 font-medium animate-pulse">Recherche des meilleurs salons...</p>
          </div>
        ) : currentIndex >= fairs.length ? (
          <div className="text-center max-w-sm">
            <div className="w-20 h-20 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(99,102,241,0.4)]">
              <Check className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Tu es à jour !</h2>
            <p className="text-zinc-400">Tu as vu tous les salons à venir correspondant à ton profil.</p>
            <Button className="mt-8 bg-[#1A1A1A] text-white hover:bg-[#222222] border border-[#2C2C2C] w-full" onClick={() => setCurrentIndex(0)}>
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
                      "absolute inset-0 w-full rounded-3xl overflow-hidden shadow-2xl bg-[#121212] border border-[#2C2C2C]",
                      getCardStyle(idx)
                    )}
                  >
                    {/* Background Image */}
                    <div 
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url(${fair.image_url})` }}
                    />
                    
                    {/* Glass Overlay (Gradient) */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/80 to-transparent" />

                    {/* Content */}
                    <div className="absolute inset-x-0 bottom-0 p-6 flex flex-col justify-end h-full">
                      {fair.match_score && (
                        <div className="absolute top-6 left-6 px-3 py-1 bg-black/40 backdrop-blur-md rounded-full border border-white/10 flex items-center gap-2">
                          <div className={cn(
                            "w-2 h-2 rounded-full",
                            fair.match_score > 80 ? "bg-green-400" : fair.match_score > 50 ? "bg-yellow-400" : "bg-red-400",
                            "shadow-[0_0_10px_currentColor]"
                          )} />
                          <span className="text-white font-bold text-sm">{Math.round(fair.match_score)}% Match</span>
                        </div>
                      )}

                      <div className="space-y-4 relative z-10">
                        <div>
                          <h2 className="text-3xl font-extrabold text-white leading-tight mb-2 drop-shadow-lg">
                            {fair.name}
                          </h2>
                          <div className="flex items-center gap-2 text-zinc-300 font-medium">
                            <MapPin className="h-4 w-4 text-indigo-400" />
                            {fair.city}, {fair.region}
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-zinc-400">
                          <div className="flex items-center gap-1.5 bg-white/5 py-1.5 px-3 rounded-lg border border-white/5">
                            <Calendar className="h-4 w-4 text-purple-400" />
                            {fair.date}
                          </div>
                          <div className="flex items-center gap-1.5 bg-white/5 py-1.5 px-3 rounded-lg border border-white/5">
                            <GraduationCap className="h-4 w-4 text-pink-400" />
                            {fair.schools_count} écoles
                          </div>
                        </div>

                        <p className="text-sm text-zinc-300 leading-relaxed line-clamp-3">
                          {fair.description}
                        </p>

                        <div className="flex flex-wrap gap-2 pt-2">
                          {fair.topics.slice(0, 3).map(topic => (
                            <span key={topic} className="px-3 py-1 bg-indigo-500/20 text-indigo-300 text-xs font-semibold rounded-full border border-indigo-500/30">
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
            <div className="absolute -bottom-20 left-0 right-0 flex justify-center gap-6">
              <Button 
                onClick={() => handleSwipe('left')}
                className="w-16 h-16 rounded-full bg-[#1A1A1A] hover:bg-[#2C2C2C] border-2 border-red-500/20 text-red-500 hover:text-red-400 shadow-xl transition-all hover:scale-110 active:scale-95"
              >
                <X className="h-8 w-8" />
              </Button>
              <Button 
                onClick={() => handleSwipe('right')}
                className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 hover:opacity-90 border-none text-white shadow-[0_0_30px_rgba(99,102,241,0.3)] transition-all hover:scale-110 active:scale-95"
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
