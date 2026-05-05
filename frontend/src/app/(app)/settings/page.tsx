'use client';

import { useState, useEffect } from 'react';
import { Settings, User, Bell, Shield, CreditCard, LogOut, ChevronRight, Sliders, ArrowLeft, Loader2, CheckCircle2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/utils/supabase/client';
import { useProfile } from '@/contexts/ProfileContext';

type View = 'menu' | 'profile' | 'security' | 'notifications' | 'billing';

export default function SettingsPage() {
  const [view, setView] = useState<View>('menu');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { profileData, refreshProfile } = useProfile();
  const supabase = createClient();

  // Profile Form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  // Security Form
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (profileData) {
      setName(profileData.name || '');
      setEmail(profileData.email || '');
    }
  }, [profileData]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile/${session?.user?.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (res.ok) {
        await refreshProfile();
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("Les mots de passe ne correspondent pas.");
      return;
    }
    setLoading(true);
    setSuccess(false);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (!error) {
        setSuccess(true);
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setSuccess(false), 3000);
      } else {
        alert(error.message);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const renderHeader = (title: string) => (
    <div className="flex items-center gap-4 mb-8">
      <Button variant="ghost" size="icon" onClick={() => setView('menu')} className="rounded-xl hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200">
        <ArrowLeft className="w-5 h-5 text-slate-600" />
      </Button>
      <h2 className="text-2xl font-black text-slate-900 tracking-tight">{title}</h2>
    </div>
  );

  return (
    <div className="min-h-full bg-slate-50 p-4 md:p-8 overflow-y-auto">
      <div className="max-w-3xl mx-auto">
        <AnimatePresence mode="wait">
          
          {/* MENU VIEW */}
          {view === 'menu' && (
            <motion.div key="menu" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <header className="mb-10">
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-200">
                    <Settings className="w-6 h-6 text-slate-900" />
                  </div>
                  <h1 className="text-3xl font-black text-slate-900 tracking-tight">Paramètres</h1>
                </div>
                <p className="text-slate-500 font-medium ml-16">Gérez vos préférences et votre configuration Alberthon.</p>
              </header>

              <div className="space-y-8">
                <section className="space-y-4">
                  <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">Compte</h2>
                  <div className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm">
                    <button onClick={() => setView('profile')} className="w-full flex items-center gap-4 p-6 hover:bg-slate-50 border-b border-slate-100 transition-colors text-left group">
                      <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center border border-orange-100"><User className="w-5 h-5 text-orange-600" /></div>
                      <div className="flex-1"><h3 className="font-bold text-slate-900">Profil personnel</h3><p className="text-sm text-slate-500 font-medium">Nom, email et informations de base</p></div>
                      <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-900" />
                    </button>
                    <button onClick={() => setView('security')} className="w-full flex items-center gap-4 p-6 hover:bg-slate-50 transition-colors text-left group">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100"><Shield className="w-5 h-5 text-blue-600" /></div>
                      <div className="flex-1"><h3 className="font-bold text-slate-900">Sécurité</h3><p className="text-sm text-slate-500 font-medium">Changer votre mot de passe</p></div>
                      <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-900" />
                    </button>
                  </div>
                </section>

                <section className="space-y-4">
                  <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">Facturation</h2>
                  <div className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm">
                    <button onClick={() => setView('billing')} className="w-full flex items-center gap-4 p-6 hover:bg-slate-50 transition-colors text-left group">
                      <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center border border-purple-100"><CreditCard className="w-5 h-5 text-purple-600" /></div>
                      <div className="flex-1"><h3 className="font-bold text-slate-900">Abonnement</h3><p className="text-sm text-slate-500 font-medium">Gérer votre plan ORI Premium</p></div>
                      <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-900" />
                    </button>
                  </div>
                </section>

                <div className="pt-8"><Button onClick={handleLogout} variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50 font-black rounded-xl gap-2 h-12 px-6"><LogOut className="w-5 h-5" /> Déconnexion</Button></div>
              </div>
            </motion.div>
          )}

          {/* PROFILE VIEW */}
          {view === 'profile' && (
            <motion.div key="profile" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              {renderHeader('Profil personnel')}
              <form onSubmit={handleUpdateProfile} className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Nom complet</label>
                  <Input value={name} onChange={e => setName(e.target.value)} className="bg-slate-50 border-slate-200 h-14 rounded-xl font-bold focus-visible:ring-orange-500" placeholder="Ton nom" />
                </div>
                <div className="space-y-2 opacity-60">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email (non modifiable)</label>
                  <Input value={email} disabled className="bg-slate-100 border-slate-200 h-14 rounded-xl font-bold cursor-not-allowed" />
                </div>
                <div className="pt-4 flex items-center gap-4">
                  <Button type="submit" disabled={loading} className="flex-1 h-14 bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-lg font-black text-lg transition-transform active:scale-[0.98]">
                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Sauvegarder les modifications"}
                  </Button>
                  {success && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-2 text-green-600 font-bold bg-green-50 px-4 py-2 rounded-xl border border-green-100"><CheckCircle2 className="w-5 h-5" /> Enregistré</motion.div>}
                </div>
              </form>
            </motion.div>
          )}

          {/* SECURITY VIEW */}
          {view === 'security' && (
            <motion.div key="security" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              {renderHeader('Sécurité')}
              <form onSubmit={handleUpdatePassword} className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm space-y-6">
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-start gap-4 mb-4">
                  <div className="bg-white p-2 rounded-xl shadow-sm border border-blue-100"><Lock className="w-5 h-5 text-blue-600" /></div>
                  <p className="text-sm text-blue-800 font-medium leading-relaxed">Pour changer votre mot de passe, saisissez le nouveau ci-dessous. Il sera mis à jour immédiatement via Supabase.</p>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Nouveau mot de passe</label>
                  <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="bg-slate-50 border-slate-200 h-14 rounded-xl font-bold focus-visible:ring-blue-500" placeholder="••••••••" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Confirmer le mot de passe</label>
                  <Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="bg-slate-50 border-slate-200 h-14 rounded-xl font-bold focus-visible:ring-blue-500" placeholder="••••••••" />
                </div>
                <div className="pt-4 flex items-center gap-4">
                  <Button type="submit" disabled={loading || !newPassword} className="flex-1 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/20 font-black text-lg transition-transform active:scale-[0.98]">
                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Mettre à jour le mot de passe"}
                  </Button>
                  {success && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-2 text-green-600 font-bold bg-green-50 px-4 py-2 rounded-xl border border-green-100"><CheckCircle2 className="w-5 h-5" /> Mis à jour</motion.div>}
                </div>
              </form>
            </motion.div>
          )}

          {/* BILLING VIEW (Mock) */}
          {view === 'billing' && (
            <motion.div key="billing" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              {renderHeader('Abonnement')}
              <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/20 blur-[100px] rounded-full" />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-6">
                    <span className="px-3 py-1 bg-orange-500 rounded-full text-[10px] font-black uppercase tracking-widest">Plan Actuel</span>
                    <h3 className="text-4xl font-black">ORI <span className="text-orange-500">Free</span></h3>
                  </div>
                  <p className="text-slate-400 font-medium mb-10 max-w-sm">Débloquez l'IA avancée, les salons exclusifs et le passport QR premium.</p>
                  <Button className="w-full h-14 bg-white text-slate-900 hover:bg-slate-100 rounded-xl font-black text-lg shadow-xl shadow-white/5 transition-transform active:scale-95">Passer à Alberthon Pro</Button>
                  <p className="text-center mt-6 text-xs text-slate-500 font-bold uppercase tracking-widest">9.99€ / mois • Annulable à tout moment</p>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
