'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageCircle, User, Users, Compass, Route, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProfile } from '@/contexts/ProfileContext';

const mobileNavItems = [
  { name: 'Chat', href: '/chat', icon: MessageCircle, alwaysAccessible: true },
  { name: 'Salons', href: '/salons', icon: Users, alwaysAccessible: false },
  { name: 'Parcours', href: '/parcours', icon: Route, alwaysAccessible: false },
  { name: 'Passport', href: '/passport', icon: Compass, alwaysAccessible: false },
  { name: 'Profil', href: '/profil', icon: User, alwaysAccessible: true },
];

export function MobileNav() {
  const pathname = usePathname();
  const { isProfileComplete, isLoading } = useProfile();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 px-2 pb-safe">
      <div className="flex items-center justify-around h-16">
        {mobileNavItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const isLocked = !isLoading && !isProfileComplete && !item.alwaysAccessible;
          const Icon = item.icon;
          
          if (isLocked) {
            return (
              <div
                key={item.name}
                className="flex flex-col items-center justify-center w-full h-full gap-1 text-slate-300 cursor-not-allowed"
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  <Lock className="w-2.5 h-2.5 absolute -top-1 -right-1 text-slate-400" />
                </div>
                <span className="text-[10px] font-medium">{item.name}</span>
              </div>
            );
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors",
                isActive ? "text-orange-500" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive && "fill-orange-500/20")} />
              <span className={cn(
                "text-[10px] font-medium",
                isActive && "font-bold"
              )}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
