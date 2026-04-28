'use client';

import { useState, useEffect } from 'react';
import { Loader2, QrCode, Smartphone, ChevronLeft } from 'lucide-react';
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
    <div className="flex h-full items-center justify-center bg-[#0A0A0A]">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
    </div>
  );

  return (
    <div className="min-h-full bg-[#0A0A0A] flex flex-col items-center py-12 px-4 overflow-y-auto">
      <div className="max-w-md w-full">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 mb-4 shadow-[0_0_30px_rgba(99,102,241,0.3)]">
            <QrCode className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">QR Passport</h1>
          <p className="text-zinc-400">Présente ce code sur les stands des salons étudiants pour transférer ton profil (sans formulaire à remplir !).</p>
        </div>

        {/* Apple Wallet Style Wrapper */}
        <motion.div 
          initial={{ opacity: 0, y: 50, rotateX: 20 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ type: "spring", damping: 20 }}
          className="relative w-full rounded-[2rem] overflow-hidden bg-gradient-to-br from-[#1E1E1E] to-[#121212] shadow-2xl border border-[#333] perspective-1000"
        >
          {/* Top Banner / Color Stripe */}
          <div className="h-32 bg-gradient-to-r from-indigo-600 to-purple-600 relative">
            {/* Pattern overlay */}
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
            <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#1E1E1E]" />
          </div>

          <div className="px-8 pb-10 pt-4 text-center">
            <h2 className="text-xl font-bold text-white mb-1 uppercase tracking-widest">ORI Pass</h2>
            <div className="w-full h-px bg-gradient-to-r from-transparent via-zinc-600 to-transparent my-6" />
            
            <div className="bg-white p-4 rounded-xl inline-block shadow-lg mx-auto">
              {qrBase64 ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={qrBase64} alt="QR Code" className="w-48 h-48 sm:w-56 sm:h-56 object-contain" />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center bg-gray-100 text-gray-400">Error</div>
              )}
            </div>

            <p className="mt-8 text-sm text-zinc-400">
              Ce pass est crypté. Seules les écoles partenaires L'Étudiant pourront déchiffrer tes informations d'orientation sécurisées.
            </p>
          </div>
        </motion.div>

        <div className="mt-10 flex gap-4 justify-center">
          <Button variant="outline" className="bg-[#121212] border-[#2C2C2C] text-white hover:bg-[#1A1A1A]">
            <Smartphone className="w-4 h-4 mr-2" /> Ajouter à Wallet
          </Button>
        </div>
      </div>
    </div>
  );
}
