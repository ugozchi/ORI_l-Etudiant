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
            setStep(4);
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
      setStep(4);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex h-full items-center justify-center bg-slate-50">
      <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
    </div>
  );

  return (
    <div className="min-h-full bg-slate-50 p-6 lg:p-12 overflow-y-auto">
      <div className="max-w-2xl mx-auto space-y-8">
        
        <header className="mb-10 text-center">
          <div className="inline-flex h-12 w-12 rounded-2xl bg-orange-100 items-center justify-center mb-4 border border-orange-200 shadow-sm">
            <User className="h-6 w-6 text-orange-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Ton Profil Étudiant</h1>
          <p className="text-slate-500">ORI s'adapte à toi. Paramètre tes infos pour une orientation sur-mesure.</p>
        </header>

        {/* Stepper */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3, 4].map(num => (
            <div key={num} className="flex items-center">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border transition-colors shadow-sm",
                step === num ? "bg-orange-500 border-orange-500 text-white" : 
                step > num ? "bg-orange-100 border-orange-200 text-orange-600" : "bg-white border-slate-200 text-slate-400"
              )}>
                {step > num ? <Check className="w-4 h-4" /> : num}
              </div>
              {num < 4 && (
                <div className={cn(
                  "w-12 h-0.5 mx-2",
                  step > num ? "bg-orange-200" : "bg-slate-200"
                )} />
              )}
            </div>
          ))}
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm relative overflow-hidden">
          <AnimatePresence mode="wait">
            {/* STEP 1 */}
            {step === 1 && (
              <motion.div 
                key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-slate-900">Les bases</h2>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm text-slate-600 font-semibold flex items-center gap-2">
                      <User className="w-4 h-4 text-slate-400" /> Ton Prénom
                    </label>
                    <Input value={name} onChange={e => setName(e.target.value)} placeholder="Alex" className="bg-slate-50 border-slate-200 text-slate-900 focus-visible:ring-orange-500" />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm text-slate-600 font-semibold flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-400" /> Ta Ville
                    </label>
                    <Input value={city} onChange={e => setCity(e.target.value)} placeholder="Paris, Lyon..." className="bg-slate-50 border-slate-200 text-slate-900 focus-visible:ring-orange-500" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-slate-600 font-semibold flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-slate-400" /> Ton Niveau Actuel
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {LEVELS.slice(0,4).map(l => (
                        <button 
                          key={l} onClick={() => setLevel(l)}
                          className={cn("py-2 rounded-lg text-sm border transition-all font-medium", level === l ? "bg-orange-500 border-orange-500 text-white shadow-sm" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50")}
                        >{l}</button>
                      ))}
                    </div>
                  </div>
                </div>

                <Button onClick={() => setStep(2)} disabled={!name || !city || !level} className="w-full bg-slate-900 text-white hover:bg-slate-800 mt-4 rounded-xl">
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
                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-orange-500" /> Tes Centres d'Intérêt
                </h2>
                <p className="text-sm text-slate-500 mb-6">Sélectionne les domaines qui t'attirent le plus.</p>
                
                <div className="flex flex-wrap gap-3">
                  {INTERESTS_LIST.map(interest => (
                    <button
                      key={interest}
                      onClick={() => toggleInterest(interest)}
                      className={cn(
                        "px-4 py-2 rounded-full text-sm font-semibold border transition-all duration-200",
                        interests.includes(interest) 
                          ? "bg-orange-50 border-orange-500 text-orange-700 scale-[1.03] shadow-sm" 
                          : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                      )}
                    >
                      {interest}
                    </button>
                  ))}
                </div>

                <div className="flex gap-4 mt-8">
                  <Button variant="outline" onClick={() => setStep(1)} className="border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl">Retour</Button>
                  <Button onClick={() => setStep(3)} disabled={interests.length === 0} className="flex-1 bg-slate-900 text-white hover:bg-slate-800 rounded-xl">
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
                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-orange-500" /> Tes Points Forts
                </h2>
                <p className="text-sm text-slate-500">Qu'est-ce qui te caractérise ? Tes qualités utiles pour l'orientation.</p>
                
                <div className="space-y-2">
                  <Input 
                    value={strengthsStr} 
                    onChange={e => setStrengthsStr(e.target.value)} 
                    placeholder="Ex: Créatif, Bon en maths, Aisance à l'oral..." 
                    className="bg-slate-50 border-slate-200 text-slate-900 focus-visible:ring-orange-500 h-12" 
                  />
                  <p className="text-xs text-slate-400">Sépare par des virgules.</p>
                </div>

                <div className="flex gap-4 mt-8">
                  <Button variant="outline" onClick={() => setStep(2)} className="border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl">Retour</Button>
                  <Button onClick={saveProfile} disabled={saving} className="flex-1 bg-orange-500 text-white hover:bg-orange-600 rounded-xl shadow-md">
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
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-200">
                  <Check className="w-10 h-10 text-green-500" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900">Profil Prêt !</h2>
                <p className="text-slate-500 max-w-md mx-auto leading-relaxed">
                  Ton contexte est maintenant actif. L'Assistant ORI connaît ton profil et l'utilisera pour adapter ses réponses, générer tes documents et filtrer tes événements.
                </p>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-left max-w-sm mx-auto mt-6 shadow-sm">
                  <ul className="space-y-3 text-sm text-slate-600">
                    <li className="flex justify-between items-center"><strong className="text-slate-900">Nom</strong> <span>{name}</span></li>
                    <li className="flex justify-between items-center"><strong className="text-slate-900">Lieu</strong> <span>{city}</span></li>
                    <li className="flex justify-between items-center"><strong className="text-slate-900">Niveau</strong> <span>{level}</span></li>
                    <li className="pt-2 border-t border-slate-200">
                      <strong className="text-slate-900 block mb-2">Intérêts</strong>
                      <div className="flex flex-wrap gap-1.5">
                        {interests.map(i => <span key={i} className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-xs font-semibold">{i}</span>)}
                      </div>
                    </li>
                  </ul>
                </div>

                <Button onClick={() => setStep(1)} variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-50 mt-6 rounded-xl font-medium">
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
