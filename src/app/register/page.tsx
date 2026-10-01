// src/app/register/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Register() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      router.push('/login');
    } else {
      const data = await res.json();
      setError(data.message || 'Registration failed');
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-[#0a0a0a] text-neutral-200 font-sans p-6 sm:p-12">
      
      <div className="w-full max-w-5xl flex flex-col lg:flex-row items-stretch gap-12 lg:gap-20">
        
        {/* Left Column - Register Form */}
        <div className="flex-1 flex flex-col justify-center w-full max-w-md mx-auto lg:mx-0 py-8">
          
          <div className="mb-6 flex gap-1 items-end">
            <div className="w-4 h-4 bg-emerald-500 rounded-sm"></div>
            <div className="w-4 h-6 bg-emerald-400 rounded-sm"></div>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Create an account</h1>
          <p className="text-sm text-neutral-400 leading-relaxed mb-8">
            Start tracking your fuel expenses and automating your logs in seconds.
          </p>

          <form onSubmit={handleRegister} className="flex flex-col gap-5">
            {error && (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm px-4 py-2 rounded-lg">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-neutral-300">Email</label>
              <input 
                type="text" required placeholder="youremail@yourdomain.com" 
                value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#1c1c1c] border border-[#2e2e2e] rounded-lg px-4 py-3 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500/50 focus:bg-[#222] transition-all"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-neutral-300">Password</label>
              <input 
                type="password" required placeholder="Create a password" 
                value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#1c1c1c] border border-[#2e2e2e] rounded-lg px-4 py-3 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500/50 focus:bg-[#222] transition-all"
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoading} 
              className="mt-2 w-full bg-emerald-500 hover:bg-emerald-400 border border-emerald-400 text-neutral-950 font-bold text-sm py-3 rounded-lg transition-all disabled:opacity-50"
            >
              {isLoading ? 'Creating account...' : 'Sign up'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-neutral-500">
            Already have an account?{' '}
            <Link href="/login" className="text-emerald-400 font-semibold hover:underline">
              Sign in
            </Link>
          </p>

        </div>

        {/* Right Column - Visual Graphic (Matches Login) */}
        <div className="hidden lg:flex flex-1 relative rounded-3xl overflow-hidden shadow-2xl bg-black">
          
          <div className="absolute inset-0 animate-rgb-gradient opacity-60"></div>
          
          <div 
            className="absolute inset-0 pointer-events-none opacity-[0.15]" 
            style={{ 
              backgroundImage: 'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)', 
              backgroundSize: '32px 32px' 
            }}
          ></div>

          <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-white/5 border border-white/10 rounded-[3rem] rotate-45 pointer-events-none backdrop-blur-[2px]"></div>
          <div className="absolute top-[5%] right-[15%] w-64 h-64 bg-white/5 border border-white/10 rounded-[2.5rem] rotate-45 pointer-events-none backdrop-blur-[2px]"></div>
          <div className="absolute top-[25%] right-[-5%] w-80 h-80 bg-white/5 border border-white/10 rounded-[3rem] rotate-45 pointer-events-none backdrop-blur-[2px]"></div>

          <div className="w-full h-full flex flex-col items-center justify-center p-10 relative z-10">
            <div className="bg-[#2a2a2a]/80 backdrop-blur-xl border border-[#3a3a3a] rounded-2xl p-6 max-w-md shadow-2xl">
              <div className="flex gap-2 mb-4">
                <span className="bg-[#3a3a3a] text-neutral-300 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full">Secure</span>
                <span className="bg-[#3a3a3a] text-neutral-300 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full">Encrypted</span>
              </div>
              
              <p className="text-neutral-100 text-sm leading-relaxed mb-6">
                "We take your data seriously. All credentials are fully encrypted using industry-standard bcrypt hashing before they ever hit the database."
              </p>
              
              <div className="flex flex-col">
                <span className="text-neutral-400 text-xs font-semibold">Security Protocol</span>
                <span className="text-neutral-500 text-[10px] uppercase tracking-wide mt-0.5">System Architecture, <strong className="text-neutral-300">trakr</strong></span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}