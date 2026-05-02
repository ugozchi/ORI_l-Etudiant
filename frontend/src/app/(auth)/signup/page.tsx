'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { GraduationCap, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const LEVELS = ['Seconde', 'Première', 'Terminale', 'Bac+1', 'Bac+2', 'Bac+3', 'Bac+4', 'Bac+5'];

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState('');
  const [level, setLevel] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback`,
        data: {
          first_name: firstName,
          last_name: lastName,
          age: parseInt(age),
          level,
        },
      },
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
      <div className="w-full max-w-md space-y-6 bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center font-black text-white text-xl mb-4 shadow-lg shadow-orange-500/20">
            O
          </div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">Rejoindre ORI</h2>
          <p className="text-sm text-slate-500 mt-2 font-medium">Crée ton compte pour commencer ton orientation</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2">
          <div className={cn("w-8 h-1.5 rounded-full transition-colors", step >= 1 ? "bg-orange-500" : "bg-slate-200")} />
          <div className={cn("w-8 h-1.5 rounded-full transition-colors", step >= 2 ? "bg-orange-500" : "bg-slate-200")} />
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          {step === 1 && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-slate-700 font-bold text-xs uppercase tracking-wider">Prénom</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="bg-slate-50 border-slate-200 text-slate-900 h-11 rounded-xl focus-visible:ring-orange-500"
                    placeholder="Alex"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-slate-700 font-bold text-xs uppercase tracking-wider">Nom</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="bg-slate-50 border-slate-200 text-slate-900 h-11 rounded-xl focus-visible:ring-orange-500"
                    placeholder="Dupont"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="age" className="text-slate-700 font-bold text-xs uppercase tracking-wider">Âge</Label>
                <Input
                  id="age"
                  type="number"
                  min={14}
                  max={30}
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  required
                  className="bg-slate-50 border-slate-200 text-slate-900 h-11 rounded-xl focus-visible:ring-orange-500"
                  placeholder="17"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700 font-bold text-xs uppercase tracking-wider">Niveau d'études</Label>
                <div className="flex flex-wrap gap-2">
                  {LEVELS.map(l => (
                    <button
                      type="button"
                      key={l}
                      onClick={() => setLevel(l)}
                      className={cn(
                        "px-3 py-2 rounded-xl text-sm border transition-all font-bold",
                        level === l
                          ? "bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-500/20"
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      )}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                type="button"
                onClick={() => setStep(2)}
                disabled={!firstName || !lastName || !age || !level}
                className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold shadow-md gap-2"
              >
                Continuer <ChevronRight className="w-4 h-4" />
              </Button>
            </>
          )}

          {step === 2 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700 font-bold text-xs uppercase tracking-wider">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-slate-50 border-slate-200 text-slate-900 h-11 rounded-xl focus-visible:ring-orange-500"
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
                  minLength={6}
                  className="bg-slate-50 border-slate-200 text-slate-900 h-11 rounded-xl focus-visible:ring-orange-500"
                />
              </div>

              {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setStep(1)} className="h-12 rounded-xl font-bold border-slate-200 text-slate-600">
                  Retour
                </Button>
                <Button type="submit" className="flex-1 h-12 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold shadow-lg shadow-orange-500/20" disabled={loading}>
                  {loading ? 'Inscription...' : "Créer mon compte"}
                </Button>
              </div>
            </>
          )}
        </form>

        <div className="text-center text-sm text-slate-500">
          Déjà un compte ?{' '}
          <Link href="/login" className="text-orange-500 hover:text-orange-600 font-bold">
            Se connecter
          </Link>
        </div>
      </div>
    </div>
  );
}
