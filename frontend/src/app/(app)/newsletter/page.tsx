'use client';

import { useState, useEffect } from 'react';
import { Mail, Loader2, Sparkles, Send, CheckCircle2, Video, FileText, Compass, ExternalLink, X, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/utils/supabase/client';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

type Article = {
  id: string;
  title: string;
  summary: string;
  topic: string;
  date: string;
  url: string;
  type: 'Article' | 'Vidéo' | 'Témoignage' | 'Guide';
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

  useEffect(() => {
    const fetchPreview = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const id = session?.user?.id || 'demo-user';
        setUserId(id);
        if (session?.user?.email) setEmail(session.user.email);

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/newsletter/preview/${id}`);
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/newsletter/subscribe`, {
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
          title: "Les métiers de l'IA en 2026 : Au-delà de la hype",
          summary: "Découvre les vraies opportunités de carrière dans l'Intelligence Artificielle et le Machine Learning pour les jeunes diplômés.",
          topic: "Tech & Futur",
          date: new Date().toISOString(),
          url: "#",
          type: "Article",
          image_url: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=800&auto=format&fit=crop"
        },
        {
          id: `new-${Date.now()}-2`,
          title: "Témoignage : Mon année de césure humanitaire au Pérou",
          summary: "Comment une césure m'a permis de me recentrer et de trouver ma voie d'ingénieur éco-responsable.",
          topic: "Soft Skills",
          date: new Date().toISOString(),
          url: "#",
          type: "Témoignage",
          image_url: "https://images.unsplash.com/photo-1526976663186-ea62c961e6c3?q=80&w=800&auto=format&fit=crop"
        },
        {
          id: `new-${Date.now()}-3`,
          title: "Le Guide Ultime des Concours Post-Bac",
          summary: "Tout ce qu'il faut savoir pour réussir les concours Avenir, Puissance Alpha et Advance.",
          topic: "Préparation",
          date: new Date().toISOString(),
          url: "#",
          type: "Guide",
          image_url: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=800&auto=format&fit=crop"
        },
        {
          id: `new-${Date.now()}-4`,
          title: "Pourquoi l'intelligence émotionnelle est le skill #1",
          summary: "Les recruteurs recherchent de plus en plus de soft skills. Apprends à cultiver ton intelligence émotionnelle.",
          topic: "Carrière",
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
    <div className="min-h-full bg-slate-50 overflow-y-auto">
      
      {/* Heroic Subscription Banner */}
      <section className="relative px-6 py-20 md:py-32 border-b border-slate-200 overflow-hidden bg-slate-900">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5" />
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[600px] h-[600px] bg-orange-500/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[500px] h-[500px] bg-blue-500/20 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="relative max-w-5xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          <div className="flex-1 text-center lg:text-left space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-orange-400 text-xs font-bold tracking-wider uppercase shadow-xl">
              <Sparkles className="w-4 h-4" />
              Intelligence Artificielle
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
              L'orientation qui vient <br className="hidden md:block" /> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">
                directement à toi.
              </span>
            </h1>
            
            <p className="text-lg text-slate-300 max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed">
              Chaque semaine, reçois une sélection d'articles, vidéos et opportunités choisis par ORI uniquement pour ton profil.
            </p>
          </div>

          <div className="w-full max-w-md relative z-10">
            {/* Glowing border effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-orange-300 rounded-[2rem] blur opacity-30 animate-pulse" />
            
            <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
              {subscribed ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-8 flex flex-col items-center text-center space-y-4"
                >
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center shadow-sm border border-green-500/30">
                    <CheckCircle2 className="w-8 h-8 text-green-400" />
                  </div>
                  <h3 className="text-2xl font-black text-white">Inscription Réussie !</h3>
                  <p className="text-slate-300 font-medium">Tu recevras ta première newsletter sur {email} très bientôt.</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubscribe} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-white uppercase tracking-wider">Mon e-mail</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
                      <Input 
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="etudiant@ecole.com"
                        className="pl-12 bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus-visible:ring-orange-500 focus-visible:border-orange-500 h-14 shadow-inner rounded-xl font-medium text-base transition-colors"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-white uppercase tracking-wider">Fréquence</label>
                    <div className="flex gap-3">
                      <button 
                        type="button"
                        onClick={() => setFrequency('hebdo')}
                        className={cn(
                          "flex-1 py-3.5 rounded-xl text-sm font-bold transition-all border-2",
                          frequency === 'hebdo' 
                            ? "bg-orange-500 text-white border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.3)]" 
                            : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10"
                        )}
                      >
                        Hebdomadaire
                      </button>
                      <button 
                        type="button"
                        onClick={() => setFrequency('mensuel')}
                        className={cn(
                          "flex-1 py-3.5 rounded-xl text-sm font-bold transition-all border-2",
                          frequency === 'mensuel' 
                            ? "bg-orange-500 text-white border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.3)]" 
                            : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10"
                        )}
                      >
                        Mensuelle
                      </button>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-14 bg-white text-slate-900 hover:bg-slate-100 font-black rounded-xl shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all text-base hover:scale-[1.02] active:scale-[0.98]"
                    disabled={subscribing || !email}
                  >
                    {subscribing ? (
                      <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Inscription...</>
                    ) : (
                      <><Send className="mr-2 h-5 w-5 text-orange-500" /> S'abonner maintenant</>
                    )}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Preview Section */}
      <section className="px-6 py-16 md:py-24 max-w-7xl mx-auto">
        <div className="mb-12 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Un aperçu pour toi</h2>
            <p className="text-slate-500 font-medium text-lg">Ces contenus ont été sélectionnés par ORI basé sur tes affinités actuelles.</p>
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
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110"
                      style={{ backgroundImage: `url(${article.image_url})` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
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
                    
                    <h3 className="text-xl font-black text-slate-900 leading-tight mb-3 group-hover:text-orange-500 transition-colors line-clamp-2">
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
                  <h2 className="text-2xl md:text-4xl font-black text-white leading-tight drop-shadow-md">
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
                  
                  {/* Faux contenu généré pour la démo */}
                  <div className="space-y-6 text-slate-700 leading-relaxed">
                    <p>
                      Dans le cadre de l'évolution rapide des technologies et des méthodes de travail, ce sujet devient central pour les étudiants d'aujourd'hui. Les attentes des entreprises se transforment, et la maîtrise de ces concepts clés est devenue un atout majeur pour se démarquer.
                    </p>
                    <h3 className="text-xl font-bold text-slate-900 mt-8 mb-4">Pourquoi c'est important pour ton profil ?</h3>
                    <p>
                      D'après l'analyse de ton Persona par l'IA d'ORI, tu as un profil très orienté vers la résolution de problèmes complexes. T'intéresser à cette thématique te permettra non seulement d'élargir ta vision globale du marché, mais aussi de connecter tes compétences techniques avec de réels besoins sociétaux.
                    </p>
                    <div className="bg-orange-50 border border-orange-100 rounded-2xl p-6 my-8">
                      <h4 className="font-bold text-orange-900 mb-2 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-orange-500" /> Conseil de l'IA ORI
                      </h4>
                      <p className="text-orange-800 text-sm">
                        Garde un œil sur les écoles spécialisées dans ce domaine. Nous avons noté une augmentation de 40% des recrutements à la sortie de ces cursus l'année dernière. Pense à en parler lors des prochains salons de l'Étudiant.
                      </p>
                    </div>
                    <p>
                      Les prochaines étapes pour toi consisteraient à approfondir ce sujet via des projets associatifs ou des MOOCs. Cela renforcera considérablement ton dossier lors de tes vœux d'orientation ou de tes recherches de stages.
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
