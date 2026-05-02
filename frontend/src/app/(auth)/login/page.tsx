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
    <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
      <div className="w-full max-w-sm space-y-8 bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center font-black text-white text-xl mb-4 shadow-lg shadow-orange-500/20">
            O
          </div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">Rebonjour</h2>
          <p className="text-sm text-slate-500 mt-2 font-medium">Connecte-toi à ton espace ORI</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-700 font-bold text-xs uppercase tracking-wider">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-orange-500 h-11 rounded-xl"
              placeholder="votre@email.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-slate-700 font-bold text-xs uppercase tracking-wider">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-slate-50 border-slate-200 text-slate-900 focus-visible:ring-orange-500 h-11 rounded-xl"
            />
          </div>
          
          {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
          
          <Button type="submit" className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold shadow-lg shadow-orange-500/20" disabled={loading}>
            {loading ? 'Connexion en cours...' : 'Se connecter'}
          </Button>
        </form>

        <div className="text-center text-sm text-slate-500">
          Pas encore de compte ?{' '}
          <Link href="/signup" className="text-orange-500 hover:text-orange-600 font-bold">
            S'inscrire
          </Link>
        </div>
      </div>
    </div>
  );
}
