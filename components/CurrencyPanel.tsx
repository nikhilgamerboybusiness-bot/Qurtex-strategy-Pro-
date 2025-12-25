import React, { useState, useMemo } from 'react';
import { Currency } from '../types';
import { CURRENCY_DATA } from '../constants';
import { Search } from 'lucide-react';

interface CurrencyPanelProps {
  currentAssetIndex: number;
  onSelectAsset: (index: number) => void;
  gmtTime: string;
}

const CurrencyPanel: React.FC<CurrencyPanelProps> = ({ 
  currentAssetIndex, 
  onSelectAsset, 
  gmtTime 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'currencies' | 'crypto' | 'commodities'>('currencies');

  const filteredCurrencies = useMemo(() => {
    return CURRENCY_DATA.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  return (
    <div className="w-full lg:w-80 bg-panel rounded-xl overflow-hidden flex flex-col border border-panel-border h-[450px] md:h-[500px] lg:h-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-blue-900 p-5 border-b border-panel-border">
        <h2 className="text-lg font-bold text-white leading-tight">Market Assets</h2>
        <p className="text-xs text-blue-300 mt-1">Real-time Data Stream</p>
      </div>

      {/* Connection Status */}
      <div className="flex items-center justify-between px-5 py-3 bg-gray-800 border-b border-panel-border">
        <div className="flex items-center text-green-500 text-sm font-medium">
          <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
          <span>SYNCED</span>
        </div>
        <div className="text-gray-400 text-xs font-mono">{gmtTime}</div>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-panel-border">
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search currency pair..." 
            className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex px-4 border-b border-panel-border bg-panel">
        {['currencies', 'crypto', 'commodities'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
              activeTab === tab 
                ? 'text-primary border-primary' 
                : 'text-gray-500 border-transparent hover:text-gray-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto py-1">
        {filteredCurrencies.map((currency, index) => {
          // Find the original index in the main data array to pass back correct ID
          const originalIndex = CURRENCY_DATA.indexOf(currency);
          const isActive = originalIndex === currentAssetIndex;
          const isPositive = currency.change.startsWith('+');

          return (
            <div 
              key={currency.name}
              onClick={() => onSelectAsset(originalIndex)}
              className={`flex justify-between items-center px-5 py-4 border-b border-panel-border cursor-pointer transition-all hover:bg-gray-800 ${
                isActive ? 'bg-blue-500/10 border-l-4 border-l-primary pl-4' : 'border-l-4 border-l-transparent'
              }`}
            >
              <div>
                <div className={`text-base font-bold ${isActive ? 'text-white' : 'text-gray-200'}`}>
                  {currency.name}
                </div>
                <div className="flex items-center mt-1 space-x-2">
                  <span className="bg-blue-500/20 text-blue-400 text-[10px] font-bold px-1.5 py-0.5 rounded">
                    1m {currency.profit1min}%
                  </span>
                  {currency.isOTC && (
                    <span className="text-gray-500 text-[10px] font-medium">OTC</span>
                  )}
                </div>
              </div>
              <div className={`text-sm font-bold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                {currency.change}
              </div>
            </div>
          );
        })}
        {filteredCurrencies.length === 0 && (
          <div className="p-8 text-center text-gray-500 text-sm">
            No currencies found.
          </div>
        )}
      </div>
    </div>
  );
};

export default CurrencyPanel;