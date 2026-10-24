// src/app/reset-password/page.tsx
'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to reset password');
      }

      setSuccess(true);
      setTimeout(() => router.push('/login'), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center text-rose-400 p-6 bg-rose-500/10 border border-rose-500/30 rounded-lg">
        Invalid or missing reset token.
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto py-8">
      <div className="mb-6 flex gap-1 items-end">
        <div className="w-4 h-4 bg-emerald-500 rounded-sm"></div>
        <div className="w-4 h-6 bg-emerald-400 rounded-sm"></div>
      </div>

      <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Create New Password</h1>
      <p className="text-sm text-neutral-400 leading-relaxed mb-8">
        Your new password must be different from previously used passwords.
      </p>

      {success ? (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm px-4 py-4 rounded-lg text-center">
          Password reset successfully! Redirecting to login...
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm px-4 py-2 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-neutral-300">New Password</label>
            <input 
              type="password" required placeholder="***********" 
              value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#1c1c1c] border border-[#2e2e2e] rounded-lg px-4 py-3 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500/50 focus:bg-[#222] transition-all"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-neutral-300">Confirm Password</label>
            <input 
              type="password" required placeholder="***********" 
              value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-[#1c1c1c] border border-[#2e2e2e] rounded-lg px-4 py-3 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500/50 focus:bg-[#222] transition-all"
            />
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting} 
            className="mt-2 w-full bg-[#2a2a2a] hover:bg-[#333] border border-[#3a3a3a] text-white font-medium text-sm py-3 rounded-lg transition-all disabled:opacity-50"
          >
            {isSubmitting ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      )}
    </div>
  );
}

export default function ResetPassword() {
  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-[#0a0a0a] text-neutral-200 font-sans p-6 sm:p-12">
      <Suspense fallback={<div className="text-emerald-500">Loading...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </main>
  );
}