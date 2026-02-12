import React, { useState, useMemo } from 'react';
import { useStore } from '../context/Store';
import { useTheme } from '../context/ThemeContext';
import { calculateGlobalTargets, aggregateActuals } from '../utils/calculations';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { MONTH_NAMES } from '../constants';
import { Trophy, Target, Home, CheckCircle2, TrendingUp, Key, AlertTriangle, ArrowRight, CalendarCheck, ZoomIn, ArrowLeft } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { state } = useStore();
  const { theme } = useTheme();
  
  // Interaction State
  const [drillDownMonth, setDrillDownMonth] = useState<number | null>(null);

  // Calculations
  const targets = calculateGlobalTargets(state.assumptions);
  const actuals = aggregateActuals(state.tracking);
  
  const monthlyTargetR1 = targets.monthlyR1;
  const currentMonthIndex = new Date().getMonth();

  // --- CHART DATA PREPARATION ---
  
  // 1. Generate Yearly Data (Weeks 1-48)
  const yearlyWeeklyData = useMemo(() => {
      const data: any[] = [];
      state.tracking.forEach((month, mIdx) => {
          // Initialize 4 weeks for this month
          for(let w=0; w<4; w++) {
             const absIdx = (mIdx * 4) + w;
             data[absIdx] = {
                 uniqueId: `S${absIdx+1}`, 
                 name: `S${absIdx + 1}`,
                 monthIndex: mIdx,
                 monthName: MONTH_NAMES[mIdx],
                 weekInMonth: w + 1,
                 Actions: 0,
                 RDV: 0,
                 isCurrentMonth: mIdx === currentMonthIndex,
                 isFuture: mIdx > currentMonthIndex
             };
          }

          // Fill with actual data
          month.channelTracking.forEach(ct => {
              ct.weeks.forEach((w, wIdx) => {
                  const absIdx = (mIdx * 4) + wIdx;
                  if (data[absIdx]) {
                      data[absIdx].Actions += w.actionsDone;
                      data[absIdx].RDV += w.rdvObtained;
                  }
              });
          });
      });
      return data;
  }, [state.tracking, currentMonthIndex]);

  // 2. Filter Data based on View
  const chartData = useMemo(() => {
      if (drillDownMonth !== null) {
          // Zoomed View: Show 4 weeks of selected month
          return yearlyWeeklyData
            .filter(d => d.monthIndex === drillDownMonth)
            .map((d, i) => ({ ...d, name: `Sem ${i+1}` }));
      }
      // Default View: Show all weeks
      return yearlyWeeklyData;
  }, [yearlyWeeklyData, drillDownMonth]);

  const currentMonthR1 = state.tracking[currentMonthIndex].channelTracking.reduce((acc, ct) => {
    return acc + ct.weeks.reduce((sum, w) => sum + w.rdvObtained, 0);
  }, 0);
  const rdvProgress = monthlyTargetR1 > 0 ? Math.round((currentMonthR1 / monthlyTargetR1) * 100) : 0;
  
  const currentMonthKey = new Date().toISOString().substring(0, 7); 
  const activeDaysCount = state.activeDays.filter(d => d.startsWith(currentMonthKey)).length;

  // Handle Chart Click (Unified Handler for both Chart area and specific Bars)
  const handleUnifiedClick = (data: any) => {
      // 1. Unzoom if already zoomed (Reset view)
      if (drillDownMonth !== null) {
          setDrillDownMonth(null);
          return;
      }

      // 2. Identify Clicked Month Index
      let clickedMonthIndex: number | undefined;

      // Case A: Click on Chart Background (Recharts passes an object with activePayload)
      if (data && data.activePayload && data.activePayload.length > 0) {
          clickedMonthIndex = data.activePayload[0].payload.monthIndex;
      }
      // Case B: Click directly on a Bar (Recharts passes the data object itself)
      else if (data && data.monthIndex !== undefined) {
          clickedMonthIndex = data.monthIndex;
      }

      // 3. Zoom Action
      if (clickedMonthIndex !== undefined) {
          setDrillDownMonth(clickedMonthIndex);
      }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* 1. HERO SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* PRIMARY BLOCK: RDV VENDEURS */}
        <div className="lg:col-span-2 bg-capi-blue-600 dark:bg-capi-blue-700 rounded-3xl p-8 text-white shadow-xl shadow-capi-blue-200 dark:shadow-none relative overflow-hidden flex flex-col justify-between min-h-[240px]">
           <div className="absolute right-0 top-0 p-8 opacity-10"><Target size={200} /></div>
           <div className="relative z-10">
              <div className="flex items-center gap-2 mb-1">
                 <div className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-md text-white">Priorité N°1</div>
              </div>
              <h2 className="text-xl font-medium text-capi-blue-100">RDV Estimations ce mois-ci</h2>
           </div>
           <div className="relative z-10 mt-6">
              <div className="flex items-baseline gap-3">
                 <span className="text-7xl md:text-8xl font-black tracking-tighter text-white">{currentMonthR1}</span>
                 <span className="text-2xl text-capi-blue-200 font-medium">/ {monthlyTargetR1}</span>
              </div>
              <div className="mt-6">
                 <div className="w-full bg-capi-blue-900/30 h-3 rounded-full overflow-hidden backdrop-blur-sm">
                    <div className={`h-full rounded-full transition-all duration-1000 ${rdvProgress >= 100 ? 'bg-green-400' : 'bg-white'}`} style={{ width: `${Math.min(100, rdvProgress)}%` }}></div>
                 </div>
                 <div className="flex justify-between mt-2 text-sm font-medium text-capi-blue-100">
                    <span>{rdvProgress}% de l'objectif</span>
                    {rdvProgress < 50 ? <span className="flex items-center gap-1 text-orange-300"><AlertTriangle size={14}/> Accélérez</span> : <span className="flex items-center gap-1 text-green-300"><CheckCircle2 size={14}/> Bon rythme</span>}
                 </div>
              </div>
           </div>
        </div>

        {/* SECONDARY BLOCKS */}
        <div className="flex flex-col gap-6">
           <div className="flex-1 bg-white dark:bg-capi-dark-800 rounded-3xl p-6 border border-gray-100 dark:border-capi-dark-700 shadow-sm flex flex-col justify-center relative overflow-hidden group">
              <div className="absolute right-[-10px] top-[-10px] opacity-5 group-hover:opacity-10 transition-opacity dark:opacity-10 dark:text-white"><CalendarCheck size={100} /></div>
              <div className="relative z-10">
                 <h3 className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Régularité (Jours Actifs)</h3>
                 <div className="flex items-baseline justify-between">
                    <span className="text-4xl font-black text-gray-900 dark:text-white">{activeDaysCount}</span>
                    <span className="text-sm font-bold text-gray-400 bg-gray-50 dark:bg-capi-dark-700 dark:text-gray-300 px-2 py-1 rounded-lg">jours</span>
                 </div>
                 <div className="mt-2 text-xs font-bold flex items-center gap-1">
                    {activeDaysCount >= 12 ? <span className="text-green-500 flex items-center gap-1"><CheckCircle2 size={12}/> Discipline Top</span> : <span className="text-orange-500 flex items-center gap-1"><TrendingUp size={12}/> Soyez plus régulier</span>}
                 </div>
              </div>
           </div>
           <div className="flex-1 bg-white dark:bg-capi-dark-800 rounded-3xl p-6 border border-gray-100 dark:border-capi-dark-700 shadow-sm flex flex-col justify-center relative overflow-hidden group">
              <div className="absolute right-[-10px] top-[-10px] opacity-5 group-hover:opacity-10 transition-opacity dark:opacity-10 dark:text-white"><Trophy size={100} /></div>
              <div className="relative z-10">
                 <h3 className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Ventes Actées (Annuel)</h3>
                 <div className="flex items-baseline justify-between">
                    <span className="text-4xl font-black text-gray-900 dark:text-white">{actuals.sales}</span>
                    <span className="text-sm font-bold text-gray-400 bg-gray-50 dark:bg-capi-dark-700 dark:text-gray-300 px-2 py-1 rounded-lg">Obj: {targets.annualSales}</span>
                 </div>
                 <div className="mt-2 text-xs font-bold text-gray-400 dark:text-gray-500">CA: {actuals.turnover.toLocaleString()} €</div>
              </div>
           </div>
        </div>
      </div>

      {/* 2. INTERACTIVE CHART */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white dark:bg-capi-dark-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-capi-dark-700 lg:col-span-2 transition-colors relative">
          <div className="mb-6 flex justify-between items-end">
              <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                   {drillDownMonth !== null ? (
                       <button onClick={() => setDrillDownMonth(null)} className="flex items-center gap-1 text-capi-blue-600 dark:text-capi-blue-400 hover:underline">
                          <ArrowLeft size={18} /> Vue Annuelle
                       </button>
                   ) : "Votre régularité"}
                   {drillDownMonth !== null && (<> <span className="text-gray-300">/</span> {MONTH_NAMES[drillDownMonth]}</>)}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                   {drillDownMonth !== null ? "Détail hebdomadaire du mois." : "Cliquez sur une semaine pour voir le détail du mois."}
                </p>
              </div>
              <div onClick={() => drillDownMonth !== null ? setDrillDownMonth(null) : null} className="cursor-pointer hidden md:flex items-center gap-2 text-xs font-medium text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-capi-dark-900 px-3 py-1 rounded-full hover:bg-gray-100 dark:hover:bg-capi-dark-700 transition-colors">
                 {drillDownMonth === null && <ZoomIn size={14} />} 
                 {drillDownMonth !== null ? "Dézoomer" : "Zoom possible"}
              </div>
          </div>
          
          <div className="h-64 w-full cursor-pointer">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={chartData} 
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                onClick={handleUnifiedClick} // Gestionnaire sur le graphique global
                style={{ cursor: 'pointer' }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#233F5E' : '#f3f4f6'} />
                <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: theme === 'dark' ? '#94a3b8' : '#9ca3af', fontSize: 10}} 
                    dy={10} 
                    interval={drillDownMonth !== null ? 0 : 3} 
                />
                <YAxis axisLine={false} tickLine={false} tick={{fill: theme === 'dark' ? '#94a3b8' : '#9ca3af', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: theme === 'dark' ? '#0B1E33' : '#fff', color: theme === 'dark' ? '#fff' : '#000' }}
                  labelFormatter={(label, payload) => payload && payload[0] ? `${label} - ${payload[0].payload.monthName}` : label}
                  wrapperStyle={{ pointerEvents: 'none' }} 
                />
                <ReferenceLine y={Math.ceil(monthlyTargetR1/4)} stroke="#ef4444" strokeDasharray="3 3" />
                <Bar 
                    dataKey="Actions" 
                    radius={[4, 4, 0, 0]} 
                    barSize={drillDownMonth !== null ? 60 : undefined}
                    background={{ fill: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }} 
                    onClick={handleUnifiedClick} // Gestionnaire sur les barres (CRITIQUE pour le fonctionnement)
                    style={{ cursor: 'pointer' }}
                >
                  {chartData.map((entry: any, index: number) => (
                    <Cell 
                        key={`cell-${index}`} 
                        fill={entry.Actions > 0 ? '#0ea5e9' : (theme === 'dark' ? '#334155' : '#cbd5e1')} 
                        fillOpacity={entry.isFuture ? 0.3 : 1}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-capi-dark-900 p-6 rounded-3xl border border-gray-100 dark:border-capi-dark-700 flex flex-col h-full transition-colors">
           <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">État de santé</h3>
           <div className="space-y-6 flex-1">
               <div className="relative pl-4 border-l-2 border-gray-300 dark:border-gray-600">
                  <div className="text-xs font-bold uppercase text-gray-400 mb-1">Effort Terrain</div>
                  <div className="flex justify-between items-center">
                     <span className="font-bold text-gray-700 dark:text-gray-300">Actions</span>
                     <span className="text-sm font-medium bg-white dark:bg-capi-dark-800 dark:text-white px-2 py-1 rounded border border-gray-200 dark:border-capi-dark-700">{actuals.actions}</span>
                  </div>
               </div>
               <div className="relative pl-4 border-l-2 border-capi-blue-500">
                  <div className="text-xs font-bold uppercase text-capi-blue-400 mb-1">Conversion</div>
                  <div className="flex justify-between items-center">
                     <span className="font-bold text-capi-blue-900 dark:text-capi-blue-100">RDV & Mandats</span>
                     <span className="text-sm font-medium bg-white dark:bg-capi-dark-800 dark:text-white px-2 py-1 rounded border border-gray-200 dark:border-capi-dark-700">{actuals.rdv} / {actuals.mandates}</span>
                  </div>
               </div>
               <div className="relative pl-4 border-l-2 border-green-500">
                  <div className="text-xs font-bold uppercase text-green-500 mb-1">Closing</div>
                  <div className="flex justify-between items-center">
                     <span className="font-bold text-gray-700 dark:text-gray-300">Offres & Ventes</span>
                     <span className="text-sm font-medium bg-white dark:bg-capi-dark-800 dark:text-white px-2 py-1 rounded border border-gray-200 dark:border-capi-dark-700">{actuals.offers} / {actuals.sales}</span>
                  </div>
               </div>
           </div>
           {actuals.sales === 0 && <div className="mt-6 bg-white dark:bg-capi-dark-800 p-4 rounded-xl text-xs text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-capi-dark-700 italic">"Concentrez-vous sur la première étape : les actions terrain."</div>}
        </div>
      </div>
    </div>
  );
};