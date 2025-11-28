import React from 'react';

interface StatsCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'green' | 'red' | 'blue' | 'neutral';
  icon?: React.ReactNode;
}

export const StatsCard: React.FC<StatsCardProps> = ({ label, value, subValue, color = 'neutral', icon }) => {
  const colorMap = {
    green: 'text-neon-green',
    red: 'text-neon-red',
    blue: 'text-neon-blue',
    neutral: 'text-white'
  };

  const borderMap = {
    green: 'border-neon-green/30 shadow-[0_0_20px_rgba(0,255,148,0.05)]',
    red: 'border-neon-red/30 shadow-[0_0_20px_rgba(255,0,85,0.05)]',
    blue: 'border-neon-blue/30',
    neutral: 'border-white/10'
  };

  return (
    <div className={`glass-card p-6 rounded-2xl border ${borderMap[color]} relative overflow-hidden group transition-all hover:scale-[1.02]`}>
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-2">
          <p className="text-sm text-gray-400 font-medium uppercase tracking-wider">{label}</p>
          {icon && <span className={`${colorMap[color]} opacity-80`}>{icon}</span>}
        </div>
        <h3 className={`text-3xl font-bold ${colorMap[color]}`}>{value}</h3>
        {subValue && <p className="text-xs text-gray-500 mt-1">{subValue}</p>}
      </div>
      
      {/* Background Glow Effect */}
      <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity 
        ${color === 'green' ? 'bg-neon-green' : color === 'red' ? 'bg-neon-red' : 'bg-white'}`} 
      />
    </div>
  );
};