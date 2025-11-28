export enum TradeType {
  BUY = 'BUY',
  SELL = 'SELL'
}

export enum TradeStatus {
  WIN = 'WIN',
  LOSS = 'LOSS',
  BE = 'BE', // Break Even
  OPEN = 'OPEN'
}

export interface Trade {
  id: string;
  symbol: string;
  type: TradeType;
  entryDate: string; // ISO String
  entryPrice: number;
  exitPrice?: number;
  stopLoss: number;
  takeProfit: number;
  quantity: number;
  notes?: string;
  screenshotUrl?: string;
  status: TradeStatus;
  pnl?: number;
  setup?: string;
}

export interface TradeStats {
  totalTrades: number;
  winRate: number;
  totalPnL: number;
  bestTrade: number;
  worstTrade: number;
  profitFactor: number;
  avgRR: number;
  consecutiveWins: number;
  consecutiveLosses: number;
}