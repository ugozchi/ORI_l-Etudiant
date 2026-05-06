'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  User, MapPin, GraduationCap, Sparkles, UploadCloud, ChevronRight, Loader2, 
  FileText, CheckCircle2, Target, BrainCircuit, Rocket, Activity, Send, 
  Timer, Brain, Palette, Zap, CheckCircle, BarChart3, FastForward, Trophy, 
  RotateCcw, Sliders, ArrowRight, MessageCircle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/utils/supabase/client';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useProfile } from '@/contexts/ProfileContext';
import { apiUrl } from '@/utils/api';

const INTERESTS_LIST = [
  "Informatique", "Sciences", "Art", "Santé", 
  "Droit", "Commerce", "Ingénierie", "Lettres", "Jeux Vidéo"
];

const LEVELS = ["Seconde", "Première", "Terminale", "Bac+1", "Bac+2", "Bac+3"];

const BEHAVIOR_SITS = [
  { 
    sit: "Ton équipe est bloquée sur un bug à 2h du rendu final.", 
    opts: [
      { text: "Je tranche les décisions pour avancer coûte que coûte.", traits: { leadership: 3, pragmatism: 1 } },
      { text: "Je propose une approche créative pour contourner le bug.", traits: { creativity: 3 } },
      { text: "Je m'assure que le moral de l'équipe reste positif.", traits: { empathy: 3 } },
      { text: "Je documente la solution pour éviter que ça se reproduise.", traits: { pragmatism: 3 } }
    ] 
  },
  { 
    sit: "On te propose un projet ambitieux mais très risqué.", 
    opts: [
      { text: "J'analyse froidement les risques et les bénéfices.", traits: { pragmatism: 3 } },
      { text: "Je fonce, c'est l'occasion d'innover radicalement !", traits: { creativity: 3, leadership: 1 } },
      { text: "Je demande l'avis de tous avant de me décider.", traits: { empathy: 3 } },
      { text: "Je prends la responsabilité de mener l'équipe au succès.", traits: { leadership: 3 } }
    ] 
  },
  { 
    sit: "Un collègue est en retard et ralentit tout le groupe.", 
    opts: [
      { text: "Je lui propose mon aide pour qu'il rattrape son retard.", traits: { empathy: 3 } },
      { text: "Je réorganise le planning pour compenser son absence.", traits: { leadership: 3, pragmatism: 1 } },
      { text: "Je cherche une méthode plus simple pour finir sa partie.", traits: { creativity: 3, pragmatism: 1 } },
      { text: "Je lui rappelle fermement les objectifs et les délais.", traits: { pragmatism: 3, leadership: 1 } }
    ] 
  }
];

