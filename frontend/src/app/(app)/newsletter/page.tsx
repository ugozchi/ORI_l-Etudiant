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
      <section className="relative px-6 py-16 md:py-24 border-b border-slate-200 overflow-hidden bg-white">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 via-white to-orange-100/30" />
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-96 h-96 bg-orange-400/10 blur-[100px] rounded-full" />
        
        <div className="relative max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 text-center md:text-left space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-orange-50 border border-orange-200 rounded-full text-orange-600 text-sm font-bold shadow-sm">
              <Sparkles className="w-4 h-4" />
              Intelligence Artificielle
            </div>
            
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              L'orientation qui vient <br className="hidden md:block" /> 
              <span className="text-orange-500">
                directement à toi.
              </span>
            </h1>
            
            <p className="text-lg text-slate-600 max-w-xl mx-auto md:mx-0 font-medium leading-relaxed">
              Chaque semaine, reçois une sélection d'articles, vidéos et opportunités choisis par ORI uniquement pour ton profil.
            </p>
          </div>

          <div className="w-full max-w-md">
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-orange-500" />
              
              {subscribed ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-8 flex flex-col items-center text-center space-y-4"
                >
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center shadow-sm">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Inscription Réussie !</h3>
                  <p className="text-slate-500 text-sm font-medium">Tu recevras ta première newsletter sur {email} très bientôt.</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubscribe} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-900">Mon e-mail</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                      <Input 
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="etudiant@ecole.com"
                        className="pl-12 bg-slate-50 border-slate-200 text-slate-900 focus-visible:ring-orange-500 focus-visible:border-orange-500 h-12 shadow-sm rounded-xl font-medium"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-900">Fréquence</label>
                    <div className="flex gap-3">
                      <button 
                        type="button"
                        onClick={() => setFrequency('hebdo')}
                        className={cn(
                          "flex-1 py-3 rounded-xl text-sm font-bold transition-all border-2",
                          frequency === 'hebdo' 
                            ? "bg-orange-50 text-orange-700 border-orange-500 shadow-sm" 
                            : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                        )}
                      >
                        Hebdomadaire
                      </button>
                      <button 
                        type="button"
                        onClick={() => setFrequency('mensuel')}
                        className={cn(
                          "flex-1 py-3 rounded-xl text-sm font-bold transition-all border-2",
                          frequency === 'mensuel' 
                            ? "bg-orange-50 text-orange-700 border-orange-500 shadow-sm" 
                            : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                        )}
                      >
                        Mensuelle
                      </button>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-md transition-all text-base"
                    disabled={subscribing || !email}
                  >
                    {subscribing ? (
                      <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Inscription...</>
                    ) : (
                      <><Send className="mr-2 h-5 w-5" /> M'abonner</>
                    )}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Preview Section */}
      <section className="px-6 py-12 md:py-20 max-w-6xl mx-auto">
        <div className="mb-10 text-center md:text-left">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Un aperçu de ce qui t'attend</h2>
          <p className="text-slate-500 font-medium">Ces contenus ont été sélectionnés par ORI basé sur tes affinités actuelles.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {articles.map((article, i) => (
              <motion.a 
                href={article.url}
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group flex flex-col bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-orange-300 transition-all hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm"
              >
                {/* Image Card header */}
                <div className="relative h-48 overflow-hidden bg-slate-100">
                  <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                    style={{ backgroundImage: `url(${article.image_url})` }}
                  />
                  
                  {/* Topic Badge */}
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-sm">
                    <span className="text-xs font-bold text-slate-900 tracking-wide uppercase">{article.topic}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-4 text-xs text-orange-700 font-bold bg-orange-50 w-fit px-2.5 py-1 rounded-md border border-orange-200 uppercase tracking-wider">
                    {getTypeIcon(article.type)}
                    {article.type}
                  </div>
                  
                  <h3 className="text-lg font-bold text-slate-900 leading-tight mb-3 group-hover:text-orange-600 transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  
                  <p className="text-sm text-slate-600 line-clamp-3 mb-6 flex-1 font-medium leading-relaxed">
                    {article.summary}
                  </p>
                  
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                    <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                      {new Date(article.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                    </span>
                    <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-orange-500 transition-colors" />
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
