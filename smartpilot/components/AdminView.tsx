import React, { useState, useMemo } from 'react';
import { useStore } from '../context/Store';
import { useTheme } from '../context/ThemeContext';
import { calculateGlobalTargets, calculateChannelTargets } from '../utils/calculations';
import { MONTH_NAMES } from '../constants';
import { 
  Users, Calendar, BarChart2, TrendingUp, TrendingDown, Minus, 
  Activity, Target, BrainCircuit, AlertTriangle, CheckCircle2, Clock,
  ArrowLeft, ZoomIn, Award, Filter, ZoomOut
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';

// --- BENCHMARKS MARCHÉ ---
const BENCHMARKS = {
  actionsToContact: 30, 
  contactToRdv: 15,     
  rdvToMandate: 25,     
  mandateToSale: 70     
};

export const AdminView: React.FC = () => {
  const { state } = useStore();
  const { theme } = useTheme();
  
  // State for Selection
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [drillDownMonth, setDrillDownMonth] = useState<number | null>(null);
  
  // --- 1. DATA PREPARATION ---
  const globalTargets = calculateGlobalTargets(state.assumptions);
  const channelTargets = calculateChannelTargets(globalTargets.monthlyR1, state.assumptions.channels);
  const totalActionTarget = channelTargets.reduce((sum, t) => sum + t.monthlyActionTarget, 0);

  // Get Current & Previous Month Data for KPIs
  const currentData = state.tracking[selectedMonth];
  const prevMonthIndex = selectedMonth === 0 ? 11 : selectedMonth - 1; 
  const prevData = selectedMonth === 0 ? null : state.tracking[prevMonthIndex];

  // --- 2. CALCULATE METRICS (AGGREGATION) ---
  const aggregateMonth = (monthData: typeof currentData) => {
    let actions = 0, contacts = 0, rdv = 0;
    
    // Channel details for the table
    const channelsDetail = state.assumptions.channels
        .filter(c => c.enabled)
        .map(channel => {
            const track = monthData.channelTracking.find(t => t.channelId === channel.id);
            const target = channelTargets.find(t => t.channelId === channel.id);
            
            let cActions = 0, cContacts = 0, cRdv = 0;
            track?.weeks.forEach(w => {
                cActions += w.actionsDone;
                cContacts += w.contactsObtained;
                cRdv += w.rdvObtained;
            });
            
            actions += cActions;
            contacts += cContacts;
            rdv += cRdv;

            const efficiency = cRdv > 0 ? Math.round(cActions / cRdv) : 0;

            return {
                id: channel.id,
                name: channel.name,
                category: channel.category,
                unit: channel.actionUnit,
                targetActions: target?.monthlyActionTarget || 0,
                actualActions: cActions,
                contacts: cContacts,
                rdv: cRdv,
                efficiency,
                conversionRate: cActions > 0 ? (cRdv / cActions) * 100 : 0
            };
        })
        .sort((a, b) => b.rdv - a.rdv); 

    return { actions, contacts, rdv, mandates: monthData.manualMandates, sales: monthData.manualSales, channelsDetail };
  };

  const current = aggregateMonth(currentData);
  const prev = prevData ? aggregateMonth(prevData) : null;

  // Active Days (Regularity)
  const currentYear = new Date().getFullYear(); 
  const monthString = `${currentYear}-${String(selectedMonth + 1).padStart(2, '0')}`;
  const activeDaysCount = state.activeDays.filter(d => d.startsWith(monthString)).length;
  const volumeScore = Math.min(100, (current.actions / totalActionTarget) * 100);
  const regularityScore = Math.min(100, (activeDaysCount / 12) * 100);
  const engagementScore = Math.round((volumeScore * 0.6) + (regularityScore * 0.4));

  // Funnel Ratios
  const ratioActToCtc = current.actions > 0 ? (current.contacts / current.actions) * 100 : 0;
  const ratioCtcToRdv = current.contacts > 0 ? (current.rdv / current.contacts) * 100 : 0;
  const ratioRdvToMdt = current.rdv > 0 ? (current.mandates / current.rdv) * 100 : 0;
  const ratioMdtToVte = current.mandates > 0 ? (current.sales / current.mandates) * 100 : 0;
  const prevRatioCtcToRdv = prev && prev.contacts > 0 ? (prev.rdv / prev.contacts) * 100 : 0;

  // --- 3. CHART DATA (IDENTICAL TO DASHBOARD) ---
  const currentMonthIndex = new Date().getMonth();
  
  const yearlyWeeklyData = useMemo(() => {
      const data: any[] = [];
      state.tracking.forEach((month, mIdx) => {
          for(let w=0; w<4; w++) {
             const absIdx = (mIdx * 4) + w;
             data[absIdx] = {
                 name: `S${absIdx + 1}`,
                 monthIndex: mIdx,
                 monthName: MONTH_NAMES[mIdx],
                 Actions: 0,
                 RDV: 0,
                 isFuture: mIdx > currentMonthIndex
             };
          }
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

  const chartData = useMemo(() => {
      if (drillDownMonth !== null) {
          return yearlyWeeklyData
            .filter(d => d.monthIndex === drillDownMonth)
            .map((d, i) => ({ ...d, name: `Sem ${i+1}` }));
      }
      return yearlyWeeklyData;
  }, [yearlyWeeklyData, drillDownMonth]);

  const handleUnifiedClick = (data: any) => {
      // Toggle logic: If drilled down, any click resets.
      if (drillDownMonth !== null) {
          setDrillDownMonth(null);
          return;
      }

      // Identify Month Index
      let clickedMonthIndex: number | undefined;

      if (data && data.activePayload && data.activePayload.length > 0) {
          clickedMonthIndex = data.activePayload[0].payload.monthIndex;
      } else if (data && data.monthIndex !== undefined) {
          clickedMonthIndex = data.monthIndex;
      }

      if (clickedMonthIndex !== undefined) {
          setDrillDownMonth(clickedMonthIndex);
          setSelectedMonth(clickedMonthIndex); // Sync Admin Selection
      }
  };

  const handleResetZoom = () => setDrillDownMonth(null);

  // Coach Summary
  const getCoachSummary = () => {
    if (current.actions === 0) return { title: "Arrêt total d'activité", desc: "Aucune action enregistrée. Relancez la machine.", color: "bg-red-500", textColor: "text-red-100" };
    if (engagementScore < 50) return { title: "Manque de volume", desc: `Volume insuffisant (${Math.round(volumeScore)}% de l'objectif). L'intensité doit doubler.`, color: "bg-orange-500", textColor: "text-orange-100" };
    return { title: "Bonne dynamique", desc: "Les voyants sont au vert. Continuez à maintenir ce rythme.", color: "bg-green-600", textColor: "text-green-100" };
  };
  const coach = getCoachSummary();

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-gray-200 dark:border-capi-dark-700 pb-6">
        <div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">Reporting Stratégique</h2>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Analyse comparative et détection des leviers de croissance.</p>
        </div>
        <div className="relative w-full md:w-auto">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400"><Calendar size={16} /></div>
            <select 
              value={selectedMonth} 
              onChange={(e) => {
                  const m = parseInt(e.target.value);
                  setSelectedMonth(m);
                  setDrillDownMonth(m); // Auto zoom on select
              }}
              className="pl-10 pr-8 py-2 bg-white dark:bg-capi-dark-800 border border-gray-300 dark:border-capi-dark-700 rounded-lg text-sm font-medium text-gray-700 dark:text-white shadow-sm focus:border-capi-blue-500 focus:ring-1 focus:ring-capi-blue-500 outline-none cursor-pointer w-full md:w-auto"
            >
              {MONTH_NAMES.map((m, i) => <option key={i} value={i}>{m}</option>)}
            </select>
        </div>
      </div>

      {/* BLOC COACH */}
      <div className={`${coach.color} rounded-2xl p-6 text-white shadow-lg relative overflow-hidden`}>
         <div className="absolute top-0 right-0 p-6 opacity-10"><BrainCircuit size={100} /></div>
         <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2 opacity-90"><Activity size={18} /><span className="text-xs font-black uppercase tracking-widest">Synthèse Coach</span></div>
            <h3 className="text-2xl font-black mb-2">{coach.title}</h3>
            <p className={`font-medium opacity-90 text-sm md:text-base max-w-2xl ${coach.textColor}`}>{coach.desc}</p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* BLOC 1: ENGAGEMENT */}
         <div className="bg-white dark:bg-capi-dark-800 rounded-2xl border border-gray-200 dark:border-capi-dark-700 p-6 shadow-sm flex flex-col justify-between">
             <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2"><Target className="text-capi-blue-600" size={20} />Implication</h3>
                <span className={`px-2 py-1 rounded text-xs font-bold ${engagementScore >= 70 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>Score: {engagementScore}/100</span>
             </div>
             <div className="space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-capi-dark-700">
                   <div className="text-sm text-gray-500">Jours Actifs</div>
                   <div className="text-xl font-black text-gray-900 dark:text-white">{activeDaysCount} <span className="text-xs font-normal text-gray-400">jours</span></div>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-capi-dark-700">
                   <div className="text-sm text-gray-500">Volume Actions</div>
                   <div className="text-right"><div className="text-xl font-black text-gray-900 dark:text-white">{current.actions}</div><div className="text-xs text-gray-400">Obj: {totalActionTarget}</div></div>
                </div>
                <div className="flex justify-between items-center">
                   <div className="text-sm text-gray-500">Intensité</div>
                   <div className="text-right"><div className="text-xl font-black text-gray-900 dark:text-white">~ {Math.round(current.actions / 4)}</div><div className="text-xs text-gray-400">/ sem</div></div>
                </div>
             </div>
         </div>

         {/* BLOC 3: CHART (IDENTICAL TO DASHBOARD) */}
         <div className="lg:col-span-2 bg-white dark:bg-capi-dark-800 rounded-2xl border border-gray-200 dark:border-capi-dark-700 p-6 shadow-sm relative">
             <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                   {drillDownMonth !== null ? (
                       <button onClick={handleResetZoom} className="flex items-center gap-1 text-capi-blue-600 dark:text-capi-blue-400 hover:underline">
                          <ArrowLeft size={18} /> Vue Annuelle
                       </button>
                   ) : "Dynamique Annuelle (Hebdo)"}
                   {drillDownMonth !== null && <span className="text-gray-400 text-sm font-normal ml-2">({MONTH_NAMES[drillDownMonth]})</span>}
                </h3>
                <div className="flex items-center gap-2 text-xs font-medium text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-capi-dark-900 px-3 py-1 rounded-full cursor-pointer" onClick={() => drillDownMonth !== null ? handleResetZoom() : null}>
                   {drillDownMonth === null && <ZoomIn size={14} />} 
                   {drillDownMonth !== null ? "Dézoomer" : "Zoom possible"}
                </div>
             </div>
             
             <div className="h-48 w-full cursor-pointer">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={chartData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    onClick={handleUnifiedClick} // ONE SINGLE HANDLER
                    style={{ cursor: 'pointer' }}
                  >
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#233F5E' : '#f3f4f6'} />
                     <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: theme === 'dark' ? '#9ca3af' : '#9ca3af'}} interval={drillDownMonth ? 0 : 3} />
                     <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: theme === 'dark' ? '#9ca3af' : '#9ca3af'}} />
                     <Tooltip 
                        cursor={{fill: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', backgroundColor: theme === 'dark' ? '#0B1E33' : '#fff', color: theme === 'dark' ? '#fff' : '#000' }} 
                        labelFormatter={(l, p) => p && p[0] ? `${l} - ${p[0].payload.monthName}` : l}
                        wrapperStyle={{ pointerEvents: 'none' }} // Prevent blocking
                     />
                     <ReferenceLine y={Math.ceil(totalActionTarget/48)} stroke="#ef4444" strokeDasharray="3 3" />
                     <Bar 
                        dataKey="Actions" 
                        radius={[4, 4, 0, 0]} 
                        barSize={drillDownMonth !== null ? 60 : undefined}
                        background={{ fill: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }} // Visible background
                        onClick={handleUnifiedClick}
                     >
                        {chartData.map((e: any, i: number) => (
                           <Cell key={i} fill={e.Actions > 0 ? '#0ea5e9' : (theme === 'dark' ? '#334155' : '#cbd5e1')} fillOpacity={e.isFuture ? 0.3 : 1} />
                        ))}
                     </Bar>
                  </BarChart>
                </ResponsiveContainer>
             </div>
         </div>
      </div>

      {/* SYNTHÈSE PERFORMANCE CANAUX (Responsive) */}
      <div className="bg-white dark:bg-capi-dark-800 rounded-2xl border border-gray-200 dark:border-capi-dark-700 overflow-hidden shadow-sm">
         <div className="px-6 py-4 border-b border-gray-200 dark:border-capi-dark-700 bg-gray-50 dark:bg-capi-dark-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
               <Award size={18} className="text-capi-blue-600" />
               <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-widest">Performance par Canal ({MONTH_NAMES[selectedMonth]})</h3>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400"><Filter size={14} /> Classé par RDV</div>
         </div>
         
         {/* DESKTOP TABLE */}
         <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm text-left min-w-[900px]">
               <thead className="bg-white dark:bg-capi-dark-800 text-gray-500 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-capi-dark-700">
                  <tr>
                     <th className="px-6 py-4">Canal</th>
                     <th className="px-6 py-4 text-center">Obj. Actions</th>
                     <th className="px-6 py-4 text-center">Act. Réalisées</th>
                     <th className="px-6 py-4 text-center">Contacts</th>
                     <th className="px-6 py-4 text-center bg-capi-blue-50/50 dark:bg-capi-blue-900/10 text-capi-blue-800 dark:text-capi-blue-300">RDV Vendeurs</th>
                     <th className="px-6 py-4 text-center">Efficacité</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-100 dark:divide-capi-dark-700">
                  {current.channelsDetail.map((channel, idx) => (
                      <tr key={channel.id} className="hover:bg-gray-50 dark:hover:bg-capi-dark-700/50 transition-colors">
                          <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                  {idx === 0 && channel.rdv > 0 && <Award size={16} className="text-yellow-500" />}
                                  <span className="font-bold text-gray-900 dark:text-white">{channel.name}</span>
                              </div>
                              <span className="text-xs text-gray-400">{channel.category}</span>
                          </td>
                          <td className="px-6 py-4 text-center text-gray-400">{channel.targetActions}</td>
                          <td className="px-6 py-4 text-center">
                              <span className={`font-bold ${channel.actualActions >= channel.targetActions ? 'text-green-600' : 'text-gray-700 dark:text-gray-300'}`}>{channel.actualActions}</span>
                          </td>
                          <td className="px-6 py-4 text-center font-medium">{channel.contacts}</td>
                          <td className="px-6 py-4 text-center bg-capi-blue-50/30 dark:bg-capi-blue-900/10">
                              <span className={`text-lg font-black ${channel.rdv > 0 ? 'text-capi-blue-600 dark:text-capi-blue-400' : 'text-gray-300'}`}>{channel.rdv}</span>
                          </td>
                          <td className="px-6 py-4 text-center">
                              {channel.rdv > 0 ? <span className="inline-block px-3 py-1 bg-gray-100 dark:bg-capi-dark-700 rounded-full text-xs font-bold">1 RDV / {channel.efficiency} act.</span> : <span className="text-xs text-gray-300 italic">Pas de RDV</span>}
                          </td>
                      </tr>
                  ))}
               </tbody>
            </table>
         </div>

         {/* MOBILE CARDS */}
         <div className="md:hidden p-4 space-y-4">
             {current.channelsDetail.map((channel, idx) => (
                <div key={channel.id} className="bg-gray-50 dark:bg-capi-dark-900 rounded-xl p-4 border border-gray-200 dark:border-capi-dark-700">
                    <div className="flex justify-between mb-3">
                        <div>
                            <div className="flex items-center gap-2">
                               {idx === 0 && channel.rdv > 0 && <Award size={14} className="text-yellow-500" />}
                               <h4 className="font-bold text-gray-900 dark:text-white text-sm">{channel.name}</h4>
                            </div>
                            <span className="text-xs text-gray-500">{channel.category}</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className="bg-white dark:bg-capi-dark-800 p-2 rounded-lg border border-gray-100 dark:border-capi-dark-600">
                            <div className="text-[10px] text-gray-400 uppercase font-bold">Actions</div>
                            <div className="font-bold text-gray-900 dark:text-white text-sm">{channel.actualActions} <span className="text-xs font-normal text-gray-400">/ {channel.targetActions}</span></div>
                        </div>
                        <div className="bg-white dark:bg-capi-dark-800 p-2 rounded-lg border border-gray-100 dark:border-capi-dark-600">
                            <div className="text-[10px] text-gray-400 uppercase font-bold">Contacts</div>
                            <div className="font-bold text-gray-900 dark:text-white text-sm">{channel.contacts}</div>
                        </div>
                    </div>
                    <div className="flex items-center justify-between bg-capi-blue-50 dark:bg-capi-blue-900/20 p-3 rounded-lg border border-capi-blue-100 dark:border-capi-blue-800">
                         <span className="text-xs font-bold text-capi-blue-900 dark:text-capi-blue-100 uppercase">RDV Vendeurs</span>
                         <span className="text-xl font-black text-capi-blue-600 dark:text-capi-blue-400">{channel.rdv}</span>
                    </div>
                </div>
             ))}
         </div>
      </div>

      {/* ENTONNOIR GLOBAL (Same as before) */}
      <div className="bg-white dark:bg-capi-dark-800 rounded-2xl border border-gray-200 dark:border-capi-dark-700 overflow-hidden shadow-sm">
         <div className="px-6 py-4 border-b border-gray-200 dark:border-capi-dark-700 bg-gray-50 dark:bg-capi-dark-900 flex items-center gap-2">
            <BarChart2 size={18} className="text-gray-400" /><h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-widest">Entonnoir Global</h3>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-sm text-left min-w-[800px]">
               <thead className="bg-white dark:bg-capi-dark-800 text-gray-500 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-capi-dark-700">
                  <tr>
                     <th className="px-6 py-4 w-1/4">Étape</th><th className="px-6 py-4 text-center">Volume</th><th className="px-6 py-4 text-center">Conversion</th><th className="px-6 py-4 text-center">vs Benchmark</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-100 dark:divide-capi-dark-700">
                  <tr><td className="px-6 py-4 font-bold text-gray-900 dark:text-white">Contacts Obtenus</td><td className="px-6 py-4 text-center font-bold">{current.contacts}</td><td className="px-6 py-4 text-center"><span className="px-3 py-1 bg-gray-100 dark:bg-capi-dark-700 rounded-full font-bold">{ratioActToCtc.toFixed(1)}%</span></td><td className="px-6 py-4 text-center text-xs text-gray-400">Cible: {BENCHMARKS.actionsToContact}%</td></tr>
                  <tr className="bg-capi-blue-50/20 dark:bg-capi-blue-900/10"><td className="px-6 py-4 font-bold text-capi-blue-900 dark:text-capi-blue-300">RDV Vendeurs (R1)</td><td className="px-6 py-4 text-center font-black text-lg">{current.rdv}</td><td className="px-6 py-4 text-center"><span className={`px-3 py-1 rounded-full font-bold ${ratioCtcToRdv >= 15 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{ratioCtcToRdv.toFixed(1)}%</span></td><td className="px-6 py-4 text-center text-xs text-gray-400">Cible: 15%</td></tr>
                  <tr><td className="px-6 py-4 font-bold text-gray-900 dark:text-white">Mandats Signés</td><td className="px-6 py-4 text-center font-bold">{current.mandates}</td><td className="px-6 py-4 text-center"><span className="px-3 py-1 bg-gray-100 dark:bg-capi-dark-700 rounded-full font-bold">{ratioRdvToMdt.toFixed(1)}%</span></td><td className="px-6 py-4 text-center text-xs text-gray-400">Cible: 25%</td></tr>
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};