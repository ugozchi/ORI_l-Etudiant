'use client';

import { Lock, MessageCircle, User, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useProfile } from '@/contexts/ProfileContext';
import { motion } from 'framer-motion';

export function LockedOverlay() {
  const { completionPercentage } = useProfile();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 z-50 flex items-center justify-center bg-slate-50/60 backdrop-blur-md"
    >
      <div className="max-w-md mx-auto text-center px-6">
        {/* Progress indicator */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
          className="relative w-32 h-32 mx-auto mb-8"
        >
          {/* Circular progress background */}
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="58"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-white drop-shadow-sm"
            />
            <motion.circle
              cx="64"
              cy="64"
              r="58"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={364.4}
              initial={{ strokeDashoffset: 364.4 }}
              animate={{ strokeDashoffset: 364.4 - (364.4 * completionPercentage) / 100 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="text-orange-500"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-black text-slate-900">{completionPercentage}%</span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rempli</span>
          </div>
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
            Ton profil est rempli à <span className="text-orange-600 font-bold">{completionPercentage}%</span>. Complète-le pour débloquer toutes les fonctionnalités !
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
