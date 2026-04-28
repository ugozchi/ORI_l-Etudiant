'use client';

import { useState } from 'react';
import { FileText, Copy, Download, Loader2, Sparkles, Send, Briefcase, GraduationCap, PenTool } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/utils/supabase/client';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function DocsPage() {
  const [docType, setDocType] = useState('cover_letter');
  const [targetSchool, setTargetSchool] = useState('');
  const [targetProgram, setTargetProgram] = useState('');
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState('');
  
  const supabase = createClient();

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    setResult('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const uid = session?.user?.id || 'demo-user';

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/docs/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: uid,
          doc_type: docType,
          target_school: targetSchool,
          target_program: targetProgram
        })
      });
      
      const json = await res.json();
      if (json.status === 'success') {
        setResult(json.doc_content);
      }
    } catch (err) {
      console.error(err);
      setResult("Une erreur s'est produite lors de la génération. Le serveur Vertex AI est peut-être injoignable.");
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
    // In real app, put a toast here
  };

  return (
    <div className="min-h-full bg-slate-50 flex flex-col lg:flex-row overflow-hidden">
      
      {/* Left Panel: Configuration */}
      <div className="w-full lg:w-[450px] border-r border-slate-200 bg-white overflow-y-auto p-6 md:p-8 flex flex-col shadow-sm z-10">
        <header className="mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-orange-100 border border-orange-200 mb-4 shadow-sm">
            <PenTool className="w-6 h-6 text-orange-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Docs Assistant</h1>
          <p className="text-sm text-slate-600">ORI rédige tes lettres de motivation, CV et projets motivés en fonction de ton profil.</p>
        </header>

        <form onSubmit={handleGenerate} className="space-y-6 flex-1">
          {/* Doc Type Selection */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-900">Que veux-tu générer ?</label>
            <div className="grid grid-cols-1 gap-3">
              <button
                type="button"
                onClick={() => setDocType('cover_letter')}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all",
                  docType === 'cover_letter' ? "bg-orange-50 border-orange-500 text-slate-900 shadow-sm" : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                )}
              >
                <FileText className={cn("w-6 h-6 shrink-0", docType === 'cover_letter' ? "text-orange-500" : "text-slate-400")} />
                <div>
                  <div className={cn("font-bold text-sm", docType === 'cover_letter' ? "text-orange-900" : "text-slate-900")}>Lettre de Motivation</div>
                  <div className="text-xs mt-0.5 opacity-80">Classique, pour école ou stage</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setDocType('parcoursup')}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all",
                  docType === 'parcoursup' ? "bg-orange-50 border-orange-500 text-slate-900 shadow-sm" : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                )}
              >
                <GraduationCap className={cn("w-6 h-6 shrink-0", docType === 'parcoursup' ? "text-orange-500" : "text-slate-400")} />
                <div>
                  <div className={cn("font-bold text-sm", docType === 'parcoursup' ? "text-orange-900" : "text-slate-900")}>Projet Motivé Parcoursup</div>
                  <div className="text-xs mt-0.5 opacity-80">Format court (1500 caractères)</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setDocType('cv')}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all",
                  docType === 'cv' ? "bg-orange-50 border-orange-500 text-slate-900 shadow-sm" : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                )}
              >
                <Briefcase className={cn("w-6 h-6 shrink-0", docType === 'cv' ? "text-orange-500" : "text-slate-400")} />
                <div>
                  <div className={cn("font-bold text-sm", docType === 'cv' ? "text-orange-900" : "text-slate-900")}>Structure de CV</div>
                  <div className="text-xs mt-0.5 opacity-80">Mise en valeur de tes points forts</div>
                </div>
              </button>
            </div>
          </div>

          <div className="space-y-4 pt-6 border-t border-slate-200">
            <div className="space-y-2 flex flex-col">
              <label className="text-sm font-semibold text-slate-900">Établissement Visé</label>
              <Input 
                value={targetSchool} onChange={e => setTargetSchool(e.target.value)} 
                placeholder="Ex: INSA Lyon, Sorbonne..." 
                className="bg-white border-slate-200 text-slate-900 focus-visible:ring-orange-500 h-12 shadow-sm rounded-xl" 
              />
            </div>
            <div className="space-y-2 flex flex-col">
              <label className="text-sm font-semibold text-slate-900">Formation Visée</label>
              <Input 
                value={targetProgram} onChange={e => setTargetProgram(e.target.value)} 
                placeholder="Ex: BUT Informatique, Licence Bio..." 
                className="bg-white border-slate-200 text-slate-900 focus-visible:ring-orange-500 h-12 shadow-sm rounded-xl" 
              />
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={generating}
            className="w-full h-14 mt-8 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-md transition-all text-base"
          >
            {generating ? (
              <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Écriture en cours...</>
            ) : (
              <><Sparkles className="w-5 h-5 mr-2" /> Générer avec ORI</>
            )}
          </Button>
        </form>
      </div>

      {/* Right Panel: Editor / Output */}
      <div className="flex-1 bg-[#E2E8F0] relative flex flex-col overflow-hidden items-center justify-center p-8">
        {/* Background "Desk" Texture */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 pointer-events-none" />

        <div className="w-full max-w-4xl h-full relative z-10 flex flex-col">
          {result ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="flex-1 flex flex-col"
            >
              <div className="flex items-center justify-between mb-4 bg-white/50 backdrop-blur-md p-4 rounded-2xl border border-white shadow-sm">
                <div className="text-slate-600 font-semibold flex items-center gap-2">
                  <FileText className="w-4 h-4 text-orange-500" /> Document prêt
                  <span className="text-xs font-normal text-slate-400 bg-white px-2 py-0.5 rounded-full">{result.length} caractères</span>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" size="sm" onClick={copyToClipboard} className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm rounded-xl font-bold">
                    <Copy className="w-4 h-4 mr-2 text-slate-400" /> Copier
                  </Button>
                  <Button size="sm" className="bg-slate-900 text-white hover:bg-slate-800 shadow-md rounded-xl font-bold">
                    <Download className="w-4 h-4 mr-2" /> Télécharger
                  </Button>
                </div>
              </div>
              
              <div className="flex-1 bg-white rounded-md shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] overflow-y-auto p-12 md:p-20 font-serif text-slate-800 leading-relaxed relative ring-1 ring-slate-900/5 max-w-[210mm] mx-auto w-full aspect-[1/1.414]">
                {/* Paper texture overlay */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/clean-textile.png')] opacity-10 pointer-events-none" />
                <div className="relative z-10 whitespace-pre-wrap text-[15px]">{result}</div>
              </div>
            </motion.div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="bg-white/50 backdrop-blur-sm rounded-md shadow-2xl overflow-y-auto p-12 font-serif text-slate-400 leading-relaxed relative ring-1 ring-white max-w-[210mm] mx-auto w-full aspect-[1/1.414] flex flex-col items-center justify-center text-center">
                <div className="absolute inset-0 bg-white/60 pointer-events-none" />
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-20 h-20 mb-6 rounded-full bg-white shadow-md flex items-center justify-center">
                    <FileText className="w-8 h-8 text-slate-300" />
                  </div>
                  <h2 className="text-2xl font-black text-slate-800 mb-3 font-sans">Feuille Blanche</h2>
                  <p className="text-slate-500 max-w-sm leading-relaxed font-sans font-medium">
                    Sélectionne tes paramètres à gauche et laisse l'IA de l'Étudiant rédiger ton document.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
