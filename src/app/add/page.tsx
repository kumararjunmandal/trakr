// src/app/add/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';

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
    <DashboardLayout>
      <div className="flex items-center gap-4 mb-6">
        <Link 
          href="/" 
          className="flex items-center justify-center w-10 h-10 bg-[#0F0F11] border border-[#27272A] rounded-xl text-[#A1A1AA] hover:text-[#FAFAFA] hover:border-primary transition-all shadow-sm focus:outline-none"
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </Link>
        <div>
          <h1 className="text-[#FAFAFA] text-xl font-bold leading-tight">Log New Refill</h1>
          <p className="text-[#A1A1AA] text-xs">Enter your latest fuel statistics</p>
        </div>
      </div>

      <div className="flex flex-col gap-4 flex-1 max-w-3xl">
        <section className="bg-[#0F0F11] border border-[#27272A] rounded-2xl p-6 sm:p-8 relative overflow-hidden transition-colors">
          
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-faded blur-[100px] rounded-full pointer-events-none transition-colors"></div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6 relative z-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase font-bold text-[#A1A1AA] block mb-1">Refill Date</label>
                <input type="date" required value={form.refillDate} onChange={(e) => setForm({...form, refillDate: e.target.value})} className="w-full bg-[#000000] border border-[#27272A] rounded-xl px-4 py-3 text-sm text-[#FAFAFA] focus:outline-none focus:border-primary transition-colors" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase font-bold text-[#A1A1AA] block mb-1">Current Odometer</label>
                <input type="number" required placeholder="e.g. 45000" value={form.odo} onChange={(e) => setForm({...form, odo: e.target.value})} className="w-full bg-[#000000] border border-[#27272A] rounded-xl px-4 py-3 text-sm text-[#FAFAFA] placeholder-[#A1A1AA]/40 focus:outline-none focus:border-primary transition-colors" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase font-bold text-[#A1A1AA] block mb-1">Total Cost (₹)</label>
                <input type="number" step="any" required placeholder="0.00" value={form.totalCost} onChange={(e) => setForm({...form, totalCost: e.target.value})} className="w-full bg-[#000000] border border-[#27272A] rounded-xl px-4 py-3 text-sm text-[#FAFAFA] placeholder-[#A1A1AA]/40 focus:outline-none focus:border-primary transition-colors" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase font-bold text-[#A1A1AA] block mb-1">Price / Litre (₹)</label>
                <input type="number" step="any" required placeholder="0.00" value={form.pricePerLitre} onChange={(e) => setForm({...form, pricePerLitre: e.target.value})} className="w-full bg-[#000000] border border-[#27272A] rounded-xl px-4 py-3 text-sm text-[#FAFAFA] placeholder-[#A1A1AA]/40 focus:outline-none focus:border-primary transition-colors" />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase font-bold text-[#A1A1AA] block mb-1">Remarks (Optional)</label>
              <input type="text" placeholder="mira-newtown-me" value={form.remarks} onChange={(e) => setForm({...form, remarks: e.target.value})} className="w-full bg-[#000000] border border-[#27272A] rounded-xl px-4 py-3 text-sm text-[#FAFAFA] placeholder-[#A1A1AA]/40 focus:outline-none focus:border-primary transition-colors" />
            </div>

            <div className="mt-2 flex justify-between items-center bg-[#000000] border border-[#27272A] rounded-xl p-5 shadow-inner">
              <span className="text-xs uppercase tracking-wider font-bold text-[#A1A1AA]">Total Volume Added</span>
              <span className="text-3xl font-black text-primary transition-colors">{liters} <span className="text-lg text-[#A1A1AA]">L</span></span>
            </div>
            
            <div className="pt-2 flex justify-end">
              <button type="submit" disabled={isSubmitting} className="w-full bg-primary hover:bg-primary-hover text-white font-bold text-sm uppercase tracking-widest py-4 rounded-xl transition-colors shadow-primary-glow disabled:opacity-50">
                {isSubmitting ? 'Saving...' : 'Save Record'}
              </button>
            </div>
          </form>
        </section>
      </div>
    </DashboardLayout>
  );
}