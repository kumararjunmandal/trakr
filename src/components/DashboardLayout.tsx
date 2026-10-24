// src/components/DashboardLayout.tsx
'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import SidebarNav from './SidebarNav';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <main className="min-h-screen bg-[#000000] text-[#FAFAFA] font-sans selection:bg-primary-faded lg:p-6 flex justify-center relative transition-colors duration-300">
      
      {/* MOBILE HEADER */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#000000]/90 backdrop-blur-md border-b border-[#27272A] px-4 flex items-center justify-between z-[40]">
        <div className="flex items-center gap-2 text-[#FAFAFA] font-bold text-lg tracking-widest">
          <div className="text-primary transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 2 22 22 22"></polygon></svg>
          </div>
          TRAKR
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(true)} 
          className="text-[#FAFAFA] p-2 bg-[#27272A] rounded-lg hover:bg-primary transition-colors"
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        </button>
      </div>

      {/* MOBILE OVERLAY */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[90] lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      <div className="w-full max-w-[1400px] flex gap-0 lg:gap-6 mt-16 lg:mt-0 relative">
        
        {/* UNIFIED SIDEBAR */}
        <aside className={`
          fixed inset-y-0 left-0 z-[100] w-[280px] bg-[#0F0F11] lg:bg-[#000000] border-r border-[#27272A] p-6 lg:p-0 lg:pr-4 lg:py-2 flex flex-col shrink-0
          transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:static lg:translate-x-0 lg:w-[240px]
        `}>
          <div className="flex items-center justify-between mb-8 px-2">
            <div className="flex items-center gap-3 text-[#FAFAFA] font-bold text-lg tracking-widest">
              <div className="text-primary transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 2 22 22 22"></polygon></svg>
              </div>
              TRAKR
            </div>
            <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden p-2 text-[#A1A1AA] hover:text-[#FAFAFA] bg-[#27272A]/50 rounded-lg">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>

          <SidebarNav setIsMobileMenuOpen={setIsMobileMenuOpen} />

          <div className="flex flex-col gap-3 mt-6 pt-4 border-t border-[#27272A]">
            <Link href="/add" className="w-full bg-primary hover:bg-primary-hover text-white py-3 lg:py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-primary-glow">
               Log Refill <span className="text-base leading-none">+</span>
            </Link>

            <div className="flex items-center gap-3 bg-[#1A1A1C] lg:bg-[#0F0F11] p-3 lg:p-2.5 rounded-xl border border-[#27272A]">
              {session?.user?.image ? (
                <img src={session.user.image} alt="User" className="w-9 h-9 lg:w-8 lg:h-8 rounded-full border border-[#27272A] shrink-0" />
              ) : (
                <div className="w-9 h-9 lg:w-8 lg:h-8 rounded-full bg-[#27272A] flex items-center justify-center text-[#FAFAFA] text-xs font-bold shrink-0">
                  {session?.user?.name?.charAt(0) || 'U'}
                </div>
              )}
              <div className="overflow-hidden">
                <div className="text-[#FAFAFA] text-xs font-bold truncate">{session?.user?.name || 'User'}</div>
                <div className="text-[#A1A1AA] text-[9px] truncate">{session?.user?.email || 'Active User'}</div>
              </div>
            </div>
          </div>
        </aside>

        {/* DYNAMIC PAGE CONTENT GOES HERE */}
        <div className="flex flex-col flex-1 min-w-0 p-4 lg:p-0">
          {children}
        </div>

      </div>
    </main>
  );
}