import React, { useState } from 'react';
import { useStore } from '../context/Store';
import { calculateGlobalTargets, calculateChannelTargets } from '../utils/calculations';
import { MapPin, Phone, Share2, UserCheck, Info, CheckCircle2, Calendar, TrendingUp, AlertCircle } from 'lucide-react';
import { ChannelDetailsModal } from './ChannelDetailsModal';
import { ProspectingChannel } from '../types';
import { MONTH_NAMES } from '../constants';

export const Roadmap: React.FC = () => {
  const { state } = useStore();
  
  // State for Month Selection
  const currentMonthIndex = new Date().getMonth();
  const [selectedMonth, setSelectedMonth] = useState(currentMonthIndex);

  // State for Channel Info Modal
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [selectedChannelForInfo, setSelectedChannelForInfo] = useState<ProspectingChannel | null>(null);

  // 1. Calculate Targets
  const globals = calculateGlobalTargets(state.assumptions);
  const targets = calculateChannelTargets(globals.monthlyR1, state.assumptions.channels);

  // 2. Get Actual Data for Selected Month
  const monthlyData = state.tracking[selectedMonth];

  // Helper to get full channel definition
  const getFullChannelData = (id: string): ProspectingChannel | undefined => {
    return state.assumptions.channels.find(c => c.id === id);
  };

  const openInfoModal = (channelId: string) => {
    const fullChannel = getFullChannelData(channelId);
    if (fullChannel) {
      setSelectedChannelForInfo(fullChannel);
      setInfoModalOpen(true);
    }
  };

  // Helper to get progress for a specific channel in the selected month
  const getChannelProgress = (channelId: string) => {
    const channelTrack = monthlyData.channelTracking.find(ct => ct.channelId === channelId);
    if (!channelTrack) return 0;
    // Sum up actions from all 4 weeks
    return channelTrack.weeks.reduce((sum, week) => sum + week.actionsDone, 0);
  };

  // Grouping logic (Only show enabled channels)
  const groupedChannels = {
    'Terrain': targets.filter(t => state.assumptions.channels.find(ac => ac.id === t.channelId)?.category === 'Terrain' && t.monthlyActionTarget > 0),
    'Relationnel': targets.filter(t => state.assumptions.channels.find(ac => ac.id === t.channelId)?.category === 'Relationnel' && t.monthlyActionTarget > 0),
    'Téléphone': targets.filter(t => state.assumptions.channels.find(ac => ac.id === t.channelId)?.category === 'Téléphone' && t.monthlyActionTarget > 0),
    'Digital': targets.filter(t => state.assumptions.channels.find(ac => ac.id === t.channelId)?.category === 'Digital' && t.monthlyActionTarget > 0),
  };

  const getCategoryIcon = (cat: string) => {
    switch(cat) {
      case 'Terrain': return MapPin;
      case 'Relationnel': return UserCheck;
      case 'Téléphone': return Phone;
      case 'Digital': return Share2;
      default: return TrendingUp;
    }
  };

  return (
    <div className="space-y-8 pb-20 animate-in fade-in">
      
      {/* INFO MODAL */}
      <ChannelDetailsModal 
        isOpen={infoModalOpen} 
        onClose={() => setInfoModalOpen(false)} 
        channel={selectedChannelForInfo} 
      />

      {/* HEADER & MONTH SELECTOR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-gray-200 dark:border-capi-dark-700 pb-6">
        <div>
           <h2 className="text-2xl font-black text-gray-900 dark:text-white">Suivi des Objectifs Mensuels</h2>
           <p className="text-gray-500 dark:text-gray-400 font-medium">Visualisez votre progression action par action pour le mois de <span className="text-capi-blue-600 dark:text-capi-blue-400 font-bold">{MONTH_NAMES[selectedMonth]}</span>.</p>
        </div>

        <div className="relative w-full md:w-auto">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
              <Calendar size={16} />
            </div>
            <select 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="pl-10 pr-8 py-3 bg-white dark:bg-capi-dark-800 border border-gray-300 dark:border-capi-dark-700 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-200 shadow-sm focus:border-capi-blue-500 focus:ring-1 focus:ring-capi-blue-500 outline-none appearance-none cursor-pointer w-full md:w-auto transition-all hover:border-capi-blue-300"
            >
              {MONTH_NAMES.map((m, i) => (
                <option key={i} value={i}>{m}</option>
              ))}
            </select>
        </div>
      </div>

      {/* LISTE DES ACTIONS GROUPEES */}
      <div className="space-y-10">
        {Object.entries(groupedChannels).map(([category, items]) => {
          if (items.length === 0) return null;
          
          const Icon = getCategoryIcon(category);

          return (
            <div key={category} className="space-y-4">
               {/* Category Title */}
               <div className="flex items-center gap-2 border-b border-gray-200 dark:border-capi-dark-700 pb-2">
                  <div className="p-1.5 bg-gray-100 dark:bg-capi-dark-800 rounded-lg text-gray-500 dark:text-gray-400">
                    <Icon size={16} />
                  </div>
                  <h3 className="text-sm font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{category}</h3>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {items.map(target => {
                     const actionsDone = getChannelProgress(target.channelId);
                     const percentage = Math.min(100, Math.round((actionsDone / target.monthlyActionTarget) * 100));
                     const isComplete = actionsDone >= target.monthlyActionTarget;
                     
                     return (
                        <div 
                          key={target.channelId} 
                          className={`bg-white dark:bg-capi-dark-800 rounded-2xl shadow-sm border-2 p-6 flex flex-col justify-between transition-all relative group
                            ${isComplete 
                                ? 'border-green-200 dark:border-green-900 bg-green-50/30 dark:bg-green-900/10' 
                                : 'border-gray-100 dark:border-capi-dark-700 hover:border-capi-blue-200 dark:hover:border-capi-blue-700 hover:shadow-md'}
                          `}
                        >
                           {/* Success Badge */}
                           {isComplete && (
                              <div className="absolute top-[-10px] right-[-10px] bg-green-500 text-white p-1.5 rounded-full shadow-md animate-in zoom-in spin-in-12">
                                 <CheckCircle2 size={20} fill="currentColor" className="text-white" stroke="white" />
                              </div>
                           )}

                           <div>
                              <div className="flex justify-between items-start mb-4">
                                 <div className="flex items-start gap-2 pr-8">
                                     <h4 className={`font-bold text-lg leading-tight ${isComplete ? 'text-green-800 dark:text-green-400' : 'text-gray-900 dark:text-white group-hover:text-capi-blue-700 dark:group-hover:text-capi-blue-400'} transition-colors`}>
                                       {target.channelName}
                                     </h4>
                                     <button 
                                        onClick={() => openInfoModal(target.channelId)}
                                        className="text-gray-300 dark:text-gray-600 hover:text-capi-blue-600 dark:hover:text-capi-blue-400 transition-colors mt-0.5 shrink-0"
                                        title="Voir le descriptif"
                                     >
                                         <Info size={16} />
                                     </button>
                                 </div>
                              </div>
                              
                              {/* Progress Stats */}
                              <div className="flex items-end gap-2 mb-2">
                                 <span className={`text-3xl font-black tracking-tighter ${isComplete ? 'text-green-600 dark:text-green-400' : 'text-capi-blue-600 dark:text-capi-blue-400'}`}>
                                    {actionsDone}
                                 </span>
                                 <span className="text-sm font-bold text-gray-400 dark:text-gray-500 mb-1.5">
                                    / {target.monthlyActionTarget} {target.actionUnit}
                                 </span>
                              </div>

                              {/* Progress Bar */}
                              <div className="w-full bg-gray-100 dark:bg-capi-dark-900 h-3 rounded-full overflow-hidden shadow-inner">
                                 <div 
                                    className={`h-full rounded-full transition-all duration-1000 ease-out ${isComplete ? 'bg-green-500' : 'bg-capi-blue-600'}`} 
                                    style={{ width: `${percentage}%` }}
                                 ></div>
                              </div>
                           </div>

                           <div className="mt-4 pt-3 border-t border-gray-100/50 dark:border-gray-700/50 flex justify-between items-center">
                              <span className={`text-xs font-bold uppercase ${isComplete ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`}>
                                 {isComplete ? 'Objectif Atteint' : 'Progression'}
                              </span>
                              <span className={`font-black text-sm ${isComplete ? 'text-green-700 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
                                 {percentage}%
                              </span>
                           </div>
                        </div>
                     );
                  })}
               </div>
            </div>
          );
        })}
      </div>

      {/* EMPTY STATE IF NO CHANNELS */}
      {Object.values(groupedChannels).every(arr => arr.length === 0) && (
         <div className="bg-gray-50 dark:bg-capi-dark-900 border-2 border-dashed border-gray-200 dark:border-capi-dark-700 rounded-3xl p-10 text-center flex flex-col items-center gap-4">
            <div className="p-4 bg-white dark:bg-capi-dark-800 rounded-full shadow-sm text-gray-300 dark:text-gray-600">
               <AlertCircle size={32} />
            </div>
            <div>
               <p className="font-bold text-gray-500 dark:text-gray-400 text-lg">Aucune action planifiée ce mois-ci.</p>
               <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Vos compteurs sont à zéro ou vous n'avez pas configuré de canaux actifs.</p>
            </div>
         </div>
      )}
    </div>
  );
};