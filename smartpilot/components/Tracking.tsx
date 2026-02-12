import React, { useState } from 'react';
import { useStore } from '../context/Store';
import { MONTH_NAMES } from '../constants';
import { calculateGlobalTargets, calculateChannelTargets } from '../utils/calculations';
import { ChevronDown, ChevronRight, CheckCircle2, TrendingUp, Users, Target, Minus, Plus, AlertCircle, Edit3, Info } from 'lucide-react';
import { ChannelDetailsModal } from './ChannelDetailsModal';
import { ProspectingChannel } from '../types';

// Composant interne pour les boutons +/-
interface StepperInputProps {
  value: number;
  onChange: (val: number) => void;
  step?: number;
  min?: number;
  label: string;
  colorTheme: 'green' | 'sky' | 'indigo';
}

const StepperInput: React.FC<StepperInputProps> = ({ 
  value, 
  onChange, 
  step = 1, 
  min = 0, 
  label,
  colorTheme
}) => {
  
  const handleIncrement = () => onChange(value + step);
  const handleDecrement = () => onChange(Math.max(min, value - step));
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    onChange(isNaN(val) ? 0 : Math.max(min, val));
  };

  const themes = {
    green: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800', btn: 'hover:bg-emerald-100 dark:hover:bg-emerald-900/40' },
    sky: { bg: 'bg-sky-50 dark:bg-sky-900/20', text: 'text-sky-700 dark:text-sky-400', border: 'border-sky-200 dark:border-sky-800', btn: 'hover:bg-sky-100 dark:hover:bg-sky-900/40' },
    indigo: { bg: 'bg-capi-blue-50 dark:bg-capi-blue-900/20', text: 'text-capi-blue-700 dark:text-capi-blue-400', border: 'border-capi-blue-200 dark:border-capi-blue-800', btn: 'hover:bg-capi-blue-100 dark:hover:bg-capi-blue-900/40' }
  };
  const t = themes[colorTheme];

  return (
    <div className={`p-3 rounded-xl border ${t.border} ${t.bg}`}>
       <label className={`block text-[10px] uppercase font-bold mb-2 ${t.text}`}>{label}</label>
       <div className="flex items-center gap-3">
          <button onClick={handleDecrement} className={`p-2 bg-white dark:bg-capi-dark-800 rounded-lg shadow-sm border border-gray-100 dark:border-capi-dark-700 ${t.text} ${t.btn} active:scale-95 transition-all`}>
             <Minus size={16} />
          </button>
          <input 
            type="number" 
            value={value === 0 ? '' : value} 
            placeholder="0"
            onChange={handleChange}
            className="w-full bg-transparent text-center font-black text-xl text-gray-900 dark:text-white focus:outline-none"
          />
          <button onClick={handleIncrement} className={`p-2 bg-white dark:bg-capi-dark-800 rounded-lg shadow-sm border border-gray-100 dark:border-capi-dark-700 ${t.text} ${t.btn} active:scale-95 transition-all`}>
             <Plus size={16} />
          </button>
       </div>
    </div>
  );
};

