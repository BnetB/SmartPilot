import React, { useState } from 'react';
import { useStore } from '../context/Store';
import { Save, ChevronDown, ChevronUp, AlertCircle, Target, TrendingUp, Briefcase, Settings2, Info, Calculator, BarChart3, Clock, ArrowRight, ChevronRight } from 'lucide-react';
import { calculateGlobalTargets, estimateFieldTime } from '../utils/calculations';
import { ProspectingChannel } from '../types';
import { ChannelDetailsModal } from './ChannelDetailsModal';

export const Settings: React.FC = () => {
  const { state, updateAssumptions } = useStore();
  const [formData, setFormData] = useState(state.assumptions);
  const [openSection, setOpenSection] = useState<string | null>('objectives');
  
  // State for expanded channel card
  const [expandedChannelId, setExpandedChannelId] = useState<string | null>(null);

  // State for Channel Info Modal
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [selectedChannelForInfo, setSelectedChannelForInfo] = useState<ProspectingChannel | null>(null);

  const globals = calculateGlobalTargets(formData);
  const totalDistribution = formData.channels.filter(c => c.enabled).reduce((sum, c) => sum + c.distributionPercent, 0);

  // Group channels by category
  const categories = Array.from(new Set(formData.channels.map(c => c.category)));

  const toggleSection = (id: string) => setOpenSection(openSection === id ? null : id);

  const toggleChannelExpand = (id: string) => {
    setExpandedChannelId(prev => prev === id ? null : id);
  };

  const updateField = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const updateChannel = (id: string, field: keyof ProspectingChannel, value: any) => {
    setFormData(prev => ({
      ...prev,
      channels: prev.channels.map(c => c.id === id ? { ...c, [field]: value } : c)
    }));
  };

  const handleSave = () => {
    if (totalDistribution !== 100) {
      alert(`Impossible de sauvegarder : La répartition de vos actions est de ${totalDistribution}%. \n\nElle doit être strictement de 100%.\n\nVeuillez ajuster les canaux dans la section "Mix de Prospection".`);
      return;
    }
    updateAssumptions(formData);
    alert("Stratégie mise à jour avec succès !");
  };

  const openInfoModal = (channel: ProspectingChannel) => {
    setSelectedChannelForInfo(channel);
    setInfoModalOpen(true);
  };

  return (
    <div className="space-y-8 pb-24 animate-in fade-in max-w-5xl mx-auto">
      {/* INFO MODAL */}
      <ChannelDetailsModal 
        isOpen={infoModalOpen} 
        onClose={() => setInfoModalOpen(false)} 
        channel={selectedChannelForInfo} 
      />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-gray-200 dark:border-capi-dark-700 pb-6 gap-4">
        <div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Paramètres Stratégiques</h2>
          <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">Ajustez les réglages techniques et financiers de votre activité.</p>
        </div>
        <button 
          onClick={handleSave}
          className={`flex items-center gap-3 px-8 py-3 rounded-2xl shadow-lg text-white transition-all font-black uppercase text-xs tracking-widest w-full md:w-auto justify-center
            ${totalDistribution === 100 ? 'bg-capi-blue-600 hover:bg-capi-blue-700 shadow-capi-blue-100 dark:shadow-none' : 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'}`}
        >
          <Save size={18} /> Sauvegarder
        </button>
      </div>

      <div className="space-y-4">
        {/* SECTION 1: OBJECTIVES & FINANCE */}
        <div className="bg-white dark:bg-capi-dark-800 rounded-3xl shadow-sm border border-gray-200 dark:border-capi-dark-700 overflow-hidden transition-all">
          <button 
            onClick={() => toggleSection('objectives')}
            className={`w-full px-6 py-6 md:px-8 flex justify-between items-center transition-colors ${openSection === 'objectives' ? 'bg-capi-blue-50/50 dark:bg-capi-dark-900/50' : 'hover:bg-gray-50 dark:hover:bg-capi-dark-700'}`}
          >
            <div className="flex items-center gap-4">
               <div className="p-2 bg-white dark:bg-capi-dark-700 rounded-xl shadow-sm text-capi-blue-600 dark:text-capi-blue-400"><Target size={20} /></div>
               <span className="font-black text-gray-800 dark:text-gray-200 uppercase text-xs tracking-widest">Objectifs & Finance</span>
            </div>
            {openSection === 'objectives' ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
          </button>
          
          {openSection === 'objectives' && (
            <div className="p-6 md:p-8 space-y-8 animate-in slide-in-from-top-2">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                 <div className="space-y-2">
                   <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">Mode de calcul</label>
                   <select 
                     value={formData.objectiveMode}
                     onChange={(e) => updateField('objectiveMode', e.target.value)}
                     className="w-full p-4 border-2 border-gray-100 dark:border-capi-dark-600 rounded-2xl text-gray-900 dark:text-white bg-gray-50 dark:bg-capi-dark-900 font-bold focus:border-capi-blue-300 dark:focus:border-capi-blue-700 outline-none transition-all"
                   >
                     <option value="monthlyIncome">Revenu Net Mensuel (€)</option>
                     <option value="annualTurnover">Chiffre d'Affaires Annuel (HT)</option>
                     <option value="annualSales">Volume de Ventes (Nb)</option>
                   </select>
                 </div>
                 
                 <div className="space-y-2">
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">Valeur Cible</label>
                    {formData.objectiveMode === 'monthlyIncome' && (
                       <input type="number" value={formData.monthlyNetSalaryGoal} onChange={(e) => updateField('monthlyNetSalaryGoal', parseInt(e.target.value))} className="w-full p-4 border-2 border-capi-blue-100 dark:border-capi-dark-600 rounded-2xl text-capi-blue-900 dark:text-white bg-sky-50 dark:bg-capi-dark-900 font-black focus:border-capi-blue-400 outline-none shadow-inner" />
                    )}
                    {formData.objectiveMode === 'annualTurnover' && (
                       <input type="number" value={formData.targetTurnover} onChange={(e) => updateField('targetTurnover', parseInt(e.target.value))} className="w-full p-4 border-2 border-capi-blue-100 dark:border-capi-dark-600 rounded-2xl text-capi-blue-900 dark:text-white bg-sky-50 dark:bg-capi-dark-900 font-black focus:border-capi-blue-400 outline-none shadow-inner" />
                    )}
                    {formData.objectiveMode === 'annualSales' && (
                       <input type="number" value={formData.targetSales} onChange={(e) => updateField('targetSales', parseInt(e.target.value))} className="w-full p-4 border-2 border-capi-blue-100 dark:border-capi-dark-600 rounded-2xl text-capi-blue-900 dark:text-white bg-sky-50 dark:bg-capi-dark-900 font-black focus:border-capi-blue-400 outline-none shadow-inner" />
                    )}
                 </div>

                 <div className="space-y-2">
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">Honoraires Moyens HT (€)</label>
                    <input 
                      type="number" value={formData.avgFee}
                      onChange={(e) => updateField('avgFee', parseInt(e.target.value))}
                      className="w-full p-4 border-2 border-gray-100 dark:border-capi-dark-600 rounded-2xl text-gray-900 dark:text-white bg-gray-50 dark:bg-capi-dark-900 font-bold focus:border-capi-blue-300 outline-none transition-all"
                    />
                 </div>
               </div>

               <div className="p-6 bg-gradient-to-r from-capi-blue-600 to-purple-600 rounded-3xl text-white shadow-xl flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="flex items-center gap-4 w-full md:w-auto">
                     <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm"><TrendingUp size={24} /></div>
                     <div>
                        <div className="text-[10px] font-black uppercase tracking-widest opacity-80">Volume Annuel Estimé</div>
                        <div className="text-xl md:text-2xl font-black">{globals.annualSales} Ventes <span className="text-capi-blue-200 font-medium">/</span> {globals.annualTurnover.toLocaleString()}€ HT</div>
                     </div>
                  </div>
                  <div className="text-right w-full md:w-auto flex items-center justify-between md:block border-t border-white/20 md:border-0 pt-4 md:pt-0">
                     <div className="text-[10px] font-black uppercase tracking-widest opacity-80 md:mb-1">Mois travaillés</div>
                     <input 
                        type="number" value={formData.monthsWorked}
                        onChange={(e) => updateField('monthsWorked', parseFloat(e.target.value))}
                        className="bg-transparent text-right text-2xl font-black w-16 focus:outline-none border-b-2 border-white/30"
                      />
                  </div>
               </div>
            </div>
          )}
        </div>

        {/* SECTION 2: TRANSFORMATION RATIOS */}
        <div className="bg-white dark:bg-capi-dark-800 rounded-3xl shadow-sm border border-gray-200 dark:border-capi-dark-700 overflow-hidden transition-all">
          <button 
            onClick={() => toggleSection('ratios')}
            className={`w-full px-6 py-6 md:px-8 flex justify-between items-center transition-colors ${openSection === 'ratios' ? 'bg-capi-blue-50/50 dark:bg-capi-dark-900/50' : 'hover:bg-gray-50 dark:hover:bg-capi-dark-700'}`}
          >
            <div className="flex items-center gap-4">
               <div className="p-2 bg-white dark:bg-capi-dark-700 rounded-xl shadow-sm text-emerald-600 dark:text-emerald-400"><Settings2 size={20} /></div>
               <span className="font-black text-gray-800 dark:text-gray-200 uppercase text-xs tracking-widest">Ratios de l'Entonnoir</span>
            </div>
            {openSection === 'ratios' ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
          </button>
          
          {openSection === 'ratios' && (
             <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-top-2">
                <div className="p-6 bg-gray-50 dark:bg-capi-dark-900 rounded-3xl border border-gray-100 dark:border-capi-dark-600 flex flex-col items-center gap-4 text-center">
                   <div className="w-20 h-20 bg-white dark:bg-capi-dark-800 rounded-2xl flex items-center justify-center text-3xl font-black text-capi-blue-600 dark:text-capi-blue-400 shadow-sm border border-capi-blue-50 dark:border-capi-dark-600">
                     <input 
                        type="number" value={formData.mandatesPerSale}
                        onChange={(e) => updateField('mandatesPerSale', parseFloat(e.target.value))}
                        className="w-full text-center bg-transparent focus:outline-none"
                      />
                   </div>
                   <div>
                      <h4 className="font-bold text-gray-900 dark:text-white">Mandats pour 1 Vente</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Nombre de mandats nécessaires pour signer un acte authentique.</p>
                   </div>
                </div>

                <div className="p-6 bg-gray-50 dark:bg-capi-dark-900 rounded-3xl border border-gray-100 dark:border-capi-dark-600 flex flex-col items-center gap-4 text-center">
                   <div className="w-20 h-20 bg-white dark:bg-capi-dark-800 rounded-2xl flex items-center justify-center text-3xl font-black text-capi-blue-600 dark:text-capi-blue-400 shadow-sm border border-capi-blue-50 dark:border-capi-dark-600">
                     <input 
                        type="number" value={formData.r1PerMandate}
                        onChange={(e) => updateField('r1PerMandate', parseFloat(e.target.value))}
                        className="w-full text-center bg-transparent focus:outline-none"
                      />
                   </div>
                   <div>
                      <h4 className="font-bold text-gray-900 dark:text-white">RDV pour 1 Mandat</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Nombre de RDV Vendeurs (R1) pour obtenir un mandat de vente.</p>
                   </div>
                </div>

                <div className="p-6 bg-gray-50 dark:bg-capi-dark-900 rounded-3xl border border-gray-100 dark:border-capi-dark-600 flex flex-col items-center gap-4 text-center">
                   <div className="w-20 h-20 bg-white dark:bg-capi-dark-800 rounded-2xl flex items-center justify-center text-3xl font-black text-capi-blue-600 dark:text-capi-blue-400 shadow-sm border border-capi-blue-50 dark:border-capi-dark-600">
                     <input 
                        type="number" value={formData.visitsPerOffer ?? 10}
                        onChange={(e) => updateField('visitsPerOffer', parseFloat(e.target.value))}
                        className="w-full text-center bg-transparent focus:outline-none"
                      />
                   </div>
                   <div>
                      <h4 className="font-bold text-gray-900 dark:text-white">Visites pour 1 Offre</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Nombre de visites nécessaires pour obtenir une offre d'achat.</p>
                   </div>
                </div>
             </div>
          )}
        </div>

        {/* SECTION 3: PROSPECTING CHANNELS - ACCORDION STYLE */}
        <div className="bg-white dark:bg-capi-dark-800 rounded-3xl shadow-sm border border-gray-200 dark:border-capi-dark-700 overflow-hidden transition-all">
          <button 
            onClick={() => toggleSection('channels')}
            className={`w-full px-6 py-6 md:px-8 flex justify-between items-center transition-colors ${openSection === 'channels' ? 'bg-capi-blue-50/50 dark:bg-capi-dark-900/50' : 'hover:bg-gray-50 dark:hover:bg-capi-dark-700'}`}
          >
            <div className="flex items-center gap-4">
               <div className="p-2 bg-white dark:bg-capi-dark-700 rounded-xl shadow-sm text-amber-600 dark:text-amber-500"><Briefcase size={20} /></div>
               <div className="flex items-center gap-3">
                  <span className="font-black text-gray-800 dark:text-gray-200 uppercase text-xs tracking-widest">Mix de Prospection</span>
                  {totalDistribution !== 100 && (
                    <span className="flex items-center gap-1 text-[10px] bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full font-bold">
                       <AlertCircle size={10} /> {totalDistribution}%
                    </span>
                  )}
               </div>
            </div>
            {openSection === 'channels' ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
          </button>
          
          {openSection === 'channels' && (
             <div className="p-4 md:p-8 animate-in slide-in-from-top-2 space-y-8">
               
               <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800 text-sm text-blue-800 dark:text-blue-300 flex gap-3">
                  <Info className="shrink-0 mt-0.5" size={18} />
                  <p>Cliquez sur un levier pour le paramétrer. <br/>Équation : <strong>Ambition</strong> (part du gâteau) x <strong>Difficulté</strong> (effort par RDV) = <strong>Travail Hebdo</strong>.</p>
               </div>

               {categories.map(cat => (
                 <div key={cat}>
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-capi-dark-600 pb-2 mb-6">{cat}</h4>
                    <div className="space-y-4">
                      {formData.channels.filter(c => c.category === cat).map(channel => {
                        
                        // --- CALCULS PEDAGOGIQUES ---
                        const targetR1ForChannel = Math.round(globals.monthlyR1 * (channel.distributionPercent / 100) * 10) / 10;
                        const weeklyWorkload = Math.ceil((targetR1ForChannel * channel.actionsPerR1) / 4);
                        const estimatedTime = estimateFieldTime(weeklyWorkload, channel.id);
                        
                        const isExpanded = expandedChannelId === channel.id;

                        return (
                        <div key={channel.id} className={`rounded-2xl border transition-all relative overflow-hidden ${isExpanded ? 'bg-white dark:bg-capi-dark-800 border-capi-blue-300 dark:border-capi-blue-700 ring-2 ring-capi-blue-50 dark:ring-capi-blue-900/20 shadow-md' : 'bg-gray-50 dark:bg-capi-dark-900 border-gray-100 dark:border-capi-dark-700 hover:border-gray-300 dark:hover:border-capi-dark-600'}`}>
                           
                           {/* HEADER - CLICK TO EXPAND */}
                           <div 
                             className="p-4 md:p-5 flex items-center justify-between cursor-pointer"
                             onClick={() => toggleChannelExpand(channel.id)}
                           >
                              <div className="flex items-center gap-4">
                                  {/* CHECKBOX - Stop propagation to avoid expand toggle just for enable */}
                                  <div onClick={(e) => e.stopPropagation()}>
                                    <input 
                                        type="checkbox" 
                                        checked={channel.enabled} 
                                        onChange={(e) => updateChannel(channel.id, 'enabled', e.target.checked)} 
                                        className="rounded-lg text-capi-blue-600 h-5 w-5 border-2 border-gray-300 dark:border-gray-500 focus:ring-capi-blue-500 cursor-pointer" 
                                    />
                                  </div>
                                  <div>
                                     <h5 className={`font-bold text-base ${channel.enabled ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>{channel.name}</h5>
                                     {/* Description visible only if not expanded (Essential Info) */}
                                     {!isExpanded && (
                                        <p className="text-xs text-gray-400 dark:text-gray-500 truncate max-w-[200px] md:max-w-md hidden md:block">
                                            {channel.description}
                                        </p>
                                     )}
                                  </div>
                              </div>

                              {/* SUMMARY INFO (VISIBLE WHEN COLLAPSED & ENABLED) */}
                              <div className="flex items-center gap-4">
                                  {!isExpanded && channel.enabled && (
                                     <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300 animate-in fade-in">
                                         <div className="flex flex-col items-end md:flex-row md:items-center md:gap-3">
                                            <span className="font-bold bg-gray-200 dark:bg-capi-dark-700 px-2 py-0.5 rounded text-xs">{channel.distributionPercent}%</span>
                                            <span className="hidden md:block w-px h-3 bg-gray-300 dark:bg-gray-600"></span>
                                            <span className="font-bold text-xs md:text-sm">{weeklyWorkload} {channel.actionUnit}</span>
                                            <span className="text-[10px] text-gray-400 hidden md:block">({estimatedTime})</span>
                                         </div>
                                     </div>
                                  )}
                                  
                                  <ChevronRight size={20} className={`text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`} />
                              </div>
                           </div>
                           
                           {/* BODY CONFIGURATION (EXPANDED) */}
                           {isExpanded && channel.enabled && (
                              <div className="p-5 border-t border-gray-100 dark:border-capi-dark-700 bg-gray-50/50 dark:bg-capi-dark-900/50 animate-in slide-in-from-top-2 cursor-default" onClick={(e) => e.stopPropagation()}>
                                 
                                 <div className="flex justify-between items-start mb-6">
                                    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-2xl">{channel.description}</p>
                                    {channel.details && (
                                        <button onClick={() => openInfoModal(channel)} className="text-capi-blue-600 dark:text-capi-blue-400 hover:bg-capi-blue-50 dark:hover:bg-capi-dark-700 px-3 py-1.5 rounded-lg transition-colors text-xs font-bold flex items-center gap-1" title="Fiche technique">
                                        <Info size={14} /> Guide méthode
                                        </button>
                                    )}
                                 </div>

                                 <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                                     
                                     {/* 1. DISTRIBUTION */}
                                     <div className="md:col-span-5 space-y-3">
                                        <div className="flex justify-between items-end">
                                           <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Votre Ambition (Part du gâteau)</label>
                                           <span className="text-xs font-bold text-capi-blue-600 dark:text-capi-blue-400 bg-capi-blue-50 dark:bg-capi-blue-900/30 px-2 py-1 rounded">
                                              Obj: {targetR1ForChannel} RDV / mois
                                           </span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                           <input 
                                              type="range" min="0" max="100" step="5"
                                              value={channel.distributionPercent}
                                              onChange={(e) => updateChannel(channel.id, 'distributionPercent', parseInt(e.target.value))}
                                              className="w-full accent-capi-blue-600 h-2 bg-gray-200 dark:bg-capi-dark-600 rounded-full appearance-none cursor-pointer"
                                           />
                                           <div className="w-16 text-right font-black text-lg text-gray-800 dark:text-white">{channel.distributionPercent}%</div>
                                        </div>
                                     </div>

                                     {/* 2. RATIO */}
                                     <div className="md:col-span-3 space-y-3 border-l-0 md:border-l border-gray-200 dark:border-capi-dark-600 md:pl-8">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1">
                                           <Calculator size={10} /> Difficulté (Ratio)
                                        </label>
                                        <div className="relative">
                                           <input 
                                              type="number" value={channel.actionsPerR1}
                                              onChange={(e) => updateChannel(channel.id, 'actionsPerR1', parseInt(e.target.value))}
                                              className="w-full p-3 pl-4 border border-gray-200 dark:border-capi-dark-600 rounded-xl text-gray-900 dark:text-white bg-white dark:bg-capi-dark-800 font-bold focus:border-capi-blue-400 outline-none shadow-sm"
                                           />
                                           <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium pointer-events-none">Act. / RDV</span>
                                        </div>
                                     </div>

                                     {/* 3. RESULTAT */}
                                     <div className="md:col-span-4 bg-white dark:bg-capi-dark-800 rounded-xl p-4 border border-gray-200 dark:border-capi-dark-600 flex flex-col justify-center h-full shadow-sm">
                                        <div className="flex items-center gap-2 mb-1 text-gray-500 dark:text-gray-400">
                                           <Clock size={14} />
                                           <span className="text-[10px] font-bold uppercase tracking-widest">Impact Hebdo</span>
                                        </div>
                                        <div className="flex items-baseline gap-2">
                                           <span className="text-2xl font-black text-gray-900 dark:text-white">{weeklyWorkload}</span>
                                           <span className="text-sm font-medium text-gray-500">{channel.actionUnit}</span>
                                        </div>
                                        <div className="mt-1 text-xs text-capi-blue-600 dark:text-capi-blue-400 font-bold">
                                           ~ {estimatedTime} / semaine
                                        </div>
                                     </div>

                                 </div>
                              </div>
                           )}
                        </div>
                      )})}
                    </div>
                 </div>
               ))}

                <div className={`mt-10 p-6 rounded-3xl text-right font-black flex justify-between items-center transition-colors shadow-sm ${totalDistribution === 100 ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800'}`}>
                  <div className="flex items-center gap-3">
                     <BarChart3 size={24} />
                     <div className="text-left">
                        <div className="text-xs uppercase tracking-widest font-black opacity-70">Répartition Totale</div>
                        <div className="text-sm font-medium opacity-80">Doit être égale à 100%</div>
                     </div>
                  </div>
                  <div className="text-4xl tracking-tight">{totalDistribution}%</div>
               </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};