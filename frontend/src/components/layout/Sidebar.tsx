'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageCircle, User, Users, Newspaper, FileText, Compass, ChevronLeft, ChevronRight, Route } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const navItems = [
  { name: 'Chat', href: '/chat', icon: MessageCircle },
  { name: 'Parcours', href: '/parcours', icon: Route },
  { name: 'Salons', href: '/salons', icon: Users },
  { name: 'Newsletter', href: '/newsletter', icon: Newspaper },
  { name: 'Docs', href: '/docs', icon: FileText },
  { name: 'Passport', href: '/passport', icon: Compass },
  { name: 'Profil', href: '/profil', icon: User },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside className={cn(
      "hidden md:flex flex-col border-r border-slate-800 bg-slate-900 py-8 transition-all duration-300 relative z-20 shadow-xl",
      isCollapsed ? "w-20 px-2" : "w-64 px-4"
    )}>
      {/* Toggle Button */}
      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute -right-3 top-8 h-6 w-6 rounded-full border border-slate-200 bg-white text-slate-400 hover:text-orange-500 z-50 shadow-md transition-transform hover:scale-110"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </Button>

      <div className={cn("flex items-center gap-3 mb-10", isCollapsed ? "justify-center px-0" : "px-2")}>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center font-black text-white shadow-lg shadow-orange-500/20 shrink-0">
          O
        </div>
        {!isCollapsed && <span className="text-2xl font-black tracking-tight text-white transition-opacity duration-300">ORI</span>}
      </div>

      <nav className="flex-1 space-y-1.5">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center rounded-xl text-sm transition-all duration-200 group relative overflow-hidden",
                isCollapsed ? "justify-center py-3" : "py-3 px-3 gap-3",
                isActive 
                  ? "bg-orange-500/10 text-orange-400 font-bold" 
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50 font-medium"
              )}
              title={isCollapsed ? item.name : undefined}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-orange-500 rounded-r-full" />
              )}
              <item.icon className={cn("h-5 w-5 shrink-0 transition-transform group-hover:scale-110", isActive ? "text-orange-500" : "text-slate-400")} />
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>
      
      {!isCollapsed && (
        <div className="mt-auto px-2 py-4">
          <div className="bg-gradient-to-br from-slate-800 to-slate-800/50 border border-slate-700/50 p-4 rounded-2xl relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-orange-500/20 blur-xl rounded-full" />
            <p className="text-xs text-slate-400 font-bold mb-1 uppercase tracking-wider">L'Étudiant</p>
            <p className="text-sm font-medium text-white">Édition Hackathon Vertex AI</p>
          </div>
        </div>
      )}
    </aside>
  );
}
