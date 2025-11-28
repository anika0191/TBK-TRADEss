import React from 'react';
import { TradingViewWidget } from './TradingViewWidget';

export const ChartPage: React.FC = () => {
  return (
    <div className="h-[calc(100vh-100px)] w-full flex flex-col space-y-4">
      <div className="flex items-center justify-between">
         <h2 className="text-3xl font-bold text-white">Live Chart</h2>
         <p className="text-sm text-gray-500">Note: External login is not supported in the embedded widget.</p>
      </div>
      <div className="flex-1 glass-card rounded-3xl border border-white/5 overflow-hidden">
        <TradingViewWidget />
      </div>
    </div>
  );
};