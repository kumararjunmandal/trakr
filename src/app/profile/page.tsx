// src/app/profile/page.tsx
'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Profile() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  return (
    <main className="min-h-screen bg-[#000000] text-[#FAFAFA] font-sans selection:bg-[#3B82F6]/30 p-4 flex justify-center">
      <div className="w-full max-w-[1400px] grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
        
        {/* SIDEBAR */}
        <aside className="hidden lg:flex flex-col bg-[#000000] border-r border-[#27272A] pr-4 py-2">
          <div className="flex items-center gap-3 text-[#FAFAFA] font-bold text-lg mb-8 px-2 tracking-widest">
            <div className="text-[#3B82F6]">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 2 22 22 22"></polygon></svg>
            </div>
            TRAKR
          </div>

          <nav className="flex flex-col gap-1 mb-auto">
            <div className="text-[11px] text-[#A1A1AA] mb-2 px-3">Menu</div>
            <Link href="/" className="flex items-center gap-3 text-[#A1A1AA] hover:text-[#FAFAFA] px-3 py-2.5 rounded-lg text-sm font-medium transition-colors">
               <span>∷</span> Dashboard
            </Link>
            <Link href="/add" className="flex items-center gap-3 text-[#A1A1AA] hover:text-[#FAFAFA] px-3 py-2.5 rounded-lg text-sm font-medium transition-colors">
               <span>+</span> Add Fuel Log
            </Link>
            <Link href="/profile" className="flex items-center gap-3 bg-[#0F0F11] text-[#FAFAFA] px-3 py-2.5 rounded-lg text-sm font-medium border border-[#27272A]">
               <span className="text-[#3B82F6]">👤</span> Profile Settings
            </Link>
            <button onClick={() => signOut({ callbackUrl: '/login' })} className="flex items-center gap-3 text-[#A1A1AA] hover:text-[#3B82F6] px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left mt-2">
               <span>⚙</span> Sign Out
            </button>
          </nav>

          {/* SIDEBAR USER CARD */}
          <div className="flex flex-col gap-3 mt-6 pt-4 border-t border-[#27272A]">
            <Link href="/add" className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-[0_0_15px_rgba(59,130,246,0.2)]">
               Log Refill <span className="text-base leading-none">+</span>
            </Link>

            <div className="flex items-center gap-3 bg-[#0F0F11] p-2.5 rounded-xl border border-[#27272A]">
              {session?.user?.image ? (
                <img src={session.user.image} alt="User" className="w-8 h-8 rounded-full border border-[#27272A] shrink-0" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#27272A] flex items-center justify-center text-[#FAFAFA] text-xs font-bold shrink-0">
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

        {/* MAIN CONTENT */}
        <div className="flex flex-col flex-1 pl-0 lg:pl-2 min-w-0">
          
          <div className="flex items-center justify-between mb-6 bg-[#000000]">
            <h1 className="text-[#FAFAFA] text-lg font-bold">Account Settings</h1>
          </div>

          <div className="flex flex-col gap-4 flex-1 max-w-3xl">
            
            {/* USER IDENTITY & ACCOUNT DETAILS */}
            <section className="bg-[#0F0F11] border border-[#27272A] rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#3B82F6]/5 blur-[100px] rounded-full pointer-events-none"></div>

              <div className="relative shrink-0">
                {session?.user?.image ? (
                  <img src={session.user.image} alt="Profile" className="w-24 h-24 rounded-full border-2 border-[#27272A] object-cover" />
                ) : (
                  <div className="w-24 h-24 rounded-full border-2 border-[#27272A] bg-[#000000] flex items-center justify-center text-3xl font-bold text-[#FAFAFA]">
                    {session?.user?.name?.charAt(0) || 'U'}
                  </div>
                )}
                <div className="absolute bottom-0 right-0 w-5 h-5 bg-[#10B981] border-2 border-[#0F0F11] rounded-full"></div>
              </div>

              <div className="flex flex-col items-center sm:items-start text-center sm:text-left z-10 flex-1 w-full">
                <h2 className="text-xl font-black text-[#FAFAFA] mb-1">{session?.user?.name || 'User'}</h2>
                <p className="text-[#A1A1AA] text-xs mb-6">{session?.user?.email}</p>

                {/* AUTHENTICATION & SECURITY STATUS */}
                <div className="w-full bg-[#000000] border border-[#27272A] rounded-xl p-4 flex flex-col gap-3">
                  <div className="flex justify-between items-center border-b border-[#27272A] pb-3">
                    <span className="text-[10px] uppercase tracking-widest text-[#A1A1AA] font-bold">Authentication Provider</span>
                    <span className="text-xs text-[#FAFAFA] bg-[#27272A] px-2.5 py-1 rounded-md flex items-center gap-2">
                       <svg className="w-3.5 h-3.5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                       Google OAuth
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase tracking-widest text-[#A1A1AA] font-bold">Account Status</span>
                    <span className="text-xs text-[#10B981] font-bold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></span>
                      Active Session
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* APP PREFERENCES / SETTINGS */}
            <section className="bg-[#0F0F11] border border-[#27272A] rounded-2xl p-6">
              <h3 className="text-[#FAFAFA] text-sm font-medium mb-4">App Preferences</h3>
              
              <div className="flex justify-between items-center py-3.5 border-b border-[#27272A]">
                <div>
                  <div className="text-xs text-[#FAFAFA] font-medium">UI Theme Aesthetic</div>
                  <div className="text-[10px] text-[#A1A1AA]">Current color palette configuration</div>
                </div>
                <div className="flex items-center gap-2 bg-[#000000] border border-[#27272A] px-3 py-1.5 rounded-lg">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]"></div>
                  <span className="text-xs text-[#FAFAFA] font-bold">Black & Blue</span>
                </div>
              </div>

              <div className="flex justify-between items-center py-3.5">
                <div>
                  <div className="text-xs text-[#FAFAFA] font-medium">Sign Out</div>
                  <div className="text-[10px] text-[#A1A1AA]">Securely terminate your session</div>
                </div>
                <button onClick={() => signOut({ callbackUrl: '/login' })} className="bg-[#27272A] hover:bg-[#ef4444] text-[#FAFAFA] text-xs px-4 py-2 rounded-lg font-bold transition-colors">
                  Log Out
                </button>
              </div>
            </section>

          </div>
        </div>
      </div>
    </main>
  );
}