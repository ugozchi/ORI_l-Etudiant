'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap, MapPin, Calendar, ChevronRight, Sparkles,
  CheckCircle2, Plus, Trash2, BookOpen, School, Trophy,
  Target, ArrowRight, Loader2, PenLine, X, Save
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/utils/supabase/client';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface AcademicStep {
  id: string;
  year: string;
  school: string;
  city: string;
  diploma: string;
  field: string;
  status: 'completed' | 'in-progress' | 'planned';
  mentions?: string;
}

const EMPTY_STEP: Omit<AcademicStep, 'id'> = {
  year: '', school: '', city: '', diploma: '', field: '', status: 'completed'
};

const STATUS_CONFIG = {
  'completed': { label: 'Validé', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', dot: 'bg-emerald-500', icon: CheckCircle2 },
  'in-progress': { label: 'En cours', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', dot: 'bg-orange-500', icon: BookOpen },
  'planned': { label: 'Objectif', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', dot: 'bg-blue-500', icon: Target },
};

const DIPLOMA_OPTIONS = [
  'Brevet des Collèges', 'Baccalauréat Général', 'Baccalauréat Technologique',
  'Baccalauréat Professionnel', 'BTS', 'BUT', 'Licence', 'Licence Pro',
  'Master', 'Diplôme d\'Ingénieur', 'Classe Prépa (CPGE)', 'Autre'
];

const FIELD_OPTIONS = [
  'Scientifique (S/Maths-Physique)', 'Économique (ES/SES)', 'Littéraire (L)',
  'STI2D', 'STMG', 'Informatique', 'Commerce / Gestion',
  'Droit', 'Santé / Médecine', 'Arts / Design', 'Ingénierie',
  'Sciences Politiques', 'Communication', 'Autre'
];

export default function ParcoursPage() {
  const [steps, setSteps] = useState<AcademicStep[]>([
    { id: '1', year: '2021', school: 'Collège Jean Moulin', city: 'Paris', diploma: 'Brevet des Collèges', field: 'Général', status: 'completed', mentions: 'Mention Bien' },
    { id: '2', year: '2024', school: 'Lycée Louis-le-Grand', city: 'Paris', diploma: 'Baccalauréat Général', field: 'Scientifique (S/Maths-Physique)', status: 'completed', mentions: 'Mention Très Bien' },
    { id: '3', year: '2024-2025', school: 'À déterminer', city: '', diploma: 'Classe Prépa (CPGE)', field: 'Informatique', status: 'in-progress' },
  ]);

  const [editing, setEditing] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [newStep, setNewStep] = useState<Omit<AcademicStep, 'id'>>(EMPTY_STEP);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);

  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const uid = session?.user?.id || 'demo-user';
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile/${uid}`);
        if (res.ok) {
          const json = await res.json();
          if (json.status === 'success' && json.data) {
            setProfileData(json.data);
          }
        }
      } catch { /* demo mode */ }
      setLoading(false);
    };
    load();
  }, [supabase]);

  const addStep = () => {
    if (!newStep.year || !newStep.diploma) return;
    const step: AcademicStep = { ...newStep, id: Date.now().toString() };
    const sorted = [...steps, step].sort((a, b) => {
      const yA = parseInt(a.year); const yB = parseInt(b.year);
      return yA - yB;
    });
    setSteps(sorted);
    setNewStep(EMPTY_STEP);
    setAdding(false);
  };

  const removeStep = (id: string) => setSteps(prev => prev.filter(s => s.id !== id));

  const updateStep = (id: string, field: keyof AcademicStep, value: string) => {
    setSteps(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const completedCount = steps.filter(s => s.status === 'completed').length;
  const currentStep = steps.find(s => s.status === 'in-progress');

  if (loading) return (
    <div className="flex h-full items-center justify-center bg-slate-50">
      <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
    </div>
  );

  return (
    <div className="min-h-full p-6 lg:p-12 relative overflow-y-auto">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-400/5 blur-[100px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 blur-[100px] rounded-full pointer-events-none translate-y-1/2 -translate-x-1/2" />

      <div className="max-w-4xl mx-auto relative z-10">

        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-100 text-orange-600 font-bold text-sm mb-4">
            <GraduationCap className="w-4 h-4" />
            Parcours Scolaire
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-3">Mon Parcours</h1>
          <p className="text-lg text-slate-500 font-medium">
            Retrace ton parcours académique pour que ORI comprenne d'où tu viens et où tu veux aller.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Trophy className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-sm font-bold text-slate-500">Diplômes obtenus</span>
            </div>
            <p className="text-3xl font-black text-slate-900">{completedCount}</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-orange-600" />
              </div>
              <span className="text-sm font-bold text-slate-500">Étape actuelle</span>
            </div>
            <p className="text-lg font-black text-slate-900 truncate">{currentStep?.diploma || profileData?.level || '—'}</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-sm font-bold text-slate-500">Ville actuelle</span>
            </div>
            <p className="text-lg font-black text-slate-900">{profileData?.city || currentStep?.city || '—'}</p>
          </motion.div>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-emerald-300 via-orange-300 to-blue-300" />

          <motion.div initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.15 } } }} className="space-y-6">
            {steps.map((step) => {
              const config = STATUS_CONFIG[step.status];
              const Icon = config.icon;
              const isEditing = editing === step.id;

              return (
                <motion.div
                  key={step.id}
                  variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 120 } } }}
                  className="relative pl-16"
                >
                  {/* Timeline dot */}
                  <div className={cn("absolute left-[14px] w-7 h-7 rounded-full border-4 border-white shadow-md flex items-center justify-center z-10", config.dot)}>
                    <Icon className="w-3.5 h-3.5 text-white" />
                  </div>

                  {/* Card */}
                  <div className={cn("bg-white rounded-2xl border shadow-sm hover:shadow-md transition-shadow overflow-hidden", config.border)}>
                    {/* Card header */}
                    <div className="flex items-center justify-between p-5 pb-0">
                      <div className="flex items-center gap-3">
                        <span className={cn("px-2.5 py-1 rounded-lg text-xs font-bold", config.bg, config.color)}>{config.label}</span>
                        <span className="text-sm font-bold text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" /> {step.year}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => setEditing(isEditing ? null : step.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-orange-500 hover:bg-orange-50 transition-colors">
                          {isEditing ? <X className="w-4 h-4" /> : <PenLine className="w-4 h-4" />}
                        </button>
                        <button onClick={() => removeStep(step.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Card body */}
                    <div className="p-5">
                      {!isEditing ? (
                        <>
                          <h3 className="text-xl font-black text-slate-900 mb-1">{step.diploma}</h3>
                          <p className="text-sm font-medium text-slate-500 mb-3">{step.field}</p>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                            <span className="flex items-center gap-1.5 font-medium">
                              <School className="w-4 h-4 text-slate-400" /> {step.school}
                            </span>
                            {step.city && (
                              <span className="flex items-center gap-1.5 font-medium">
                                <MapPin className="w-4 h-4 text-slate-400" /> {step.city}
                              </span>
                            )}
                          </div>
                          {step.mentions && (
                            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-xs font-bold text-amber-700">
                              <Trophy className="w-3.5 h-3.5" /> {step.mentions}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Année</label>
                            <Input value={step.year} onChange={e => updateStep(step.id, 'year', e.target.value)} className="bg-slate-50 border-slate-200 h-10 text-sm" />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Établissement</label>
                            <Input value={step.school} onChange={e => updateStep(step.id, 'school', e.target.value)} className="bg-slate-50 border-slate-200 h-10 text-sm" />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Ville</label>
                            <Input value={step.city} onChange={e => updateStep(step.id, 'city', e.target.value)} className="bg-slate-50 border-slate-200 h-10 text-sm" />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Diplôme</label>
                            <select value={step.diploma} onChange={e => updateStep(step.id, 'diploma', e.target.value)} className="w-full h-10 bg-slate-50 border border-slate-200 rounded-md text-sm px-3">
                              <option value="">Choisir...</option>
                              {DIPLOMA_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Filière</label>
                            <select value={step.field} onChange={e => updateStep(step.id, 'field', e.target.value)} className="w-full h-10 bg-slate-50 border border-slate-200 rounded-md text-sm px-3">
                              <option value="">Choisir...</option>
                              {FIELD_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Statut</label>
                            <select value={step.status} onChange={e => updateStep(step.id, 'status', e.target.value as AcademicStep['status'])} className="w-full h-10 bg-slate-50 border border-slate-200 rounded-md text-sm px-3">
                              <option value="completed">Validé</option>
                              <option value="in-progress">En cours</option>
                              <option value="planned">Objectif</option>
                            </select>
                          </div>
                          <div className="sm:col-span-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Mention / Distinction</label>
                            <Input value={step.mentions || ''} onChange={e => updateStep(step.id, 'mentions', e.target.value)} placeholder="Ex: Mention Très Bien" className="bg-slate-50 border-slate-200 h-10 text-sm" />
                          </div>
                          <div className="sm:col-span-2 flex justify-end">
                            <Button onClick={() => setEditing(null)} size="sm" className="bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-bold gap-1.5">
                              <Save className="w-4 h-4" /> Enregistrer
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Add Step */}
          <div className="relative pl-16 mt-6">
            <div className="absolute left-[14px] w-7 h-7 rounded-full border-4 border-white shadow-md bg-slate-300 flex items-center justify-center z-10">
              <Plus className="w-3.5 h-3.5 text-white" />
            </div>

            <AnimatePresence>
              {!adding ? (
                <motion.div key="add-btn" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <button
                    onClick={() => setAdding(true)}
                    className="w-full bg-white border-2 border-dashed border-slate-300 hover:border-orange-400 rounded-2xl p-5 text-center transition-all hover:bg-orange-50/50 group"
                  >
                    <span className="text-sm font-bold text-slate-400 group-hover:text-orange-500 flex items-center justify-center gap-2">
                      <Plus className="w-4 h-4" /> Ajouter une étape à mon parcours
                    </span>
                  </button>
                </motion.div>
              ) : (
                <motion.div key="add-form" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-white rounded-2xl border border-orange-200 shadow-lg p-6">
                  <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-orange-500" /> Nouvelle étape
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Année *</label>
                      <Input value={newStep.year} onChange={e => setNewStep(p => ({ ...p, year: e.target.value }))} placeholder="Ex: 2025" className="bg-slate-50 border-slate-200 h-10 text-sm" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Établissement</label>
                      <Input value={newStep.school} onChange={e => setNewStep(p => ({ ...p, school: e.target.value }))} placeholder="Nom de l'école" className="bg-slate-50 border-slate-200 h-10 text-sm" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Ville</label>
                      <Input value={newStep.city} onChange={e => setNewStep(p => ({ ...p, city: e.target.value }))} placeholder="Ville" className="bg-slate-50 border-slate-200 h-10 text-sm" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Diplôme *</label>
                      <select value={newStep.diploma} onChange={e => setNewStep(p => ({ ...p, diploma: e.target.value }))} className="w-full h-10 bg-slate-50 border border-slate-200 rounded-md text-sm px-3">
                        <option value="">Choisir...</option>
                        {DIPLOMA_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Filière</label>
                      <select value={newStep.field} onChange={e => setNewStep(p => ({ ...p, field: e.target.value }))} className="w-full h-10 bg-slate-50 border border-slate-200 rounded-md text-sm px-3">
                        <option value="">Choisir...</option>
                        {FIELD_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Statut</label>
                      <select value={newStep.status} onChange={e => setNewStep(p => ({ ...p, status: e.target.value as AcademicStep['status'] }))} className="w-full h-10 bg-slate-50 border border-slate-200 rounded-md text-sm px-3">
                        <option value="completed">Validé</option>
                        <option value="in-progress">En cours</option>
                        <option value="planned">Objectif</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-5 justify-end">
                    <Button variant="outline" onClick={() => { setAdding(false); setNewStep(EMPTY_STEP); }} className="rounded-lg font-bold border-slate-200 text-slate-600">Annuler</Button>
                    <Button onClick={addStep} disabled={!newStep.year || !newStep.diploma} className="bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-bold gap-1.5">
                      <Plus className="w-4 h-4" /> Ajouter
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ORI Insight */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="mt-12 bg-gradient-to-br from-slate-900 to-[#0F172A] rounded-[2rem] p-8 relative overflow-hidden shadow-2xl shadow-slate-900/20 border border-slate-800">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/15 blur-[80px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Analyse ORI de ton parcours</h3>
                <p className="text-slate-400 text-xs font-medium">Basée sur {steps.length} étapes renseignées</p>
              </div>
            </div>
            <p className="text-slate-300 leading-relaxed font-medium text-sm">
              Ton parcours montre une progression cohérente avec une orientation vers les filières scientifiques et techniques.
              {completedCount > 0 && ` Tu as validé ${completedCount} diplôme${completedCount > 1 ? 's' : ''}.`}
              {currentStep && ` Tu es actuellement en ${currentStep.diploma}.`}
              {' '}ORI peut t'aider à identifier les meilleures formations qui correspondent à ta trajectoire. Discute avec ORI pour affiner ton orientation.
            </p>
            <div className="mt-6">
              <Link href="/chat">
                <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold h-12 px-6 shadow-lg shadow-orange-500/30 gap-2">
                  Discuter avec ORI <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
