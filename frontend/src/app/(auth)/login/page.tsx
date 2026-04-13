'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/chat');
      router.refresh();
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0A0A0A] p-4">
      <div className="w-full max-w-sm space-y-8 bg-[#121212] p-8 rounded-2xl border border-[#2C2C2C] shadow-xl">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white text-xl mb-4 shadow-lg">
            O
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Rebonjour</h2>
          <p className="text-sm text-zinc-400 mt-2">Connectez-vous à l'espace ORI</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-zinc-300">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-[#1A1A1A] border-[#3C3C3C] text-white placeholder:text-zinc-500 focus-visible:ring-indigo-500"
              placeholder="votre@email.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-zinc-300">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-[#1A1A1A] border-[#3C3C3C] text-white focus-visible:ring-indigo-500"
            />
          </div>
          
          {error && <p className="text-red-400 text-sm font-medium">{error}</p>}
          
          <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" disabled={loading}>
            {loading ? 'Connexion en cours...' : 'Se connecter'}
          </Button>
        </form>

        <div className="text-center text-sm text-zinc-400">
          Pas encore de compte ?{' '}
          <Link href="/signup" className="text-indigo-400 hover:text-indigo-300 font-medium">
            S'inscrire
          </Link>
        </div>
      </div>
    </div>
  );
}
