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
    <div className="min-h-full bg-[#0A0A0A] overflow-y-auto">
      
      {/* Heroic Subscription Banner */}
      <section className="relative px-6 py-16 md:py-24 border-b border-[#2C2C2C] overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-[#0A0A0A] to-purple-900/20" />
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-96 h-96 bg-indigo-500/10 blur-[100px] rounded-full" />
        
        <div className="relative max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 text-center md:text-left space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-300 text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              Intelligence Artificielle
            </div>
            
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
              L'orientation qui vient <br className="hidden md:block" /> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                directement à toi.
              </span>
            </h1>
            
            <p className="text-lg text-zinc-400 max-w-xl mx-auto md:mx-0">
              Chaque semaine, reçois une sélection d'articles, vidéos et opportunités choisis par ORI uniquement pour ton profil.
            </p>
          </div>

          <div className="w-full max-w-md">
            <div className="bg-[#121212] border border-[#2C2C2C] rounded-2xl p-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
              
              {subscribed ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-8 flex flex-col items-center text-center space-y-4"
                >
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-green-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Inscription Réussie !</h3>
                  <p className="text-zinc-400 text-sm">Tu recevras ta première newsletter sur {email} très bientôt.</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubscribe} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-zinc-300">Mon e-mail</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-5 w-5 text-zinc-500" />
                      <Input 
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="etudiant@ecole.com"
                        className="pl-10 bg-[#1A1A1A] border-[#2C2C2C] text-white focus-visible:ring-indigo-500 h-11"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-zinc-300">Fréquence</label>
                    <div className="flex gap-2">
                      <button 
                        type="button"
                        onClick={() => setFrequency('hebdo')}
                        className={cn(
                          "flex-1 py-2.5 rounded-xl text-sm font-medium transition-all",
                          frequency === 'hebdo' 
                            ? "bg-indigo-600 text-white border border-indigo-500 shadow-md" 
                            : "bg-[#1A1A1A] text-zinc-400 border border-[#2C2C2C] hover:bg-[#222222]"
                        )}
                      >
                        Hebdomadaire
                      </button>
                      <button 
                        type="button"
                        onClick={() => setFrequency('mensuel')}
                        className={cn(
                          "flex-1 py-2.5 rounded-xl text-sm font-medium transition-all",
                          frequency === 'mensuel' 
                            ? "bg-purple-600 text-white border border-purple-500 shadow-md" 
                            : "bg-[#1A1A1A] text-zinc-400 border border-[#2C2C2C] hover:bg-[#222222]"
                        )}
                      >
                        Mensuelle
                      </button>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-11 bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 text-white font-semibold rounded-xl"
                    disabled={subscribing || !email}
                  >
                    {subscribing ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Inscription...</>
                    ) : (
                      <><Send className="mr-2 h-4 w-4" /> M'abonner</>
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
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-white mb-2">Un aperçu de ce qui t'attend</h2>
          <p className="text-zinc-400">Ces contenus ont été sélectionnés par ORI basé sur tes affinités actuelles.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {articles.map((article, i) => (
              <motion.a 
                href={article.url}
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group flex flex-col bg-[#121212] border border-[#2C2C2C] rounded-2xl overflow-hidden hover:border-indigo-500/50 transition-all hover:shadow-[0_0_30px_rgba(99,102,241,0.15)] focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {/* Image Card header */}
                <div className="relative h-40 overflow-hidden bg-[#1A1A1A]">
                  <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                    style={{ backgroundImage: `url(${article.image_url})` }}
                  />
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#121212] to-transparent" />
                  
                  {/* Topic Badge */}
                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10">
                    <span className="text-xs font-semibold text-white tracking-wide">{article.topic}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-3 text-xs text-indigo-400 font-medium bg-indigo-500/10 w-fit px-2 py-0.5 rounded border border-indigo-500/20">
                    {getTypeIcon(article.type)}
                    {article.type}
                  </div>
                  
                  <h3 className="text-lg font-bold text-zinc-100 leading-tight mb-2 group-hover:text-indigo-400 transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  
                  <p className="text-sm text-zinc-400 line-clamp-3 mb-4 flex-1">
                    {article.summary}
                  </p>
                  
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-[#2C2C2C]">
                    <span className="text-xs text-zinc-500 font-medium">
                      {new Date(article.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                    </span>
                    <ExternalLink className="w-4 h-4 text-zinc-500 group-hover:text-indigo-400 transition-colors" />
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
