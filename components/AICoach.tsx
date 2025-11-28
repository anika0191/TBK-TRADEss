import React, { useState } from 'react';
import { useTrades } from '../context/TradeContext';
import { analyzeTradesWithAI } from '../services/geminiService';
import { BrainCircuit, Lock, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export const AICoach: React.FC = () => {
  const { trades } = useTrades();
  const [apiKey, setApiKey] = useState('');
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Check if API key is in environment (for demo purposes if pre-configured)
  // In a real user scenario, we ask for it.
  const hasEnvKey = !!process.env.API_KEY;

  const handleAnalyze = async () => {
    const keyToUse = hasEnvKey ? process.env.API_KEY : apiKey;
    if (!keyToUse) return;

    setLoading(true);
    try {
      const result = await analyzeTradesWithAI(trades, keyToUse);
      setAnalysis(result);
    } catch (e) {
      setAnalysis("Error analyzing trades. Please check your API key.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="text-center space-y-2 mb-8">
        <div className="inline-flex items-center justify-center p-3 rounded-full bg-neon-blue/10 text-neon-blue mb-2">
          <BrainCircuit size={32} />
        </div>
        <h2 className="text-3xl font-bold text-white">AI Trading Coach</h2>
        <p className="text-gray-400">Get personalized insights on your trading psychology and risk management using Gemini 2.5.</p>
      </div>

      {!hasEnvKey && !analysis && (
        <div className="glass-card p-6 rounded-2xl border border-white/10 text-center space-y-4">
          <Lock className="mx-auto text-gray-500" size={24} />
          <p className="text-sm text-gray-400">Enter your Gemini API Key to unlock insights. (Key is not stored)</p>
          <div className="flex gap-2 max-w-md mx-auto">
            <input 
              type="password" 
              placeholder="Google Gemini API Key" 
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="flex-1 bg-black border border-white/10 rounded-lg px-4 py-2 text-white focus:border-neon-blue outline-none"
            />
          </div>
        </div>
      )}

      {analysis ? (
        <div className="glass-card p-8 rounded-3xl border border-neon-blue/30 bg-neon-blue/5">
           <div className="prose prose-invert max-w-none">
             <ReactMarkdown>{analysis}</ReactMarkdown>
           </div>
           <button 
            onClick={() => setAnalysis(null)}
            className="mt-6 text-sm text-neon-blue hover:text-white underline"
           >
             Clear Analysis
           </button>
        </div>
      ) : (
        <button
          onClick={handleAnalyze}
          disabled={loading || (!apiKey && !hasEnvKey)}
          className={`w-full py-6 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-3
            ${loading ? 'bg-white/10 text-gray-400 cursor-wait' : 'bg-gradient-to-r from-neon-blue to-purple-600 text-white hover:opacity-90 shadow-[0_0_30px_rgba(0,209,255,0.2)]'}
          `}
        >
          {loading ? (
            <>Thinking...</>
          ) : (
            <>
              <Sparkles /> Analyze My Journal
            </>
          )}
        </button>
      )}
    </div>
  );
};