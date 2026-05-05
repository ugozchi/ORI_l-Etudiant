'use client';

import { Settings, User, Bell, Shield, CreditCard, LogOut, ChevronRight, Sliders } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const SETTINGS_GROUPS = [
  {
    title: 'Compte',
    items: [
      { name: 'Profil personnel', icon: User, desc: 'Gérer vos informations de base', href: '#' },
      { name: 'Sécurité', icon: Shield, desc: 'Mot de passe et authentification', href: '#' },
      { name: 'Notifications', icon: Bell, desc: 'Préférences de communication', href: '#' },
    ]
  },
  {
    title: 'Facturation',
    items: [
      { name: 'Abonnement', icon: CreditCard, desc: 'Gérer votre plan et vos factures', href: '#' },
      { name: 'Méthodes de paiement', icon: Sliders, desc: 'Cartes et moyens de paiement', href: '#' },
    ]
  }
];

export default function SettingsPage() {
  return (
    <div className="min-h-full bg-slate-50 p-4 md:p-8 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
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
          {SETTINGS_GROUPS.map((group, idx) => (
            <motion.section 
              key={group.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="space-y-4"
            >
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">{group.title}</h2>
              <div className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm">
                {group.items.map((item, i) => (
                  <button 
                    key={item.name}
                    className={cn(
                      "w-full flex items-center gap-4 p-6 hover:bg-slate-50 transition-colors text-left group",
                      i !== group.items.length - 1 && "border-b border-slate-100"
                    )}
                  >
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all border border-transparent group-hover:border-slate-100">
                      <item.icon className="w-5 h-5 text-slate-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900">{item.name}</h3>
                      <p className="text-sm text-slate-500 font-medium">{item.desc}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-900 transition-colors" />
                  </button>
                ))}
              </div>
            </motion.section>
          ))}

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="pt-8"
          >
            <Button variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50 font-bold rounded-xl gap-2 h-12 px-6">
              <LogOut className="w-5 h-5" />
              Déconnexion
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
