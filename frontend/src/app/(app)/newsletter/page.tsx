'use client';

import { useState, useEffect } from 'react';
import { Mail, Loader2, Sparkles, Send, CheckCircle2, Video, FileText, Compass, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/utils/supabase/client';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

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
          <Button variant="outline" className="rounded-full border-slate-200 text-slate-600 font-bold hover:bg-slate-100 hidden md:flex">
            Voir plus d'articles
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {articles.map((article, i) => (
              <motion.a 
                href={article.url}
                key={article.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5, type: "spring" }}
                className="group flex flex-col bg-white border border-slate-200/60 rounded-[2rem] overflow-hidden hover:border-orange-300 transition-all duration-300 hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] focus:outline-none focus:ring-4 focus:ring-orange-500/20"
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
              </motion.a>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}

// Quick fallback for UserIcon since we aliased it awkwardly above or missed importing it. It's just 'User' in lucide-react.
const UserIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);
