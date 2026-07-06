import { useEffect, useState } from 'react';
import { Play, Square, RotateCcw, FileText } from 'lucide-react';

interface Container {
  Id: string;
  Names: string[];
  Image: string;
  State: string;
  Status: string;
}

const DockerManager = () => {
  const [containers, setContainers] = useState<Container[]>([]);
  // const [loading, setLoading] = useState(true);

  const fetchContainers = async () => {
    try {
      const res = await fetch('/api/docker/list');
      const data = await res.json();
      setContainers(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchContainers();
    const interval = setInterval(fetchContainers, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleAction = async (id: string, action: string) => {
    await fetch(`/api/docker/action?id=${id}&action=${action}`);
    fetchContainers();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Docker Containers</h2>
        <button className="bg-indigo-600 px-4 py-2 rounded-lg text-sm hover:bg-indigo-700">Deploy Compose</button>
      </div>

      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-800/50 text-slate-400 text-sm">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Image</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {containers.map(c => (
              <tr key={c.Id} className="hover:bg-slate-800/30 transition-colors">
                <td className="px-6 py-4 font-medium">{c.Names[0].replace('/', '')}</td>
                <td className="px-6 py-4 text-slate-400 text-sm">{c.Image}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    c.State === 'running' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                  }`}>
                    {c.Status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex space-x-2">
                    {c.State !== 'running' ? (
                      <button onClick={() => handleAction(c.Id, 'start')} className="p-1.5 hover:bg-slate-700 rounded text-emerald-500"><Play size={18} /></button>
                    ) : (
                      <button onClick={() => handleAction(c.Id, 'stop')} className="p-1.5 hover:bg-slate-700 rounded text-rose-500"><Square size={18} /></button>
                    )}
                    <button onClick={() => handleAction(c.Id, 'restart')} className="p-1.5 hover:bg-slate-700 rounded text-amber-500"><RotateCcw size={18} /></button>
                    <button className="p-1.5 hover:bg-slate-700 rounded text-slate-400"><FileText size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DockerManager;
