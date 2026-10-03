// src/app/login/page.tsx
'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const res = await signIn('credentials', {
      username: email, 
      password,
      redirect: false,
    });

    if (res?.error) {
      setError('Invalid email or password');
      setIsLoading(false);
    } else {
      router.push('/');
    }
  };

  const handleGoogleLogin = () => {
    signIn('google', { callbackUrl: '/' });
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-[#0a0a0a] text-neutral-200 font-sans p-6 sm:p-12">
      
      <div className="w-full max-w-5xl flex flex-col lg:flex-row items-stretch gap-12 lg:gap-20">
        
        {/* Left Column - Login Form */}
        <div className="flex-1 flex flex-col justify-center w-full max-w-md mx-auto lg:mx-0 py-8">
          
          <div className="mb-6 flex gap-1 items-end">
            <div className="w-4 h-4 bg-emerald-500 rounded-sm"></div>
            <div className="w-4 h-6 bg-emerald-400 rounded-sm"></div>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Welcome back!</h1>
          <p className="text-sm text-neutral-400 leading-relaxed mb-8">
          
          </p>

          <form onSubmit={handleCredentialsLogin} className="flex flex-col gap-5">
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
                type="password" required placeholder="********" 
                value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#1c1c1c] border border-[#2e2e2e] rounded-lg px-4 py-3 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500/50 focus:bg-[#222] transition-all"
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoading} 
              className="mt-2 w-full bg-[#2a2a2a] hover:bg-[#333] border border-[#3a3a3a] text-white font-medium text-sm py-3 rounded-lg transition-all disabled:opacity-50"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="relative flex items-center py-6 mt-2">
            <div className="flex-grow border-t border-[#2e2e2e]"></div>
            <span className="flex-shrink-0 mx-4 text-neutral-500 text-xs">or</span>
            <div className="flex-grow border-t border-[#2e2e2e]"></div>
          </div>

          <button 
            onClick={handleGoogleLogin} 
            type="button" 
            className="w-full bg-[#1c1c1c] hover:bg-[#222] border border-[#2e2e2e] rounded-lg py-3 flex justify-center items-center gap-3 transition-colors text-sm font-medium text-neutral-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with Google
          </button>

          <p className="mt-8 text-center text-sm text-neutral-500">
            Already have an account?{' '}
            <Link href="/register" className="text-orange-500 font-semibold hover:underline">
              Sign up
            </Link>
          </p>

        </div>

        {/* Right Column - Visual Graphic */}
        <div className="hidden lg:flex flex-1 relative rounded-3xl overflow-hidden shadow-2xl bg-black">
          
          {/* Animated RGB Gradient Background */}
          <div className="absolute inset-0 animate-rgb-gradient opacity-60"></div>
          
          {/* Small Squares Grid Overlay */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-[0.15]" 
            style={{ 
              backgroundImage: 'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)', 
              backgroundSize: '32px 32px' 
            }}
          ></div>

          {/* Aceternity Large Background Diamonds */}
          <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-white/5 border border-white/10 rounded-[3rem] rotate-45 pointer-events-none backdrop-blur-[2px]"></div>
          <div className="absolute top-[5%] right-[15%] w-64 h-64 bg-white/5 border border-white/10 rounded-[2.5rem] rotate-45 pointer-events-none backdrop-blur-[2px]"></div>
          <div className="absolute top-[25%] right-[-5%] w-80 h-80 bg-white/5 border border-white/10 rounded-[3rem] rotate-45 pointer-events-none backdrop-blur-[2px]"></div>

          {/* Centered Inner Content */}
          <div className="w-full h-full flex flex-col items-center justify-center p-10 relative z-10">
            <div className="bg-[#2a2a2a]/80 backdrop-blur-xl border border-[#3a3a3a] rounded-2xl p-6 max-w-md shadow-2xl">
              <div className="flex gap-2 mb-4">
                <span className="bg-[#3a3a3a] text-neutral-300 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full">Product Company</span>
                <span className="bg-[#3a3a3a] text-neutral-300 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full">Online Management</span>
              </div>
              
              <p className="text-neutral-100 text-sm leading-relaxed mb-6">
                "Trakr is a game-changer for managing fuel expenses. The intuitive interface makes it easy to track and control costs."
              </p>
              
              <div className="flex flex-col">
                <span className="text-neutral-400 text-xs font-semibold">snowman</span>
                <span className="text-neutral-500 text-[10px] uppercase tracking-wide mt-0.5">Creator of  <strong className="text-neutral-300">Darcseid Inc.</strong></span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}