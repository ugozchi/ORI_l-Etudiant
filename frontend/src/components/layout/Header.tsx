'use client';

import { Menu, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export function Header() {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <header className="h-16 flex items-center justify-between px-4 md:px-6 border-b border-[#2C2C2C] bg-[#121212]/80 backdrop-blur-md sticky top-0 z-40">
      <div className="flex items-center gap-4">
        {/* Mobile menu trigger - to be fully implemented with a sheet/drawer later if needed */}
        <Button variant="ghost" size="icon" className="md:hidden text-zinc-400">
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex md:hidden items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-white text-xs">O</div>
          <span className="font-semibold text-white">ORI</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" className="hidden md:flex gap-2 text-zinc-400 hover:text-white" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
          <span>Déconnexion</span>
        </Button>
        <div className="h-8 w-8 rounded-full bg-[#2C2C2C] border border-[#3C3C3C] flex items-center justify-center overflow-hidden">
          <User className="h-4 w-4 text-zinc-400" />
        </div>
      </div>
    </header>
  );
}
