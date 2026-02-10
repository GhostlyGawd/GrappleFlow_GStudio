import React from 'react';
import { TrainingSession, SessionType } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';

interface StatsProps {
  sessions: TrainingSession[];
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

const Stats: React.FC<StatsProps> = ({ sessions }) => {
  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500 p-8">
        <p className="text-lg mb-2">No Data Yet</p>
        <p className="text-sm text-center">Log your first session to see your stats!</p>
      </div>
    );
  }

  // Calculate Sessions per Month
  const sessionsByDate = sessions.reduce((acc, session) => {
    const date = new Date(session.date);
    const key = `${date.getMonth() + 1}/${date.getDate()}`; // Simple MM/DD
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const barData = Object.keys(sessionsByDate).slice(-7).map(key => ({
    name: key,
    sessions: sessionsByDate[key]
  }));

  // Calculate Type Distribution
  const typeDistribution = sessions.reduce((acc, session) => {
    acc[session.type] = (acc[session.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.keys(typeDistribution).map(key => ({
    name: key,
    value: typeDistribution[key]
  }));

  // Calculate Intensity Average
  const avgIntensity = (sessions.reduce((acc, curr) => acc + curr.intensity, 0) / sessions.length).toFixed(1);
  const totalMatTime = sessions.reduce((acc, curr) => acc + curr.durationMinutes, 0);
  const hours = Math.floor(totalMatTime / 60);
  const minutes = totalMatTime % 60;

  return (
    <div className="space-y-6 pb-20">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
            <h3 className="text-slate-400 text-xs uppercase tracking-wider font-semibold mb-1">Total Mat Time</h3>
            <p className="text-2xl font-bold text-white">{hours}h {minutes}m</p>
        </div>
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
            <h3 className="text-slate-400 text-xs uppercase tracking-wider font-semibold mb-1">Avg Intensity</h3>
            <p className="text-2xl font-bold text-brand-400">{avgIntensity}<span className="text-sm text-slate-500">/10</span></p>
        </div>
      </div>

      <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-lg">
        <h3 className="text-white font-semibold mb-4">Recent Activity</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData}>
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
              />
              <Bar dataKey="sessions" radius={[4, 4, 0, 0]}>
                {barData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill="#6366f1" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-lg">
        <h3 className="text-white font-semibold mb-4">Training Type</h3>
        <div className="h-64 w-full flex justify-center">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={pieData}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
            </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Stats;