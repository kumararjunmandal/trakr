// src/app/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface FuelRecord {
  _id: string;
  refill_date: string;
  odo: number;
  'total cost': number;
  'price / litre': number;
  liters: number;
  remarks?: string;
}

export default function Home() {
  const { data: session } = useSession();
  const [mounted, setMounted] = useState<boolean>(false);
  const [records, setRecords] = useState<FuelRecord[]>([]);
  const [chartView, setChartView] = useState<'cost' | 'kmpl' | 'price' | 'liters'>('cost');
  const [filterMonth, setFilterMonth] = useState<string>('All Time');
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchRecords();
    
    // FETCH THEME FROM DB ON DASHBOARD LOAD
    const fetchUserTheme = async () => {
      try {
        const res = await fetch('/api/user');
        if (res.ok) {
          const userData = await res.json();
          if (userData.theme) {
            document.documentElement.setAttribute('data-theme', userData.theme);
          }
        }
      } catch (error) {
        console.error('Failed to fetch theme:', error);
      }
    };
    fetchUserTheme();
  }, []);

  const fetchRecords = async () => {
    try {
      const res = await fetch('/api/fuel');
      if (res.ok) setRecords(await res.json());
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this record?')) return;
    await fetch('/api/fuel', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    fetchRecords();
  };

  const { globalStats, trends, monthOptions, filteredChartData, filteredStats, filteredLatestRecords } = useMemo(() => {
    if (!records.length) {
      return { 
        globalStats: { totalSpent: 0, avgKmpl: 0, distance: 0, costPerKm: 0, latestPrice: 0, totalLiters: 0 }, 
        trends: { spent: 0, kmpl: 0, costPerKm: 0 },
        monthOptions: ['All Time'],
        filteredChartData: [],
        filteredStats: { totalSpent: 0, avgKmpl: 0, latestPrice: 0, totalLiters: 0 },
        filteredLatestRecords: [] 
      };
    }

    const sorted = [...records].sort((a, b) => a.odo - b.odo);
    const processed = sorted.map((record, index) => {
      let kmpl = 0;
      let costPerKm = 0;
      if (index > 0) {
        const distance = record.odo - sorted[index - 1].odo;
        if (distance > 0 && record.liters > 0) {
          kmpl = Number((distance / record.liters).toFixed(2));
          costPerKm = Number((record['total cost'] / distance).toFixed(2));
        }
      }
      return { 
        ...record, 
        kmpl, 
        costPerKm,
        displayDate: new Date(record.refill_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        filterMonthStr: new Date(record.refill_date).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
      };
    });

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const getStatsForPeriod = (month: number, year: number) => {
      const periodRecords = processed.filter(r => new Date(r.refill_date).getMonth() === month && new Date(r.refill_date).getFullYear() === year);
      const spent = periodRecords.reduce((sum, r) => sum + r['total cost'], 0);
      const validKmpl = periodRecords.filter(r => r.kmpl > 0);
      const avgKmpl = validKmpl.length ? validKmpl.reduce((sum, r) => sum + r.kmpl, 0) / validKmpl.length : 0;
      const validCpk = periodRecords.filter(r => r.costPerKm > 0);
      const avgCpk = validCpk.length ? validCpk.reduce((sum, r) => sum + r.costPerKm, 0) / validCpk.length : 0;
      return { spent, avgKmpl, avgCpk };
    };

    const currentStats = getStatsForPeriod(currentMonth, currentYear);
    const prevStats = getStatsForPeriod(prevMonth, prevYear);
    const calcTrend = (curr: number, prev: number) => prev > 0 ? ((curr - prev) / prev) * 100 : 0;

    const allTimeValidKmpl = processed.filter(r => r.kmpl > 0);
    const allTimeValidCpk = processed.filter(r => r.costPerKm > 0);

    const globalStats = {
      totalSpent: processed.reduce((sum, r) => sum + r['total cost'], 0), 
      avgKmpl: allTimeValidKmpl.length ? allTimeValidKmpl.reduce((sum, r) => sum + r.kmpl, 0) / allTimeValidKmpl.length : 0, 
      distance: processed.length > 0 ? processed[processed.length - 1].odo - processed[0].odo : 0,
      costPerKm: allTimeValidCpk.length ? allTimeValidCpk.reduce((sum, r) => sum + r.costPerKm, 0) / allTimeValidCpk.length : 0,
      latestPrice: processed[processed.length - 1]['price / litre'],
      totalLiters: processed.reduce((sum, r) => sum + r.liters, 0)
    };

    const trends = {
      spent: calcTrend(currentStats.spent, prevStats.spent),
      kmpl: calcTrend(currentStats.avgKmpl, prevStats.avgKmpl),
      costPerKm: calcTrend(currentStats.avgCpk, prevStats.avgCpk)
    };

    const extractedMonths = Array.from(new Set(processed.map(r => r.filterMonthStr)));
    const monthOptions = ['All Time', ...extractedMonths];

    const filtered = filterMonth === 'All Time' ? processed : processed.filter(r => r.filterMonthStr === filterMonth);
    const filteredValidKmpl = filtered.filter(r => r.kmpl > 0);
    
    const filteredStats = {
      totalSpent: filtered.reduce((sum, r) => sum + r['total cost'], 0),
      avgKmpl: filteredValidKmpl.length ? filteredValidKmpl.reduce((sum, r) => sum + r.kmpl, 0) / filteredValidKmpl.length : 0,
      latestPrice: filtered.length > 0 ? filtered[filtered.length - 1]['price / litre'] : 0,
      totalLiters: filtered.reduce((sum, r) => sum + r.liters, 0)
    };

    return { globalStats, trends, monthOptions, filteredChartData: filtered.slice(-20), filteredStats, filteredLatestRecords: [...filtered].reverse().slice(0, 10) };
  }, [records, filterMonth]);

  // UPDATE: Now uses 'var(--primary)' for the main cost chart to sync with theme
  const chartConfig = {
    cost: { key: 'total cost', label: 'Total Spent', color: 'var(--primary)', prefix: '₹', suffix: '' },
    kmpl: { key: 'kmpl', label: 'Efficiency', color: '#06B6D4', prefix: '', suffix: ' km/L' },
    price: { key: 'price / litre', label: 'Fuel Price', color: '#8B5CF6', prefix: '₹', suffix: '/L' },
    liters: { key: 'liters', label: 'Volume Added', color: '#10B981', prefix: '', suffix: ' L' }
  };
  const activeChart = chartConfig[chartView];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0F0F11] border border-[#27272A] p-3 rounded-lg shadow-xl z-50">
          <p className="text-[#A1A1AA] text-[10px] uppercase mb-1">{label}</p>
          <p style={{ color: activeChart.color }} className="text-sm font-bold">
            {activeChart.prefix}{payload[0].value.toLocaleString('en-IN')}{activeChart.suffix}
          </p>
        </div>
      );
    }
    return null;
  };

  const TrendBadge = ({ value, invert = false }: { value: number, invert?: boolean }) => {
    if (value === 0) return null;
    const isPositive = invert ? value < 0 : value > 0; 
    const color = isPositive ? 'text-[#10B981]' : 'text-[#EF4444]';
    return (
      <span className={`${color} text-[10px] font-bold ml-1.5 whitespace-nowrap`}>
        {value > 0 ? '↑' : '↓'} {Math.abs(value).toFixed(1)}%
      </span>
    );
  };

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-[#000000] text-[#FAFAFA] font-sans selection:bg-primary-faded lg:p-6 flex justify-center relative">
      
      {/* MOBILE HEADER */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#000000]/90 backdrop-blur-md border-b border-[#27272A] px-4 flex items-center justify-between z-[40]">
        <div className="flex items-center gap-2 text-[#FAFAFA] font-bold text-lg tracking-widest">
          <div className="text-primary">
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

      {/* SINGLE CENTERED WRAPPER */}
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
              <div className="text-primary">
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
            <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 bg-[#1A1A1C] lg:bg-[#0F0F11] text-[#FAFAFA] px-3 py-2.5 rounded-lg text-sm font-medium border border-primary/20 lg:border-[#27272A]">
               <span className="text-primary">∷</span> Dashboard
            </Link>
            <Link href="/add" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 text-[#A1A1AA] hover:text-[#FAFAFA] px-3 py-2.5 rounded-lg text-sm font-medium transition-colors">
               <span>+</span> Add Fuel Log
            </Link>
            <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 text-[#A1A1AA] hover:text-[#FAFAFA] px-3 py-2.5 rounded-lg text-sm font-medium transition-colors">
               <span>/_\</span> Profile Settings
            </Link>
            <button onClick={() => signOut({ callbackUrl: '/login' })} className="flex items-center gap-3 text-[#A1A1AA] hover:text-primary px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left mt-2">
               <span>x</span> Sign Out
            </button>
          </nav>

          <div className="flex flex-col gap-3 mt-6 pt-4 border-t border-[#27272A]">
            {/* <Link href="/add" onClick={() => setIsMobileMenuOpen(false)} className="w-full bg-primary hover:bg-primary-hover text-white py-3 lg:py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-primary-glow">
               Log Refill <span className="text-base leading-none">+</span>
            </Link> */}

            <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 bg-[#1A1A1C] lg:bg-[#0F0F11] hover:border-primary p-3 lg:p-2.5 rounded-xl border border-[#27272A] transition-colors cursor-pointer">
              {session?.user?.image ? (
                <img src={session.user.image} alt="User" className="w-9 h-9 lg:w-8 lg:h-8 rounded-full border border-[#27272A] shrink-0" />
              ) : (
                <div className="w-9 h-9 lg:w-8 lg:h-8 rounded-full bg-[#27272A] flex items-center justify-center text-[#FAFAFA] text-xs font-bold shrink-0">
                  {session?.user?.name?.charAt(0) || 'U'}
                </div>
              )}
              <div className="overflow-hidden">
                <div className="text-[#FAFAFA] text-xs font-bold truncate">{session?.user?.name || 'User'}</div>
                <div className="text-[#A1A1AA] text-[9px] truncate">{session?.user?.email || 'View Profile'}</div>
              </div>
            </Link>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <div className="flex flex-col flex-1 min-w-0 p-4 lg:p-0">
          
          {/* ROW 1: CHART AND LOGS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            
            {/* CHART AREA */}
            <div className="lg:col-span-2 flex flex-col gap-4 min-w-0">
              <section className="bg-[#0F0F11] border border-[#27272A] rounded-2xl p-5 sm:p-6 h-[420px] flex flex-col relative w-full overflow-hidden">
                
                {/* TOP CARD METRICS & TOGGLES */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 z-10">
                  <div className="w-full sm:w-auto">
                    <div className="flex items-center gap-4 mb-2">
                      <div>
                        <span className="text-[10px] uppercase text-[#A1A1AA] font-bold">Avg Efficiency</span>
                        <div className="flex items-center">
                          <span className="text-xs font-bold text-[#FAFAFA]">{globalStats.avgKmpl.toFixed(1)} km/L</span>
                          <TrendBadge value={trends.kmpl} />
                        </div>
                      </div>
                      <div className="border-l border-[#27272A] pl-4">
                        <span className="text-[10px] uppercase text-[#A1A1AA] font-bold">Cost / KM</span>
                        <div className="flex items-center">
                          <span className="text-xs font-bold text-[#FAFAFA]">₹{globalStats.costPerKm.toFixed(2)}</span>
                          <TrendBadge value={trends.costPerKm} invert={true} />
                        </div>
                      </div>
                    </div>

                    <h2 className="text-[#FAFAFA] text-sm font-medium truncate">
                      {activeChart.label} <span className="text-[#A1A1AA] text-xs font-normal">({filterMonth})</span>
                    </h2>
                    <div className="text-2xl sm:text-3xl font-bold text-[#FAFAFA]">
                      {chartView === 'cost' && `₹${filteredStats.totalSpent.toLocaleString('en-IN')}`}
                      {chartView === 'kmpl' && `${filteredStats.avgKmpl.toFixed(1)} km/L`}
                      {chartView === 'price' && `₹${filteredStats.latestPrice.toFixed(2)} /L`}
                      {chartView === 'liters' && `${filteredStats.totalLiters.toFixed(2)} L`}
                    </div>
                  </div>
                  
                  {/* CHART TOGGLES */}
                  <div className="inline-flex bg-[#000000] border border-[#27272A] p-1 rounded-lg w-fit max-w-full overflow-x-auto custom-scrollbar shrink-0">
                    <button onClick={() => setChartView('cost')} className={`text-[11px] px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${chartView === 'cost' ? 'bg-[#27272A] text-white font-bold' : 'text-[#A1A1AA] hover:text-white'}`}>Cost</button>
                    <button onClick={() => setChartView('kmpl')} className={`text-[11px] px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${chartView === 'kmpl' ? 'bg-[#27272A] text-white font-bold' : 'text-[#A1A1AA] hover:text-white'}`}>Efficiency</button>
                    <button onClick={() => setChartView('price')} className={`text-[11px] px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${chartView === 'price' ? 'bg-[#27272A] text-white font-bold' : 'text-[#A1A1AA] hover:text-white'}`}>Price</button>
                    <button onClick={() => setChartView('liters')} className={`text-[11px] px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${chartView === 'liters' ? 'bg-[#27272A] text-white font-bold' : 'text-[#A1A1AA] hover:text-white'}`}>Volume</button>
                  </div>
                </div>

                <div className="flex-1 w-full min-h-0 relative z-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={filteredChartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorDynamic" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={activeChart.color} stopOpacity={0.25}/>
                          <stop offset="95%" stopColor={activeChart.color} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="displayDate" stroke="#27272A" fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#27272A', strokeWidth: 1, strokeDasharray: '4 4' }} />
                      <Area type="monotone" dataKey={activeChart.key} stroke={activeChart.color} strokeWidth={2.5} fillOpacity={1} fill="url(#colorDynamic)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </section>
            </div>

            {/* RECENT LOGS WIDGET */}
            <div className="flex flex-col gap-4 min-w-0">
              <section className="bg-[#0F0F11] border border-[#27272A] rounded-2xl p-5 h-[420px] overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-center mb-4 sticky top-0 bg-[#0F0F11] pb-2 z-10">
                  <h3 className="text-[#FAFAFA] text-sm font-medium truncate">Logs ({filterMonth})</h3>
                  <button className="text-[#A1A1AA] shrink-0">⋮</button>
                </div>
                <div className="flex flex-col gap-0">
                  {filteredLatestRecords.map((r) => (
                    <div key={r._id} className="flex justify-between items-center py-3 border-b border-[#27272A] last:border-0 group">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-6 h-6 rounded-full bg-[#27272A] flex items-center justify-center text-[10px] text-[#FAFAFA] shrink-0">⛽</div>
                        <div className="overflow-hidden">
                          <div className="text-[#FAFAFA] text-xs font-medium truncate">{r.displayDate}</div>
                          <div className="text-[#A1A1AA] text-[10px] truncate">Odo: {r.odo} km</div>
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-2 shrink-0">
                        <div>
                          <div className="text-[#FAFAFA] text-xs font-medium">₹{r['total cost']}</div>
                          <div className="text-primary text-[10px]">{r.liters}L</div>
                        </div>
                        <button onClick={() => handleDelete(r._id)} className="opacity-100 lg:opacity-0 group-hover:opacity-100 text-[#A1A1AA] hover:text-[#ef4444] text-xs p-1 transition-opacity">✕</button>
                      </div>
                    </div>
                  ))}
                  {filteredLatestRecords.length === 0 && <div className="text-xs text-[#A1A1AA] mt-2">No logs found.</div>}
                </div>
              </section>
            </div>
          </div>

          {/* MONTH FILTER CONTROLS */}
          <div className="mt-6 mb-4 flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar w-full">
            <span className="shrink-0 whitespace-nowrap text-[#A1A1AA] text-[10px] font-bold uppercase tracking-widest mr-2 flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
              Filter Data
            </span>
            <div className="flex flex-nowrap gap-2">
              {monthOptions.map(month => (
                <button 
                  key={month}
                  onClick={() => setFilterMonth(month)}
                  className={`shrink-0 px-4 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all ${filterMonth === month ? 'bg-primary text-white shadow-primary-glow' : 'bg-[#0F0F11] border border-[#27272A] text-[#A1A1AA] hover:text-[#FAFAFA]'}`}
                >
                  {month}
                </button>
              ))}
            </div>
          </div>

          {/* ROW 2: MAP WIDGET */}
          <section className="bg-[#0F0F11] border border-[#27272A] rounded-2xl p-5 flex flex-col h-[450px] mb-8 lg:mb-0">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[#FAFAFA] text-sm font-medium flex items-center gap-2">
                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" className="stroke-primary" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                 Nearby Stations
              </h3>
              <span className="text-[#A1A1AA] text-xs">Live Locator</span>
            </div>
            
            <div className="flex-1 w-full rounded-xl overflow-hidden border border-[#27272A] bg-[#000000] relative">
              <iframe 
                width="100%" 
                height="100%" 
                frameBorder="0" 
                scrolling="no" 
                src="https://maps.google.com/maps?q=petrol%20pump%20in%20Kolkata&t=m&z=13&output=embed&iwloc=near" 
                title="Nearby Petrol Pumps"
                className="absolute inset-0 w-full h-full grayscale-[90%] invert-[100%] contrast-[85%] hue-rotate-180 opacity-80"
              ></iframe>
            </div>
          </section>

        </div>
      </div>
    </main>
  );
}