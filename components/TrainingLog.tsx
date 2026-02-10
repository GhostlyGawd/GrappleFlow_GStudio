import React, { useState } from 'react';
import { TrainingSession, SessionType } from '../types';
import { PlusCircleIcon, CheckIcon, TrashIcon } from './icons';

interface TrainingLogProps {
  sessions: TrainingSession[];
  onAddSession: (session: TrainingSession) => void;
  onDeleteSession: (id: string) => void;
}

const TrainingLog: React.FC<TrainingLogProps> = ({ sessions, onAddSession, onDeleteSession }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<TrainingSession>>({
    type: SessionType.GI,
    mood: 'Good',
    intensity: 7,
    durationMinutes: 90,
    rounds: 5,
    techniques: [],
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newSession: TrainingSession = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      durationMinutes: formData.durationMinutes || 60,
      type: formData.type || SessionType.GI,
      rounds: formData.rounds || 0,
      techniques: [], // Simplified for this view
      notes: formData.notes || '',
      mood: formData.mood || 'Good',
      intensity: formData.intensity || 5
    } as TrainingSession;

    onAddSession(newSession);
    setIsAdding(false);
    // Reset form
    setFormData({
        type: SessionType.GI,
        mood: 'Good',
        intensity: 7,
        durationMinutes: 90,
        rounds: 5,
        techniques: [],
        notes: ''
    });
  };

  const sortedSessions = [...sessions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (isAdding) {
    return (
      <div className="bg-slate-900 h-full overflow-y-auto pb-20 animate-in slide-in-from-bottom-10 duration-200">
        <div className="p-4 flex items-center justify-between border-b border-slate-800 sticky top-0 bg-slate-900/95 backdrop-blur z-10">
          <button 
            onClick={() => setIsAdding(false)}
            className="text-slate-400 hover:text-white text-sm"
          >
            Cancel
          </button>
          <h2 className="font-bold text-white">Log Session</h2>
          <button 
            onClick={handleSubmit}
            className="text-brand-500 font-semibold text-sm"
          >
            Save
          </button>
        </div>

        <form className="p-4 space-y-6">
          <div className="space-y-2">
            <label className="text-xs text-slate-400 uppercase font-bold tracking-wider">Type</label>
            <div className="grid grid-cols-3 gap-2">
                {[SessionType.GI, SessionType.NOGI, SessionType.OPEN_MAT].map(type => (
                    <button
                        key={type}
                        type="button"
                        onClick={() => setFormData({...formData, type})}
                        className={`py-2 px-3 rounded-lg text-sm font-medium border transition-all ${
                            formData.type === type 
                            ? 'bg-brand-600 border-brand-500 text-white' 
                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                        }`}
                    >
                        {type}
                    </button>
                ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <label className="text-xs text-slate-400 uppercase font-bold tracking-wider">Duration (min)</label>
                <input 
                    type="number" 
                    value={formData.durationMinutes}
                    onChange={(e) => setFormData({...formData, durationMinutes: parseInt(e.target.value) || 0})}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-brand-500"
                />
            </div>
            <div className="space-y-2">
                <label className="text-xs text-slate-400 uppercase font-bold tracking-wider">Rounds</label>
                <input 
                    type="number" 
                    value={formData.rounds}
                    onChange={(e) => setFormData({...formData, rounds: parseInt(e.target.value) || 0})}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-brand-500"
                />
            </div>
          </div>

          <div className="space-y-2">
             <div className="flex justify-between">
                <label className="text-xs text-slate-400 uppercase font-bold tracking-wider">Intensity</label>
                <span className="text-xs text-brand-400 font-bold">{formData.intensity}/10</span>
             </div>
             <input 
                type="range" 
                min="1" 
                max="10" 
                value={formData.intensity}
                onChange={(e) => setFormData({...formData, intensity: parseInt(e.target.value)})}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500"
             />
             <div className="flex justify-between text-[10px] text-slate-500">
                <span>Light Flow</span>
                <span>Competition</span>
             </div>
          </div>

          <div className="space-y-2">
             <label className="text-xs text-slate-400 uppercase font-bold tracking-wider">How did you feel?</label>
             <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                {['Great', 'Good', 'Neutral', 'Hard', 'Injured'].map((m) => (
                    <button
                        key={m}
                        type="button"
                        onClick={() => setFormData({...formData, mood: m as any})}
                        className={`px-4 py-2 rounded-full text-xs font-medium border whitespace-nowrap ${
                            formData.mood === m
                            ? 'bg-slate-200 text-slate-900 border-slate-200'
                            : 'bg-slate-800 border-slate-700 text-slate-400'
                        }`}
                    >
                        {m}
                    </button>
                ))}
             </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-slate-400 uppercase font-bold tracking-wider">Session Notes</label>
            <textarea 
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="What did you work on? What went well? What needs work?"
                className="w-full h-32 bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-brand-500 resize-none text-sm leading-relaxed"
            />
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col relative">
      <div className="p-4 flex justify-between items-center bg-slate-900/50 backdrop-blur border-b border-slate-800 sticky top-0 z-10">
        <h2 className="text-xl font-bold text-white">Training Log</h2>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-brand-600 hover:bg-brand-500 text-white rounded-full p-2 transition-colors shadow-lg shadow-brand-500/20"
        >
          <PlusCircleIcon className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-24">
        {sortedSessions.length === 0 ? (
           <div className="flex flex-col items-center justify-center py-20 text-slate-500 opacity-60">
                <div className="bg-slate-800 p-4 rounded-full mb-4">
                    <PlusCircleIcon className="w-8 h-8" />
                </div>
                <p>No sessions logged yet.</p>
           </div>
        ) : (
            sortedSessions.map((session) => (
            <div key={session.id} className="bg-slate-800 border border-slate-700 rounded-xl p-4 shadow-sm hover:border-slate-600 transition-colors group">
                <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide ${
                            session.type === SessionType.GI ? 'bg-indigo-500/20 text-indigo-300' :
                            session.type === SessionType.NOGI ? 'bg-emerald-500/20 text-emerald-300' :
                            'bg-amber-500/20 text-amber-300'
                        }`}>
                            {session.type}
                        </span>
                        <span className="text-slate-400 text-xs">{new Date(session.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                    </div>
                    <button 
                        onClick={() => onDeleteSession(session.id)}
                        className="text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                    >
                        <TrashIcon className="w-4 h-4" />
                    </button>
                </div>
                
                <div className="flex gap-4 text-sm text-slate-300 mb-3">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-slate-500 uppercase">Duration</span>
                        <span className="font-semibold">{session.durationMinutes}m</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] text-slate-500 uppercase">Rounds</span>
                        <span className="font-semibold">{session.rounds}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] text-slate-500 uppercase">Intensity</span>
                        <span className="font-semibold">{session.intensity}/10</span>
                    </div>
                </div>

                {session.notes && (
                    <div className="bg-slate-900/50 rounded-lg p-3 text-sm text-slate-400 leading-relaxed border border-slate-800/50">
                        <p className="line-clamp-3">{session.notes}</p>
                    </div>
                )}
            </div>
            ))
        )}
      </div>
    </div>
  );
};

export default TrainingLog;