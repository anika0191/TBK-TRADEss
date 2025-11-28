import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrades } from '../context/TradeContext';
import { TradeType } from '../types';
import { Save, Upload, X, Target, ShieldAlert, CheckCircle, AlertCircle, Circle } from 'lucide-react';

export const TradeForm: React.FC = () => {
  const { addTrade } = useTrades();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    symbol: '',
    type: TradeType.BUY,
    entryDate: new Date().toISOString().split('T')[0],
    entryPrice: '',
    stopLoss: '',
    takeProfit: '',
    quantity: '',
    notes: '',
    screenshotUrl: ''
  });

  // Separate states for Pips to allow independent editing
  const [slPips, setSlPips] = useState('');
  const [tpPips, setTpPips] = useState('');
  
  // Outcome state replaces manual exit price
  const [outcome, setOutcome] = useState<'OPEN' | 'TP' | 'SL'>('OPEN');

  // Improved Pip Logic
  const getPipMultiplier = (symbol: string, priceStr: string): number => {
    const s = symbol.toUpperCase();
    const p = parseFloat(priceStr);
    
    if (isNaN(p)) return 0.0001; // Fallback

    // JPY Pairs
    if (s.includes('JPY')) return 0.01;

    // Gold / Silver
    if (s.includes('XAU') || s.includes('GOLD')) return 0.1; // Standard gold pip is 0.10
    if (s.includes('XAG') || s.includes('SILVER')) return 0.01;

    // Indices (US30, NAS100, GER30, SPX)
    if (s.match(/(US30|NAS|NDX|SPX|GER30|DE30|DOW)/)) return 1.0;

    // Crypto
    if (s.includes('BTC') || s.includes('ETH') || s.includes('SOL')) return 1.0; // Crypto points usually

    // Standard Forex (price usually < 50 for majors/minors except JPY)
    if (p < 50 && !s.includes('JPY')) return 0.0001;
    
    // High value stocks/assets
    if (p > 500) return 1.0;

    return 0.0001; // Default Forex
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Auto-calculate Pips if Price changes
    if (name === 'entryPrice' || name === 'stopLoss' || name === 'takeProfit' || name === 'symbol') {
      // We need the newest values
      const nextData = { ...formData, [name]: value };
      const entry = parseFloat(nextData.entryPrice);
      const multiplier = getPipMultiplier(nextData.symbol, nextData.entryPrice);

      if (!isNaN(entry)) {
        if (name === 'stopLoss' || (name !== 'takeProfit' && nextData.stopLoss)) {
          const sl = parseFloat(name === 'stopLoss' ? value : nextData.stopLoss);
          if (!isNaN(sl)) {
            const diff = Math.abs(entry - sl);
            setSlPips((diff / multiplier).toFixed(1));
          }
        }
        if (name === 'takeProfit' || (name !== 'stopLoss' && nextData.takeProfit)) {
          const tp = parseFloat(name === 'takeProfit' ? value : nextData.takeProfit);
          if (!isNaN(tp)) {
            const diff = Math.abs(tp - entry);
            setTpPips((diff / multiplier).toFixed(1));
          }
        }
      }
    }
  };

  // Handle Pip Inputs
  const handlePipChange = (type: 'SL' | 'TP', value: string) => {
    if (type === 'SL') setSlPips(value);
    else setTpPips(value);

    const pips = parseFloat(value);
    const entry = parseFloat(formData.entryPrice);
    
    if (!isNaN(pips) && !isNaN(entry)) {
      const multiplier = getPipMultiplier(formData.symbol, formData.entryPrice);
      const delta = pips * multiplier;
      
      let newPrice;
      const decimals = formData.entryPrice.includes('.') ? formData.entryPrice.split('.')[1].length : 2;

      if (type === 'SL') {
        // Long: SL is below entry. Short: SL is above entry.
        newPrice = formData.type === TradeType.BUY ? entry - delta : entry + delta;
        setFormData(prev => ({ ...prev, stopLoss: newPrice.toFixed(decimals) }));
      } else {
        // Long: TP is above entry. Short: TP is below entry.
        newPrice = formData.type === TradeType.BUY ? entry + delta : entry - delta;
        setFormData(prev => ({ ...prev, takeProfit: newPrice.toFixed(decimals) }));
      }
    }
  };

  const processImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1000;
          let width = img.width;
          let height = img.height;

          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await processImage(file);
        setFormData(prev => ({ ...prev, screenshotUrl: base64 }));
      } catch (error) {
        console.error("Error processing image", error);
        alert("Failed to process image.");
      }
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, screenshotUrl: '' }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let finalExitPrice = undefined;
    if (outcome === 'TP') finalExitPrice = Number(formData.takeProfit);
    if (outcome === 'SL') finalExitPrice = Number(formData.stopLoss);

    addTrade({
      ...formData,
      entryPrice: Number(formData.entryPrice),
      exitPrice: finalExitPrice,
      stopLoss: Number(formData.stopLoss),
      takeProfit: Number(formData.takeProfit),
      quantity: Number(formData.quantity),
    });
    navigate('/history');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold text-white mb-6">Log New Trade</h2>
      
      <form onSubmit={handleSubmit} className="glass-card p-6 md:p-8 rounded-3xl space-y-8 border border-white/10">
        
        {/* Row 1: Basics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Symbol</label>
            <input 
              required
              name="symbol"
              type="text" 
              placeholder="e.g. BTCUSD, XAUUSD"
              value={formData.symbol}
              onChange={handleChange}
              className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-neon-green focus:outline-none focus:ring-1 focus:ring-neon-green/50 uppercase placeholder-gray-700 font-bold tracking-wide"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Direction</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormData(p => ({ ...p, type: TradeType.BUY }))}
                className={`p-3 rounded-xl font-bold transition-all ${formData.type === TradeType.BUY ? 'bg-neon-green text-black shadow-[0_0_15px_rgba(0,255,148,0.2)]' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
              >
                LONG
              </button>
              <button
                type="button"
                onClick={() => setFormData(p => ({ ...p, type: TradeType.SELL }))}
                className={`p-3 rounded-xl font-bold transition-all ${formData.type === TradeType.SELL ? 'bg-neon-red text-white shadow-[0_0_15px_rgba(255,0,85,0.2)]' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
              >
                SHORT
              </button>
            </div>
          </div>
        </div>

        {/* Row 2: Entry & Size */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Entry Price</label>
            <input required name="entryPrice" type="number" step="any" value={formData.entryPrice} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-neon-blue focus:outline-none font-mono" />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Quantity / Position Size</label>
            <input required name="quantity" type="number" step="any" value={formData.quantity} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-white/30 focus:outline-none font-mono" />
          </div>
        </div>

        <div className="border-t border-white/10 my-4"></div>

        {/* Row 3: Stop Loss Config */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-1">
            <ShieldAlert size={16} className="text-neon-red" />
            <label className="text-sm text-gray-300 font-medium">Stop Loss</label>
          </div>
          <div className="grid grid-cols-5 gap-4">
            <div className="col-span-3">
              <label className="text-xs text-gray-500 block mb-1">Price</label>
              <input required name="stopLoss" type="number" step="any" value={formData.stopLoss} onChange={handleChange} className="w-full bg-black/40 border border-neon-red/30 rounded-xl p-3 text-neon-red focus:border-neon-red focus:outline-none font-mono" />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-gray-500 block mb-1">Pips</label>
              <input 
                type="number" 
                step="any" 
                value={slPips} 
                onChange={(e) => handlePipChange('SL', e.target.value)}
                placeholder="0"
                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-gray-300 focus:border-neon-red/50 focus:outline-none font-mono text-center" 
              />
            </div>
          </div>
        </div>

        {/* Row 4: Take Profit Config */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-1">
            <Target size={16} className="text-neon-green" />
            <label className="text-sm text-gray-300 font-medium">Take Profit</label>
          </div>
          <div className="grid grid-cols-5 gap-4">
            <div className="col-span-3">
              <label className="text-xs text-gray-500 block mb-1">Price</label>
              <input required name="takeProfit" type="number" step="any" value={formData.takeProfit} onChange={handleChange} className="w-full bg-black/40 border border-neon-green/30 rounded-xl p-3 text-neon-green focus:border-neon-green focus:outline-none font-mono" />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-gray-500 block mb-1">Pips</label>
              <input 
                type="number" 
                step="any" 
                value={tpPips} 
                onChange={(e) => handlePipChange('TP', e.target.value)}
                placeholder="0"
                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-gray-300 focus:border-neon-green/50 focus:outline-none font-mono text-center" 
              />
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 my-4"></div>

        {/* Row 5: Trade Outcome */}
        <div className="space-y-3">
          <label className="text-sm text-gray-400">Trade Outcome</label>
          <div className="grid grid-cols-3 gap-3">
             <button
                type="button"
                onClick={() => setOutcome('OPEN')}
                className={`p-4 rounded-xl font-bold flex flex-col items-center justify-center gap-2 transition-all border ${outcome === 'OPEN' ? 'bg-white/10 border-white text-white' : 'bg-black/40 border-white/10 text-gray-500 hover:bg-white/5'}`}
              >
                <Circle size={20} />
                OPEN
              </button>

              <button
                type="button"
                onClick={() => setOutcome('SL')}
                className={`p-4 rounded-xl font-bold flex flex-col items-center justify-center gap-2 transition-all border ${outcome === 'SL' ? 'bg-neon-red/10 border-neon-red text-neon-red' : 'bg-black/40 border-white/10 text-gray-500 hover:bg-neon-red/5'}`}
              >
                <AlertCircle size={20} />
                HIT SL
              </button>
              
              <button
                type="button"
                onClick={() => setOutcome('TP')}
                className={`p-4 rounded-xl font-bold flex flex-col items-center justify-center gap-2 transition-all border ${outcome === 'TP' ? 'bg-neon-green/10 border-neon-green text-neon-green' : 'bg-black/40 border-white/10 text-gray-500 hover:bg-neon-green/5'}`}
              >
                <CheckCircle size={20} />
                HIT TP
              </button>
          </div>
        </div>

        {/* Row 6: Meta */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Date</label>
            <input required name="entryDate" type="date" value={formData.entryDate} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-white/30 focus:outline-none" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-gray-400">Chart Screenshot (Optional)</label>
          <div className="w-full">
            {!formData.screenshotUrl ? (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-white/10 border-dashed rounded-xl cursor-pointer hover:bg-white/5 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="text-gray-400 mb-2" size={24} />
                  <p className="text-sm text-gray-500">Click to upload screenshot</p>
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
              </label>
            ) : (
              <div className="relative w-full h-48 bg-black/40 rounded-xl overflow-hidden border border-white/10">
                <img src={formData.screenshotUrl} alt="Trade Screenshot" className="w-full h-full object-contain" />
                <button 
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-2 bg-black/80 rounded-full text-red-500 hover:text-red-400 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-gray-400">Notes & Strategy</label>
          <textarea name="notes" rows={4} value={formData.notes} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-white/30 focus:outline-none resize-none" placeholder="What was your confluence? Emotions?" />
        </div>

        <button type="submit" className="w-full py-4 bg-neon-green text-black font-bold text-lg rounded-xl hover:bg-neon-green/90 transition-all flex items-center justify-center gap-2">
          <Save size={20} />
          Save Trade
        </button>
      </form>
    </div>
  );
};