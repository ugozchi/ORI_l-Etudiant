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
      <div className="flex-1 bg-slate-100 relative flex flex-col overflow-hidden">
        {result ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col p-6 lg:p-12">
            <div className="flex items-center justify-between mb-6">
              <div className="text-slate-500 text-sm font-medium">Document généré ({result.length} caractères)</div>
              <div className="flex gap-3">
                <Button variant="outline" size="sm" onClick={copyToClipboard} className="bg-white border-slate-300 text-slate-700 hover:bg-slate-50 shadow-sm rounded-lg font-medium">
                  <Copy className="w-4 h-4 mr-2 text-slate-500" /> Copier
                </Button>
                <Button size="sm" className="bg-slate-900 text-white hover:bg-slate-800 shadow-sm rounded-lg font-medium">
                  <Download className="w-4 h-4 mr-2" /> Sauvegarder
                </Button>
              </div>
            </div>
            
            <div className="flex-1 bg-white border border-slate-200 rounded-2xl p-8 shadow-sm overflow-y-auto font-serif text-slate-800 leading-relaxed max-w-4xl mx-auto w-full">
              <div className="whitespace-pre-wrap">{result}</div>
            </div>
          </motion.div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="w-24 h-24 mb-6 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm">
              <FileText className="w-10 h-10 text-slate-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-3">Feuille Blanche</h2>
            <p className="text-slate-500 max-w-md leading-relaxed">
              Remplis les paramètres sur la gauche et laisse l'IA de l'Étudiant rédiger une première version de ton document.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
