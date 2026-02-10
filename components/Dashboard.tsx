import React from 'react';
import { TrainingSession } from '../types';
import { PlusCircleIcon } from './icons';

interface DashboardProps {
    sessions: TrainingSession[];
    onNavigate: (view: any) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ sessions, onNavigate }) => {
    const totalSessions = sessions.length;
    const lastSession = sessions.length > 0 
        ? sessions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] 
        : null;

    const thisWeekCount = sessions.filter(s => {
        const d = new Date(s.date);
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return d > oneWeekAgo;
    }).length;

    return (
        <div className="p-6 space-y-6 pb-24 overflow-y-auto h-full bg-gradient-to-b from-slate-900 to-slate-950">
            <div className="space-y-1 mt-4">
                <h1 className="text-3xl font-bold text-white tracking-tight">Welcome Back</h1>
                <p className="text-slate-400">Ready to hit the mats?</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                         <div className="w-16 h-16 bg-brand-500 rounded-full blur-xl"></div>
                    </div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Total Sessions</p>
                    <p className="text-3xl font-bold text-white">{totalSessions}</p>
                </div>
                <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 relative overflow-hidden group">
                     <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                         <div className="w-16 h-16 bg-emerald-500 rounded-full blur-xl"></div>
                    </div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">This Week</p>
                    <p className="text-3xl font-bold text-brand-accent">{thisWeekCount}</p>
                </div>
            </div>

            <div className="bg-slate-800 rounded-2xl p-1 border border-slate-700">
                <div className="p-4">
                    <h3 className="text-white font-semibold mb-2">Weekly Goal</h3>
                    <div className="flex justify-between text-xs text-slate-400 mb-2">
                        <span>{thisWeekCount} sessions</span>
                        <span>Target: 4</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-gradient-to-r from-brand-600 to-brand-400 rounded-full transition-all duration-1000"
                            style={{ width: `${Math.min((thisWeekCount / 4) * 100, 100)}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            {lastSession ? (
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <h3 className="text-slate-200 font-semibold">Last Session</h3>
                        <button onClick={() => onNavigate('log')} className="text-xs text-brand-400 hover:text-brand-300">View All</button>
                    </div>
                    <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 hover:border-slate-600 transition-colors cursor-pointer" onClick={() => onNavigate('log')}>
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <p className="text-white font-medium">{new Date(lastSession.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric'})}</p>
                                <p className="text-brand-400 text-sm">{lastSession.type}</p>
                            </div>
                            <span className="text-xl">{lastSession.mood === 'Great' ? '🔥' : lastSession.mood === 'Good' ? '👍' : lastSession.mood === 'Injured' ? '🤕' : '😐'}</span>
                        </div>
                        {lastSession.notes && (
                             <p className="text-slate-400 text-sm line-clamp-2">{lastSession.notes}</p>
                        )}
                    </div>
                </div>
            ) : (
                <div className="bg-slate-800/50 border border-slate-700 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center space-y-3">
                    <p className="text-slate-400 text-sm">No training logged yet.</p>
                    <button 
                        onClick={() => onNavigate('log')}
                        className="text-brand-400 font-semibold text-sm hover:underline"
                    >
                        Log your first session
                    </button>
                </div>
            )}
            
            <div className="bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border border-indigo-500/20 rounded-2xl p-5 relative overflow-hidden">
                <div className="relative z-10">
                    <h3 className="text-white font-semibold mb-1">Analyze your game</h3>
                    <p className="text-slate-300 text-xs mb-3">Get personalized insights from Coach G.</p>
                    <button 
                        onClick={() => onNavigate('coach')}
                        className="bg-white text-indigo-900 text-xs font-bold px-4 py-2 rounded-full hover:bg-slate-100 transition-colors"
                    >
                        Talk to Coach
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;