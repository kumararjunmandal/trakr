// src/app/profile/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Profile() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [theme, setTheme] = useState('blue'); // New theme state
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || '');
    }

    const fetchUserData = async () => {
      try {
        const res = await fetch('/api/user');
        if (res.ok) {
          const userData = await res.json();
          setName(userData.name || session?.user?.name || '');
          setUsername(userData.username || '');
          setPhone(userData.phone || '');
          setTheme(userData.theme || 'blue'); // Set theme from DB
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      }
    };

    if (status === 'authenticated') {
      fetchUserData();
    }
  }, [session, status]);

  // LIVE THEME PREVIEW
  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const res = await fetch('/api/user/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Include theme in the database save
        body: JSON.stringify({ name, username, phone, theme }), 
      });

      if (!res.ok) throw new Error('Failed to update profile');
      
      setMessage('Profile updated successfully!');
      await update({ name });
    } catch (err) {
      setMessage('Error updating profile.');
    } finally {
      setSaving(false);
    }
  };

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  return (
    <main className="min-h-screen bg-[#000000] text-[#FAFAFA] font-sans selection:bg-[#3B82F6]/30 lg:p-6 flex justify-center relative">
      
      {/* MOBILE HEADER */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#000000]/90 backdrop-blur-md border-b border-[#27272A] px-4 flex items-center justify-between z-[40]">
        <div className="flex items-center gap-2 text-[#FAFAFA] font-bold text-lg tracking-widest">
          <div className="text-[#3B82F6]">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 2 22 22 22"></polygon></svg>
          </div>
          TRAKR
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(true)} 
          className="text-[#FAFAFA] p-2 bg-[#27272A] rounded-lg hover:bg-[#3B82F6] transition-colors"
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
        
        {/* SIDEBAR */}
        <aside className={`
          fixed inset-y-0 left-0 z-[100] w-[280px] bg-[#0F0F11] lg:bg-[#000000] border-r border-[#27272A] p-6 lg:p-0 lg:pr-4 lg:py-2 flex flex-col shrink-0
          transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:static lg:translate-x-0 lg:w-[240px]
        `}>
          <div className="flex items-center justify-between mb-8 px-2">
            <div className="flex items-center gap-3 text-[#FAFAFA] font-bold text-lg tracking-widest">
              <div className="text-[#3B82F6]">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 2 22 22 22"></polygon></svg>
              </div>
              TRAKR
            </div>
            <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden p-2 text-[#A1A1AA] hover:text-[#FAFAFA] bg-[#27272A]/50 rounded-lg">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>

          <nav className="flex flex-col gap-1 mb-auto">
            <div className="text-[11px] text-[#A1A1AA] mb-2 px-3">Menu</div>
            <Link href="/" className="flex items-center gap-3 text-[#A1A1AA] hover:text-[#FAFAFA] px-3 py-2.5 rounded-lg text-sm font-medium transition-colors">
               <span>∷</span> Dashboard
            </Link>
            <Link href="/add" className="flex items-center gap-3 text-[#A1A1AA] hover:text-[#FAFAFA] px-3 py-2.5 rounded-lg text-sm font-medium transition-colors">
               <span>+</span> Add Fuel Log
            </Link>
            <Link href="/profile" className="flex items-center gap-3 bg-[#1A1A1C] lg:bg-[#0F0F11] text-[#FAFAFA] px-3 py-2.5 rounded-lg text-sm font-medium border border-[#3B82F6]/20 lg:border-[#27272A]">
               <span className="text-[#3B82F6]">👤</span> Profile Settings
            </Link>
            <button onClick={() => signOut({ callbackUrl: '/login' })} className="flex items-center gap-3 text-[#A1A1AA] hover:text-[#3B82F6] px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left mt-2">
               <span>⚙</span> Sign Out
            </button>
          </nav>

          <div className="flex flex-col gap-3 mt-6 pt-4 border-t border-[#27272A]">
            <Link href="/add" className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white py-3 lg:py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-[0_0_15px_rgba(59,130,246,0.2)]">
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

        {/* MAIN CONTENT */}
        <div className="flex flex-col flex-1 min-w-0 p-4 lg:p-0">
          
          <div className="flex items-center gap-4 mb-6">
            <Link 
              href="/" 
              className="flex items-center justify-center w-10 h-10 bg-[#0F0F11] border border-[#27272A] rounded-xl text-[#A1A1AA] hover:text-[#FAFAFA] hover:border-[#3B82F6] transition-all shadow-sm"
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
            </Link>
            <h1 className="text-[#FAFAFA] text-xl font-bold">Account Settings</h1>
          </div>

          <div className="flex flex-col gap-4 flex-1 max-w-3xl">
            
            <section className="bg-[#0F0F11] border border-[#27272A] rounded-2xl p-6 sm:p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#3B82F6]/5 blur-[100px] rounded-full pointer-events-none"></div>

              <div className="flex items-center gap-4 mb-6 relative z-10">
                {session?.user?.image ? (
                  <img src={session.user.image} alt="Profile" className="w-16 h-16 rounded-full border-2 border-[#27272A] object-cover" />
                ) : (
                  <div className="w-16 h-16 rounded-full border-2 border-[#27272A] bg-[#000000] flex items-center justify-center text-2xl font-bold text-[#FAFAFA]">
                    {session?.user?.name?.charAt(0) || 'U'}
                  </div>
                )}
                <div>
                  <h2 className="text-lg font-bold text-[#FAFAFA]">{session?.user?.name || 'User'}</h2>
                  <p className="text-[#A1A1AA] text-xs">{session?.user?.email}</p>
                </div>
              </div>

              {message && (
                <div className="mb-4 bg-[#3B82F6]/10 border border-[#3B82F6]/30 text-[#3B82F6] text-xs p-3 rounded-lg relative z-10">
                  {message}
                </div>
              )}

              <form onSubmit={handleSave} className="flex flex-col gap-4 relative z-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-[#A1A1AA] block mb-1">Full Name</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-[#000000] border border-[#27272A] rounded-xl px-3 py-2.5 text-xs text-[#FAFAFA] focus:outline-none focus:border-[#3B82F6]" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-[#A1A1AA] block mb-1">Username</label>
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="e.g. arjun_trakr" className="w-full bg-[#000000] border border-[#27272A] rounded-xl px-3 py-2.5 text-xs text-[#FAFAFA] focus:outline-none focus:border-[#3B82F6]" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-[#A1A1AA] block mb-1">Phone Number</label>
                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" className="w-full bg-[#000000] border border-[#27272A] rounded-xl px-3 py-2.5 text-xs text-[#FAFAFA] focus:outline-none focus:border-[#3B82F6]" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-[#A1A1AA] block mb-1">Email (Read-only)</label>
                    <input type="email" disabled value={session?.user?.email || ''} className="w-full bg-[#000000]/50 border border-[#27272A] rounded-xl px-3 py-2.5 text-xs text-[#A1A1AA] cursor-not-allowed" />
                  </div>
                </div>

                {/* THEME SELECTOR INSIDE THE FORM TO SAVE TOGETHER */}
                <div className="pt-4 border-t border-[#27272A]">
                  <h3 className="text-[#FAFAFA] text-sm font-medium mb-1">UI Theme Aesthetic</h3>
                  <p className="text-[10px] text-[#A1A1AA] mb-4">Select your preferred color palette (Requires global theme implementation to apply app-wide).</p>
                  
                  <div className="flex flex-wrap items-center gap-3">
                    <button 
                      type="button"
                      onClick={() => setTheme('blue')}
                      className={`flex items-center gap-2 border px-4 py-2 rounded-xl transition-all ${theme === 'blue' ? 'bg-[#3B82F6]/10 border-[#3B82F6]' : 'bg-[#000000] border-[#27272A] hover:border-[#3B82F6]/50'}`}
                    >
                      <div className="w-3 h-3 rounded-full bg-[#3B82F6]"></div>
                      <span className="text-xs text-[#FAFAFA] font-bold">Black & Blue</span>
                    </button>

                    <button 
                      type="button"
                      onClick={() => setTheme('emerald')}
                      className={`flex items-center gap-2 border px-4 py-2 rounded-xl transition-all ${theme === 'emerald' ? 'bg-[#10B981]/10 border-[#10B981]' : 'bg-[#000000] border-[#27272A] hover:border-[#10B981]/50'}`}
                    >
                      <div className="w-3 h-3 rounded-full bg-[#10B981] ring-1 ring-pink-300/30"></div>
                      <span className="text-xs text-[#FAFAFA] font-bold">Emerald & Pink</span>
                    </button>

                    <button 
                      type="button"
                      onClick={() => setTheme('purple')}
                      className={`flex items-center gap-2 border px-4 py-2 rounded-xl transition-all ${theme === 'purple' ? 'bg-[#8B5CF6]/10 border-[#8B5CF6]' : 'bg-[#000000] border-[#27272A] hover:border-[#8B5CF6]/50'}`}
                    >
                      <div className="w-3 h-3 rounded-full bg-[#8B5CF6]"></div>
                      <span className="text-xs text-[#FAFAFA] font-bold">Midnight Purple</span>
                    </button>
                    <button 
                      type="button"
                      onClick={() => handleThemeChange('orange')}
                      className={`flex items-center gap-2 border px-4 py-2 rounded-xl transition-all ${theme === 'orange' ? 'bg-[#F59E0B]/10 border-[#F59E0B]' : 'bg-[#000000] border-[#27272A] hover:border-[#F59E0B]/50'}`}
                    >
                      <div className="w-3 h-3 rounded-full bg-[#F59E0B]"></div>
                      <span className="text-xs text-[#FAFAFA] font-bold">Sunset Orange</span>
                    </button>

                    <button 
                      type="button"
                      onClick={() => handleThemeChange('cyan')}
                      className={`flex items-center gap-2 border px-4 py-2 rounded-xl transition-all ${theme === 'cyan' ? 'bg-[#06B6D4]/10 border-[#06B6D4]' : 'bg-[#000000] border-[#27272A] hover:border-[#06B6D4]/50'}`}
                    >
                      <div className="w-3 h-3 rounded-full bg-[#06B6D4]"></div>
                      <span className="text-xs text-[#FAFAFA] font-bold">Neon Cyan</span>
                    </button>
                  </div>
                </div>

                <div className="pt-6 flex justify-end">
                  <button type="submit" disabled={saving} className="bg-[#3B82F6] hover:bg-[#2563EB] text-white font-bold text-xs px-6 py-2.5 rounded-xl transition-colors shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </section>

            {/* SYSTEM PREFERENCES */}
            <section className="bg-[#0F0F11] border border-[#27272A] rounded-2xl p-6 mb-10 lg:mb-0 relative z-10">
              <h3 className="text-[#FAFAFA] text-sm font-medium mb-4">System Settings</h3>
              
              <div className="flex justify-between items-center py-2">
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