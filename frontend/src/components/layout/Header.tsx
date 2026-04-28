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
    <header className="h-16 flex items-center justify-between px-4 md:px-8 border-b border-white/40 bg-white/60 backdrop-blur-xl sticky top-0 z-40 shadow-[0_4px_30px_rgba(0,0,0,0.03)]">
      <div className="flex items-center gap-4">
        {/* Mobile menu trigger - to be fully implemented with a sheet/drawer later if needed */}
        <Button variant="ghost" size="icon" className="md:hidden text-slate-500 hover:bg-slate-100/50">
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex md:hidden items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center font-black text-white text-sm shadow-md">O</div>
          <span className="font-black text-slate-900 text-xl tracking-tight">ORI</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" className="hidden md:flex gap-2 text-slate-500 hover:text-orange-600 hover:bg-orange-50 font-bold transition-colors" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
          <span>Déconnexion</span>
        </Button>
        <button className="h-9 w-9 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden hover:border-orange-300 transition-colors shadow-sm cursor-pointer">
          <User className="h-4 w-4 text-slate-500" />
        </button>
      </div>
    </header>
  );
}
