export enum SessionType {
  GI = 'Gi',
  NOGI = 'No-Gi',
  OPEN_MAT = 'Open Mat',
  SEMINAR = 'Seminar',
  COMPETITION = 'Competition'
}

export enum BeltRank {
  WHITE = 'White',
  BLUE = 'Blue',
  PURPLE = 'Purple',
  BROWN = 'Brown',
  BLACK = 'Black'
}

export interface Technique {
  id: string;
  name: string;
  category: 'Guard' | 'Pass' | 'Submission' | 'Escape' | 'Takedown' | 'Other';
  notes: string;
}

export interface TrainingSession {
  id: string;
  date: string;
  durationMinutes: number;
  type: SessionType;
  rounds: number;
  techniques: Technique[];
  notes: string;
  mood: 'Great' | 'Good' | 'Neutral' | 'Hard' | 'Injured';
  intensity: number; // 1-10
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

// --- NEW SCIENTIFIC LAB TYPES ---

export type LabEntryType = 'Observation' | 'Hypothesis' | 'Experiment' | 'Analysis';

export interface LabEntry {
  id: string;
  challengeId: string;
  date: string;
  type: LabEntryType;
  content: string;
  // For Experiments:
  result?: 'Success' | 'Failure' | 'Inconclusive';
}

export interface Challenge {
  id: string;
  title: string; // e.g. "Breaking Closed Guard"
  category: string; // e.g. "Passing"
  status: 'Active' | 'Solved' | 'Shelved';
  createdAt: string;
  lastUpdated: string;
}

export type ViewState = 'dashboard' | 'log' | 'stats' | 'coach' | 'lab';