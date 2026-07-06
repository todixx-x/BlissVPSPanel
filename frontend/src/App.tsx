import { useState } from 'react';
import { LayoutDashboard, Container, Folder, Terminal as TerminalIcon } from 'lucide-react';
import Dashboard from './components/Dashboard';
import DockerManager from './components/DockerManager';
import FileManager from './components/FileManager';
import Terminal from './components/Terminal';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'docker', name: 'Docker', icon: Container },
    { id: 'files', name: 'Files', icon: Folder },
    { id: 'terminal', name: 'Terminal', icon: TerminalIcon },
  ];

  return (
    <div className="flex h-screen bg-slate-950">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-indigo-500">BlissPanel</h1>
          <p className="text-xs text-slate-500 mt-1">v1.0.0</p>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <tab.icon className="w-5 h-5 mr-3" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-8">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'docker' && <DockerManager />}
        {activeTab === 'files' && <FileManager />}
        {activeTab === 'terminal' && <Terminal />}
      </main>
    </div>
  );
}

export default App;
