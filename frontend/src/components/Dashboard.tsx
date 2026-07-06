import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Stats {
  cpu: number;
  ram: number;
  disk: number;
  net_in: number;
  net_out: number;
  time: string;
}

const Dashboard = () => {
  const [history, setHistory] = useState<Stats[]>([]);

  useEffect(() => {
    const ws = new WebSocket(`ws://${window.location.host}/ws/stats`);
    ws.onmessage = (event) => {
      const newStats = JSON.parse(event.data);
      setHistory(prev => [...prev.slice(-19), newStats]);
    };
    return () => ws.close();
  }, []);

  const latest = history[history.length - 1] || { cpu: 0, ram: 0, disk: 0 };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">System Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="CPU Usage" value={`${latest.cpu.toFixed(1)}%`} color="text-blue-500" />
        <StatCard title="RAM Usage" value={`${latest.ram.toFixed(1)}%`} color="text-purple-500" />
        <StatCard title="Disk Usage" value={`${latest.disk.toFixed(1)}%`} color="text-emerald-500" />
      </div>

      <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
        <h3 className="text-lg font-medium mb-4">Real-time CPU Load</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none' }} />
              <Line type="monotone" dataKey="cpu" stroke="#3b82f6" strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, color }: { title: string; value: string; color: string }) => (
  <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
    <p className="text-slate-400 text-sm">{title}</p>
    <p className={`text-3xl font-bold mt-2 ${color}`}>{value}</p>
  </div>
);

export default Dashboard;
