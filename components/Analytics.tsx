import React from 'react';
import { useTrades } from '../context/TradeContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

export const Analytics: React.FC = () => {
  const { trades, stats } = useTrades();

  const winLossData = [
    { name: 'Wins', value: stats.winRate },
    { name: 'Losses', value: 100 - stats.winRate }
  ];

  // Group PnL by Month (Simplified)
  const monthlyData = React.useMemo(() => {
    const map = new Map();
    trades.forEach(t => {
      if (t.status === 'OPEN' || !t.pnl) return;
      const date = new Date(t.entryDate);
      const key = `${date.getMonth() + 1}/${date.getFullYear()}`;
      map.set(key, (map.get(key) || 0) + t.pnl);
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [trades]);

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-white">Performance Analytics</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Win Rate Donut */}
        <div className="glass-card p-6 rounded-3xl border border-white/5 flex flex-col items-center justify-center min-h-[350px]">
          <h3 className="text-xl font-bold text-white mb-4 self-start">Accuracy</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={winLossData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                <Cell fill="#00FF94" stroke="none" />
                <Cell fill="#FF0055" stroke="none" />
              </Pie>
              <Tooltip 
                 contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '8px' }}
                 itemStyle={{ color: '#fff' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-neon-green"></div>
              <span className="text-gray-400">Wins ({stats.winRate.toFixed(1)}%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-neon-red"></div>
              <span className="text-gray-400">Losses ({(100 - stats.winRate).toFixed(1)}%)</span>
            </div>
          </div>
        </div>

        {/* Monthly PnL Bar */}
        <div className="glass-card p-6 rounded-3xl border border-white/5 min-h-[350px]">
          <h3 className="text-xl font-bold text-white mb-4">Monthly Profit</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyData}>
              <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
              <Tooltip 
                cursor={{fill: 'rgba(255,255,255,0.05)'}}
                contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '8px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {monthlyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.value >= 0 ? '#00FF94' : '#FF0055'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};