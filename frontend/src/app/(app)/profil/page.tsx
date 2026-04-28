'use client';

import { useState, useEffect } from 'react';
import { User, MapPin, GraduationCap, Sparkles, TrendingUp, ChevronRight, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/utils/supabase/client';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const INTERESTS_LIST = [
  "Informatique", "Sciences", "Art", "Santé", 
  "Droit", "Commerce", "Ingénierie", "Lettres", "Jeux Vidéo"
];

const LEVELS = ["Seconde", "Première", "Terminale", "Bac+1", "Bac+2", "Bac+3", "Bac+4", "Bac+5"];

export default function ProfilePage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [level, setLevel] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [strengthsStr, setStrengthsStr] = useState('');

  const supabase = createClient();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const uid = session?.user?.id || 'demo-user';
      setUserId(uid);

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile/${uid}`);
        if (res.ok) {
          const json = await res.json();
          if (json.status === 'success' && json.data) {
            const p = json.data;
            setName(p.name);
            setCity(p.city);
            setLevel(p.level);
            setInterests(p.interests || []);
            setStrengthsStr((p.strengths || []).join(', '));
            setStep(4); // Si profil existe, on montre le résumé
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [supabase]);

  const toggleInterest = (interest: string) => {
    if (interests.includes(interest)) {
      setInterests(prev => prev.filter(i => i !== interest));
    } else {
      setInterests(prev => [...prev, interest]);
    }
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      const payload = {
        user_id: userId,
        name,
        city,
        level,
        interests,
        strengths: strengthsStr.split(',').map(s => s.trim()).filter(Boolean),
        mobility: true
      };

      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      setStep(4); // Show success summary
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex h-full items-center justify-center bg-[#0A0A0A]">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
    </div>
  );

  return (
    <div className="min-h-full bg-[#0A0A0A] p-6 lg:p-12 overflow-y-auto">
      <div className="max-w-2xl mx-auto space-y-8">
        
        <header className="mb-10 text-center">
          <div className="inline-flex h-12 w-12 rounded-2xl bg-indigo-500/10 items-center justify-center mb-4 border border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
            <User className="h-6 w-6 text-indigo-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Ton Profil Étudiant</h1>
          <p className="text-zinc-400">ORI s'adapte à toi. Paramètre tes infos pour une orientation sur-mesure.</p>
        </header>

        {/* Stepper */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3, 4].map(num => (
            <div key={num} className="flex items-center">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border transition-colors",
                step === num ? "bg-indigo-600 border-indigo-500 text-white" : 
                step > num ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-300" : "bg-[#1A1A1A] border-[#2C2C2C] text-zinc-500"
              )}>
                {step > num ? <Check className="w-4 h-4" /> : num}
              </div>
              {num < 4 && (
                <div className={cn(
                  "w-12 h-0.5 mx-2",
                  step > num ? "bg-indigo-500/50" : "bg-[#2C2C2C]"
                )} />
              )}
            </div>
          ))}
        </div>

        <div className="bg-[#121212] border border-[#2C2C2C] rounded-3xl p-8 shadow-xl relative overflow-hidden">
          <AnimatePresence mode="wait">
            {/* STEP 1 */}
            {step === 1 && (
              <motion.div 
                key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-semibold text-white">Les bases</h2>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm text-zinc-400 font-medium flex items-center gap-2">
                      <User className="w-4 h-4" /> Ton Prénom
                    </label>
                    <Input value={name} onChange={e => setName(e.target.value)} placeholder="Alex" className="bg-[#1A1A1A] border-[#2C2C2C]" />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm text-zinc-400 font-medium flex items-center gap-2">
                      <MapPin className="w-4 h-4" /> Ta Ville
                    </label>
                    <Input value={city} onChange={e => setCity(e.target.value)} placeholder="Paris, Lyon..." className="bg-[#1A1A1A] border-[#2C2C2C]" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-zinc-400 font-medium flex items-center gap-2">
                      <GraduationCap className="w-4 h-4" /> Ton Niveau Actuel
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {LEVELS.slice(0,4).map(l => (
                        <button 
                          key={l} onClick={() => setLevel(l)}
                          className={cn("py-2 rounded-lg text-sm border transition-all", level === l ? "bg-indigo-600 border-indigo-500 text-white" : "bg-[#1A1A1A] border-[#2C2C2C] text-zinc-400 hover:bg-[#222222]")}
                        >{l}</button>
                      ))}
                    </div>
                  </div>
                </div>

                <Button onClick={() => setStep(2)} disabled={!name || !city || !level} className="w-full bg-white text-black hover:bg-zinc-200 mt-4">
                  Suivant <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </motion.div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <motion.div 
                key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-indigo-400" /> Tes Centres d'Intérêt
                </h2>
                <p className="text-sm text-zinc-400 mb-6">Sélectionne les domaines qui t'attirent le plus.</p>
                
                <div className="flex flex-wrap gap-3">
                  {INTERESTS_LIST.map(interest => (
                    <button
                      key={interest}
                      onClick={() => toggleInterest(interest)}
                      className={cn(
                        "px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200",
                        interests.includes(interest) 
                          ? "bg-indigo-500/20 border-indigo-500 text-indigo-300 scale-105 shadow-[0_0_15px_rgba(99,102,241,0.2)]" 
                          : "bg-[#1A1A1A] border-[#2C2C2C] text-zinc-400 hover:border-zinc-500"
                      )}
                    >
                      {interest}
                    </button>
                  ))}
                </div>

                <div className="flex gap-4 mt-8">
                  <Button variant="outline" onClick={() => setStep(1)} className="border-[#2C2C2C] text-white hover:bg-[#2C2C2C]">Retour</Button>
                  <Button onClick={() => setStep(3)} disabled={interests.length === 0} className="flex-1 bg-white text-black hover:bg-zinc-200">
                    Suivant <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <motion.div 
                key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-indigo-400" /> Tes Points Forts
                </h2>
                <p className="text-sm text-zinc-400">Qu'est-ce qui te caractérise ? Tes qualités utiles pour l'orientation.</p>
                
                <div className="space-y-2">
                  <Input 
                    value={strengthsStr} 
                    onChange={e => setStrengthsStr(e.target.value)} 
                    placeholder="Ex: Créatif, Bon en maths, Aisance à l'oral..." 
                    className="bg-[#1A1A1A] border-[#2C2C2C] h-12" 
                  />
                  <p className="text-xs text-zinc-500">Sépare par des virgules.</p>
                </div>

                <div className="flex gap-4 mt-8">
                  <Button variant="outline" onClick={() => setStep(2)} className="border-[#2C2C2C] text-white hover:bg-[#2C2C2C]">Retour</Button>
                  <Button onClick={saveProfile} disabled={saving} className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-90">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Terminer et Sauvegarder"}
                  </Button>
                </div>
              </motion.div>
            )}

            {/* STEP 4: SUMMARY */}
            {step === 4 && (
              <motion.div 
                key="step4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-6 py-4"
              >
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/30">
                  <Check className="w-10 h-10 text-green-400" />
                </div>
                <h2 className="text-3xl font-bold text-white">Profil Prêt !</h2>
                <p className="text-zinc-400 max-w-md mx-auto">
                  Ton contexte est maintenant actif. ORI connaît ton profil et l'utilisera pour adapter ses discussions, te générer des documents et te trouver les meilleurs salons.
                </p>

                <div className="bg-[#1A1A1A] border border-[#2C2C2C] rounded-xl p-4 text-left max-w-sm mx-auto mt-6">
                  <ul className="space-y-2 text-sm text-zinc-300">
                    <li><strong className="text-white">Nom:</strong> {name}</li>
                    <li><strong className="text-white">Lieu:</strong> {city}</li>
                    <li><strong className="text-white">Niveau:</strong> {level}</li>
                    <li className="flex flex-wrap gap-1 mt-2">
                      {interests.map(i => <span key={i} className="bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded text-xs">{i}</span>)}
                    </li>
                  </ul>
                </div>

                <Button onClick={() => setStep(1)} variant="outline" className="border-[#2C2C2C] text-white hover:bg-[#2C2C2C] mt-6">
                  Modifier mon profil
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
