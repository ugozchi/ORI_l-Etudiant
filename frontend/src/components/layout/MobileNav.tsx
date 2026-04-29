'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageCircle, User, Users, Compass, Route } from 'lucide-react';
import { cn } from '@/lib/utils';

const mobileNavItems = [
  { name: 'Chat', href: '/chat', icon: MessageCircle },
  { name: 'Salons', href: '/salons', icon: Users },
  { name: 'Parcours', href: '/parcours', icon: Route },
  { name: 'Passport', href: '/passport', icon: Compass },
  { name: 'Profil', href: '/profil', icon: User },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 px-2 pb-safe">
      <div className="flex items-center justify-around h-16">
        {mobileNavItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          
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
