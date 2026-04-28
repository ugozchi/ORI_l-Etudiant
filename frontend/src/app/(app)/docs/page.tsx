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
    <div className="min-h-full bg-[#0A0A0A] flex flex-col lg:flex-row overflow-hidden">
      
      {/* Left Panel: Configuration */}
      <div className="w-full lg:w-[450px] border-r border-[#2C2C2C] bg-[#121212] overflow-y-auto p-6 md:p-8 flex flex-col">
        <header className="mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 mb-4">
            <PenTool className="w-6 h-6 text-purple-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Docs Assistant</h1>
          <p className="text-sm text-zinc-400">ORI rédige tés letres de motivation, CV et projets motivés en fonction de ton Profil.</p>
        </header>

        <form onSubmit={handleGenerate} className="space-y-6 flex-1">
          {/* Doc Type Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-zinc-300">Que veux-tu générer ?</label>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => setDocType('cover_letter')}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl border text-left transition-all",
                  docType === 'cover_letter' ? "bg-indigo-600/20 border-indigo-500 text-white" : "bg-[#1A1A1A] border-[#2C2C2C] text-zinc-400 hover:border-zinc-500"
                )}
              >
                <FileText className={cn("w-5 h-5", docType === 'cover_letter' ? "text-indigo-400" : "")} />
                <div>
                  <div className="font-semibold text-sm">Lettre de Motivation</div>
                  <div className="text-xs opacity-70">Classique, pour école ou stage</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setDocType('parcoursup')}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl border text-left transition-all",
                  docType === 'parcoursup' ? "bg-indigo-600/20 border-indigo-500 text-white" : "bg-[#1A1A1A] border-[#2C2C2C] text-zinc-400 hover:border-zinc-500"
                )}
              >
                <GraduationCap className={cn("w-5 h-5", docType === 'parcoursup' ? "text-indigo-400" : "")} />
                <div>
                  <div className="font-semibold text-sm">Projet Motivé Parcoursup</div>
                  <div className="text-xs opacity-70">Format court (1500 caractères)</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setDocType('cv')}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl border text-left transition-all",
                  docType === 'cv' ? "bg-indigo-600/20 border-indigo-500 text-white" : "bg-[#1A1A1A] border-[#2C2C2C] text-zinc-400 hover:border-zinc-500"
                )}
              >
                <Briefcase className={cn("w-5 h-5", docType === 'cv' ? "text-indigo-400" : "")} />
                <div>
                  <div className="font-semibold text-sm">Structure de CV</div>
                  <div className="text-xs opacity-70">Mise en valeur de tes points forts</div>
                </div>
              </button>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-[#2C2C2C]">
            <div className="space-y-1.5 flex flex-col">
              <label className="text-sm font-medium text-zinc-300">Établissement Visé</label>
              <Input 
                value={targetSchool} onChange={e => setTargetSchool(e.target.value)} 
                placeholder="Ex: INSA Lyon, Sorbonne..." 
                className="bg-[#1A1A1A] border-[#2C2C2C] text-white focus-visible:ring-indigo-500 h-11" 
              />
            </div>
            <div className="space-y-1.5 flex flex-col">
              <label className="text-sm font-medium text-zinc-300">Formation Visée</label>
              <Input 
                value={targetProgram} onChange={e => setTargetProgram(e.target.value)} 
                placeholder="Ex: BUT Informatique, Licence Bio..." 
                className="bg-[#1A1A1A] border-[#2C2C2C] text-white focus-visible:ring-indigo-500 h-11" 
              />
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={generating}
            className="w-full h-12 mt-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-90 font-semibold"
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
      <div className="flex-1 bg-[#1A1A1A] relative flex flex-col overflow-hidden">
        {result ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col p-6 lg:p-12">
            <div className="flex items-center justify-between mb-6">
              <div className="text-zinc-400 text-sm">Document généré ({result.length} caractères)</div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={copyToClipboard} className="bg-[#121212] border-[#2C2C2C] text-white hover:bg-[#222]">
                  <Copy className="w-4 h-4 mr-2" /> Copier
                </Button>
                <Button size="sm" className="bg-white text-black hover:bg-zinc-200">
                  <Download className="w-4 h-4 mr-2" /> Sauvegarder
                </Button>
              </div>
            </div>
            
            <div className="flex-1 bg-white rounded-2xl p-8 shadow-2xl overflow-y-auto font-serif text-gray-800 leading-relaxed max-w-4xl mx-auto w-full">
              <div className="whitespace-pre-wrap">{result}</div>
            </div>
          </motion.div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="w-24 h-24 mb-6 rounded-full bg-[#121212] border border-[#2C2C2C] flex items-center justify-center shadow-lg">
              <FileText className="w-10 h-10 text-zinc-600" />
            </div>
            <h2 className="text-xl font-medium text-white mb-2">Feuille Blanche</h2>
            <p className="text-zinc-500 max-w-md">
              Remplis les paramètres sur la gauche et laisse l'IA de l'Étudiant rédiger une première version de ton document.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
