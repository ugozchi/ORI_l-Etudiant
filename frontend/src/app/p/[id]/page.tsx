'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { motion } from 'framer-motion';
import { GraduationCap, Sparkles, MapPin, Heart, Target, Star, Brain, Lightbulb, Compass } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function PublicProfilePage() {
  const params = useParams();
  const id = params?.id;
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!id) return;
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', id)
          .single();

        if (data) {
          setProfile(data);
        }
      } catch (err) {
        console.error('Error fetching public profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin mb-4" />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Chargement du Persona...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mb-6">
          <Target className="w-10 h-10 text-slate-300" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 mb-2">Profil Introuvable</h1>
        <p className="text-slate-500 max-w-xs mx-auto">Ce QR Code ne semble pas correspondre à un utilisateur actif de l'application ORI.</p>
      </div>
    );
  }

  const strengths = profile.strengths_data || [];
  const sortedStrengths = [...strengths].sort((a: any, b: any) => b.val - a.val);

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col items-center pb-12">
      {/* Header / Brand */}
      <div className="w-full bg-slate-900 text-white pt-12 pb-24 px-6 relative overflow-hidden flex flex-col items-center text-center">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/20 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 blur-[60px] rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 flex items-center gap-2 mb-8"
        >
          <Sparkles className="w-4 h-4 text-orange-400" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Passport Étudiant ORI</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="relative"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-orange-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-orange-500/30 mb-6 border-4 border-white/10 mx-auto">
            <GraduationCap className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-black tracking-tight">{profile.first_name} {profile.last_name}</h1>
          <p className="text-orange-400 font-bold uppercase tracking-widest text-xs mt-2 flex items-center justify-center gap-2">
            <Target className="w-3 h-3" /> {profile.level}
          </p>
        </motion.div>
      </div>

      {/* Main Content (Shifted up) */}
      <div className="w-full max-w-md px-6 -mt-16 z-10 space-y-6">
        {/* Persona Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-100 p-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Star className="w-5 h-5 text-orange-500" /> Forces & Talents
            </h2>
          </div>

          <div className="space-y-4">
            {sortedStrengths.slice(0, 3).map((s: any, idx: number) => (
              <div key={s.name} className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold text-slate-700">{s.name}</span>
                  <span className="text-orange-500 font-black">{s.val}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${s.val}%` }}
                    transition={{ delay: 0.4 + (idx * 0.1), duration: 1 }}
                    className="h-full bg-gradient-to-r from-orange-400 to-orange-500"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-8 border-t border-slate-100">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Centres d'intérêt</h3>
            <div className="flex flex-wrap gap-2">
              {(profile.interests || []).map((interest: string) => (
                <span key={interest} className="px-4 py-2 bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-100 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                  {interest}
                </span>
              ))}
              {(!profile.interests || profile.interests.length === 0) && (
                <span className="text-slate-400 text-xs italic">Non renseigné</span>
              )}
            </div>
          </div>

          {profile.scores?.education && profile.scores.education.length > 0 && (
            <div className="mt-8 pt-8 border-t border-slate-100">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Parcours Académique</h3>
              <div className="space-y-4">
                {profile.scores.education.map((edu: any, idx: number) => (
                  <div key={idx} className="flex gap-4 items-start">
                    <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-xs shrink-0 border border-orange-100">{edu.year.split('-')[0]}</div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{edu.school}</h4>
                      <p className="text-xs text-slate-500 font-medium">{edu.diploma}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* AI Insight Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 blur-[40px] rounded-full" />
          
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <h2 className="font-black">Analyse Personae IA</h2>
          </div>
          
          <p className="text-slate-300 text-sm leading-relaxed">
            "{profile.persona_summary || "Étudiant dynamique avec une forte prédisposition pour les domaines créatifs et analytiques. Profil idéal pour des cursus alliant innovation et méthodologie."}"
          </p>
        </motion.div>

        {/* Action Button for Recruiter */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="pt-4"
        >
          <a 
            href={`mailto:contact@ori-app.fr?subject=Contact%20depuis%20le%20salon%20-%20${profile.first_name}%20${profile.last_name}`}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-5 rounded-[2rem] flex items-center justify-center gap-2 shadow-xl shadow-orange-500/20 transition-all active:scale-95"
          >
            Contacter cet étudiant
          </a>
        </motion.div>
      </div>

      <footer className="mt-12 text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em] flex items-center gap-2">
        <span>Powered by ORI</span>
        <div className="w-1 h-1 rounded-full bg-slate-300" />
        <span>L'Étudiant</span>
      </footer>
    </div>
  );
}
