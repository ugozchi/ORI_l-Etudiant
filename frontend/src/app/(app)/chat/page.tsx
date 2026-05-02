'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { Send, User, Bot, Loader2, PlusCircle, MessageSquare, PanelLeftClose, PanelLeftOpen, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { createClient } from '@/utils/supabase/client';
import { cn } from '@/lib/utils';
import { useProfile } from '@/contexts/ProfileContext';
import Link from 'next/link';
import { motion } from 'framer-motion';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  thread_id?: string;
  created_at?: string;
};

type Thread = {
  id: string;
  title: string;
  updatedAt: number;
};

export default function ChatPage() {
  const [allMessages, setAllMessages] = useState<Message[]>([]);
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { isProfileComplete } = useProfile();
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [allMessages, currentThreadId, loading]);

  useEffect(() => {
    const fetchMessages = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      setUserId(session.user.id);

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.warn('Erreur lors de la récupération des messages:', error);
      }

      if (data && data.length > 0) {
        const history: Message[] = data.map((msg) => ({
          id: msg.id,
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
          thread_id: msg.thread_id,
          created_at: msg.created_at
        }));
        setAllMessages(history);
        
        // Find most recent thread_id or create new
        const sorted = [...history].sort((a, b) => 
          new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
        );
        const lastThreadId = sorted[0].thread_id || session.user.id;
        setCurrentThreadId(lastThreadId);
      } else {
        // No messages, start fresh thread
        handleNewChat();
      }
    };

    fetchMessages();
  }, [supabase]);

  const threads = useMemo(() => {
    if (!userId) return [];
    const threadsMap = new Map<string, Thread>();
    const legacyThreadId = userId;

    allMessages.forEach(msg => {
      const tId = msg.thread_id || legacyThreadId;
      if (!threadsMap.has(tId)) {
         threadsMap.set(tId, { 
           id: tId, 
           title: msg.role === 'user' ? msg.content.substring(0, 30) + '...' : 'Nouvelle conversation', 
           updatedAt: new Date(msg.created_at || Date.now()).getTime() 
         });
      } else {
         const t = threadsMap.get(tId)!;
         if (msg.role === 'user' && t.title === 'Nouvelle conversation') {
            t.title = msg.content.substring(0, 30) + '...';
         }
         t.updatedAt = new Date(msg.created_at || Date.now()).getTime();
      }
    });

    return Array.from(threadsMap.values()).sort((a, b) => b.updatedAt - a.updatedAt);
  }, [allMessages, userId]);

  const currentMessages = useMemo(() => {
    if (!currentThreadId || !userId) return [];
    
    const msgs = allMessages.filter(m => (m.thread_id || userId) === currentThreadId);
    
    if (msgs.length === 0) {
      const welcomeContent = !isProfileComplete
        ? "Salut ! 👋 Je suis **ORI**, ton conseiller d'orientation propulsé par l'IA.\n\nAvant de commencer, j'ai besoin de mieux te connaître. Tu peux :\n\n**→ Compléter ton profil** pour que je puisse te faire des recommandations personnalisées\n\n**→ Ou me poser directement une question** sur ton orientation !"
        : "Rebonjour ! 👋 Je suis ORI, ton conseiller d'orientation. Comment puis-je t'aider aujourd'hui ?";
      
      return [{
        id: 'welcome',
        role: 'assistant',
        content: welcomeContent,
        isWelcome: true,
      } as Message & { isWelcome?: boolean }];
    }
    return msgs;
  }, [allMessages, currentThreadId, userId, isProfileComplete]);

  const handleNewChat = () => {
    if (loading) return;
    const newId = crypto.randomUUID();
    setCurrentThreadId(newId);
    // On mobile, auto close sidebar when composing a new chat
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const handleSelectThread = (threadId: string) => {
    setCurrentThreadId(threadId);
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading || !userId) return;

    const userMsg = input.trim();
    setInput('');
    
    // Default backward compatibility if thread is somehow unassigned
    const activeThreadId = currentThreadId || userId;

    const newLocalMsg: Message = { 
      id: Date.now().toString(), 
      role: 'user', 
      content: userMsg, 
      thread_id: activeThreadId,
      created_at: new Date().toISOString()
    };
    
    setAllMessages(prev => [...prev, newLocalMsg]);
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) throw new Error('Non authentifié');

      supabase.from('messages').insert([
        { user_id: userId, role: 'user', content: userMsg, thread_id: activeThreadId !== userId ? activeThreadId : null }
      ]).then(({ error }) => {
        if (error) console.warn("Erreur sauvegarde user:", error);
      });

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: userMsg,
          thread_id: activeThreadId
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error('Erreur API ORI: ' + errorText);
      }

      const data = await response.json();
      
      const assistantMsg: Message = {
         id: Date.now().toString() + 'bot',
         role: 'assistant',
         content: data.response,
         thread_id: activeThreadId,
         created_at: new Date().toISOString()
      };

      supabase.from('messages').insert([
        { user_id: userId, role: 'assistant', content: data.response, thread_id: activeThreadId !== userId ? activeThreadId : null }
      ]).then(({ error }) => {
        if (error) console.warn("Erreur sauvegarde assistant:", error);
      });

      setAllMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      console.error(error);
      setAllMessages(prev => [
        ...prev,
        { id: Date.now().toString() + 'err', role: 'assistant', content: 'Désolé, une erreur est survenue.', thread_id: activeThreadId }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full bg-slate-50 overflow-hidden">
      
      {/* Sidebar for Threads */}
      <div className={cn(
        "bg-white border-r border-slate-200 hidden md:flex flex-col transition-all duration-300 relative",
        isSidebarOpen ? "w-64" : "w-0 border-r-0 opacity-0 overflow-hidden"
      )}>
        <div className="p-4 pt-6 flex items-center justify-between">
          <Button 
            onClick={handleNewChat}
            className="flex-1 bg-orange-500 hover:bg-orange-600 rounded-xl flex items-center justify-center gap-2 text-white font-medium shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            Nouveau
          </Button>
        </div>
        <ScrollArea className="flex-1 px-2">
          <div className="space-y-1 pb-4">
            {threads.map((thread) => (
              <button
                key={thread.id}
                onClick={() => handleSelectThread(thread.id)}
                className={cn(
                  "w-full text-left px-3 py-3 rounded-xl text-sm flex items-center gap-3 transition-colors",
                  currentThreadId === thread.id 
                    ? "bg-slate-100 text-slate-900 font-medium" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <MessageSquare className="w-4 h-4 shrink-0" />
                <span className="truncate">{thread.title}</span>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative h-full min-w-0">
        
        {/* Toggle Button Container for Top Left of Chat Area */}
        <div className="absolute top-4 left-4 z-10 hidden md:block">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-slate-500 hover:text-slate-900 bg-white border border-slate-200 shadow-sm rounded-xl h-10 w-10 flex items-center justify-center"
            title={isSidebarOpen ? "Masquer l'historique" : "Afficher l'historique"}
          >
             {isSidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeftOpen className="w-5 h-5" />}
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 pt-16 md:pt-8" ref={scrollRef}>
          <div className="max-w-3xl mx-auto space-y-8 pb-36">
            {currentMessages.map((msg: any) => (
              <div
                key={msg.id}
                className={cn(
                  "flex gap-4 group",
                  msg.role === 'user' ? "flex-row-reverse" : "flex-row"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-md",
                  msg.role === 'user' 
                    ? "bg-gradient-to-br from-orange-400 to-orange-600 ml-2" 
                    : "bg-slate-900 mr-2"
                )}>
                  {msg.role === 'user' ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
                </div>
                
                <div className="flex flex-col gap-3 max-w-[80%]">
                  <div className={cn(
                    "py-3.5 px-5 rounded-3xl shadow-sm relative group-hover:shadow-md transition-shadow",
                    msg.role === 'user' 
                      ? "bg-orange-500 text-white rounded-tr-sm" 
                      : "bg-white border border-slate-100 text-slate-800 rounded-tl-sm"
                  )}>
                    <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{msg.content}</p>
                  </div>

                  {/* CTA Buttons for welcome message when profile is incomplete */}
                  {msg.isWelcome && !isProfileComplete && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="flex flex-col sm:flex-row gap-2"
                    >
                      <Link href="/profil">
                        <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold h-11 px-5 shadow-md shadow-orange-500/20 gap-2 text-sm">
                          <Sparkles className="w-4 h-4" />
                          Compléter mon profil
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </Link>
                    </motion.div>
                  )}
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-900 mr-2 flex items-center justify-center shrink-0 shadow-md">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="py-3 px-5 rounded-3xl max-w-[80%] bg-white border border-slate-100 rounded-tl-sm flex items-center gap-3 shadow-sm">
                  <div className="flex space-x-1.5">
                    <div className="w-2 h-2 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 pt-20 pb-8 px-4 md:px-8 pointer-events-none bg-gradient-to-t from-slate-50 via-slate-50/90 to-transparent">
          <div className="max-w-3xl mx-auto pointer-events-auto">
            <form 
              onSubmit={handleSubmit}
              className="relative flex items-center bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-full overflow-hidden focus-within:ring-4 focus-within:ring-orange-500/20 focus-within:border-orange-500 shadow-lg transition-all"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Posez-moi une question sur votre orientation..."
                className="flex-1 bg-transparent border-0 focus-visible:ring-0 text-slate-900 placeholder:text-slate-400 py-6 pl-6 pr-16 h-16 text-[15px] font-medium"
                disabled={loading}
              />
              <Button 
                type="submit" 
                size="icon"
                disabled={!input.trim() || loading}
                className="absolute right-2 h-12 w-12 bg-orange-500 hover:bg-orange-600 rounded-full disabled:opacity-50 transition-colors shadow-md flex items-center justify-center"
              >
                <Send className="h-5 w-5 text-white" />
              </Button>
            </form>
            <div className="text-center mt-4">
              <span className="text-xs font-medium text-slate-400">ORI peut se tromper. Vérifiez les informations importantes.</span>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
}
