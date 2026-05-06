'use client';

import { useState, useEffect } from 'react';
import { Mail, Loader2, Sparkles, Send, CheckCircle2, Video, FileText, Compass, ExternalLink, X, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/utils/supabase/client';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useProfile } from '@/contexts/ProfileContext';
import { LockedOverlay } from '@/components/layout/LockedOverlay';

import { apiUrl } from '@/utils/api';
import Link from 'next/link';

type Article = {
  id: string;
  title: string;
  summary: string;
  topic: string;
  date: string;
  url: string;
  type: 'Article' | 'Vidéo' | 'Témoignage' | 'Guide' | 'Analyse';
  image_url: string;
};

export default function NewsletterPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [email, setEmail] = useState('');
  const [frequency, setFrequency] = useState('hebdo');
  const [userId, setUserId] = useState<string | null>(null);
  
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  const supabase = createClient();
  const { isProfileComplete } = useProfile();

  useEffect(() => {
    const fetchPreview = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const id = session?.user?.id || 'demo-user';
        setUserId(id);
        if (session?.user?.email) setEmail(session.user.email);

        const res = await fetch(apiUrl(`/api/newsletter/preview/${id}`));
        const json = await res.json();
        
        if (json.status === 'success') {
          setArticles(json.data);
        }
      } catch (err) {
        console.error("Failed to fetch newsletter preview", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPreview();
  }, [supabase]);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setSubscribing(true);
    try {
      const res = await fetch(apiUrl('/api/newsletter/subscribe'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId || 'anonymous',
          email,
          frequency
        })
      });
      
      const json = await res.json();
      if (json.status === 'success') {
        setSubscribed(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubscribing(false);
    }
  };

  const handleLoadMore = () => {
    setLoadingMore(true);
    setTimeout(() => {
      const moreArticles: Article[] = [
        {
          id: `new-${Date.now()}-1`,
          title: "Les algorithmes de pricing en temps réel chez LVMH",
          summary: "Comment l'industrie du luxe utilise désormais la data science pour optimiser ses marges mondiales.",
          topic: "Data & Luxe",
          date: new Date().toISOString(),
          url: "#",
          type: "Analyse",
          image_url: "https://images.unsplash.com/photo-1549439602-43ebca2327af?q=80&w=800&auto=format&fit=crop"
        },
        {
          id: `new-${Date.now()}-2`,
          title: "Témoignage : De 42 à CTO d'une FinTech à Londres",
          summary: "Le parcours atypique de Julien, qui a su allier l'exigence du code à la vision stratégique financière.",
          topic: "Carrière",
          date: new Date().toISOString(),
          url: "#",
          type: "Témoignage",
          image_url: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800&auto=format&fit=crop"
        },
        {
          id: `new-${Date.now()}-3`,
          title: "Le Guide Ultime des certifications Cloud (AWS/GCP)",
          summary: "Quelles certifications passer en 2026 pour maximiser son attractivité auprès des grands fonds d'investissement.",
          topic: "Architecture",
          date: new Date().toISOString(),
          url: "#",
          type: "Guide",
          image_url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop"
        },
        {
          id: `new-${Date.now()}-4`,
          title: "L'art de la négociation : Soft Skills pour ingénieurs",
          summary: "Pourquoi savoir coder ne suffit plus. Apprends à négocier ton package salarial comme un HEC.",
          topic: "Soft Skills",
          date: new Date().toISOString(),
          url: "#",
          type: "Vidéo",
          image_url: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=800&auto=format&fit=crop"
        }
      ];
      setArticles((prev) => [...prev, ...moreArticles]);
      setLoadingMore(false);
    }, 1000);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Vidéo': return <Video className="w-3.5 h-3.5" />;
      case 'Témoignage': return <UserIcon className="w-3.5 h-3.5" />;
      case 'Guide': return <Compass className="w-3.5 h-3.5" />;
      default: return <FileText className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="min-h-full bg-slate-50 overflow-y-auto relative">
      {!isProfileComplete && <LockedOverlay />}
      
      {/* Premium Hero Section */}
      <section className="relative px-6 py-20 md:py-32 overflow-hidden bg-[#0A0F1C] border-b border-white/5">
        {/* Deep tech background effects */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20" />
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[800px] h-[800px] bg-indigo-500/10 blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-[600px] h-[600px] bg-orange-500/15 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="relative max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20">
          <div className="flex-1 text-center lg:text-left space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} 
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full text-orange-400 text-xs font-bold tracking-widest uppercase shadow-2xl"
            >
              <Sparkles className="w-4 h-4" />
              Intelligence Exécutive
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15]"
            >
              L'information stratégique, <br className="hidden md:block" /> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500">
                directement à la source.
              </span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="text-lg text-slate-300 max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed"
            >
              Finance, Data, Entrepreneuriat. Chaque semaine, l'IA ORI analyse des milliers de sources pour ne te livrer que les insights qui propulseront ta carrière.
            </motion.p>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}
            className="w-full max-w-md relative z-10"
          >
            {/* Glowing border effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-br from-orange-500/50 via-indigo-500/30 to-orange-500/50 rounded-[2rem] blur-md opacity-50 animate-pulse" />
            
            <div className="bg-[#111827]/80 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-32 bg-orange-500/10 blur-[50px] rounded-full pointer-events-none" />
              
              {subscribed ? (
                <div className="py-8 flex flex-col items-center text-center space-y-4 relative z-10">
                  <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center shadow-inner border border-emerald-500/30">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                  </div>
                  <h3 className="text-2xl font-black text-white">Accès Premium Activé</h3>
                  <p className="text-slate-300 font-medium text-sm leading-relaxed">Ta sélection Executive Insights arrivera très bientôt sur l'adresse : <br/><span className="text-white font-bold">{email}</span></p>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="space-y-6 relative z-10">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Adresse E-mail</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <Input 
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="ugo.zanchi@hec.edu"
                        className="pl-12 bg-black/40 border-white/10 text-white placeholder:text-slate-600 focus-visible:ring-orange-500 focus-visible:border-orange-500 h-14 shadow-inner rounded-xl font-medium text-base transition-colors"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Fréquence des Insights</label>
                    <div className="flex gap-3">
                      <button 
                        type="button"
                        onClick={() => setFrequency('hebdo')}
                        className={cn(
                          "flex-1 py-3.5 rounded-xl text-sm font-bold transition-all border",
                          frequency === 'hebdo' 
                            ? "bg-gradient-to-b from-orange-500 to-orange-600 text-white border-orange-400 shadow-[0_0_20px_rgba(249,115,22,0.3)]" 
                            : "bg-white/5 text-slate-400 border-white/5 hover:bg-white/10 hover:text-white"
                        )}
                      >
                        Hebdomadaire
                      </button>
                      <button 
                        type="button"
                        onClick={() => setFrequency('mensuel')}
                        className={cn(
                          "flex-1 py-3.5 rounded-xl text-sm font-bold transition-all border",
                          frequency === 'mensuel' 
                            ? "bg-gradient-to-b from-orange-500 to-orange-600 text-white border-orange-400 shadow-[0_0_20px_rgba(249,115,22,0.3)]" 
                            : "bg-white/5 text-slate-400 border-white/5 hover:bg-white/10 hover:text-white"
                        )}
                      >
                        Mensuelle
                      </button>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-14 bg-white text-slate-900 hover:bg-slate-200 font-black rounded-xl shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all text-base hover:scale-[1.02] active:scale-[0.98] mt-2"
                    disabled={subscribing || !email}
                  >
                    {subscribing ? (
                      <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Activation...</>
                    ) : (
                      <><Send className="mr-2 h-5 w-5 text-orange-500" /> Déverrouiller les Insights</>
                    )}
                  </Button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Preview Section */}
      <section className="px-6 py-16 md:py-24 max-w-7xl mx-auto">
        <div className="mb-12 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Executive Selection</h2>
            <p className="text-slate-500 font-medium text-lg">Curated par l'IA d'Alberthon en fonction de tes performances quantitatives et entrepreneuriales.</p>
          </div>
          <Button 
            onClick={handleLoadMore}
            disabled={loadingMore}
            variant="outline" 
            className="rounded-full border-slate-200 text-slate-600 font-bold hover:bg-slate-100 flex items-center justify-center py-6 px-8 shadow-sm"
          >
            {loadingMore ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <BookOpen className="w-5 h-5 mr-2 text-orange-500" />}
            {loadingMore ? 'Chargement...' : "Voir plus d'articles"}
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            <AnimatePresence>
              {articles.map((article, i) => (
                <motion.div 
                  key={article.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (i % 4) * 0.1, duration: 0.5, type: "spring" }}
                  onClick={() => setSelectedArticle(article)}
                  className="group flex flex-col bg-white border border-slate-200/60 rounded-[2rem] overflow-hidden hover:border-orange-300 transition-all duration-300 hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] focus:outline-none cursor-pointer"
                >
                  {/* Image Card header */}
                  <div className="relative h-56 overflow-hidden bg-slate-100">
                    <div 
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
                      style={{ backgroundImage: `url(${article.image_url})` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1C] via-transparent to-transparent opacity-80" />
                    
                    {/* Topic Badge */}
                    <div className="absolute top-5 left-5 bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl shadow-sm">
                      <span className="text-xs font-black text-slate-900 tracking-wide uppercase">{article.topic}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-8 flex flex-col flex-1 relative bg-white">
                    <div className="flex items-center gap-2 mb-5 text-xs text-orange-600 font-bold bg-orange-50 w-fit px-3 py-1.5 rounded-lg border border-orange-100 uppercase tracking-widest">
                      {getTypeIcon(article.type)}
                      {article.type}
                    </div>
                    
                    <h3 className="text-xl font-black text-slate-900 leading-[1.3] mb-3 group-hover:text-orange-500 transition-colors line-clamp-3">
                      {article.title}
                    </h3>
                    
                    <p className="text-sm text-slate-500 line-clamp-3 mb-8 flex-1 font-medium leading-relaxed">
                      {article.summary}
                    </p>
                    
                    <div className="flex items-center justify-between mt-auto pt-5 border-t border-slate-100/80">
                      <span className="text-xs text-slate-400 font-black uppercase tracking-widest">
                        {new Date(article.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                      </span>
                      <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-orange-50 transition-colors">
                        <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-orange-500 transition-colors" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>

      {/* Article Reader Modal */}
      <AnimatePresence>
        {selectedArticle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-12">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setSelectedArticle(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm cursor-pointer"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-3xl max-h-full bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col z-10"
            >
              {/* Header Image */}
              <div className="relative h-64 shrink-0">
                <div 
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${selectedArticle.image_url})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                
                <Button 
                  onClick={() => setSelectedArticle(null)}
                  variant="ghost" 
                  size="icon" 
                  className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white rounded-full w-10 h-10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </Button>

                <div className="absolute bottom-6 left-6 right-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-3 py-1 bg-orange-500 text-white text-xs font-bold uppercase tracking-wider rounded-lg">
                      {selectedArticle.topic}
                    </span>
                    <span className="text-white/80 text-sm font-medium">
                      {new Date(selectedArticle.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                  <h2 className="text-3xl md:text-5xl font-black text-white leading-[1.1] drop-shadow-2xl">
                    {selectedArticle.title}
                  </h2>
                </div>
              </div>

              {/* Body Content */}
              <div className="p-6 md:p-10 overflow-y-auto custom-scrollbar flex-1 bg-slate-50">
                <div className="prose prose-slate max-w-none">
                  <p className="text-xl font-medium text-slate-600 leading-relaxed mb-8 border-l-4 border-orange-400 pl-6">
                    {selectedArticle.summary}
                  </p>
                  
                  <div className="space-y-6 text-slate-700 leading-relaxed text-lg font-serif">
                    <p>
                      Dans le cadre de l'évolution rapide des technologies (LLMs, RAG, Architectures distribuées) et des marchés financiers, la fusion entre l'ingénierie logicielle avancée et la vision stratégique devient l'atout numéro un des profils de demain.
                    </p>
                    <h3 className="text-2xl font-black text-slate-900 mt-10 mb-6 font-sans">L'Analyse Executive</h3>
                    <p>
                      D'après l'analyse de ton Persona cognitif (Pragmatisme élevé, forte capacité algorithmique), tu fais partie du décile supérieur capable d'allier exécution technique brute (modèle 42) et abstraction stratégique (modèle HEC/Mines). 
                    </p>
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200/60 rounded-3xl p-8 my-10 shadow-inner">
                      <h4 className="font-black text-orange-900 mb-3 flex items-center gap-2 font-sans text-xl">
                        <Sparkles className="w-6 h-6 text-orange-500" /> Le Conseil d'Alberthon
                      </h4>
                      <p className="text-orange-800 text-base font-sans font-medium leading-relaxed">
                        Le marché du Venture Capital recherche actuellement des profils capables d'auditer techniquement des startups DeepTech tout en comprenant les modèles de revenus. Positionne-toi sur le croisement Data/Finance lors des prochains événements de networking. Ta valeur ajoutée réside dans cette intersection rare.
                      </p>
                    </div>
                    <p>
                      Il est fortement recommandé de développer des projets open-source ou des white papers démontrant ta capacité à appliquer l'IA générative sur des datasets financiers réels pour attirer l'attention des fonds d'investissement dès ta sortie d'école.
                    </p>
                  </div>
                </div>
                
                <div className="mt-10 pt-6 border-t border-slate-200 flex justify-end">
                  <Button onClick={() => setSelectedArticle(null)} className="bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 px-8">
                    Fermer l'article
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

// Quick fallback for UserIcon since we aliased it awkwardly above or missed importing it. It's just 'User' in lucide-react.
const UserIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);
