'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageCircle, User, Users, Newspaper, FileText, Compass, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const navItems = [
  { name: 'Chat', href: '/chat', icon: MessageCircle },
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
      "hidden md:flex flex-col border-r border-slate-200 bg-slate-900 py-8 transition-all duration-300 relative",
      isCollapsed ? "w-20 px-2" : "w-64 px-4"
    )}>
      {/* Toggle Button */}
      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute -right-3 top-8 h-6 w-6 rounded-full border border-slate-200 bg-white text-slate-400 hover:text-orange-500 z-50 shadow-md"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </Button>

      <div className={cn("flex items-center gap-2 mb-8", isCollapsed ? "justify-center px-0" : "px-2")}>
        <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center font-bold text-white shadow-lg shrink-0">
          O
        </div>
        {!isCollapsed && <span className="text-xl font-bold tracking-tight text-white transition-opacity duration-300">ORI</span>}
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center rounded-lg text-sm transition-all duration-200",
                isCollapsed ? "justify-center py-3" : "py-2.5 px-3 gap-3",
                isActive 
                  ? "bg-slate-800 text-white font-medium shadow-inner" 
                  : "text-slate-300 hover:text-white hover:bg-slate-800/50"
              )}
              title={isCollapsed ? item.name : undefined}
            >
              <item.icon className={cn("h-4 w-4 shrink-0", isActive ? "text-orange-500" : "text-slate-400")} />
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>
      
      {!isCollapsed && (
        <div className="mt-auto px-2 py-4">
          <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-xl">
            <p className="text-xs text-orange-200 font-bold mb-1">Hackathon L'Étudiant</p>
            <p className="text-xs text-slate-300">Vertex AI Edition</p>
          </div>
        </div>
      )}
    </aside>
  );
}
