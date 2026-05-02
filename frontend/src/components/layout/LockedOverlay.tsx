'use client';

import { Lock, MessageCircle, User, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion } from 'framer-motion';

export function LockedOverlay() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 z-50 flex items-center justify-center bg-slate-50/60 backdrop-blur-md"
    >
      <div className="max-w-md mx-auto text-center px-6">
        {/* Lock icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
          className="w-20 h-20 bg-white rounded-3xl border border-slate-200 shadow-xl flex items-center justify-center mx-auto mb-6"
        >
          <Lock className="w-9 h-9 text-slate-400" />
        </motion.div>

        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">
            Page verrouillée
          </h2>
          <p className="text-slate-500 font-medium mb-8 leading-relaxed">
            Parle avec ORI et remplis ton profil pour débloquer toutes les fonctionnalités de l'application.
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Link href="/chat">
            <Button className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold h-12 px-6 shadow-lg gap-2">
              <MessageCircle className="w-4 h-4" />
              Parler avec ORI
            </Button>
          </Link>
          <Link href="/profil">
            <Button variant="outline" className="w-full sm:w-auto border-orange-300 text-orange-600 hover:bg-orange-50 rounded-xl font-bold h-12 px-6 gap-2">
              <User className="w-4 h-4" />
              Compléter mon profil
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}
