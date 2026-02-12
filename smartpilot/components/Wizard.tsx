import React, { useState } from 'react';
import { useStore } from '../context/Store';
import { calculateGlobalTargets, calculateChannelTargets, estimateFieldTime } from '../utils/calculations';
import { ArrowRight, ArrowLeft, Check, Wallet, AlertCircle, TrendingUp, ClipboardCheck, Plus, X, Save, HelpCircle, Info, Clock, Calendar } from 'lucide-react';
import { ProspectingChannel } from '../types';
import { ChannelDetailsModal } from './ChannelDetailsModal';

export const Wizard: React.FC = () => {
  const { state, updateAssumptions, completeWizard } = useStore();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(state.assumptions);

  // State for Channel Info Modal
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [selectedChannelForInfo, setSelectedChannelForInfo] = useState<ProspectingChannel | null>(null);

  // State for Custom Channel Form
  const [isAddingChannel, setIsAddingChannel] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelYield, setNewChannelYield] = useState(20);
  const [newChannelUnit, setNewChannelUnit] = useState('actions');
  const [newChannelCategory, setNewChannelCategory] = useState('Autre');

  const globals = calculateGlobalTargets(formData);
  const totalDistribution = formData.channels.filter(c => c.enabled).reduce((sum, c) => sum + c.distributionPercent, 0);

  // Group channels by category
  const categories = Array.from(new Set(formData.channels.map(c => c.category)));

  const handleNext = () => {
    if (step === 2) {
      if (totalDistribution !== 100) {
        alert(`Attention : La répartition de vos actions est de ${totalDistribution}%. \n\nElle doit être impérativement de 100% pour valider une stratégie cohérente.`);
        return;
      }
    }
    setStep(p => Math.min(3, p + 1));
  };

  const prevStep = () => setStep(p => Math.max(1, p - 1));

  const updateField = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const updateChannel = (id: string, field: keyof ProspectingChannel, value: any) => {
    setFormData(prev => ({
      ...prev,
      channels: prev.channels.map(c => c.id === id ? { ...c, [field]: value } : c)
    }));
  };

  const toggleChannel = (id: string) => {
    setFormData(prev => {
      const channel = prev.channels.find(c => c.id === id);
      const isEnabled = !channel?.enabled;
      return {
        ...prev,
        channels: prev.channels.map(c => c.id === id ? { ...c, enabled: isEnabled, distributionPercent: 0 } : c)
      };
    });
  };

  const openInfoModal = (e: React.MouseEvent, channel: ProspectingChannel) => {
    e.stopPropagation(); // Prevent toggling the channel selection when clicking info
    setSelectedChannelForInfo(channel);
    setInfoModalOpen(true);
  };

  const handleAddCustomChannel = () => {
    if (!newChannelName.trim()) return;

    const newId = `custom_${Date.now()}`;
    const newChannel: ProspectingChannel = {
      id: newId,
      name: newChannelName,
      category: newChannelCategory,
      enabled: true,
      distributionPercent: 0,
      actionsPerR1: newChannelYield, // Yield defined by user
      actionUnit: newChannelUnit,
      description: 'Levier personnalisé'
    };

    setFormData(prev => ({
      ...prev,
      channels: [...prev.channels, newChannel]
    }));

    // Reset form
    setNewChannelName('');
    setNewChannelYield(20);
    setNewChannelUnit('actions');
    setIsAddingChannel(false);
  };

  const handleFinish = () => {
    if (totalDistribution !== 100) return;
    updateAssumptions(formData);
    completeWizard();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-capi-dark-900 flex flex-col items-center pt-10 pb-20 px-4 transition-colors">
      {/* INFO MODAL */}
      <ChannelDetailsModal 
        isOpen={infoModalOpen} 
        onClose={() => setInfoModalOpen(false)} 
        channel={selectedChannelForInfo} 
      />

      <div className="w-full max-w-5xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
            <span>Démarrage SmartPilot</span>
            <span>Étape {step} sur 3</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-capi-dark-800 rounded-full h-1.5">
            <div 
              className="bg-capi-blue-600 h-1.5 rounded-full transition-all duration-700 ease-in-out" 
              style={{ width: `${(step / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white dark:bg-capi-dark-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-capi-dark-700 overflow-hidden">
          {/* Header */}
          <div className="bg-capi-blue-600 px-10 py-8 text-white">
             <h1 className="text-3xl font-black tracking-tight">
               {step === 1 && "Définissez votre ambition"}
               {step === 2 && "Vos leviers de prospection"}
               {step === 3 && "Prêt à piloter votre année ?"}
             </h1>
             <p className="text-capi-blue-100 mt-2 font-medium opacity-90">
               {step === 1 && "Combien souhaitez-vous gagner ? Nous calculons l'effort nécessaire."}
               {step === 2 && "Choisissez les actions SMART que vous allez mener sur le terrain."}
               {step === 3 && "Voici votre feuille de route hebdomadaire personnalisée."}
             </p>
          </div>

          <div className="p-6 md:p-10">
            {/* STEP 1: GOALS */}
            {step === 1 && (
              <div className="space-y-10">
                <div className="space-y-4">
                   <label className="block text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                     Votre objectif de Revenu Net Mensuel
                   </label>
                   <div className="relative group">
                      <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-capi-blue-300">
                        <Wallet size={32} />
                      </div>
                      <input 
                        type="number" 
                        value={formData.monthlyNetSalaryGoal} 
                        onChange={(e) => updateField('monthlyNetSalaryGoal', parseInt(e.target.value) || 0)}
                        className="w-full text-5xl p-8 pl-20 border-2 border-capi-blue-50 dark:border-capi-dark-600 rounded-3xl focus:ring-8 focus:ring-capi-blue-50 dark:focus:ring-capi-blue-900/20 focus:border-capi-blue-500 text-capi-blue-900 dark:text-white bg-white dark:bg-capi-dark-900 font-black shadow-inner transition-all pr-16"
                        placeholder="0"
                      />
                      <span className="absolute right-8 top-1/2 -translate-y-1/2 text-3xl font-black text-capi-blue-200">€</span>
                   </div>
                   <p className="text-xs text-gray-400 italic font-medium">C'est la base de tout votre plan de prospection.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* AUTOMATIC CALCULATIONS - READ ONLY */}
                  <div className="p-6 bg-sky-50/50 dark:bg-sky-900/10 border border-sky-100 dark:border-sky-800/50 rounded-2xl">
                    <div className="text-[10px] font-black text-sky-600 dark:text-sky-400 uppercase mb-2 tracking-widest">Chiffre d'Affaires Annuel Cible</div>
                    <div className="text-3xl font-black text-gray-900 dark:text-white">{globals.annualTurnover.toLocaleString()} € <span className="text-lg text-gray-400 font-medium">HT</span></div>
                  </div>
                  <div className="p-6 bg-purple-50/50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-800/50 rounded-2xl">
                    <div className="text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase mb-2 tracking-widest">Ventes à réaliser / an</div>
                    <div className="text-3xl font-black text-gray-900 dark:text-white">{globals.annualSales} <span className="text-lg text-gray-400 font-medium">Ventes</span></div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: CHANNELS */}
            {step === 2 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                   <div>
                     <h3 className="font-bold text-gray-900 dark:text-white">Sélectionnez vos actions SMART</h3>
                     <p className="text-sm text-gray-500 dark:text-gray-400">Activez les leviers et répartissez votre effort pour atteindre 100%.</p>
                   </div>
                   <div className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 border ${totalDistribution === 100 ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800'}`}>
                      <AlertCircle size={16} />
                      Total Répartition : {totalDistribution}% / 100%
                   </div>
                </div>

                <div className="space-y-8">
                  {categories.map(cat => (
                    <div key={cat} className="space-y-4">
                      <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-capi-dark-700 pb-2">{cat}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {formData.channels.filter(c => c.category === cat).map(channel => {
                          
                          // DYNAMIC CALCULATION FOR PREVIEW
                          const monthlyTargetR1 = globals.monthlyR1;
                          const channelR1Target = monthlyTargetR1 * (channel.distributionPercent / 100);
                          const monthlyActionTarget = Math.ceil(channelR1Target * channel.actionsPerR1);
                          const weeklyActionTarget = Math.ceil(monthlyActionTarget / 4);
                          const estimatedTime = estimateFieldTime(weeklyActionTarget, channel.id);

                          return (
                          <div key={channel.id} className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative group ${channel.enabled ? 'border-capi-blue-500 bg-capi-blue-50/30 dark:bg-capi-blue-900/20' : 'border-gray-100 dark:border-capi-dark-700 hover:border-gray-200 dark:hover:border-capi-dark-600'}`}>
                             
                             {/* Info Button - Top Right */}
                             {channel.details && (
                               <button 
                                 onClick={(e) => openInfoModal(e, channel)}
                                 className="absolute top-2 right-2 p-1.5 text-gray-300 hover:text-capi-blue-600 hover:bg-white dark:hover:bg-capi-dark-800 rounded-full transition-all z-10"
                                 title="Voir la fiche détaillée"
                               >
                                  <Info size={18} />
                               </button>
                             )}

                             <div className="flex justify-between items-start mb-2" onClick={() => toggleChannel(channel.id)}>
                                <div className="flex items-center gap-3 w-full">
                                   <div 
                                      className={`w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-colors shrink-0 ${channel.enabled ? 'bg-capi-blue-600 border-capi-blue-600' : 'border-gray-300 dark:border-gray-600'}`}
                                   >
                                      {channel.enabled && <Check size={14} className="text-white" />}
                                   </div>
                                   <div className="flex-1 pr-6">
                                      <span className={`font-bold block ${channel.enabled ? 'text-capi-blue-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>{channel.name}</span>
                                      {channel.description && <span className="text-xs text-gray-400 block mt-0.5 leading-tight">{channel.description}</span>}
                                   </div>
                                </div>
                             </div>
                             
                             {channel.enabled && (
                               <div className="pl-9 mt-4 space-y-3">
                                 <div className="flex items-center gap-4">
                                    <input 
                                      type="range" 
                                      min="0" 
                                      max="100" 
                                      step="5"
                                      value={channel.distributionPercent}
                                      onChange={(e) => updateChannel(channel.id, 'distributionPercent', parseInt(e.target.value))}
                                      className="flex-1 accent-capi-blue-600 h-2 bg-gray-200 dark:bg-capi-dark-900 rounded-full appearance-none"
                                    />
                                    <span className="font-black text-capi-blue-600 dark:text-capi-blue-400 w-12 text-right">{channel.distributionPercent}%</span>
                                 </div>
                                 
                                 {/* WORKLOAD PREVIEW (NEW) */}
                                 <div className="grid grid-cols-2 gap-2 text-xs bg-white dark:bg-capi-dark-800 p-2 rounded-lg border border-gray-100 dark:border-capi-dark-700">
                                     <div className="flex flex-col">
                                        <span className="text-gray-400 font-bold uppercase text-[9px] tracking-wide mb-0.5 flex items-center gap-1"><Calendar size={9} /> Volume Hebdo</span>
                                        <span className="font-black text-gray-800 dark:text-white">{weeklyActionTarget} {channel.actionUnit}</span>
                                     </div>
                                     <div className="flex flex-col text-right">
                                        <span className="text-gray-400 font-bold uppercase text-[9px] tracking-wide mb-0.5 flex items-center justify-end gap-1"><Clock size={9} /> Charge estimée</span>
                                        <span className="font-black text-capi-blue-600 dark:text-capi-blue-400">{estimatedTime} /sem</span>
                                     </div>
                                 </div>
                               </div>
                             )}
                          </div>
                        )})}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Custom Channel Card */}
                {!isAddingChannel ? (
                  <button 
                    onClick={() => setIsAddingChannel(true)}
                    className="w-full border-2 border-dashed border-gray-300 dark:border-capi-dark-600 rounded-2xl p-5 flex flex-col justify-center items-center text-center cursor-pointer hover:border-capi-blue-400 hover:bg-capi-blue-50 dark:hover:bg-capi-blue-900/10 transition-all group min-h-[100px]"
                  >
                      <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500 group-hover:text-capi-blue-600 dark:group-hover:text-capi-blue-400 transition-colors">
                          <Plus size={20} />
                          <span className="font-bold text-sm">Ajouter un levier personnalisé</span>
                      </div>
                  </button>
                ) : (
                  <div className="bg-white dark:bg-capi-dark-800 border-2 border-capi-blue-100 dark:border-capi-blue-900 rounded-2xl p-6 shadow-xl relative animate-in fade-in zoom-in-95">
                      <button 
                        onClick={() => setIsAddingChannel(false)} 
                        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-capi-dark-700 rounded-full transition-colors"
                      >
                        <X size={20}/>
                      </button>
                      
                      <h4 className="font-bold text-capi-blue-900 dark:text-white mb-6 flex items-center gap-2">
                        <div className="bg-capi-blue-100 dark:bg-capi-blue-900 p-1.5 rounded-lg text-capi-blue-600 dark:text-capi-blue-400"><Plus size={16}/></div> 
                        Nouveau Levier
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="space-y-2">
                              <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest">Nom du levier</label>
                              <input 
                                type="text" 
                                value={newChannelName} 
                                onChange={e => setNewChannelName(e.target.value)} 
                                placeholder="Ex: SMS, Partenariats..." 
                                className="w-full p-3 bg-gray-50 dark:bg-capi-dark-900 border border-gray-200 dark:border-capi-dark-700 rounded-xl font-bold text-gray-800 dark:text-white focus:border-capi-blue-500 focus:ring-2 focus:ring-capi-blue-200 dark:focus:ring-capi-blue-900/50 outline-none" 
                              />
                          </div>
                           <div className="space-y-2">
                              <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest">Catégorie</label>
                              <select 
                                value={newChannelCategory} 
                                onChange={e => setNewChannelCategory(e.target.value)} 
                                className="w-full p-3 bg-gray-50 dark:bg-capi-dark-900 border border-gray-200 dark:border-capi-dark-700 rounded-xl font-bold text-gray-800 dark:text-white focus:border-capi-blue-500 focus:ring-2 focus:ring-capi-blue-200 dark:focus:ring-capi-blue-900/50 outline-none" 
                              >
                                <option>Autre</option>
                                <option>Relationnel</option>
                                <option>Terrain</option>
                                <option>Téléphone</option>
                                <option>Digital</option>
                              </select>
                          </div>
                          <div className="space-y-2">
                              <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest">Ratio (Actions pour 1 RDV)</label>
                              <input 
                                type="number" 
                                value={newChannelYield} 
                                onChange={e => setNewChannelYield(Number(e.target.value))} 
                                className="w-full p-3 bg-gray-50 dark:bg-capi-dark-900 border border-gray-200 dark:border-capi-dark-700 rounded-xl font-bold text-gray-800 dark:text-white focus:border-capi-blue-500 focus:ring-2 focus:ring-capi-blue-200 dark:focus:ring-capi-blue-900/50 outline-none" 
                              />
                              <p className="text-[10px] text-gray-400">Combien d'actions pour 1 RDV ?</p>
                          </div>
                          <div className="space-y-2">
                              <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest">Unité d'action</label>
                              <input 
                                type="text" 
                                value={newChannelUnit} 
                                onChange={e => setNewChannelUnit(e.target.value)} 
                                placeholder="Ex: sms, appels..." 
                                className="w-full p-3 bg-gray-50 dark:bg-capi-dark-900 border border-gray-200 dark:border-capi-dark-700 rounded-xl font-bold text-gray-800 dark:text-white focus:border-capi-blue-500 focus:ring-2 focus:ring-capi-blue-200 dark:focus:ring-capi-blue-900/50 outline-none" 
                              />
                          </div>
                      </div>
                      
                      <div className="mt-6 flex justify-end">
                         <button 
                           onClick={handleAddCustomChannel} 
                           className="bg-capi-blue-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-capi-blue-200 dark:shadow-none hover:bg-capi-blue-700 hover:scale-105 transition-all flex items-center gap-2"
                         >
                           <Save size={18} /> Ajouter ce levier
                         </button>
                      </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 3: SUMMARY */}
            {step === 3 && (
               <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                  <div className="bg-gradient-to-br from-gray-900 to-gray-800 dark:from-black dark:to-gray-900 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-10 opacity-10"><ClipboardCheck size={200} /></div>
                     <div className="relative z-10 flex-1">
                        <h3 className="text-2xl font-bold mb-2">Votre Plan de Bataille Hebdomadaire</h3>
                        <p className="text-gray-300">Pour atteindre {formData.monthlyNetSalaryGoal}€ net/mois, voici votre discipline hebdomadaire.</p>
                     </div>
                     <div className="relative z-10 text-center bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/10">
                        <div className="text-4xl font-black">{globals.weeklyR1}</div>
                        <div className="text-[10px] uppercase font-bold tracking-widest opacity-80">RDV Vendeurs / Semaine</div>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                     {calculateChannelTargets(globals.monthlyR1, formData.channels).filter(c => c.weeklyActionTarget > 0).map(c => (
                        <div key={c.channelId} className="bg-gray-50 dark:bg-capi-dark-900 p-4 rounded-2xl border border-gray-100 dark:border-capi-dark-700 flex justify-between items-center">
                           <span className="font-bold text-gray-700 dark:text-gray-300">{c.channelName}</span>
                           <div className="text-right">
                              <span className="block font-black text-xl text-capi-blue-600 dark:text-capi-blue-400">{c.weeklyActionTarget}</span>
                              <span className="text-[10px] text-gray-400 uppercase font-bold">{c.actionUnit}/sem</span>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            )}
          </div>

          {/* Footer Navigation */}
          <div className="bg-gray-50 dark:bg-capi-dark-900 px-10 py-6 border-t border-gray-100 dark:border-capi-dark-700 flex justify-between items-center">
             <button 
                onClick={prevStep}
                disabled={step === 1}
                className="flex items-center gap-2 text-gray-500 dark:text-gray-400 font-bold hover:text-gray-800 dark:hover:text-white disabled:opacity-30 disabled:hover:text-gray-500 transition-colors"
             >
                <ArrowLeft size={18} /> Retour
             </button>

             {step < 3 ? (
               <button 
                  onClick={handleNext}
                  className="bg-capi-blue-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-capi-blue-200 dark:shadow-none hover:bg-capi-blue-700 hover:scale-105 transition-all flex items-center gap-2"
               >
                  Suivant <ArrowRight size={18} />
               </button>
             ) : (
               <button 
                  onClick={handleFinish}
                  className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-green-200 dark:shadow-none hover:bg-green-700 hover:scale-105 transition-all flex items-center gap-2"
               >
                  C'est parti ! <Check size={18} />
               </button>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};