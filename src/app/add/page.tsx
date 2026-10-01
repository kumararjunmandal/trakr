// src/app/add/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signOut } from 'next-auth/react';

interface FuelForm {
  odo: string;
  totalCost: string;
  pricePerLitre: string;
  refillDate: string;
  remarks: string;
}

export default function AddFuel() {
  const router = useRouter();
  const getTodayDate = () => new Date().toISOString().split('T')[0];

  const [form, setForm] = useState<FuelForm>({ 
    odo: '', totalCost: '', pricePerLitre: '', refillDate: getTodayDate(), remarks: ''
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const liters: string = form.totalCost && form.pricePerLitre 
    ? (parseFloat(form.totalCost) / parseFloat(form.pricePerLitre)).toFixed(2) 
    : '0.00';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    await fetch('/api/fuel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        odo: parseFloat(form.odo),
        "total cost": parseFloat(form.totalCost),
        "price / litre": parseFloat(form.pricePerLitre),
        liters: parseFloat(liters),
        refill_date: form.refillDate,
        remarks: form.remarks
      })
    });

    router.push('/');
    router.refresh();
  };

  return (
    <main className="min-h-screen bg-[#000000] text-[#FAFAFA] font-sans selection:bg-[#3B82F6]/30 p-4 flex justify-center">
      <div className="w-full max-w-[1400px] grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-4">
        
        {/* SIDEBAR */}
        <aside className="hidden lg:flex flex-col bg-[#000000] border-r border-[#27272A] pr-4 py-2">
          <div className="flex items-center gap-3 text-[#FAFAFA] font-bold text-lg mb-10 px-2">
            <div className="text-[#3B82F6]">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 2 22 22 22"></polygon></svg>
            </div>
            TRAKR
          </div>

          <nav className="flex flex-col gap-1">
            <div className="text-[11px] text-[#A1A1AA] mb-2 px-3">Menu</div>
            <Link href="/" className="flex items-center gap-3 text-[#A1A1AA] hover:text-[#FAFAFA] px-3 py-2.5 rounded-lg text-sm font-medium transition-colors">
               <span>∷</span> Dashboard
            </Link>
            <Link href="/add" className="flex items-center gap-3 bg-[#0F0F11] text-[#FAFAFA] px-3 py-2.5 rounded-lg text-sm font-medium border border-[#27272A]">
               <span className="text-[#3B82F6]">+</span> Add Fuel Log
            </Link>
            <button onClick={() => signOut({ callbackUrl: '/login' })} className="flex items-center gap-3 text-[#A1A1AA] hover:text-[#3B82F6] px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left mt-2">
               <span>⚙</span> Sign Out
            </button>
          </nav>
        </aside>

        {/* MAIN CONTENT */}
        <div className="flex flex-col flex-1 pl-0 lg:pl-2">
          
          {/* HEADER */}
          <header className="flex items-center justify-between mb-6 bg-[#000000]">
            <div className="flex items-center gap-3">
               <Link href="/" className="text-[#A1A1AA] hover:text-[#3B82F6] transition-colors p-2 bg-[#0F0F11] rounded-lg border border-[#27272A]">
                 <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
               </Link>
               <div>
                 <div className="text-[#FAFAFA] text-sm font-bold">Log New Refill</div>
                 <div className="text-[#A1A1AA] text-[10px]">Enter your latest fuel statistics</div>
               </div>
            </div>
          </header>

          {/* LARGE CENTERED FORM */}
          <div className="flex-1 bg-[#0F0F11] border border-[#27272A] rounded-2xl p-6 lg:p-12 flex items-center justify-center shadow-2xl relative overflow-hidden">
            
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#3B82F6]/5 blur-[100px] rounded-full pointer-events-none"></div>

            <form onSubmit={handleSubmit} className="w-full max-w-lg flex flex-col gap-6 relative z-10">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-[#A1A1AA]">Refill Date</label>
                  <input type="date" required value={form.refillDate} onChange={(e) => setForm({...form, refillDate: e.target.value})} className="w-full bg-[#000000] border border-[#27272A] rounded-xl px-4 py-3.5 text-sm text-[#FAFAFA] focus:outline-none focus:border-[#3B82F6] transition-colors" />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-[#A1A1AA]">Current Odometer</label>
                  <input type="number" required placeholder="e.g. 45000" value={form.odo} onChange={(e) => setForm({...form, odo: e.target.value})} className="w-full bg-[#000000] border border-[#27272A] rounded-xl px-4 py-3.5 text-sm text-[#FAFAFA] placeholder-[#A1A1AA]/40 focus:outline-none focus:border-[#3B82F6] transition-colors" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-[#A1A1AA]">Total Cost (₹)</label>
                  <input type="number" step="any" required placeholder="0.00" value={form.totalCost} onChange={(e) => setForm({...form, totalCost: e.target.value})} className="w-full bg-[#000000] border border-[#27272A] rounded-xl px-4 py-3.5 text-sm text-[#FAFAFA] placeholder-[#A1A1AA]/40 focus:outline-none focus:border-[#3B82F6] transition-colors" />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-[#A1A1AA]">Price / Litre (₹)</label>
                  <input type="number" step="any" required placeholder="0.00" value={form.pricePerLitre} onChange={(e) => setForm({...form, pricePerLitre: e.target.value})} className="w-full bg-[#000000] border border-[#27272A] rounded-xl px-4 py-3.5 text-sm text-[#FAFAFA] placeholder-[#A1A1AA]/40 focus:outline-none focus:border-[#3B82F6] transition-colors" />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-wider font-bold text-[#A1A1AA]">Remarks (Optional)</label>
                <input type="text" placeholder="e.g. Highway trip, XP95" value={form.remarks} onChange={(e) => setForm({...form, remarks: e.target.value})} className="w-full bg-[#000000] border border-[#27272A] rounded-xl px-4 py-3.5 text-sm text-[#FAFAFA] placeholder-[#A1A1AA]/40 focus:outline-none focus:border-[#3B82F6] transition-colors" />
              </div>

              {/* Large Display Box */}
              <div className="mt-4 flex justify-between items-center bg-[#000000] border border-[#27272A] rounded-xl p-5 shadow-inner">
                <span className="text-xs uppercase tracking-wider font-bold text-[#A1A1AA]">Total Volume Added</span>
                <span className="text-3xl font-black text-[#3B82F6]">{liters} <span className="text-lg text-[#A1A1AA]">L</span></span>
              </div>
              
              {/* Submit Button */}
              <button type="submit" disabled={isSubmitting} className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white font-black text-sm uppercase tracking-widest py-4 rounded-xl transition-colors disabled:opacity-50 mt-2 shadow-[0_0_20px_rgba(59,130,246,0.15)]">
                {isSubmitting ? 'Saving...' : 'Save Record'}
              </button>
            </form>

          </div>
        </div>
      </div>
    </main>
  );
}