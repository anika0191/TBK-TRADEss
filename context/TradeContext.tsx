import React, { createContext, useContext, useState, useEffect } from 'react';
import { Trade, TradeStats } from '../types';
import * as tradeService from '../services/tradeService';

interface TradeContextType {
  trades: Trade[];
  stats: TradeStats;
  initialBalance: number;
  addTrade: (trade: any) => void;
  editTrade: (trade: any) => void;
  removeTrade: (id: string) => void;
  refreshTrades: () => void;
  updateInitialBalance: (amount: number) => void;
}

const TradeContext = createContext<TradeContextType | undefined>(undefined);

export const TradeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [initialBalance, setInitialBalance] = useState(10000);
  const [stats, setStats] = useState<TradeStats>({
    totalTrades: 0, winRate: 0, totalPnL: 0, bestTrade: 0, worstTrade: 0,
    profitFactor: 0, avgRR: 0, consecutiveWins: 0, consecutiveLosses: 0
  });

  const refreshTrades = () => {
    const loadedTrades = tradeService.getTrades();
    const settings = tradeService.getSettings();
    
    // Sort by date descending
    loadedTrades.sort((a, b) => new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime());
    
    setTrades(loadedTrades);
    setStats(tradeService.calculateStats(loadedTrades));
    setInitialBalance(settings.initialBalance);
  };

  useEffect(() => {
    refreshTrades();
  }, []);

  const addTrade = (trade: any) => {
    tradeService.saveTrade(trade);
    refreshTrades();
  };

  const editTrade = (trade: any) => {
    tradeService.saveTrade(trade);
    refreshTrades();
  };

  const removeTrade = (id: string) => {
    tradeService.deleteTrade(id);
    refreshTrades();
  };

  const updateInitialBalance = (amount: number) => {
    tradeService.saveSettings({ initialBalance: amount });
    setInitialBalance(amount);
  };

  return (
    <TradeContext.Provider value={{ trades, stats, initialBalance, addTrade, editTrade, removeTrade, refreshTrades, updateInitialBalance }}>
      {children}
    </TradeContext.Provider>
  );
};

export const useTrades = () => {
  const context = useContext(TradeContext);
  if (!context) throw new Error("useTrades must be used within a TradeProvider");
  return context;
};