import React from 'react';
import { TradeHistoryItem } from '../types';
import { Trash2, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, History, X } from 'lucide-react';

interface HistoryPanelProps {
  history: TradeHistoryItem[];
  onClearHistory: () => void;
  onDeleteItem: (id: string) => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onClearHistory, onDeleteItem }) => {
  // Logic to calculate win rate
  const total = history.length;
  const wins = history.filter(h => h.result === 'PROFIT').length;
  const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;

  return (
    <div className="flex-1 bg-panel rounded-xl p-0 md:p-5 border border-panel-border flex flex-col overflow-hidden min-h-[300px] md:min-h-[250px]">
        {/* Mobile-friendly Header with Stats */}
        <div className="flex justify-between items-center p-4 md:p-0 md:mb-4 border-b md:border-b-0 border-panel-border bg-gray-900/50 md:bg-transparent">
            <div>
                <h3 className="text-base font-bold text-primary flex items-center gap-2">
                    <History size={18} /> TRADING HISTORY
                </h3>
                <div className="flex items-center gap-3 mt-1 md:hidden">
                    <span className="text-xs text-gray-400">Win Rate: <span className={`font-bold ${winRate >= 50 ? 'text-green-500' : 'text-red-500'}`}>{winRate}%</span></span>
                    <span className="text-xs text-gray-400">Trades: <span className="text-white font-bold">{total}</span></span>
                </div>
            </div>
            
            <button 
                onClick={onClearHistory}
                className="p-2 bg-gray-800 hover:bg-red-500/20 hover:text-red-500 text-gray-400 rounded-lg transition-colors flex items-center gap-1"
                title="Clear All History"
            >
                <Trash2 size={16} />
                <span className="text-xs font-bold hidden md:inline">Clear All</span>
            </button>
        </div>

        {/* Desktop Stats (hidden on mobile to save space in header) */}
        <div className="hidden md:flex gap-4 mb-4 bg-gray-800/30 p-3 rounded-lg border border-panel-border">
             <div className="flex-1 text-center border-r border-gray-700">
                <div className="text-[10px] text-gray-400 uppercase">Total Trades</div>
                <div className="text-lg font-bold text-white">{total}</div>
             </div>
             <div className="flex-1 text-center border-r border-gray-700">
                <div className="text-[10px] text-gray-400 uppercase">Win Rate</div>
                <div className={`text-lg font-bold ${winRate >= 50 ? 'text-green-500' : 'text-red-500'}`}>{winRate}%</div>
             </div>
             <div className="flex-1 text-center">
                <div className="text-[10px] text-gray-400 uppercase">Net Result</div>
                 <div className="text-lg font-bold text-white">{wins}W - {total - wins}L</div>
             </div>
        </div>
      
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-800/50 text-gray-400 text-xs uppercase tracking-wider">
              <th className="p-3 font-medium sticky top-0 bg-panel z-10 border-b border-panel-border">Asset / Time</th>
              <th className="p-3 font-medium sticky top-0 bg-panel z-10 border-b border-panel-border text-center">Signal</th>
              <th className="p-3 font-medium sticky top-0 bg-panel z-10 border-b border-panel-border text-right">Result</th>
              <th className="p-3 font-medium sticky top-0 bg-panel z-10 border-b border-panel-border w-10"></th>
            </tr>
          </thead>
          <tbody>
            {history.map((item) => (
              <tr 
                key={item.id} 
                className="border-b border-panel-border/50 hover:bg-gray-700/40 transition-colors group"
              >
                <td className="p-3">
                    <div className="font-bold text-white text-sm">{item.asset}</div>
                    <div className="text-xs text-gray-500 font-mono">{item.time}</div>
                </td>
                <td className="p-3 text-center">
                     <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold ${
                         item.signal === 'CALL' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                     }`}>
                         {item.signal === 'CALL' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                         {item.signal}
                     </div>
                </td>
                <td className="p-3 text-right">
                    <div className={`font-bold text-sm ${item.result === 'PROFIT' ? 'text-green-500' : 'text-red-500'}`}>
                        {item.result === 'PROFIT' ? '+' : ''}{item.profitAmount}
                    </div>
                    <div className={`text-[10px] font-bold uppercase ${item.result === 'PROFIT' ? 'text-green-600' : 'text-red-600'}`}>
                        {item.result}
                    </div>
                </td>
                <td className="p-3 text-center">
                   <button 
                     onClick={() => onDeleteItem(item.id)}
                     className="text-gray-600 hover:text-red-500 p-1 rounded-full hover:bg-gray-800 transition-colors"
                     title="Delete this item"
                   >
                     <X size={14} />
                   </button>
                </td>
              </tr>
            ))}
            {history.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-500">
                  <div className="flex flex-col items-center gap-2">
                     <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center text-gray-600">
                        <History size={24} />
                     </div>
                     <p className="text-sm">No trade history recorded yet.</p>
                     <p className="text-xs text-gray-600">Use "Log Win" or "Log Loss" to track trades.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HistoryPanel;