export const Tracking: React.FC = () => {
  const { state, updateTracking, updateChannelTracking } = useStore();
  
  const globalTargets = calculateGlobalTargets(state.assumptions);
  const channelTargets = calculateChannelTargets(globalTargets.monthlyR1, state.assumptions.channels);

  const currentMonthIndex = new Date().getMonth();
  const [selectedMonth, setSelectedMonth] = useState(currentMonthIndex);
  const [activeWeekTab, setActiveWeekTab] = useState(0); // 0 to 3
  
  // Accordion State: which channel is expanded?
  const [expandedChannelId, setExpandedChannelId] = useState<string | null>(null);

  // Modal State
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [selectedChannelForInfo, setSelectedChannelForInfo] = useState<ProspectingChannel | null>(null);

  const trackingData = state.tracking[selectedMonth];
  const enabledChannels = state.assumptions.channels.filter(c => c.enabled);

  const toggleExpand = (id: string) => {
    setExpandedChannelId(expandedChannelId === id ? null : id);
  };

  const openInfoModal = (e: React.MouseEvent, channel: ProspectingChannel) => {
    e.stopPropagation();
    setSelectedChannelForInfo(channel);
    setInfoModalOpen(true);
  };

  // Check if week is empty for education state
  const isWeekEmpty = enabledChannels.every(channel => {
     const channelData = trackingData.channelTracking.find(ct => ct.channelId === channel.id);
     const weekData = channelData?.weeks[activeWeekTab];
     return !weekData || weekData.actionsDone === 0;
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      <ChannelDetailsModal 
        isOpen={infoModalOpen} 
        onClose={() => setInfoModalOpen(false)} 
        channel={selectedChannelForInfo} 
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white">Saisie des actions</h2>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Semaine {activeWeekTab + 1} • {MONTH_NAMES[selectedMonth]}</p>
        </div>
        
        {/* Week Selector */}
        <div className="flex bg-white dark:bg-capi-dark-800 p-1 rounded-xl shadow-sm border border-gray-200 dark:border-capi-dark-700">
             {[0, 1, 2, 3].map(weekIdx => (
               <button
                 key={weekIdx}
                 onClick={() => {
                    setActiveWeekTab(weekIdx);
                    setExpandedChannelId(null);
                 }}
                 className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeWeekTab === weekIdx ? 'bg-capi-blue-600 text-white shadow-md' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-capi-dark-700'}`}
               >
                 S{weekIdx + 1}
               </button>
             ))}
        </div>
      </div>

      {/* MAIN LIST - ACCORDION STYLE */}
      <div className="space-y-3">
          {isWeekEmpty && (
             <div className="bg-capi-blue-50 dark:bg-capi-blue-900/20 border-2 border-capi-blue-100 dark:border-capi-blue-800/50 border-dashed rounded-2xl p-6 text-center mb-6">
                <p className="font-bold text-capi-blue-900 dark:text-capi-blue-100">Aucune action saisie pour cette semaine.</p>
                <p className="text-sm text-capi-blue-700 dark:text-capi-blue-300 mt-1">Cliquez sur un canal ci-dessous pour commencer votre suivi.</p>
             </div>
          )}

          {enabledChannels.map(channel => {
             const monthlyTarget = channelTargets.find(t => t.channelId === channel.id)?.monthlyActionTarget || 0;
             const weeklyTarget = Math.ceil(monthlyTarget / 4);
             const channelData = trackingData.channelTracking.find(ct => ct.channelId === channel.id);
             const weekData = channelData?.weeks[activeWeekTab] || { actionsDone: 0, contactsObtained: 0, rdvObtained: 0 };
             
             const isExpanded = expandedChannelId === channel.id;
             const isFlyers = channel.id === 'distribution_prospectus';
             
             // Completion status
             const progress = weeklyTarget > 0 ? (weekData.actionsDone / weeklyTarget) * 100 : 0;
             const isDone = progress >= 100;

             return (
                <div key={channel.id} className={`bg-white dark:bg-capi-dark-800 rounded-2xl transition-all duration-300 overflow-hidden border ${isExpanded ? 'border-capi-blue-500 shadow-lg ring-4 ring-capi-blue-50 dark:ring-capi-blue-900/50' : 'border-gray-200 dark:border-capi-dark-700 shadow-sm hover:border-gray-300 dark:hover:border-capi-dark-600'}`}>
                   
                   {/* Header (Always Visible) */}
                   <button 
                     onClick={() => toggleExpand(channel.id)}
                     className="w-full flex items-center justify-between p-4 md:p-5 text-left"
                   >
                      <div className="flex items-center gap-4">
                         <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isDone ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : isExpanded ? 'bg-capi-blue-100 dark:bg-capi-blue-900/30 text-capi-blue-600 dark:text-capi-blue-400' : 'bg-gray-100 dark:bg-capi-dark-700 text-gray-500 dark:text-gray-400'}`}>
                            {isDone ? <CheckCircle2 size={20} /> : isExpanded ? <Edit3 size={20} /> : <Target size={20} />}
                         </div>
                         <div>
                            <div className="flex items-center gap-2">
                                <h3 className={`font-bold text-base ${isExpanded ? 'text-capi-blue-900 dark:text-white' : 'text-gray-800 dark:text-gray-200'}`}>{channel.name}</h3>
                                {channel.details && (
                                    <div
                                        role="button"
                                        onClick={(e) => openInfoModal(e, channel)}
                                        className="text-gray-400 hover:text-capi-blue-500 dark:hover:text-capi-blue-400 transition-colors p-0.5"
                                        title="Voir la fiche détaillée"
                                    >
                                        <Info size={16} />
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                               {isExpanded ? (
                                  <span className="text-xs font-bold text-capi-blue-500 dark:text-capi-blue-400 uppercase tracking-wider">Mode Édition</span>
                               ) : (
                                  <div className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                                     <span className={weekData.actionsDone > 0 ? 'text-gray-900 dark:text-white font-bold' : ''}>{weekData.actionsDone}</span> 
                                     <span className="text-gray-300 dark:text-gray-600">/</span> 
                                     <span>{weeklyTarget} {channel.actionUnit}</span>
                                  </div>
                               )}
                            </div>
                         </div>
                      </div>

                      <div className="flex items-center gap-4">
                         {/* Mini Progress Bar (Visible only when collapsed) */}
                         {!isExpanded && weeklyTarget > 0 && (
                            <div className="hidden md:block w-24 h-2 bg-gray-100 dark:bg-capi-dark-900 rounded-full overflow-hidden">
                               <div className={`h-full rounded-full ${isDone ? 'bg-green-500' : 'bg-capi-blue-500'}`} style={{ width: `${Math.min(100, progress)}%` }}></div>
                            </div>
                         )}
                         <ChevronRight size={20} className={`text-gray-400 dark:text-gray-500 transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`} />
                      </div>
                   </button>

                   {/* Expanded Content (Inputs) */}
                   {isExpanded && (
                      <div className="p-5 pt-0 animate-in slide-in-from-top-2">
                         
                         {/* Visualisation Progression LIVE */}
                         {weeklyTarget > 0 && (
                            <div className="mb-6 bg-gray-50 dark:bg-capi-dark-900/40 p-4 rounded-xl border border-gray-100 dark:border-capi-dark-700/50">
                               <div className="flex justify-between items-end mb-2">
                                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Avancement Semaine</span>
                                  <div className="flex items-baseline gap-1">
                                     <span className={`text-xl font-black ${isDone ? 'text-green-500' : 'text-capi-blue-600 dark:text-capi-blue-400'}`}>
                                        {Math.round(progress)}%
                                     </span>
                                  </div>
                               </div>
                               <div className="w-full bg-white dark:bg-capi-dark-700 h-4 rounded-full overflow-hidden shadow-inner border border-gray-100 dark:border-capi-dark-600">
                                  <div
                                     className={`h-full rounded-full transition-all duration-300 ease-out flex items-center justify-end pr-2 ${isDone ? 'bg-green-500' : 'bg-capi-blue-500'}`}
                                     style={{ width: `${Math.min(100, progress)}%` }}
                                  >
                                  </div>
                               </div>
                               <div className="flex justify-between mt-2 px-1">
                                  <span className="text-[10px] text-gray-400 font-bold">0</span>
                                  <span className="text-xs font-bold text-gray-600 dark:text-gray-300">{weekData.actionsDone} / {weeklyTarget} {channel.actionUnit}</span>
                               </div>
                            </div>
                         )}

                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-gray-100 dark:border-capi-dark-700 pt-5">
                            <StepperInput 
                              label={`Actions (${channel.actionUnit})`}
                              value={weekData.actionsDone}
                              onChange={(val) => updateChannelTracking(selectedMonth, channel.id, activeWeekTab, 'actionsDone', val)}
                              step={isFlyers ? 10 : 1}
                              colorTheme="green"
                            />
                            <StepperInput 
                              label="Contacts qualifiés"
                              value={weekData.contactsObtained}
                              onChange={(val) => updateChannelTracking(selectedMonth, channel.id, activeWeekTab, 'contactsObtained', val)}
                              step={1}
                              colorTheme="sky"
                            />
                            <StepperInput 
                              label="RDV décrochés"
                              value={weekData.rdvObtained}
                              onChange={(val) => updateChannelTracking(selectedMonth, channel.id, activeWeekTab, 'rdvObtained', val)}
                              step={1}
                              colorTheme="indigo"
                            />
                         </div>
                         <div className="mt-4 flex justify-end">
                            <button 
                              onClick={(e) => { e.stopPropagation(); toggleExpand(channel.id); }}
                              className="text-sm font-bold text-capi-blue-600 dark:text-capi-blue-400 hover:bg-capi-blue-50 dark:hover:bg-capi-blue-900/30 px-4 py-2 rounded-lg transition-colors"
                            >
                               Valider & Fermer
                            </button>
                         </div>
                      </div>
                   )}
                </div>
             );
          })}
      </div>

      {/* Manual Global Overrides (Collapse by default ?) */}
      <div className="mt-12">
         <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <CheckCircle2 className="text-gray-400" />
            Résultats Commerciaux
         </h3>
         <div className="bg-white dark:bg-capi-dark-800 rounded-2xl shadow-sm border border-gray-200 dark:border-capi-dark-700 p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="space-y-1">
               <label className="text-[10px] uppercase font-bold text-gray-400">Mandats</label>
               <input 
                  type="number"
                  className="w-full text-2xl font-black text-gray-900 dark:text-white bg-transparent border-b border-gray-200 dark:border-capi-dark-600 focus:border-capi-blue-500 focus:outline-none py-1"
                  value={trackingData.manualMandates}
                  onChange={(e) => updateTracking(selectedMonth, { manualMandates: parseInt(e.target.value) || 0 })}
               />
            </div>
            <div className="space-y-1">
               <label className="text-[10px] uppercase font-bold text-gray-400">Visites</label>
               <input 
                  type="number"
                  className="w-full text-2xl font-black text-gray-900 dark:text-white bg-transparent border-b border-gray-200 dark:border-capi-dark-600 focus:border-capi-blue-500 focus:outline-none py-1"
                  value={trackingData.manualVisits || 0}
                  onChange={(e) => updateTracking(selectedMonth, { manualVisits: parseInt(e.target.value) || 0 })}
               />
            </div>
            <div className="space-y-1">
               <label className="text-[10px] uppercase font-bold text-gray-400">Offres</label>
               <input 
                  type="number"
                  className="w-full text-2xl font-black text-gray-900 dark:text-white bg-transparent border-b border-gray-200 dark:border-capi-dark-600 focus:border-capi-blue-500 focus:outline-none py-1"
                  value={trackingData.manualOffers || 0}
                  onChange={(e) => updateTracking(selectedMonth, { manualOffers: parseInt(e.target.value) || 0 })}
               />
            </div>
            <div className="space-y-1">
               <label className="text-[10px] uppercase font-bold text-gray-400">Ventes</label>
               <input 
                  type="number"
                  className="w-full text-2xl font-black text-gray-900 dark:text-white bg-transparent border-b border-gray-200 dark:border-capi-dark-600 focus:border-capi-blue-500 focus:outline-none py-1"
                  value={trackingData.manualSales}
                  onChange={(e) => updateTracking(selectedMonth, { manualSales: parseInt(e.target.value) || 0 })}
               />
            </div>
         </div>
      </div>
    </div>
  );
};