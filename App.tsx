import React, { useState, useEffect } from 'react';
import { ViewState, TrainingSession, Challenge, LabEntry } from './types';
import Dashboard from './components/Dashboard';
import TrainingLog from './components/TrainingLog';
import Stats from './components/Stats';
import AICoach from './components/AICoach';
import ProblemSolver from './components/ProblemSolver';
import { HomeIcon, PlusCircleIcon, BarChartIcon, BrainIcon, FlaskIcon } from './components/icons';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [labEntries, setLabEntries] = useState<LabEntry[]>([]);

  useEffect(() => {
    const savedSessions = localStorage.getItem('grappleflow_sessions');
    if (savedSessions) {
      try {
        setSessions(JSON.parse(savedSessions));
      } catch (e) {
        console.error("Failed to load sessions", e);
      }
    }

    const savedChallenges = localStorage.getItem('grappleflow_challenges');
    if (savedChallenges) {
      try {
        setChallenges(JSON.parse(savedChallenges));
      } catch (e) {
        console.error("Failed to load challenges", e);
      }
    }

    const savedEntries = localStorage.getItem('grappleflow_lab_entries');
    if (savedEntries) {
        try {
            setLabEntries(JSON.parse(savedEntries));
        } catch (e) {
            console.error("Failed to load lab entries", e);
        }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('grappleflow_sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem('grappleflow_challenges', JSON.stringify(challenges));
  }, [challenges]);

  useEffect(() => {
      localStorage.setItem('grappleflow_lab_entries', JSON.stringify(labEntries));
  }, [labEntries]);

  const handleAddSession = (session: TrainingSession) => {
    setSessions(prev => [session, ...prev]);
  };

  const handleDeleteSession = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
  };

  const handleAddChallenge = (challenge: Challenge) => {
      setChallenges(prev => [challenge, ...prev]);
  };

  const handleUpdateChallenge = (updated: Challenge) => {
      setChallenges(prev => prev.map(c => c.id === updated.id ? updated : c));
  };

  const handleDeleteChallenge = (id: string) => {
      setChallenges(prev => prev.filter(c => c.id !== id));
      // Also delete associated entries to keep clean
      setLabEntries(prev => prev.filter(e => e.challengeId !== id));
  };

  const handleAddEntry = (entry: LabEntry) => {
      setLabEntries(prev => [...prev, entry]);
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard sessions={sessions} onNavigate={setCurrentView} />;
      case 'log':
        return <TrainingLog sessions={sessions} onAddSession={handleAddSession} onDeleteSession={handleDeleteSession} />;
      case 'stats':
        return <Stats sessions={sessions} />;
      case 'coach':
        return <AICoach sessions={sessions} />;
      case 'lab':
        return <ProblemSolver 
                  challenges={challenges} 
                  entries={labEntries}
                  onAddChallenge={handleAddChallenge} 
                  onUpdateChallenge={handleUpdateChallenge} 
                  onDeleteChallenge={handleDeleteChallenge}
                  onAddEntry={handleAddEntry}
                />;
      default:
        return <Dashboard sessions={sessions} onNavigate={setCurrentView} />;
    }
  };

  const NavItem = ({ view, icon: Icon, label }: { view: ViewState; icon: any; label: string }) => (
    <button
      onClick={() => setCurrentView(view)}
      className={`flex flex-col items-center justify-center w-full py-2 transition-colors ${
        currentView === view ? 'text-brand-500' : 'text-slate-500 hover:text-slate-300'
      }`}
    >
      <Icon className={`w-6 h-6 mb-1 ${currentView === view ? 'stroke-brand-500' : 'stroke-current'}`} />
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-50 overflow-hidden font-sans">
      <main className="flex-1 overflow-hidden relative">
        {renderView()}
      </main>

      <nav className="bg-slate-900 border-t border-slate-800 pb-safe pt-2 px-2">
        <div className="flex justify-around items-center max-w-md mx-auto">
          <NavItem view="dashboard" icon={HomeIcon} label="Home" />
          <NavItem view="log" icon={PlusCircleIcon} label="Log" />
          <NavItem view="lab" icon={FlaskIcon} label="Lab" />
          <NavItem view="coach" icon={BrainIcon} label="Coach" />
          <NavItem view="stats" icon={BarChartIcon} label="Stats" />
        </div>
      </nav>
      
      {/* Mobile Safe Area Spacer for iOS PWA */}
      <div className="h-safe-bottom bg-slate-900"></div>
    </div>
  );
};

export default App;