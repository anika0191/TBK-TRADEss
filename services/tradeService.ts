import { Trade, TradeType, TradeStatus, TradeStats } from '../types';
import { STORAGE_KEY } from '../constants';

const SETTINGS_KEY = 'neontrade_settings';

export interface AppSettings {
  initialBalance: number;
}

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

export const getTrades = (): Trade[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const getSettings = (): AppSettings => {
  const data = localStorage.getItem(SETTINGS_KEY);
  return data ? JSON.parse(data) : { initialBalance: 10000 };
};

export const saveSettings = (settings: AppSettings) => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

export const saveTrade = (trade: Omit<Trade, 'id' | 'status' | 'pnl'> & { id?: string }): Trade => {
  const trades = getTrades();
  
  // Calculate PnL and Status automatically
  let pnl = 0;
  let status = TradeStatus.OPEN;

  if (trade.exitPrice) {
    const direction = trade.type === TradeType.BUY ? 1 : -1;
    const grossPnL = (trade.exitPrice - trade.entryPrice) * trade.quantity * direction;
    pnl = grossPnL; // Removed fees subtraction

    if (pnl > 0) status = TradeStatus.WIN;
    else if (pnl < 0) status = TradeStatus.LOSS;
    else status = TradeStatus.BE;
  }

  const newTrade: Trade = {
    ...trade,
    id: trade.id || generateId(),
    status,
    pnl
  };

  if (trade.id) {
    // Edit existing
    const index = trades.findIndex(t => t.id === trade.id);
    if (index !== -1) {
      trades[index] = newTrade;
    }
  } else {
    // Add new
    trades.push(newTrade);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(trades));
  return newTrade;
};

export const deleteTrade = (id: string): void => {
  const trades = getTrades();
  const filtered = trades.filter(t => t.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};

export const calculateStats = (trades: Trade[]): TradeStats => {
  const closedTrades = trades.filter(t => t.status !== TradeStatus.OPEN);
  if (closedTrades.length === 0) {
    return {
      totalTrades: 0,
      winRate: 0,
      totalPnL: 0,
      bestTrade: 0,
      worstTrade: 0,
      profitFactor: 0,
      avgRR: 0,
      consecutiveWins: 0,
      consecutiveLosses: 0
    };
  }

  const wins = closedTrades.filter(t => t.pnl && t.pnl > 0);
  const losses = closedTrades.filter(t => t.pnl && t.pnl <= 0);
  
  const totalPnL = closedTrades.reduce((acc, t) => acc + (t.pnl || 0), 0);
  const grossProfit = wins.reduce((acc, t) => acc + (t.pnl || 0), 0);
  const grossLoss = Math.abs(losses.reduce((acc, t) => acc + (t.pnl || 0), 0));

  const winRate = (wins.length / closedTrades.length) * 100;
  const profitFactor = grossLoss === 0 ? grossProfit : grossProfit / grossLoss;

  const bestTrade = Math.max(...closedTrades.map(t => t.pnl || 0));
  const worstTrade = Math.min(...closedTrades.map(t => t.pnl || 0));

  // Calculate Average R:R (Simplified: Reward / Risk ratio based on planned stops)
  // Risk = |Entry - SL|, Reward = |TP - Entry|
  let totalRR = 0;
  let rrCount = 0;
  
  closedTrades.forEach(t => {
    const risk = Math.abs(t.entryPrice - t.stopLoss);
    const reward = Math.abs(t.takeProfit - t.entryPrice);
    if (risk > 0) {
      totalRR += (reward / risk);
      rrCount++;
    }
  });

  return {
    totalTrades: trades.length,
    winRate,
    totalPnL,
    bestTrade,
    worstTrade,
    profitFactor,
    avgRR: rrCount > 0 ? totalRR / rrCount : 0,
    consecutiveWins: 0, // Simplified for brevity
    consecutiveLosses: 0 // Simplified for brevity
  };
};

export const exportToCSV = (trades: Trade[]) => {
  const headers = ['ID', 'Symbol', 'Type', 'Date', 'Entry', 'Exit', 'Size', 'PnL', 'Status', 'Notes'];
  const csvContent = [
    headers.join(','),
    ...trades.map(t => [
      t.id,
      t.symbol,
      t.type,
      new Date(t.entryDate).toLocaleDateString(),
      t.entryPrice,
      t.exitPrice || '',
      t.quantity,
      t.pnl?.toFixed(2) || '',
      t.status,
      `"${(t.notes || '').replace(/"/g, '""')}"`
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `tbk_trades_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};