// src/components/SidebarNav.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';

// We pass setIsMobileMenuOpen as an optional prop so the menu can close itself on mobile clicks
interface SidebarNavProps {
  setIsMobileMenuOpen?: (isOpen: boolean) => void;
}

export default function SidebarNav({ setIsMobileMenuOpen }: SidebarNavProps) {
  const pathname = usePathname();

  const handleLinkClick = () => {
    if (setIsMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <nav className="flex flex-col gap-1 mb-auto">
      <div className="text-[11px] text-[#A1A1AA] mb-2 px-3">Menu</div>
      
      <Link 
        href="/" 
        onClick={handleLinkClick}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
          pathname === '/' 
            ? 'bg-[#1A1A1C] lg:bg-[#0F0F11] text-[#FAFAFA] border border-primary/20 lg:border-[#27272A]' 
            : 'text-[#A1A1AA] hover:text-[#FAFAFA]'
        }`}
      >
        <span className={pathname === '/' ? 'text-primary' : ''}>∷</span> Dashboard
      </Link>
      
      <Link 
        href="/add" 
        onClick={handleLinkClick}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
          pathname === '/add' 
            ? 'bg-[#1A1A1C] lg:bg-[#0F0F11] text-[#FAFAFA] border border-primary/20 lg:border-[#27272A]' 
            : 'text-[#A1A1AA] hover:text-[#FAFAFA]'
        }`}
      >
        <span className={pathname === '/add' ? 'text-primary' : ''}>+</span> Add Fuel Log
      </Link>
      
      <Link 
        href="/profile" 
        onClick={handleLinkClick}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
          pathname === '/profile' 
            ? 'bg-[#1A1A1C] lg:bg-[#0F0F11] text-[#FAFAFA] border border-primary/20 lg:border-[#27272A]' 
            : 'text-[#A1A1AA] hover:text-[#FAFAFA]'
        }`}
      >
        <span className={pathname === '/profile' ? 'text-primary' : ''}>~</span> Profile Settings
      </Link>
      
      <button 
        onClick={() => signOut({ callbackUrl: '/login' })} 
        className="flex items-center gap-3 text-[#A1A1AA] hover:text-primary px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left mt-2 focus:outline-none"
      >
        <span>x</span> Sign Out
      </button>
    </nav>
  );
}