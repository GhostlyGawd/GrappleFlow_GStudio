import React, { useState, useRef, useEffect } from 'react';
import { TrainingSession, ChatMessage } from '../types';
import { analyzeTrainingPatterns, getTechnicalAdvice } from '../services/geminiService';
import { SendIcon, BrainIcon } from './icons';

interface AICoachProps {
  sessions: TrainingSession[];
}

const AICoach: React.FC<AICoachProps> = ({ sessions }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'model',
      text: "Oss! I'm Coach G. I can analyze your training logs or answer technical questions. How can I help today?",
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Determine context based on keyword triggers or general query
      // Simple heuristic: if query contains "my stats" or "analyze", include session data context
      let context = "";
      if (input.toLowerCase().includes('analyze') || input.toLowerCase().includes('my training') || input.toLowerCase().includes('progress')) {
         const analysis = await analyzeTrainingPatterns(sessions);
         const aiMsg: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'model',
            text: analysis,
            timestamp: Date.now()
          };
          setMessages(prev => [...prev, aiMsg]);
      } else {
        // General technical question
        // Provide last 3 session notes as context for personalization
        const recentNotes = sessions.slice(0, 3).map(s => s.notes).join('; ');
        const response = await getTechnicalAdvice(input, recentNotes);
        const aiMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'model',
          text: response,
          timestamp: Date.now()
        };
        setMessages(prev => [...prev, aiMsg]);
      }
    } catch (error) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "I'm having trouble connecting to the mats right now. Try again later.",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action: string) => {
    setInput(action);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-lg overflow-hidden border border-slate-800 shadow-xl">
      <div className="bg-slate-800 p-4 border-b border-slate-700 flex items-center gap-3">
        <div className="p-2 bg-brand-600 rounded-full">
            <BrainIcon className="text-white w-5 h-5" />
        </div>
        <div>
            <h2 className="font-bold text-slate-100">Coach G</h2>
            <p className="text-xs text-brand-400">Powered by Gemini 3 Flash</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-brand-600 text-white rounded-br-none'
                  : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'
              }`}
            >
              {msg.text.split('\n').map((line, i) => (
                  <p key={i} className="mb-1 last:mb-0">{line}</p>
              ))}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 p-3 rounded-2xl rounded-bl-none border border-slate-700 flex gap-1">
              <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-75"></span>
              <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-150"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {messages.length < 3 && (
        <div className="px-4 py-2 flex gap-2 overflow-x-auto no-scrollbar">
            <button onClick={() => handleQuickAction("Analyze my recent training patterns")} className="whitespace-nowrap px-3 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-full text-xs text-slate-300 transition-colors">
                Analyze My Game
            </button>
            <button onClick={() => handleQuickAction("How do I escape side control?")} className="whitespace-nowrap px-3 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-full text-xs text-slate-300 transition-colors">
                Escape Help
            </button>
            <button onClick={() => handleQuickAction("Suggest a drill for guard retention")} className="whitespace-nowrap px-3 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-full text-xs text-slate-300 transition-colors">
                Drill Ideas
            </button>
        </div>
      )}

      <div className="p-4 bg-slate-900 border-t border-slate-800">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about techniques or your progress..."
            className="flex-1 bg-slate-950 border border-slate-700 rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-brand-600 hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded-full transition-colors flex items-center justify-center w-10 h-10"
          >
            <SendIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AICoach;