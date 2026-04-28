'use client';

import { useState, useEffect } from 'react';
import { Loader2, QrCode, Smartphone, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/utils/supabase/client';
import { motion } from 'framer-motion';

export default function PassportPage() {
  const [qrBase64, setQrBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchPassport = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const uid = session?.user?.id || 'demo-user';
        
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/passport/${uid}`);
        const json = await res.json();
        
        if (json.status === 'success') {
          setQrBase64(json.qr_base64);
        }
      } catch (err) {
        console.error("Failed to fetch passport", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPassport();
  }, [supabase]);

  if (loading) return (
    <div className="flex h-full items-center justify-center bg-transparent">
      <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
    </div>
  );

  return (
    <div className="min-h-full flex flex-col items-center py-12 px-4 overflow-y-auto relative perspective-[2000px]">
      <div className="max-w-md w-full relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] bg-gradient-to-br from-orange-400 to-orange-600 mb-6 shadow-xl shadow-orange-500/30 transform rotate-12">
            <QrCode className="w-10 h-10 text-white -rotate-12" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">QR Passport</h1>
          <p className="text-slate-600 font-medium text-lg max-w-sm mx-auto leading-relaxed">Présente ce code pour transférer ton profil instantanément.</p>
        </motion.div>

        {/* 3D Physical Card Wrapper */}
        <motion.div 
          initial={{ opacity: 0, y: 50, rotateX: 30 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 100 }}
          whileHover={{ y: -10, rotateX: 5, rotateY: -5, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
          className="relative w-full rounded-[2.5rem] bg-white/90 backdrop-blur-xl shadow-2xl border border-white/50 overflow-hidden group transition-all duration-300 transform-gpu"
        >
          {/* Animated Shine Effect on Hover */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-tr from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none z-20" />

          {/* Top Banner / Color Stripe L'Etudiant */}
          <div className="h-36 bg-gradient-to-r from-orange-500 via-orange-400 to-red-500 relative overflow-hidden">
            {/* Geometric patterns */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-black/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4" />
            
            <div className="absolute top-6 left-8">
              <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-bold tracking-wider uppercase border border-white/30 flex items-center gap-1.5 w-fit">
                <Sparkles className="w-3 h-3" /> VIP Pass
              </span>
            </div>
            
            <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-white to-transparent" />
          </div>

          <div className="px-8 pb-12 pt-2 text-center relative z-10">
            <h2 className="text-2xl font-black text-slate-900 mb-1 uppercase tracking-widest">L'Étudiant <span className="text-orange-500">ID</span></h2>
            <div className="w-16 h-1.5 bg-orange-500 rounded-full mx-auto my-6" />
            
            <div className="bg-white p-5 rounded-3xl inline-block shadow-[0_8px_30px_rgb(0,0,0,0.08)] mx-auto border border-slate-100 relative group-hover:scale-105 transition-transform duration-300">
              {qrBase64 ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={qrBase64} alt="QR Code" className="w-48 h-48 sm:w-56 sm:h-56 object-contain" />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center bg-slate-50 text-slate-400 rounded-2xl border-2 border-dashed border-slate-200">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              )}
            </div>

            <div className="mt-8 bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Sécurité</p>
              <p className="text-sm text-slate-700 font-medium leading-relaxed">
                Pass crypté de bout en bout. Seules les écoles partenaires pourront déchiffrer tes informations.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-10 flex gap-4 justify-center"
        >
          <Button className="bg-slate-900 hover:bg-slate-800 text-white shadow-xl shadow-slate-900/20 rounded-2xl font-bold py-7 px-8 transition-all hover:scale-105 active:scale-95 text-base w-full max-w-xs group">
            <Smartphone className="w-5 h-5 mr-3 group-hover:-translate-y-1 transition-transform" /> 
            Ajouter à Apple Wallet
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
