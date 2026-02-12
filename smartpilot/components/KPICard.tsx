import React from 'react';
import { ArrowUpRight, ArrowDownRight, Target } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  target?: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'blue' | 'green' | 'purple' | 'orange';
}

export const KPICard: React.FC<KPICardProps> = ({ title, value, target, unit = '', trend, color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    orange: 'bg-orange-50 text-orange-700 border-orange-200',
  };

  const iconColor = {
    blue: 'text-blue-500',
    green: 'text-emerald-500',
    purple: 'text-purple-500',
    orange: 'text-orange-500',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wide">{title}</h3>
        <div className={`p-2 rounded-lg ${colorClasses[color]} bg-opacity-50`}>
          <Target className={`w-5 h-5 ${iconColor[color]}`} />
        </div>
      </div>
      
      <div>
        <div className="text-3xl font-bold text-gray-900">
          {value} <span className="text-lg text-gray-400 font-normal">{unit}</span>
        </div>
        
        {target !== undefined && (
          <div className="mt-2 flex items-center text-sm">
            <span className="text-gray-500 mr-2">Objectif: {target} {unit}</span>
            {/* Simple visual indicator of gap */}
          </div>
        )}
      </div>
    </div>
  );
};