export default function ProfilePage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const { profileData, updateProfileLocally } = useProfile();
  const supabase = createClient();

  // Form state
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [level, setLevel] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [strengths, setStrengths] = useState([
    { name: 'Pragmatisme', val: 0 }, 
    { name: 'Créativité', val: 0 }, 
    { name: 'Leadership', val: 0 },
    { name: 'Empathie', val: 0 }
  ]);
  
  // Games Arcade state
  const [gameIndex, setGameIndex] = useState(0); // 0: Logic/Mem, 1: Math/Res, 2: Soft Skills, 3: Results
  const [subGame, setSubGame] = useState<'A' | 'B'>('A');
  const [gameTimer, setGameTimer] = useState(120);
  const [scores, setScores] = useState({ 
    logic: 0, 
    math: 0, 
    softSkills: { pragmatism: 0, creativity: 0, leadership: 0, empathy: 0 } 
  });

  // Game States
  const [memoryGrid, setMemoryGrid] = useState<{ size: number, pattern: number[], selected: number[], phase: 'show' | 'input' }>({
    size: 3, pattern: [], selected: [], phase: 'show'
  });
  const [sequenceGame, setSequenceGame] = useState<{ seq: string, ans: number[], correct: number }>({
    seq: '', ans: [], correct: 0
  });
  const [operatorGame, setOperatorGame] = useState<{ eq: string, correct: string }>({
    eq: '', correct: ''
  });
  const [mathGame, setMathGame] = useState({ eq: '', ans: [0,0,0,0], correct: 0 });
  const [behIdx, setBehIdx] = useState(0);

  // Chat state
  const [chatMessages, setChatMessages] = useState<{role: 'ori'|'user', content: string}[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [questionIndex, setQuestionIndex] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [retakeCount, setRetakeCount] = useState(0);
  const MAX_RETAKES = 5;
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [bulletinAnalyzing, setBulletinAnalyzing] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isRetaking, setIsRetaking] = useState(false);

  const ORI_FOLLOWUP_MESSAGES = [
    "Top. Et côté façon de travailler, tu préfères les projets en équipe ou avancer seul sur des sujets techniques ?",
    "J'adore. Dernière question: tu te projettes plutôt vers des études longues, de l'alternance, ou un mix des deux ?",
    "Parfait. Avec ce que tu m'as dit + tes tests, je peux affiner ton Persona avec une recommandation beaucoup plus fiable.",
  ];

  // Timer effect
  useEffect(() => {
    let interval: any;
    if (step === 2 && gameIndex < 3 && gameTimer > 0) {
      interval = setInterval(() => {
        setGameTimer(prev => prev - 1);
      }, 1000);
    }
    if (gameTimer === 0 && step === 2) {
      if (gameIndex < 2) {
        advanceBlock(gameIndex + 1); // Go to next block when time runs out
      } else {
        advanceBlock(3); // Time's up on last block -> results
      }
    }
    return () => clearInterval(interval);
  }, [step, gameIndex, gameTimer]);

  // Load Profile
  useEffect(() => {
    if (profileData) {
      setName(profileData.name || '');
      setCity(profileData.city || '');
      setLevel(profileData.level || '');
      setInterests(profileData.interests || []);
      
      if (!isRetaking && (profileData.is_complete || (profileData.strengths && profileData.strengths.length > 0))) {
        setRetakeCount(Number(profileData.tests_retake_count) || 0);
        if (profileData.scores) setScores(profileData.scores);
        if (profileData.strengths_data) {
          setStrengths(profileData.strengths_data);
        } else if (profileData.strengths) {
          // Fallback if only names are stored
          const fallback = profileData.strengths.map((s: string) => ({ name: s, val: 80 }));
          setStrengths(fallback);
        }
        setStep(5);
      }
    }
  }, [profileData, isRetaking]);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUserId(session?.user?.id ?? null);
      setLoading(false);
      generateMemoryGame(3);
      generateMathGame(0);
    };
    init();
  }, []);

  // GAME LOGIC GENERATORS =================================

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const generateMemoryGame = (size: number) => {
    const currentSize = scores.logic < 4 ? 3 : scores.logic < 10 ? 4 : 5;
    const numCells = currentSize * currentSize;
    const count = Math.min(numCells - 1, (currentSize === 3 ? 3 : currentSize === 4 ? 6 : 9) + Math.floor(scores.logic / 3));
    const pattern: number[] = [];
    while (pattern.length < count) {
      const r = Math.floor(Math.random() * numCells);
      if (!pattern.includes(r)) pattern.push(r);
    }
    setMemoryGrid({ size: currentSize, pattern, selected: [], phase: 'show' });
    const displayTime = Math.max(800, 1500 - (scores.logic * 100));
    setTimeout(() => {
      setMemoryGrid(prev => ({ ...prev, phase: 'input' }));
    }, displayTime);
  };

  const generateSequenceGame = (level: number) => {
    let seq: number[] = [];
    let correct = 0;
    const type = Math.floor(Math.random() * 5);
    if (type === 0) {
      const start = Math.floor(Math.random() * 10);
      const step = Math.floor(Math.random() * 8) + 2;
      seq = [start, start + step, start + step * 2, start + step * 3];
      correct = start + step * 4;
    } else if (type === 1) {
      const start = Math.floor(Math.random() * 3) + 1;
      const factor = 2 + Math.floor(scores.logic / 10);
      seq = [start, start * factor, start * factor * factor, start * factor * factor * factor];
      correct = seq[3] * factor;
    } else if (type === 2) {
      const start = Math.floor(Math.random() * 5) + 1;
      seq = [start*start, (start+1)*(start+1), (start+2)*(start+2), (start+3)*(start+3)];
      correct = (start+4)*(start+4);
    } else if (type === 3) {
      const start = 10 + Math.floor(Math.random() * 20);
      seq = [start, start - 2, start + 1, start - 1];
      correct = start + 2;
    } else {
      const s1 = Math.floor(Math.random() * 3) + 1;
      const s2 = Math.floor(Math.random() * 3) + 1;
      seq = [s1, s2, s1+s2, s2+(s1+s2), (s1+s2)+(s2+(s1+s2))];
      correct = seq[3] + seq[4];
    }
    const ans = [correct, correct + 2, correct - 2, correct * 2].sort(() => Math.random() - 0.5);
    setSequenceGame({ seq: seq.join(', ') + ', ?', ans, correct });
  };

  const generateOperatorGame = () => {
    const ops = ['+', '-', '×', '÷'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    let a, b, res;
    const diff = 1 + Math.floor(scores.math / 5);
    if (op === '+') { a = 12 * diff; b = 8 * diff; res = a + b; }
    else if (op === '-') { a = 25 * diff; b = 7 * diff; res = a - b; }
    else if (op === '×') { a = 6 + diff; b = 7; res = a * b; }
    else { b = 8; res = 5 + diff; a = b * res; }
    setOperatorGame({ eq: `${a} [?] ${b} = ${res}`, correct: op });
  };

  const generateMathGame = (level: number) => {
    let a, b, op, correct;
    const diff = 1 + Math.floor(scores.math / 5);
    if (level < 3) { a = Math.floor(Math.random() * 12) + 2; b = Math.floor(Math.random() * 12) + 2; op = '+'; correct = a + b; }
    else if (level < 8) { a = Math.floor(Math.random() * 12) + 5; b = Math.floor(Math.random() * 9) + 2; op = '×'; correct = a * b; }
    else { a = Math.floor(Math.random() * 50) + 10; b = Math.floor(Math.random() * 30) + 10; op = '-'; correct = a - b; }
    const ansSet = new Set<number>([correct]);
    while (ansSet.size < 4) {
      const fake: number = correct + Math.floor(Math.random() * (10 * diff)) - (5 * diff);
      if (fake !== correct && fake > 0) ansSet.add(fake);
    }
    setMathGame({ eq: `${a} ${op} ${b}`, ans: Array.from(ansSet).sort(() => Math.random() - 0.5), correct });
  };

  const advanceBlock = (nextIndex: number) => {
    setGameTimer(120);
    setGameIndex(nextIndex);
    setSubGame('A');
    
    // Update real-time progress in Sidebar
    const progress = (nextIndex / 3); // 0.33, 0.66, 1.0
    updateProfileLocally({ temp_game_progress: progress });

    // Ensure generators are called for the correct index
    if (nextIndex === 0) generateMemoryGame(3);
    else if (nextIndex === 1) {
      setScores(s => ({ ...s, math: 0 })); // Reset math score for new block
      generateMathGame(0);
    }
    else if (nextIndex === 2) {
      setBehIdx(0); // Reset behavior index
    }
    if (nextIndex === 3) {
      calculateFinalStrengths();
      // Step 3 (Chat) initial message
      setChatMessages([{ role: 'ori', content: "Analyse terminée ! Tes résultats montrent un profil fascinant. Veux-tu savoir comment tes compétences cognitives influencent ton futur métier ?" }]);
      setQuestionIndex(0);
      // Lance automatiquement la fake conversation ORI après les tests
      setTimeout(() => setStep(3), 500);
    }
  };

  const calculateFinalStrengths = () => {
    // Skills are now a mix of behavior choices and game performance
    // Logic performance boosts Pragmatism and Creativity
    const logicBonus = scores.logic * 1.5;
    // Math performance boosts Pragmatism
    const mathBonus = scores.math * 1.5;

    const normalize = (val: number) => Math.min(100, Math.floor((val / 20) * 100));
    
    const p = normalize(scores.softSkills.pragmatism + mathBonus + (logicBonus / 2));
    const c = normalize(scores.softSkills.creativity + (logicBonus / 2));
    const l = normalize(scores.softSkills.leadership + (scores.logic > 10 ? 2 : 0));
    const e = normalize(scores.softSkills.empathy);
    
    const res = [
      { name: 'Pragmatisme', val: p },
      { name: 'Créativité', val: c },
      { name: 'Leadership', val: l },
      { name: 'Empathie', val: e }
    ];
    setStrengths(res);
    // Sync with Sidebar percentage immediately
    updateProfileLocally({ 
      strengths: res.map(s => s.name),
      strengths_data: res,
      scores: scores,
      temp_game_progress: 1 
    });
  };

  const handleMemoryClick = (idx: number) => {
    if (memoryGrid.phase !== 'input') return;
    if (memoryGrid.selected.includes(idx)) return;
    const isCorrect = memoryGrid.pattern.includes(idx);
    if (isCorrect) {
      const newSelected = [...memoryGrid.selected, idx];
      if (newSelected.length === memoryGrid.pattern.length) {
        setScores(s => ({ ...s, logic: s.logic + 1 }));
        setSubGame('B');
        generateSequenceGame(scores.logic);
      } else {
        setMemoryGrid(prev => ({ ...prev, selected: newSelected }));
      }
    } else {
      generateMemoryGame(memoryGrid.size);
    }
  };

  const handleSequenceClick = (ans: number) => {
    if (ans === sequenceGame.correct) {
      setScores(s => ({ ...s, logic: s.logic + 1 }));
      setSubGame('A');
      generateMemoryGame(scores.logic);
    } else {
      generateSequenceGame(scores.logic);
    }
  };

  const handleMathClick = (ans: number) => {
    if (ans === mathGame.correct) {
      setScores(s => ({ ...s, math: s.math + 1 }));
      setSubGame('B');
      generateOperatorGame();
    } else {
      generateMathGame(scores.math);
    }
  };

  const handleOperatorClick = (op: string) => {
    if (op === operatorGame.correct) {
      setScores(s => ({ ...s, math: s.math + 1 }));
      setSubGame('A');
      generateMathGame(scores.math);
    } else {
      generateOperatorGame();
    }
  };

  const handleBehClick = (traits: any) => {
    setScores(s => ({ 
      ...s, 
      softSkills: {
        pragmatism: s.softSkills.pragmatism + (traits.pragmatism || 0),
        creativity: s.softSkills.creativity + (traits.creativity || 0),
        leadership: s.softSkills.leadership + (traits.leadership || 0),
        empathy: s.softSkills.empathy + (traits.empathy || 0),
      }
    }));
    if (behIdx < BEHAVIOR_SITS.length - 1) {
      setBehIdx(prev => prev + 1);
    } else {
      advanceBlock(3);
    }
  };

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setChatMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setChatInput('');
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      const nextIndex = questionIndex + 1;
      setQuestionIndex(nextIndex);
      if (questionIndex < ORI_FOLLOWUP_MESSAGES.length) {
        setChatMessages(prev => [...prev, { role: 'ori', content: ORI_FOLLOWUP_MESSAGES[questionIndex] }]);
      } else {
        setChatMessages(prev => [...prev, { role: 'ori', content: "On y est. Passe à la vérification finale et génère ton Persona." }]);
        setTimeout(() => setStep(4), 1200);
      }
    }, 1000);
  };

  const saveProfile = async () => {
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const sessionUserId = session?.user?.id;
      const effectiveUserId = sessionUserId || userId;

      if (!effectiveUserId) {
        throw new Error("Utilisateur non authentifie, impossible de sauvegarder le profil.");
      }

      const profileDataToSave = {
        name, city, level, interests,
        strengths: strengths.map(s => s.name),
        strengths_data: strengths,
        scores: scores,
        is_complete: true,
        tests_retake_count: retakeCount
      };
      const res = await fetch(apiUrl('/api/profile/'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: effectiveUserId,
          mobility: false,
          ...profileDataToSave
        }),
      });
      if (res.ok) {
        updateProfileLocally(profileDataToSave);
        setUserId(effectiveUserId);
        setSaveSuccess(true);
        setIsRetaking(false);
        setStep(5);
      } else {
        const err = await res.text();
        console.error('Profile save response:', err);
        throw new Error(`Echec de sauvegarde du profil: ${err}`);
      }
    } catch (err) {
      console.error(err);
      setSaveError(err instanceof Error ? err.message : "Erreur inconnue lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  };

  const handleBulletinFiles = (files: FileList | null) => {
    if (!files) return;
    const onlyPdf = Array.from(files).filter((f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'));
    setUploadedFiles(onlyPdf);
  };

  const handleFakeBulletinAnalysis = () => {
    setBulletinAnalyzing(true);
    setTimeout(() => {
      setBulletinAnalyzing(false);
      setStep(2);
    }, 1400);
  };

  const resetTestsState = () => {
    setScores({
      logic: 0,
      math: 0,
      softSkills: { pragmatism: 0, creativity: 0, leadership: 0, empathy: 0 }
    });
    setStrengths([
      { name: 'Pragmatisme', val: 0 },
      { name: 'Créativité', val: 0 },
      { name: 'Leadership', val: 0 },
      { name: 'Empathie', val: 0 }
    ]);
    setGameIndex(0);
    setSubGame('A');
    setGameTimer(120);
    setBehIdx(0);
    setChatMessages([]);
    setChatInput('');
    setQuestionIndex(0);
    // Explicitly generate for start
    generateMemoryGame(3);
    generateMathGame(0);
  };

  const handleRetakeTests = async () => {
    if (retakeCount >= MAX_RETAKES) return;

    const nextRetakeCount = retakeCount + 1;
    setRetakeCount(nextRetakeCount);
    updateProfileLocally({ tests_retake_count: nextRetakeCount });

    resetTestsState();
    setIsRetaking(true);
    // Repart du début pour conserver l'étape "bulletins / fake analyse IA"
    setStep(1);
  };

  const toggleInterest = (interest: string) => {
    setInterests(prev => prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]);
  };

  if (loading) return (
    <div className="flex h-full items-center justify-center bg-slate-50">
      <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
    </div>
  );

  return (
    <div className="min-h-full bg-slate-50 p-4 md:p-8 overflow-y-auto">
      <div className="max-w-5xl mx-auto">
        <AnimatePresence mode="wait">
          
          {/* STEP 1: WELCOME & BULLETINS */}
          {step === 1 && (
            <motion.div 
              key="step1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-200/60"
            >
              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="p-8 md:p-12 bg-slate-900 text-white flex flex-col justify-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,_var(--tw-gradient-stops))] from-orange-500/20 via-transparent to-transparent" />
                  <div className="relative z-10">
                    <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-orange-500/30">
                      <BrainCircuit className="w-9 h-9 text-white" />
                    </div>
                    <h1 className="text-4xl font-black mb-4 leading-tight tracking-tight">Prêt pour ton<br/><span className="text-orange-500">Profil Cognitif ?</span></h1>
                    <p className="text-slate-400 text-lg font-medium leading-relaxed mb-8">
                      On ne te demande pas tes notes. On teste ton potentiel. 3 minutes, 3 blocs, un profil unique.
                    </p>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-slate-300">
                        <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-orange-500">1</div>
                        <span>Jeux de logique & mémoire</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-300">
                        <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-orange-500">2</div>
                        <span>Calcul mental & résolution</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-300">
                        <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-orange-500">3</div>
                        <span>Mises en situation (Soft Skills)</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-8 md:p-12 flex flex-col justify-center items-center text-center">
                  <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mb-6">
                    <UploadCloud className="w-10 h-10 text-orange-500" />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 mb-2">Importe tes bulletins</h2>
                  <p className="text-slate-500 mb-8 font-medium">Glisse tes fichiers PDF pour que ORI comprenne ton parcours académique.</p>
                  <label className="w-full mb-4">
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      multiple
                      className="hidden"
                      onChange={(e) => handleBulletinFiles(e.target.files)}
                    />
                    <div className="w-full cursor-pointer rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 py-4 px-3 text-sm font-bold text-slate-600 hover:border-orange-400 hover:text-orange-600 transition-colors">
                      {uploadedFiles.length > 0 ? `${uploadedFiles.length} bulletin(s) sélectionné(s)` : 'Déposer mes bulletins (PDF)'}
                    </div>
                  </label>
                  {uploadedFiles.length > 0 && (
                    <p className="text-xs text-slate-500 mb-4 max-w-xs">
                      {uploadedFiles.map((f) => f.name).join(', ')}
                    </p>
                  )}
                  <Button
                    onClick={handleFakeBulletinAnalysis}
                    disabled={bulletinAnalyzing}
                    className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-lg font-black text-lg transition-transform active:scale-[0.98]"
                  >
                    {bulletinAnalyzing ? 'Analyse IA des bulletins...' : 'Analyser puis commencer les tests'}
                  </Button>
                  <p className="mt-4 text-xs text-slate-400 font-bold uppercase tracking-widest cursor-pointer hover:text-slate-600" onClick={() => setStep(2)}>Passer l'import pour l'instant</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: MINI GAMES ARCADE */}
          {step === 2 && (
            <motion.div 
              key="step2" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }}
              className="bg-white border-2 border-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col h-[600px] relative"
            >
              <div className="bg-slate-900 p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={cn("px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest", gameIndex === 0 ? "bg-blue-500 text-white" : "bg-slate-800 text-slate-500")}>Logique</div>
                  <div className={cn("px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest", gameIndex === 1 ? "bg-pink-500 text-white" : "bg-slate-800 text-slate-500")}>Maths</div>
                  <div className={cn("px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest", gameIndex === 2 ? "bg-orange-500 text-white" : "bg-slate-800 text-slate-500")}>Social</div>
                </div>
                <div className="flex items-center gap-3">
                  {gameIndex < 3 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => advanceBlock(gameIndex + 1)}
                      className="h-9 rounded-full border-slate-600 bg-slate-800 text-slate-100 hover:bg-slate-700 hover:text-white"
                    >
                      Bloc suivant
                    </Button>
                  )}
                  <div className="flex items-center gap-2 bg-slate-800 px-4 py-1.5 rounded-full border border-slate-700">
                    <Timer className="w-4 h-4 text-orange-500" />
                    <span className="text-white font-mono font-bold">{formatTimer(gameTimer)}</span>
                  </div>
                </div>
              </div>

              <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/50">
                {gameIndex === 0 && (
                  <div className="p-8 md:p-12 text-center relative flex-1 flex flex-col justify-center">
                    <div className="absolute top-4 right-6 text-sm font-bold text-blue-500 bg-blue-50 px-3 py-1 rounded-full">Niveau {scores.logic}</div>
                    {subGame === 'A' ? (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="mem">
                        <h2 className="text-2xl font-black text-slate-900 mb-2">Mémoire Spatiale</h2>
                        <p className="text-slate-500 mb-8 font-medium">Mémorise le motif puis reproduis-le.</p>
                        <div className="grid gap-2 mx-auto w-64 h-64" style={{ gridTemplateColumns: `repeat(${memoryGrid.size}, minmax(0, 1fr))` }}>
                          {[...Array(memoryGrid.size * memoryGrid.size)].map((_, i) => (
                            <motion.div key={i} whileTap={{ scale: 0.95 }} onClick={() => handleMemoryClick(i)} className={cn("rounded-xl border-2 transition-all cursor-pointer", memoryGrid.phase === 'show' && memoryGrid.pattern.includes(i) ? "bg-blue-500 border-blue-400" : memoryGrid.phase === 'input' && memoryGrid.selected.includes(i) ? "bg-blue-500 border-blue-400" : "bg-white border-slate-100 hover:border-blue-200")} />
                          ))}
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="seq">
                        <h2 className="text-2xl font-black text-slate-900 mb-2">Suite Logique</h2>
                        <p className="text-slate-500 mb-8 font-medium">Quel est le prochain nombre ?</p>
                        <div className="text-4xl font-black text-blue-600 mb-10 tracking-widest bg-blue-50 p-6 rounded-2xl inline-block border border-blue-100">{sequenceGame.seq}</div>
                        <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                          {sequenceGame.ans.map((a, i) => (
                            <Button key={i} variant="outline" onClick={() => handleSequenceClick(a)} className="h-14 rounded-xl text-xl font-bold border-slate-200 hover:border-blue-500 hover:text-blue-500">{a}</Button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}
                {gameIndex === 1 && (
                  <div className="p-8 md:p-12 text-center relative flex-1 flex flex-col justify-center">
                    <div className="absolute top-4 right-6 text-sm font-bold text-pink-500 bg-pink-50 px-3 py-1 rounded-full">Niveau {scores.math}</div>
                    {subGame === 'A' ? (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="calc">
                        <h2 className="text-2xl font-black text-slate-900 mb-2">Calcul Mental</h2>
                        <div className="text-5xl font-black text-slate-800 h-32 flex items-center justify-center mb-8 bg-slate-50 rounded-2xl border border-slate-100 max-w-sm mx-auto shadow-inner tracking-widest">{mathGame.eq}</div>
                        <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                          {mathGame.ans.map((ans, i) => (
                            <button key={i} onClick={() => handleMathClick(ans)} className="bg-white border-2 border-slate-200 text-2xl font-bold py-5 rounded-xl hover:border-pink-500 hover:text-pink-500 hover:bg-pink-50 active:scale-95 transition-all shadow-sm">{ans}</button>
                          ))}
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="op">
                        <h2 className="text-2xl font-black text-slate-900 mb-2">Opérateur Manquant</h2>
                        <div className="text-4xl font-black text-slate-800 p-8 mb-10 bg-slate-50 rounded-2xl inline-block border border-slate-100 shadow-inner">{operatorGame.eq}</div>
                        <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                          {['+', '-', '×', '÷'].map((op) => (
                            <Button key={op} variant="outline" onClick={() => handleOperatorClick(op)} className="h-16 text-3xl font-bold rounded-xl border-slate-200 hover:border-pink-500 hover:text-pink-500">{op}</Button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}
                {gameIndex === 2 && (
                  <div className="p-8 md:p-12 text-center relative flex-1 flex flex-col justify-center">
                    <div className="absolute top-4 right-6 text-sm font-bold text-orange-500 bg-orange-50 px-3 py-1 rounded-full">Scénario {behIdx + 1}/{BEHAVIOR_SITS.length}</div>
                    <h2 className="text-2xl font-black text-slate-900 mb-2">Mise en situation</h2>
                    <div className="text-xl font-black text-slate-800 p-8 mb-8 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner leading-relaxed">{BEHAVIOR_SITS[behIdx].sit}</div>
                    <div className="space-y-4 max-w-xl mx-auto">
                      {BEHAVIOR_SITS[behIdx].opts.map((opt, i) => (
                        <button key={i} onClick={() => handleBehClick(opt.traits)} className="w-full bg-white border-2 border-slate-100 text-left p-5 rounded-2xl hover:border-orange-500 hover:bg-orange-50 transition-all flex items-center gap-4 group shadow-sm">
                          <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-orange-200 flex items-center justify-center font-bold text-slate-400 group-hover:text-orange-600 transition-colors">{String.fromCharCode(65 + i)}</div>
                          <span className="font-bold text-slate-700 group-hover:text-orange-900">{opt.text}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {gameIndex === 3 && (
                  <div className="p-8 md:p-12">
                    <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100">
                      <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20"><BarChart3 className="w-7 h-7 text-white" /></div>
                      <div>
                        <h2 className="text-2xl font-black text-slate-900">Résultats des Tests</h2>
                        <p className="text-slate-500 font-medium">Ton profil cognitif est prêt.</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                      <div className="bg-slate-50 rounded-[2rem] p-6 flex items-center justify-center border border-slate-100 relative overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-orange-500/5 via-transparent to-transparent" />
                        <svg viewBox="0 0 100 100" className="w-64 h-64 drop-shadow-2xl relative z-10">
                          {[0.2, 0.4, 0.6, 0.8, 1].map((r) => (
                            <path key={r} d={`M 50 ${50 - 40 * r} L ${50 + 40 * r} 50 L 50 ${50 + 40 * r} L ${50 - 40 * r} 50 Z`} fill="none" stroke="#e2e8f0" strokeWidth="0.5" />
                          ))}
                          <line x1="50" y1="10" x2="50" y2="90" stroke="#e2e8f0" strokeWidth="0.5" />
                          <line x1="10" y1="50" x2="90" y2="50" stroke="#e2e8f0" strokeWidth="0.5" />
                          {(() => {
                            const p = strengths.find(s => s.name === 'Pragmatisme')?.val || 0;
                            const c = strengths.find(s => s.name === 'Créativité')?.val || 0;
                            const l = strengths.find(s => s.name === 'Leadership')?.val || 0;
                            const e = strengths.find(s => s.name === 'Empathie')?.val || 0;
                            const points = [`50,${50 - (p * 40) / 100}`, `${50 + (l * 40) / 100},50`, `50,${50 + (e * 40) / 100}`, `${50 - (c * 40) / 100},50`].join(' ');
                            return <motion.polygon initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, delay: 0.5 }} points={points} fill="rgba(249, 115, 22, 0.3)" stroke="#f97316" strokeWidth="2" strokeLinejoin="round" />;
                          })()}
                        </svg>
                        <span className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Pragmatisme</span>
                        <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Empathie</span>
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase tracking-widest [writing-mode:vertical-rl]">Leadership</span>
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase tracking-widest [writing-mode:vertical-rl] rotate-180">Créativité</span>
                      </div>
                      <div className="space-y-6 flex flex-col justify-center">
                        <div className="space-y-2">
                          <div className="flex justify-between items-end"><span className="font-bold text-slate-700 flex items-center gap-2 text-sm"><BrainCircuit className="w-4 h-4 text-blue-500" /> Logique & Mémoire</span><span className="text-sm font-black text-blue-600">{Math.min(100, scores.logic * 4)}%</span></div>
                          <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, scores.logic * 4)}%` }} className="h-full bg-blue-500" /></div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-end"><span className="font-bold text-slate-700 flex items-center gap-2 text-sm"><Zap className="w-4 h-4 text-pink-500" /> Mathématiques</span><span className="text-sm font-black text-pink-600">{Math.min(100, scores.math * 3)}%</span></div>
                          <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, scores.math * 3)}%` }} className="h-full bg-pink-500" /></div>
                        </div>
                        <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl">
                          <p className="text-xs text-orange-800 font-bold mb-1 flex items-center gap-1"><Trophy className="w-3 h-3" /> Analyse Personnalité</p>
                          <p className="text-[11px] text-orange-700 font-medium leading-relaxed">Tes choix indiquent une dominance <strong>{strengths.length > 0 ? [...strengths].sort((a,b) => b.val - a.val)[0].name : ''}</strong>. C'est un atout majeur pour ton futur parcours.</p>
                        </div>
                      </div>
                    </div>
                    <Button onClick={() => setStep(3)} className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-lg font-black text-lg transition-transform active:scale-[0.98] flex items-center justify-center gap-2">Discuter avec ORI <ChevronRight className="w-5 h-5" /></Button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* STEP 3: CONVERSATIONAL ORI AI */}
          {step === 3 && (
            <motion.div 
              key="step3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col h-[600px]"
            >
              <div className="bg-slate-900 p-6 flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-white font-black text-xl tracking-tight">Conversation avec ORI</h2>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">IA Orientation de l'Étudiant</p>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
                {chatMessages.map((msg, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={cn("flex", msg.role === 'ori' ? "justify-start" : "justify-end")}>
                    <div className={cn("max-w-[80%] p-4 rounded-2xl font-medium text-sm leading-relaxed", msg.role === 'ori' ? "bg-white border border-slate-200 text-slate-800 shadow-sm" : "bg-slate-900 text-white shadow-lg")}>
                      {msg.content}
                    </div>
                  </motion.div>
                ))}
                {analyzing && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-slate-200 p-4 rounded-2xl flex gap-2">
                      <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1 }} className="w-2 h-2 bg-slate-300 rounded-full" />
                      <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-2 h-2 bg-slate-300 rounded-full" />
                      <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-2 h-2 bg-slate-300 rounded-full" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              <form onSubmit={handleChatSubmit} className="p-4 bg-white border-t border-slate-100 flex gap-2">
                <Input value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Écris ta réponse ici..." className="flex-1 bg-slate-50 border-slate-200 h-12 rounded-xl focus-visible:ring-orange-500" />
                <Button type="submit" disabled={!chatInput.trim()} className="w-12 h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white p-0 flex items-center justify-center">
                  <Send className="w-5 h-5" />
                </Button>
              </form>
            </motion.div>
          )}

          {/* STEP 4: VERIFICATION (CLEANED) */}
          {step === 4 && (
            <motion.div 
              key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="bg-white border border-slate-200 rounded-[2rem] p-8 md:p-12 shadow-xl"
            >
              <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-100">
                <div className="bg-green-100 p-2.5 rounded-full"><CheckCircle2 className="w-6 h-6 text-green-600" /></div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Vérifie ton profil</h2>
                  <p className="text-slate-500 text-sm font-medium">L'IA a affiné ton Persona. Complète juste ce qu'il manque.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2"><MapPin className="w-5 h-5 text-orange-500" /> Localisation & Niveau</h3>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ville</label>
                    <Input value={city} onChange={e => setCity(e.target.value)} placeholder="Ta ville" className="bg-slate-50 border-slate-200 h-12 font-medium focus-visible:ring-orange-500" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Niveau d'études</label>
                    <div className="flex flex-wrap gap-2">
                      {LEVELS.map(l => (
                        <button key={l} onClick={() => setLevel(l)} className={cn("px-3 py-2 rounded-xl text-sm border transition-all font-bold", level === l ? "bg-orange-500 border-orange-500 text-white shadow-md" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50")}>{l}</button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2"><Target className="w-5 h-5 text-orange-500" /> Centres d'intérêt</h3>
                  <div className="flex flex-wrap gap-2">
                    {INTERESTS_LIST.map(interest => (
                      <button key={interest} onClick={() => toggleInterest(interest)} className={cn("px-4 py-2 rounded-xl text-sm font-bold border transition-all", interests.includes(interest) ? "bg-slate-900 border-slate-900 text-white shadow-md" : "bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50")}>{interest}</button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-10 pt-6 border-t border-slate-100 flex gap-4">
                <Button onClick={saveProfile} disabled={saving || !city || !level} className="flex-1 h-14 bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 rounded-xl shadow-lg font-black text-lg transition-transform active:scale-[0.98]">
                  {saving ? <Loader2 className="w-6 h-6 animate-spin" /> : "Générer mon Persona"}
                </Button>
              </div>
              {saveError && <p className="mt-4 text-sm font-bold text-red-600">{saveError}</p>}
              {saveSuccess && <p className="mt-4 text-sm font-bold text-green-600">Persona généré et sauvegardé.</p>}
            </motion.div>
          )}

          {/* STEP 5: PERSONA DASHBOARD */}
          {step === 5 && (
            <motion.div key="step5" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-green-500 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/20"><Rocket className="w-7 h-7 text-white" /></div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Ton Persona est Prêt</h2>
                    <p className="text-slate-500 font-medium">Analyse croisée réussie. Explore tes recommandations.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {retakeCount < MAX_RETAKES ? (
                    <Button
                      onClick={handleRetakeTests}
                      variant="outline"
                      className="rounded-xl font-bold text-slate-600 border-slate-200 hover:bg-slate-50"
                    >
                      Refaire les tests ({MAX_RETAKES - retakeCount} restant{MAX_RETAKES - retakeCount > 1 ? 's' : ''})
                    </Button>
                  ) : (
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                      Limite de retest atteinte
                    </span>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 bg-slate-900 rounded-[2.5rem] p-8 text-center relative overflow-hidden border border-slate-800 flex flex-col items-center">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 blur-[80px] rounded-full" />
                  <motion.div animate={{ y: [-10, 10, -10] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="relative w-48 h-48 mb-6 z-10">
                    <img src="https://static.vecteezy.com/system/resources/previews/011/153/360/original/3d-web-developer-working-on-project-illustration-png.png" alt="Avatar" className="w-full h-full object-contain" />
                  </motion.div>
                  <h3 className="text-3xl font-black text-white tracking-tight mb-2 z-10">{name || 'Futur Étudiant'}</h3>
                  <div className="flex items-center gap-2 text-slate-300 font-medium mb-8 z-10"><MapPin className="w-4 h-4 text-orange-400" /> {city}</div>
                  <div className="flex flex-wrap justify-center gap-2 z-10 mt-auto">
                    {interests.map(i => <span key={i} className="px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-lg text-xs font-bold text-white uppercase tracking-wider">{i}</span>)}
                  </div>
                </div>
                <div className="lg:col-span-2 space-y-8">
                  <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-slate-100">
                    <div className="flex items-center gap-3 mb-8"><div className="p-3 bg-orange-100 rounded-xl"><Activity className="w-6 h-6 text-orange-600" /></div><h3 className="text-2xl font-black text-slate-900">Profil de Compétences</h3></div>
                    <div className="space-y-6">
                      {strengths.map((skill, idx) => (
                        <div key={idx} className="space-y-2">
                          <div className="flex justify-between items-end"><span className="font-bold text-slate-700">{skill.name}</span><span className="text-xs font-black text-slate-400">{skill.val}%</span></div>
                          <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${skill.val}%` }} transition={{ duration: 1.5, delay: idx * 0.2 }} className="h-full bg-orange-500 rounded-full" /></div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {scores?.education && scores.education.length > 0 && (
                    <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-slate-100">
                      <h3 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2"><GraduationCap className="w-6 h-6 text-orange-500" /> Parcours Académique</h3>
                      <div className="space-y-4">
                        {scores.education.map((edu: any, idx: number) => (
                          <div key={idx} className="flex gap-4 items-start">
                            <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-xs shrink-0 border border-orange-100">{edu.year.split('-')[0]}</div>
                            <div>
                              <h4 className="font-bold text-slate-900 text-sm">{edu.school}</h4>
                              <p className="text-xs text-slate-500 font-medium">{edu.degree}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-slate-100">
                    <h3 className="text-xl font-black text-slate-900 mb-4">Analyse de ORI</h3>
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 relative">
                      <Sparkles className="absolute top-4 right-4 w-5 h-5 text-orange-400" />
                      <p className="text-slate-600 leading-relaxed font-medium">Tes performances en {scores.logic > scores.math ? 'logique' : 'mathématiques'} couplées à ton tempérament {strengths.length > 0 ? [...strengths].sort((a,b)=>b.val-a.val)[0].name.toLowerCase() : ''} suggèrent une orientation vers des filières à haute valeur technique. Ton potentiel d'innovation est marqué.</p>
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
