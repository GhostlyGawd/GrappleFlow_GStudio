import React, { useState, useEffect, useRef } from 'react';
import { Challenge, LabEntry, LabEntryType } from '../types';
import { generateChallengeInsight } from '../services/geminiService';
import { FlaskIcon, PlusCircleIcon, TrashIcon, CheckIcon, SendIcon } from './icons';

interface ProblemSolverProps {
    challenges: Challenge[];
    entries: LabEntry[];
    onAddChallenge: (challenge: Challenge) => void;
    onUpdateChallenge: (challenge: Challenge) => void;
    onDeleteChallenge: (id: string) => void;
    onAddEntry: (entry: LabEntry) => void;
}

const ProblemSolver: React.FC<ProblemSolverProps> = ({ 
    challenges, 
    entries, 
    onAddChallenge, 
    onUpdateChallenge, 
    onDeleteChallenge,
    onAddEntry 
}) => {
    const [selectedChallengeId, setSelectedChallengeId] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    
    // New Challenge Form State
    const [newTitle, setNewTitle] = useState('');
    const [newCategory, setNewCategory] = useState('Guard');

    // New Entry Form State
    const [entryContent, setEntryContent] = useState('');
    const [entryType, setEntryType] = useState<LabEntryType>('Observation');
    const [entryResult, setEntryResult] = useState<'Success' | 'Failure' | 'Inconclusive'>('Inconclusive');
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const entriesEndRef = useRef<HTMLDivElement>(null);

    const activeChallenge = challenges.find(c => c.id === selectedChallengeId);
    const activeEntries = entries
        .filter(e => e.challengeId === selectedChallengeId)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    useEffect(() => {
        if (activeChallenge) {
            entriesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [activeEntries.length, selectedChallengeId]);

    const handleCreateChallenge = (e: React.FormEvent) => {
        e.preventDefault();
        const challenge: Challenge = {
            id: Date.now().toString(),
            title: newTitle,
            category: newCategory,
            status: 'Active',
            createdAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
        };
        onAddChallenge(challenge);
        
        // Auto-add first observation entry if provided? For now just create container.
        setIsCreating(false);
        setNewTitle('');
        setSelectedChallengeId(challenge.id);
    };

    const handleAddLog = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedChallengeId || !entryContent.trim()) return;

        const entry: LabEntry = {
            id: Date.now().toString(),
            challengeId: selectedChallengeId,
            date: new Date().toISOString(),
            type: entryType,
            content: entryContent,
            result: entryType === 'Experiment' ? entryResult : undefined
        };

        onAddEntry(entry);
        
        // Update Challenge lastUpdated
        if (activeChallenge) {
            onUpdateChallenge({
                ...activeChallenge,
                lastUpdated: new Date().toISOString()
            });
        }

        setEntryContent('');
        setEntryType('Observation');
    };

    const handleConsultAI = async () => {
        if (!activeChallenge) return;
        setIsAnalyzing(true);
        try {
            const insight = await generateChallengeInsight(activeChallenge, activeEntries);
            const entry: LabEntry = {
                id: Date.now().toString(),
                challengeId: activeChallenge.id,
                date: new Date().toISOString(),
                type: 'Analysis',
                content: insight
            };
            onAddEntry(entry);
        } catch (e) {
            console.error(e);
        } finally {
            setIsAnalyzing(false);
        }
    };

    // --- RENDER HELPERS ---

    const getTypeColor = (type: LabEntryType) => {
        switch (type) {
            case 'Observation': return 'bg-amber-500/20 text-amber-200 border-amber-500/30';
            case 'Hypothesis': return 'bg-blue-500/20 text-blue-200 border-blue-500/30';
            case 'Experiment': return 'bg-purple-500/20 text-purple-200 border-purple-500/30';
            case 'Analysis': return 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30';
            default: return 'bg-slate-800 text-slate-200';
        }
    };

    const getTypeLabel = (type: LabEntryType) => {
        switch (type) {
            case 'Observation': return '⚠️ Observation';
            case 'Hypothesis': return '💡 Hypothesis';
            case 'Experiment': return '🧪 Experiment';
            case 'Analysis': return '🤖 Coach G Analysis';
        }
    };

    // --- VIEWS ---

    if (selectedChallengeId && activeChallenge) {
        return (
            <div className="flex flex-col h-full bg-slate-950 animate-in slide-in-from-right duration-200">
                {/* Header */}
                <div className="p-4 border-b border-slate-800 bg-slate-900 flex items-center gap-3">
                    <button onClick={() => setSelectedChallengeId(null)} className="text-slate-400 hover:text-white p-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                    </button>
                    <div className="flex-1">
                        <div className="flex items-center justify-between">
                            <h2 className="font-bold text-white text-lg leading-tight">{activeChallenge.title}</h2>
                            <button 
                                onClick={() => onDeleteChallenge(activeChallenge.id)}
                                className="text-slate-600 hover:text-red-500"
                            >
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-mono bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700">
                                {activeChallenge.category}
                            </span>
                            <span className={`text-[10px] uppercase font-bold tracking-wider ${activeChallenge.status === 'Active' ? 'text-brand-400' : 'text-emerald-500'}`}>
                                {activeChallenge.status}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Notebook Stream */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {activeEntries.length === 0 ? (
                        <div className="text-center py-10 text-slate-500">
                            <FlaskIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p className="text-sm">Lab notebook is empty.</p>
                            <p className="text-xs">Log an observation or research note to start.</p>
                        </div>
                    ) : (
                        activeEntries.map((entry) => (
                            <div key={entry.id} className={`p-4 rounded-lg border ${getTypeColor(entry.type)} relative`}>
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs font-bold uppercase tracking-wider opacity-80 flex items-center gap-2">
                                        {getTypeLabel(entry.type)}
                                        {entry.result && (
                                            <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                                                entry.result === 'Success' ? 'bg-emerald-500 text-white' : 
                                                entry.result === 'Failure' ? 'bg-red-500 text-white' : 'bg-slate-500 text-white'
                                            }`}>
                                                {entry.result}
                                            </span>
                                        )}
                                    </span>
                                    <span className="text-[10px] opacity-60 font-mono">
                                        {new Date(entry.date).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-sm whitespace-pre-wrap leading-relaxed opacity-90">{entry.content}</p>
                            </div>
                        ))
                    )}
                    {isAnalyzing && (
                         <div className="p-4 rounded-lg border border-brand-500/30 bg-brand-500/10 animate-pulse">
                            <div className="flex items-center gap-2 text-brand-300 text-xs font-bold mb-2">
                                <span className="animate-spin">⏳</span> Coach G is thinking...
                            </div>
                            <div className="h-4 bg-brand-500/20 rounded w-3/4 mb-2"></div>
                            <div className="h-4 bg-brand-500/20 rounded w-1/2"></div>
                         </div>
                    )}
                    <div ref={entriesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-slate-900 border-t border-slate-800 space-y-3">
                    {/* Quick Analysis Button */}
                    {activeEntries.length > 0 && !isAnalyzing && (
                         <button 
                            onClick={handleConsultAI}
                            className="w-full py-2 bg-gradient-to-r from-indigo-900 to-slate-900 border border-indigo-500/30 rounded-lg text-xs text-indigo-300 font-medium hover:text-white hover:border-indigo-500/60 transition-all flex items-center justify-center gap-2"
                        >
                            <span className="text-lg">🤖</span> Analyze Progress & Suggest Next Step
                        </button>
                    )}

                    <form onSubmit={handleAddLog} className="bg-slate-950 border border-slate-800 rounded-xl p-3 shadow-inner">
                        <div className="flex gap-2 mb-2 overflow-x-auto no-scrollbar">
                            {(['Observation', 'Hypothesis', 'Experiment'] as LabEntryType[]).map(t => (
                                <button
                                    key={t}
                                    type="button"
                                    onClick={() => setEntryType(t)}
                                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors whitespace-nowrap ${
                                        entryType === t 
                                        ? 'bg-slate-200 text-slate-900' 
                                        : 'bg-slate-800 text-slate-500 hover:bg-slate-700'
                                    }`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>

                        {entryType === 'Experiment' && (
                            <div className="flex gap-2 mb-2">
                                <label className="text-[10px] text-slate-500 uppercase font-bold self-center mr-1">Result:</label>
                                {(['Success', 'Failure', 'Inconclusive'] as const).map(r => (
                                    <button
                                        key={r}
                                        type="button"
                                        onClick={() => setEntryResult(r)}
                                        className={`px-2 py-1 rounded text-[10px] border transition-colors ${
                                            entryResult === r 
                                            ? (r === 'Success' ? 'bg-emerald-900 border-emerald-500 text-emerald-300' : 
                                               r === 'Failure' ? 'bg-red-900 border-red-500 text-red-300' : 'bg-slate-700 border-slate-500 text-slate-300')
                                            : 'bg-transparent border-slate-800 text-slate-600'
                                        }`}
                                    >
                                        {r}
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="flex gap-2 items-end">
                            <textarea
                                value={entryContent}
                                onChange={e => setEntryContent(e.target.value)}
                                placeholder={
                                    entryType === 'Observation' ? "What went wrong today? Be specific." :
                                    entryType === 'Hypothesis' ? "What technique/concept might fix this?" :
                                    "How did the test go? Did it work?"
                                }
                                className="flex-1 bg-transparent text-sm text-white focus:outline-none resize-none min-h-[60px] max-h-[120px]"
                            />
                            <button 
                                type="submit"
                                disabled={!entryContent.trim()}
                                className="bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white p-2 rounded-lg transition-colors"
                            >
                                <SendIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    // --- MAIN DASHBOARD VIEW ---

    return (
        <div className="flex flex-col h-full bg-slate-950">
            {/* Header */}
            <div className="p-4 flex justify-between items-center bg-slate-900/50 backdrop-blur border-b border-slate-800 sticky top-0 z-10">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <FlaskIcon className="text-brand-accent w-5 h-5" /> The Lab
                    </h2>
                    <p className="text-xs text-slate-400">Scientific Problem Solving</p>
                </div>
                <button 
                    onClick={() => setIsCreating(true)}
                    className="bg-brand-600 hover:bg-brand-500 text-white rounded-full p-2 transition-colors shadow-lg shadow-brand-500/20"
                >
                    <PlusCircleIcon className="w-6 h-6" />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 pb-24">
                {isCreating ? (
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-4 animate-in fade-in zoom-in-95 duration-200">
                        <h3 className="text-white font-bold mb-4">Define New Challenge</h3>
                        <form onSubmit={handleCreateChallenge} className="space-y-4">
                            <div>
                                <label className="block text-xs uppercase text-slate-500 font-bold mb-1">The Problem (Title)</label>
                                <input 
                                    type="text" 
                                    value={newTitle}
                                    onChange={e => setNewTitle(e.target.value)}
                                    placeholder="e.g. Can't pass closed guard"
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-brand-500"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-xs uppercase text-slate-500 font-bold mb-1">Category</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['Guard', 'Passing', 'Takedown', 'Escape', 'Submission', 'Pinning'].map(cat => (
                                        <button
                                            key={cat}
                                            type="button"
                                            onClick={() => setNewCategory(cat)}
                                            className={`py-2 text-xs rounded border ${newCategory === cat ? 'bg-brand-600 border-brand-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-2 pt-2">
                                <button type="button" onClick={() => setIsCreating(false)} className="flex-1 py-3 text-slate-400 font-medium hover:text-white">Cancel</button>
                                <button type="submit" disabled={!newTitle.trim()} className="flex-1 py-3 bg-brand-600 rounded-lg text-white font-bold hover:bg-brand-500 disabled:opacity-50">Start Experiment</button>
                            </div>
                        </form>
                    </div>
                ) : null}

                {challenges.length === 0 && !isCreating ? (
                    <div className="text-center py-20 px-6 opacity-60">
                        <FlaskIcon className="w-16 h-16 mx-auto mb-4 text-slate-700" />
                        <h3 className="text-slate-300 font-semibold text-lg">No Active Experiments</h3>
                        <p className="text-slate-500 text-sm mt-2 max-w-xs mx-auto">Identify a specific friction point in your game to start tracking variables and testing solutions.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Group by category if we wanted, for now just a list */}
                        {challenges.sort((a,b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()).map(challenge => {
                            const cEntries = entries.filter(e => e.challengeId === challenge.id);
                            const experimentCount = cEntries.filter(e => e.type === 'Experiment').length;
                            const hasNewIdea = cEntries.some(e => e.type === 'Hypothesis' && !entries.some(exp => exp.type === 'Experiment' && new Date(exp.date) > new Date(e.date)));
                            
                            return (
                                <div 
                                    key={challenge.id}
                                    onClick={() => setSelectedChallengeId(challenge.id)}
                                    className="bg-slate-800 border border-slate-700 rounded-xl p-4 active:scale-[0.98] transition-all cursor-pointer hover:border-brand-500/50 group relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full -mr-10 -mt-10 transition-opacity opacity-0 group-hover:opacity-100"></div>
                                    
                                    <div className="flex justify-between items-start mb-2 relative z-10">
                                        <span className="text-xs font-mono text-brand-300 bg-brand-900/30 px-2 py-0.5 rounded border border-brand-500/20">{challenge.category}</span>
                                        <span className="text-[10px] text-slate-500">
                                            Last update: {new Date(challenge.lastUpdated).toLocaleDateString()}
                                        </span>
                                    </div>
                                    
                                    <h3 className="text-lg font-bold text-white mb-2 relative z-10">{challenge.title}</h3>
                                    
                                    <div className="flex items-center gap-4 text-xs text-slate-400 relative z-10">
                                        <div className="flex items-center gap-1">
                                            <span className="bg-slate-700 w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white font-bold">{cEntries.length}</span>
                                            <span>Notes</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="bg-purple-900/50 text-purple-200 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border border-purple-500/30">{experimentCount}</span>
                                            <span>Tests</span>
                                        </div>
                                        {hasNewIdea && (
                                            <div className="ml-auto flex items-center gap-1 text-emerald-400 font-bold animate-pulse">
                                                <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                                                Untested Idea
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProblemSolver;