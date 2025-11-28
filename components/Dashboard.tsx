import React, { useState } from 'react';
import { useTrades } from '../context/TradeContext';
import { StatsCard } from './StatsCard';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, TrendingDown, Target, Activity, Wallet, Edit2, X } from 'lucide-react';
import { format } from 'date-fns';

export const Dashboard: React.FC = () => {
  const { stats, trades, initialBalance, updateInitialBalance } = useTrades();
  const [isEditingBalance, setIsEditingBalance] = useState(false);
  
  // We track the *current* balance for the edit input
  const currentEquity = initialBalance + stats.totalPnL;
  const [newBalance, setNewBalance] = useState(currentEquity.toString());

  // Prepare data for Equity Curve
  const equityData = React.useMemo(() => {
    let runningEquity = initialBalance;
    // Sort trades ascending for chart
    const sortedTrades = [...trades].sort((a, b) => new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime());
    
    // Initial point
    const data = [{ name: 'Start', balance: initialBalance }];
    
    sortedTrades.forEach(trade => {
      if (trade.status !== 'OPEN' && trade.pnl !== undefined) {
        runningEquity += trade.pnl;
        data.push({
          name: format(new Date(trade.entryDate), 'MMM dd'),
          balance: runningEquity
        });
      }
    });
    return data;
  }, [trades, initialBalance]);

  const handleSaveBalance = (e: React.FormEvent) => {
    e.preventDefault();
    // User edits the CURRENT balance. We need to back-calculate the initial balance.
    // Current = Initial + PnL  =>  Initial = Current - PnL
    const desiredCurrentEquity = Number(newBalance);
    const newInitial = desiredCurrentEquity - stats.totalPnL;
    
    updateInitialBalance(newInitial);
    setIsEditingBalance(false);
  };

  const openEditModal = () => {
    setNewBalance(currentEquity.toString());
    setIsEditingBalance(true);
  };

  return (
    <div className="space-y-6 relative pb-10">
      {/* Edit Balance Modal */}
      {isEditingBalance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="glass-card p-6 rounded-2xl w-full max-w-sm border border-neon-blue/30">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Adjust Account Balance</h3>
              <button onClick={() => setIsEditingBalance(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveBalance}>
              <div className="mb-4">
                <label className="text-sm text-gray-400 block mb-2">Current Total Equity</label>
                <input 
                  type="number" 
                  step="any"
                  value={newBalance}
                  onChange={(e) => setNewBalance(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-neon-blue outline-none font-mono text-lg"
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-2">This will adjust your starting balance to match your current equity.</p>
              </div>
              <button 
                type="submit" 
                className="w-full py-3 bg-neon-blue text-black font-bold rounded-xl hover:bg-neon-blue/90"
              >
                Update Balance
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white">Dashboard</h2>
          <p className="text-gray-400">Market Overview & Performance</p>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative group cursor-pointer" onClick={openEditModal}>
          <StatsCard 
            label="Current Equity" 
            value={`$${currentEquity.toFixed(2)}`} 
            color="blue"
            subValue="Click to Edit Balance"
            icon={<Wallet />}
          />
          <div className="absolute top-4 right-4 text-neon-blue opacity-0 group-hover:opacity-100 transition-opacity">
            <Edit2 size={16} />
          </div>
        </div>
        
        <StatsCard 
          label="Net P&L" 
          value={`$${stats.totalPnL.toFixed(2)}`} 
          color={stats.totalPnL >= 0 ? 'green' : 'red'}
          icon={stats.totalPnL >= 0 ? <TrendingUp /> : <TrendingDown />}
        />
        <StatsCard 
          label="Win Rate" 
          value={`${stats.winRate.toFixed(1)}%`} 
          color="neutral"
          subValue={`${stats.totalTrades} Total Trades`}
          icon={<Target />}
        />
        <StatsCard 
          label="Avg R:R" 
          value={`${stats.avgRR.toFixed(2)}R`} 
          color="neutral"
          icon={<Activity />}
        />
      </div>

      {/* Equity Curve Full Width */}
      <div className="glass-card p-6 rounded-3xl border border-white/5 h-[400px]">
        <h3 className="text-xl font-bold text-white mb-6">Equity Curve</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={equityData}>
              <defs>
                <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00D1FF" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#00D1FF" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
              <XAxis dataKey="name" stroke="#666" tick={{fill: '#666', fontSize: 12}} tickLine={false} axisLine={false} />
              <YAxis 
                stroke="#666" 
                tick={{fill: '#666', fontSize: 12}} 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={(val) => `$${val}`} 
                domain={['auto', 'auto']}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '8px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Area 
                type="monotone" 
                dataKey="balance" 
                stroke="#00D1FF" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#colorBalance)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Recent Trades */}
      <div className="glass-card p-6 rounded-3xl border border-white/5">
        <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-gray-500 text-sm border-b border-white/10">
                <th className="py-3 px-2">Symbol</th>
                <th className="py-3 px-2">Type</th>
                <th className="py-3 px-2">Result</th>
                <th className="py-3 px-2 text-right">PnL</th>
              </tr>
            </thead>
            <tbody>
              {trades.slice(0, 5).map(trade => (
                <tr key={trade.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-3 px-2 font-bold text-white">{trade.symbol}</td>
                  <td className="py-3 px-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${trade.type === 'BUY' ? 'bg-neon-green/20 text-neon-green' : 'bg-neon-red/20 text-neon-red'}`}>
                      {trade.type}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-sm text-gray-400">{trade.status}</td>
                  <td className={`py-3 px-2 text-right font-mono font-medium ${trade.pnl && trade.pnl > 0 ? 'text-neon-green' : trade.pnl && trade.pnl < 0 ? 'text-neon-red' : 'text-gray-400'}`}>
                    {trade.pnl ? `$${trade.pnl.toFixed(2)}` : '-'}
                  </td>
                </tr>
              ))}
              {trades.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-500">No trades recorded yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};