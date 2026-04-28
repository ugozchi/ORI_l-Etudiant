'use client';

import { useState, useEffect, useRef } from 'react';
import { User, MapPin, GraduationCap, Sparkles, UploadCloud, ChevronRight, Loader2, FileText, CheckCircle2, Target, BrainCircuit, Rocket, Activity, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/utils/supabase/client';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const INTERESTS_LIST = [
  "Informatique", "Sciences", "Art", "Santé", 
  "Droit", "Commerce", "Ingénierie", "Lettres", "Jeux Vidéo"
];

const LEVELS = ["Seconde", "Première", "Terminale", "Bac+1", "Bac+2", "Bac+3"];

export default function ProfilePage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [level, setLevel] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [strengths, setStrengths] = useState([{ name: 'Rigueur', val: 70 }, { name: 'Créativité', val: 50 }, { name: 'Logique', val: 80 }]);
  
  // Chat state
  const [chatMessages, setChatMessages] = useState<{role: 'ori'|'user', content: string}[]>([
    { role: 'ori', content: "Salut ! J'ai bien analysé ton document. Pour affiner ton profil, quel est ton métier ou domaine de rêve ?" }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [questionIndex, setQuestionIndex] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

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
            if (p.name) {
              setName(p.name);
              setCity(p.city);
              setLevel(p.level);
              setInterests(p.interests || []);
              setStep(4); // Go to Persona Dashboard directly if profile exists
            }
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

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const toggleInterest = (interest: string) => {
    if (interests.includes(interest)) setInterests(prev => prev.filter(i => i !== interest));
    else setInterests(prev => [...prev, interest]);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setAnalyzing(true);
      
      // Simulate AI extraction delay
      setTimeout(() => {
        setAnalyzing(false);
        // Mock extracted data
        setName('Alex');
        setCity('Paris');
        setLevel('Terminale');
        setInterests(['Informatique', 'Sciences', 'Jeux Vidéo']);
        setStrengths([
          { name: 'Logique Mathématique', val: 85 },
          { name: 'Créativité', val: 65 },
          { name: 'Rigueur', val: 90 },
          { name: 'Travail en équipe', val: 75 }
        ]);
        setStep(2); // Go to Chat step
      }, 3500);
    }
  };

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    // Add user message
    setChatMessages(prev => [...prev, { role: 'user', content: chatInput }]);
    setChatInput('');

    if (questionIndex === 0) {
      setQuestionIndex(1);
      // Simulate ORI thinking
      setTimeout(() => {
        setChatMessages(prev => [...prev, { role: 'ori', content: "Super intéressant ! Et y a-t-il une matière ou une tâche que tu détestes faire ?" }]);
      }, 1000);
    } else if (questionIndex === 1) {
      setQuestionIndex(2);
      // Simulate ORI finishing up
      setTimeout(() => {
        setChatMessages(prev => [...prev, { role: 'ori', content: "C'est noté. Je génère ton Persona..." }]);
        setTimeout(() => {
          setStep(3); // Go to Verification
        }, 1500);
      }, 1000);
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
        strengths: strengths.map(s => s.name),
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
    <div className="min-h-full bg-slate-50 p-6 lg:p-12 overflow-y-auto relative">
      {/* Background Glows */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-orange-400/5 blur-[120px] rounded-full pointer-events-none -translate-y-1/3 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 blur-[100px] rounded-full pointer-events-none translate-y-1/3 -translate-x-1/3" />

      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        
        {step < 4 && (
          <header className="mb-10 text-center">
            <div className="inline-flex h-14 w-14 rounded-2xl bg-gradient-to-br from-orange-100 to-orange-50 items-center justify-center mb-6 shadow-sm border border-orange-200">
              <Sparkles className="h-7 w-7 text-orange-600" />
            </div>
            <h1 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">Générateur de Persona</h1>
            <p className="text-lg text-slate-500 font-medium">Laisse ORI analyser tes bulletins pour créer ton profil sur-mesure.</p>
          </header>
        )}

        {/* Stepper Indicator */}
        {step < 4 && (
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((num) => (
                <div key={num} className="flex items-center">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all",
                    step === num ? "bg-orange-500 text-white shadow-md shadow-orange-500/30" : 
                    step > num ? "bg-orange-100 text-orange-500" : "bg-white text-slate-400 border border-slate-200"
                  )}>
                    {step > num ? <CheckCircle2 className="w-4 h-4" /> : num}
                  </div>
                  {num < 3 && <div className={cn("w-10 h-1 rounded-full mx-2", step > num ? "bg-orange-200" : "bg-slate-200")} />}
                </div>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          
          {/* STEP 1: UPLOAD */}
          {step === 1 && (
            <motion.div 
              key="step1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="max-w-xl mx-auto"
            >
              {!analyzing ? (
                <div className="space-y-6">
                  {/* Dropzone */}
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="relative group cursor-pointer bg-white border-2 border-dashed border-slate-300 hover:border-orange-500 rounded-3xl p-12 text-center transition-all hover:bg-orange-50/50 shadow-sm hover:shadow-xl"
                  >
                    <div className="absolute inset-0 bg-gradient-to-b from-orange-500/0 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
                    <div className="w-20 h-20 bg-slate-50 group-hover:bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6 transition-colors shadow-inner">
                      <UploadCloud className="w-10 h-10 text-slate-400 group-hover:text-orange-500 transition-colors" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Dépose ton bulletin ou CV</h3>
                    <p className="text-slate-500 text-sm font-medium mb-6">Format PDF ou Image (Max 5MB)</p>
                    <Button className="bg-slate-900 text-white hover:bg-slate-800 rounded-xl font-bold shadow-md">
                      Parcourir mes fichiers
                    </Button>
                    <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileUpload} accept=".pdf,image/*" />
                  </div>

                  <div className="relative flex items-center py-4">
                    <div className="flex-grow border-t border-slate-200"></div>
                    <span className="flex-shrink-0 mx-4 text-slate-400 text-sm font-bold uppercase tracking-wider">OU</span>
                    <div className="flex-grow border-t border-slate-200"></div>
                  </div>

                  <Button variant="outline" onClick={() => setStep(3)} className="w-full h-14 rounded-2xl border-slate-200 text-slate-600 font-bold hover:bg-white hover:border-slate-300 shadow-sm">
                    Remplir manuellement
                  </Button>
                </div>
              ) : (
                /* Loading AI Scan */
                <div className="bg-white rounded-3xl p-16 text-center shadow-2xl border border-slate-100 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-slate-100">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-orange-400 to-orange-600"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 3.5, ease: "easeInOut" }}
                    />
                  </div>
                  
                  <div className="relative w-32 h-32 mx-auto mb-8">
                    <motion.div 
                      animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 rounded-full border-[3px] border-dashed border-orange-200"
                    />
                    <motion.div 
                      animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-2 bg-gradient-to-tr from-orange-100 to-white rounded-full shadow-inner flex items-center justify-center"
                    >
                      <BrainCircuit className="w-12 h-12 text-orange-500" />
                    </motion.div>
                  </div>
                  
                  <h3 className="text-2xl font-black text-slate-900 mb-3">Analyse IA en cours...</h3>
                  <p className="text-slate-500 font-medium animate-pulse">Extraction de tes compétences et points forts depuis le document.</p>
                </div>
              )}
            </motion.div>
          )}

          {/* STEP 2: MINI-CHAT ORI */}
          {step === 2 && (
            <motion.div 
              key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="max-w-2xl mx-auto bg-white rounded-[2rem] shadow-xl border border-slate-200 overflow-hidden flex flex-col h-[500px]"
            >
              <div className="bg-slate-900 p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center shadow-inner">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Assistant ORI</h3>
                  <p className="text-slate-400 text-xs font-medium">Analyse en cours...</p>
                </div>
              </div>

              <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50">
                {chatMessages.map((msg, i) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    key={i} 
                    className={cn(
                      "max-w-[80%] rounded-2xl p-4 shadow-sm",
                      msg.role === 'ori' 
                        ? "bg-white border border-slate-200 text-slate-800 rounded-tl-sm self-start" 
                        : "bg-orange-500 text-white rounded-tr-sm self-end ml-auto"
                    )}
                  >
                    <p className="text-sm font-medium leading-relaxed">{msg.content}</p>
                  </motion.div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleChatSubmit} className="p-4 bg-white border-t border-slate-100 flex gap-2">
                <Input 
                  value={chatInput} 
                  onChange={e => setChatInput(e.target.value)}
                  placeholder="Écris ta réponse ici..." 
                  className="flex-1 bg-slate-50 border-slate-200 h-12 rounded-xl focus-visible:ring-orange-500"
                  disabled={questionIndex > 1}
                />
                <Button type="submit" disabled={!chatInput.trim() || questionIndex > 1} className="w-12 h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white p-0 flex items-center justify-center">
                  <Send className="w-5 h-5" />
                </Button>
              </form>
            </motion.div>
          )}

          {/* STEP 3: VERIFICATION & MANUAL ENTRY */}
          {step === 3 && (
            <motion.div 
              key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="bg-white border border-slate-200 rounded-[2rem] p-8 md:p-12 shadow-xl"
            >
              <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-100">
                <div className="bg-green-100 p-2.5 rounded-full">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Vérifie tes informations</h2>
                  <p className="text-slate-500 text-sm font-medium">L'IA a pré-rempli ton profil. Modifie ce qui te semble incorrect.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Column 1: Basics */}
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <User className="w-5 h-5 text-orange-500" /> Identité
                  </h3>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Prénom</label>
                    <Input value={name} onChange={e => setName(e.target.value)} placeholder="Ton prénom" className="bg-slate-50 border-slate-200 h-12 font-medium focus-visible:ring-orange-500" />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ville</label>
                    <Input value={city} onChange={e => setCity(e.target.value)} placeholder="Ta ville" className="bg-slate-50 border-slate-200 h-12 font-medium focus-visible:ring-orange-500" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Niveau d'études</label>
                    <div className="flex flex-wrap gap-2">
                      {LEVELS.map(l => (
                        <button 
                          key={l} onClick={() => setLevel(l)}
                          className={cn("px-3 py-2 rounded-xl text-sm border transition-all font-bold", level === l ? "bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-500/20" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50")}
                        >{l}</button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Column 2: Interests */}
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Target className="w-5 h-5 text-orange-500" /> Centres d'intérêt
                  </h3>
                  
                  <div className="flex flex-wrap gap-2">
                    {INTERESTS_LIST.map(interest => (
                      <button
                        key={interest}
                        onClick={() => toggleInterest(interest)}
                        className={cn(
                          "px-4 py-2 rounded-xl text-sm font-bold border transition-all",
                          interests.includes(interest) 
                            ? "bg-slate-900 border-slate-900 text-white shadow-md" 
                            : "bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50"
                        )}
                      >
                        {interest}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-10 flex gap-4 pt-6 border-t border-slate-100">
                <Button variant="outline" onClick={() => setStep(1)} className="h-14 px-8 rounded-xl border-slate-200 text-slate-600 font-bold hover:bg-slate-50">Retour</Button>
                <Button onClick={saveProfile} disabled={saving || !name || !city || !level} className="flex-1 h-14 bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 rounded-xl shadow-[0_0_20px_rgba(249,115,22,0.3)] font-black text-lg transition-transform active:scale-[0.98]">
                  {saving ? <Loader2 className="w-6 h-6 animate-spin" /> : "Créer mon Persona"}
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: PERSONA DASHBOARD */}
          {step === 4 && (
            <motion.div 
              key="step4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="space-y-8"
            >
              {/* Dashboard Header */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/20">
                    <Rocket className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Ton Persona est Actif</h2>
                    <p className="text-slate-500 font-medium">L'IA personnalise désormais ton expérience.</p>
                  </div>
                </div>
                <Button onClick={() => setStep(1)} variant="outline" className="rounded-xl font-bold text-slate-600 border-slate-200 hover:bg-slate-50">
                  Mettre à jour
                </Button>
              </div>

              {/* Persona Cards Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* ID Card (Avatar) */}
                <div className="lg:col-span-1 bg-gradient-to-b from-slate-900 to-[#0F172A] rounded-[2.5rem] p-8 text-center relative overflow-hidden shadow-2xl shadow-slate-900/20 border border-slate-800 flex flex-col items-center">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/20 blur-[80px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2" />
                  
                  {/* 3D Floating Avatar */}
                  <motion.div 
                    animate={{ y: [-10, 10, -10] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="relative w-48 h-48 mb-6 z-10"
                  >
                    <div className="absolute inset-0 bg-orange-500/20 blur-2xl rounded-full" />
                    {/* Using a high quality 3D student icon placeholder */}
                    <img 
                      src="https://static.vecteezy.com/system/resources/previews/011/153/360/original/3d-web-developer-working-on-project-illustration-png.png" 
                      alt="3D Avatar" 
                      className="w-full h-full object-contain drop-shadow-2xl"
                    />
                  </motion.div>

                  <h3 className="text-3xl font-black text-white tracking-tight mb-2 z-10">{name}</h3>
                  <div className="flex items-center gap-2 text-slate-300 font-medium mb-8 z-10">
                    <MapPin className="w-4 h-4 text-orange-400" /> {city}
                    <span className="text-slate-600">•</span>
                    <GraduationCap className="w-4 h-4 text-orange-400" /> {level}
                  </div>

                  {/* Interests Badges */}
                  <div className="flex flex-wrap justify-center gap-2 z-10 mt-auto">
                    {interests.map(i => (
                      <span key={i} className="px-3 py-1.5 bg-white/10 backdrop-blur-md border border-white/10 rounded-lg text-xs font-bold text-white uppercase tracking-wider shadow-inner">
                        {i}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Skills & AI Analysis */}
                <div className="lg:col-span-2 space-y-8">
                  {/* Skills Graph */}
                  <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="p-3 bg-orange-100 rounded-xl">
                        <Activity className="w-6 h-6 text-orange-600" />
                      </div>
                      <h3 className="text-2xl font-black text-slate-900">Profil de Compétences</h3>
                    </div>

                    <div className="space-y-6">
                      {strengths.map((skill, idx) => (
                        <div key={idx} className="space-y-2">
                          <div className="flex justify-between items-end">
                            <span className="font-bold text-slate-700">{skill.name}</span>
                            <span className="text-xs font-black text-slate-400">{skill.val}%</span>
                          </div>
                          <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${skill.val}%` }}
                              transition={{ duration: 1.5, delay: idx * 0.2, ease: "easeOut" }}
                              className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
                    <h3 className="text-xl font-black text-slate-900 mb-4">Ce que dit ORI sur toi</h3>
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 relative">
                      <Sparkles className="absolute top-4 right-4 w-5 h-5 text-orange-400" />
                      <p className="text-slate-600 leading-relaxed font-medium">
                        D'après l'analyse de tes résultats et de tes intérêts, tu as un profil très équilibré. Ta rigueur combinée à un fort intérêt pour l'innovation te destine naturellement vers des filières hybrides (Ingénierie, Tech & Management). ORI te recommandera en priorité des salons technologiques et des écoles d'ingénieurs.
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
