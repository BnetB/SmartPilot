import React from 'react';
import { X, Target, Lightbulb, Clock, CheckCircle2 } from 'lucide-react';
import { ProspectingChannel } from '../types';

interface ChannelDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  channel: ProspectingChannel | null;
}

export const ChannelDetailsModal: React.FC<ChannelDetailsModalProps> = ({ isOpen, onClose, channel }) => {
  if (!isOpen || !channel || !channel.details) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-capi-dark-800 w-full max-w-lg rounded-3xl shadow-2xl border border-gray-100 dark:border-capi-dark-700 overflow-hidden relative animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-capi-blue-600 p-6 pt-8 pb-8 text-white relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors text-white"
          >
            <X size={20} />
          </button>
          
          <div className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2 border-b border-white/20 inline-block pb-1">
            {channel.category}
          </div>
          <h2 className="text-2xl font-black leading-tight">{channel.name}</h2>
          <p className="text-capi-blue-100 mt-2 text-sm">{channel.description}</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          
          {/* Action Concrète */}
          <div>
            <div className="flex items-center gap-2 mb-2 text-capi-blue-600 dark:text-capi-blue-400">
              <Target size={18} />
              <h3 className="font-bold text-sm uppercase tracking-wide">Action Concrète (SMART)</h3>
            </div>
            <div className="bg-capi-blue-50 dark:bg-capi-blue-900/20 p-4 rounded-xl border border-capi-blue-100 dark:border-capi-blue-800/50 text-gray-800 dark:text-gray-200 text-sm font-medium leading-relaxed">
              {channel.details.actionSmart}
            </div>
          </div>

          {/* Exemple */}
          <div>
            <div className="flex items-center gap-2 mb-2 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 size={18} />
              <h3 className="font-bold text-sm uppercase tracking-wide">Exemple Hebdomadaire</h3>
            </div>
            <div className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed border-l-4 border-emerald-200 dark:border-emerald-800 pl-4 italic">
              "{channel.details.example}"
            </div>
          </div>

          {/* Indicators & Horizon */}
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-gray-50 dark:bg-capi-dark-900 p-3 rounded-xl border border-gray-100 dark:border-capi-dark-700">
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase mb-1">
                   <Clock size={12} /> Horizon Résultat
                </div>
                <div className="font-bold text-gray-900 dark:text-white text-sm">{channel.details.horizon}</div>
             </div>
             <div className="bg-gray-50 dark:bg-capi-dark-900 p-3 rounded-xl border border-gray-100 dark:border-capi-dark-700">
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase mb-1">
                   Indicateur
                </div>
                <div className="font-bold text-gray-900 dark:text-white text-sm">{channel.actionUnit}</div>
             </div>
          </div>

          {/* Tips */}
          {channel.details.tips && channel.details.tips.length > 0 && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-xl border border-yellow-100 dark:border-yellow-800/50 text-yellow-800 dark:text-yellow-400 text-sm">
               <div className="flex items-center gap-2 font-bold mb-1">
                  <Lightbulb size={16} /> Conseil Pro
               </div>
               <ul className="list-disc list-inside space-y-1 opacity-90 text-xs">
                  {channel.details.tips.map((tip, idx) => (
                    <li key={idx}>{tip}</li>
                  ))}
               </ul>
            </div>
          )}

        </div>
        
        {/* Footer */}
        <div className="p-4 bg-gray-50 dark:bg-capi-dark-900 border-t border-gray-100 dark:border-capi-dark-700 text-center">
          <button 
             onClick={onClose}
             className="w-full py-3 bg-white dark:bg-capi-dark-800 border border-gray-200 dark:border-capi-dark-600 text-gray-700 dark:text-white font-bold rounded-xl hover:bg-gray-100 dark:hover:bg-capi-dark-700 transition-colors"
          >
            J'ai compris
          </button>
        </div>

      </div>
    </div>
  );
};