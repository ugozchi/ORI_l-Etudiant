'use client';

import { motion } from 'framer-motion';
import { BrainCircuit, MessageCircle, Heart, Compass, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// Mocked timeline data representing the "Thought Flow"
const timelineEvents = [
  {
    id: 1,
    type: 'analysis',
    title: 'Génération du Persona',
    description: 'Analyse du bulletin scolaire. Forte appétence détectée pour les mathématiques et la logique.',
    time: 'Il y a 2 jours',
    icon: BrainCircuit,
    color: 'bg-purple-500',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200'
  },
  {
    id: 2,
    type: 'chat',
    title: 'Exploration d\'orientation',
    description: 'Discussion avec ORI : "Quelles sont les différences entre une prépa intégrée et classique ?"',
    time: 'Hier à 14h30',
    icon: MessageCircle,
    color: 'bg-blue-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  {
    id: 3,
    type: 'action',
    title: 'Match École',
    description: 'Vous avez swipé à droite sur "EPITA Paris" et "Rubika". Intérêt marqué pour le Numérique.',
    time: 'Hier à 14h45',
    icon: Heart,
    color: 'bg-pink-500',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200'
  },
  {
    id: 4,
    type: 'success',
    title: 'Inscription au Salon',
    description: 'Génération du QR Code d\'accès pour le Salon de l\'Étudiant "Numérique et Ingénierie".',
    time: 'Aujourd\'hui',
    icon: Compass,
    color: 'bg-green-500',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200'
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.3 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 100 }
  }
};

export default function ParcoursPage() {
  return (
    <div className="min-h-full p-6 lg:p-12 relative overflow-y-auto">
      {/* Background elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-400/5 blur-[100px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 blur-[100px] rounded-full pointer-events-none translate-y-1/2 -translate-x-1/2" />

      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-100 text-orange-600 font-bold text-sm mb-4">
            <Sparkles className="w-4 h-4" />
            Mémoire IA Active
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-3">Ton Schéma de Pensée</h1>
          <p className="text-lg text-slate-500 font-medium">
            Voici un résumé visuel de ton cheminement avec ORI. C'est en analysant ces étapes que nous te faisons les meilleures recommandations.
          </p>
        </div>

        {/* Timeline */}
        <motion.div 
          className="relative pl-8 md:pl-0"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Vertical Line for Desktop (Centered) */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-slate-200 via-orange-200 to-slate-200 -translate-x-1/2 rounded-full" />
          
          {/* Vertical Line for Mobile (Left) */}
          <div className="md:hidden absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-slate-200 via-orange-200 to-slate-200 rounded-full" />

          {timelineEvents.map((event, index) => {
            const isEven = index % 2 === 0;
            const Icon = event.icon;

            return (
              <motion.div 
                key={event.id}
                variants={itemVariants}
                className={cn(
                  "relative flex items-center justify-between md:justify-normal w-full mb-12",
                  isEven ? "md:flex-row-reverse" : "md:flex-row"
                )}
              >
                {/* Desktop Empty Space for alignment */}
                <div className="hidden md:block w-5/12" />

                {/* Timeline Node (Icon) */}
                <div className="absolute left-[-2rem] md:left-1/2 md:-translate-x-1/2 w-12 h-12 rounded-full border-4 border-white shadow-lg flex items-center justify-center z-10 shrink-0"
                     style={{ backgroundColor: 'white' }}>
                  <div className={cn("w-full h-full rounded-full flex items-center justify-center", event.color)}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                </div>

                {/* Content Card */}
                <div className={cn(
                  "w-full md:w-5/12 bg-white rounded-2xl p-6 shadow-xl border relative",
                  event.borderColor,
                  isEven ? "md:mr-auto" : "md:ml-auto"
                )}>
                  {/* Speech Bubble Arrow for Desktop */}
                  <div className={cn(
                    "hidden md:block absolute top-6 w-4 h-4 bg-white border-t border-r transform",
                    event.borderColor,
                    isEven ? "-right-2 rotate-45 border-b-0 border-l-0" : "-left-2 -rotate-[135deg] border-b-0 border-l-0"
                  )} />

                  <div className="flex items-center justify-between mb-2">
                    <span className={cn("text-xs font-bold px-2 py-1 rounded-md", event.bgColor, `text-${event.color.split('-')[1]}-700`)}>
                      {event.time}
                    </span>
                    {index === timelineEvents.length - 1 && (
                      <span className="flex items-center gap-1 text-xs font-bold text-green-600">
                        <CheckCircle2 className="w-4 h-4" /> Actuel
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{event.title}</h3>
                  <p className="text-slate-600 font-medium text-sm leading-relaxed">
                    {event.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Call to action to continue journey */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center justify-center p-1 bg-slate-100 rounded-2xl border border-slate-200 shadow-inner">
            <Link href="/chat">
              <Button className="bg-white text-slate-900 hover:bg-slate-50 font-bold rounded-xl h-12 px-6 shadow-sm border border-slate-200">
                Continuer la réflexion
                <ArrowRight className="w-4 h-4 ml-2 text-orange-500" />
              </Button>
            </Link>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
