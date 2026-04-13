'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageCircle, User, Users, Newspaper, FileText, Compass } from 'lucide-react';
import { cn } from '@/lib/utils';

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

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-[#2C2C2C] bg-[#121212] px-4 py-8">
      <div className="flex items-center gap-2 px-2 mb-8">
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white shadow-lg">
          O
        </div>
        <span className="text-xl font-semibold tracking-tight text-white">ORI</span>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200",
                isActive 
                  ? "bg-white/10 text-white font-medium shadow-sm" 
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon className={cn("h-4 w-4", isActive ? "text-indigo-400" : "text-zinc-500")} />
              {item.name}
            </Link>
          );
        })}
      </nav>
      
      <div className="mt-auto px-2 py-4">
        <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 p-4 rounded-xl">
          <p className="text-xs text-indigo-200 font-medium mb-1">Hackathon L'Étudiant</p>
          <p className="text-xs text-zinc-500">Vertex AI Edition</p>
        </div>
      </div>
    </aside>
  );
}
