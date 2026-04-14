'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { createClient } from '@/utils/supabase/client';
import { cn } from '@/lib/utils';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Bonjour ! Je suis ORI, ton conseiller d\'orientation propulsé par l\'IA. Comment puis-je t\'aider aujourd\'hui ?'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    const newMessages = [...messages, { id: Date.now().toString(), role: 'user' as const, content: userMsg }];
    setMessages(newMessages);
    setLoading(true);

    try {
      // Récupération de la session pour obtenir le token JWT Supabase
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const user = session?.user;

      if (!token || !user) {
        throw new Error('Non authentifié');
      }

      // Appel de l'API Vertex via le backend FastAPI
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: userMsg,
          thread_id: user.id // On lie le thread à l'ID de l'utilisateur Supabase
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la communication avec l\'API ORI');
      }

      const data = await response.json();
      
      setMessages((prev: Message[]) => [
        ...prev,
        { id: Date.now().toString(), role: 'assistant', content: data.response }
      ]);
    } catch (error: any) {
      console.error(error);
      setMessages((prev: Message[]) => [
        ...prev,
        { id: Date.now().toString(), role: 'assistant', content: 'Désolé, une erreur est survenue lors de la communication de votre message.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0A0A0A] relative">
      <ScrollArea className="flex-1 p-4 md:p-8" ref={scrollRef}>
        <div className="max-w-3xl mx-auto space-y-6 pb-24">
          {messages.map((msg: Message) => (
            <div
              key={msg.id}
              className={cn(
                "flex gap-4",
                msg.role === 'user' ? "flex-row-reverse" : "flex-row"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                msg.role === 'user' 
                  ? "bg-indigo-600 ml-4" 
                  : "bg-gradient-to-tr from-indigo-500 to-purple-500 mr-4"
              )}>
                {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
              </div>
              
              <div className={cn(
                "py-3 px-4 rounded-2xl max-w-[80%]",
                msg.role === 'user' 
                  ? "bg-indigo-600 text-white rounded-tr-sm" 
                  : "bg-[#1A1A1A] border border-[#2C2C2C] text-zinc-200 rounded-tl-sm"
              )}>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 mr-4 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="py-3 px-4 rounded-2xl max-w-[80%] bg-[#1A1A1A] border border-[#2C2C2C] rounded-tl-sm flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                <span className="text-sm text-zinc-400">ORI est en train d'écrire...</span>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A] to-transparent pt-6 pb-6 px-4 md:px-8">
        <div className="max-w-3xl mx-auto">
          <form 
            onSubmit={handleSubmit}
            className="relative flex items-center bg-[#1A1A1A] border border-[#2C2C2C] rounded-2xl overflow-hidden focus-within:ring-1 focus-within:ring-indigo-500 shadow-2xl transition-all"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Posez-moi une question sur votre orientation..."
              className="flex-1 bg-transparent border-0 focus-visible:ring-0 text-white placeholder:text-zinc-500 py-6 pl-4 pr-16 h-14"
              disabled={loading}
            />
            <Button 
              type="submit" 
              size="icon"
              disabled={!input.trim() || loading}
              className="absolute right-2 h-10 w-10 bg-indigo-600 hover:bg-indigo-500 rounded-xl disabled:opacity-50"
            >
              <Send className="h-4 w-4 text-white" />
            </Button>
          </form>
          <div className="text-center mt-3">
            <span className="text-xs text-zinc-500">ORI peut se tromper. Vérifiez les informations importantes.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
