import React, { useState } from 'react';
import { useTrades } from '../context/TradeContext';
import { Trash2, Download, Filter, Image as ImageIcon, X } from 'lucide-react';
import { exportToCSV } from '../services/tradeService';
import { format } from 'date-fns';

export const TradeList: React.FC = () => {
  const { trades, removeTrade } = useTrades();
  const [filter, setFilter] = useState('ALL');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const filteredTrades = trades.filter(t => {
    if (filter === 'ALL') return true;
    if (filter === 'WIN') return t.status === 'WIN';
    if (filter === 'LOSS') return t.status === 'LOSS';
    return true;
  });

  return (
    <div className="space-y-6 relative">
      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={() => setSelectedImage(null)}>
          <button onClick={() => setSelectedImage(null)} className="absolute top-6 right-6 text-white hover:text-gray-300">
            <X size={32} />
          </button>
          <img src={selectedImage} alt="Trade Screenshot" className="max-w-full max-h-[90vh] rounded-lg shadow-2xl border border-white/10" />
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-3xl font-bold text-white">Trade Journal</h2>
        <div className="flex gap-3">
          <div className="flex items-center gap-2 bg-white/5 rounded-lg p-1 border border-white/10">
            {['ALL', 'WIN', 'LOSS'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${filter === f ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
              >
                {f}
              </button>
            ))}
          </div>
          <button 
            onClick={() => exportToCSV(trades)}
            className="flex items-center gap-2 px-4 py-2 bg-neon-blue/10 text-neon-blue border border-neon-blue/30 rounded-lg hover:bg-neon-blue/20 transition-all"
          >
            <Download size={18} /> CSV
          </button>
        </div>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden border border-white/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-gray-400 text-sm font-medium">
                <th className="p-4">Date</th>
                <th className="p-4">Symbol</th>
                <th className="p-4">Side</th>
                <th className="p-4">Price</th>
                <th className="p-4">Size</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">PnL</th>
                <th className="p-4 text-center">Shot</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredTrades.map(trade => (
                <tr key={trade.id} className="hover:bg-white/5 transition-colors group">
                  <td className="p-4 text-gray-300 whitespace-nowrap">{format(new Date(trade.entryDate), 'MMM dd, yyyy')}</td>
                  <td className="p-4 font-bold text-white">{trade.symbol}</td>
                  <td className="p-4">
                     <span className={`text-xs px-2 py-1 rounded-full font-bold ${trade.type === 'BUY' ? 'text-neon-green' : 'text-neon-red'}`}>
                      {trade.type}
                    </span>
                  </td>
                  <td className="p-4 text-gray-300">{trade.entryPrice}</td>
                  <td className="p-4 text-gray-300">{trade.quantity}</td>
                  <td className="p-4">
                    <span className={`inline-block w-2 h-2 rounded-full mr-2 ${trade.status === 'WIN' ? 'bg-neon-green' : trade.status === 'LOSS' ? 'bg-neon-red' : trade.status === 'OPEN' ? 'bg-yellow-500' : 'bg-gray-500'}`}></span>
                    <span className="text-sm text-gray-400">{trade.status}</span>
                  </td>
                  <td className={`p-4 text-right font-mono font-bold ${trade.pnl && trade.pnl > 0 ? 'text-neon-green' : trade.pnl && trade.pnl < 0 ? 'text-neon-red' : 'text-gray-500'}`}>
                    {trade.pnl ? `$${trade.pnl.toFixed(2)}` : '-'}
                  </td>
                  <td className="p-4 text-center">
                    {trade.screenshotUrl ? (
                      <button 
                        onClick={() => setSelectedImage(trade.screenshotUrl!)}
                        className="text-gray-400 hover:text-neon-blue transition-colors"
                      >
                        <ImageIcon size={18} />
                      </button>
                    ) : (
                      <span className="text-gray-700">-</span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    <button 
                      onClick={() => removeTrade(trade.id)}
                      className="text-gray-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredTrades.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            <Filter className="mx-auto mb-3 opacity-50" />
            No trades found matching your filters.
          </div>
        )}
      </div>
    </div>
  );
};