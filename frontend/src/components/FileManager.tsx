import React, { useEffect, useState } from 'react';
import { File, Folder, ChevronRight, Upload, Edit } from 'lucide-react';

interface FileItem {
  name: string;
  size: number;
  is_dir: boolean;
  mode: string;
}

const FileManager = () => {
  const [path, setPath] = useState('/');
  const [files, setFiles] = useState<FileItem[]>([]);

  const fetchFiles = async (newPath: string) => {
    const res = await fetch(`/api/files/list?path=${encodeURIComponent(newPath)}`);
    const data = await res.json();
    setFiles(data);
    setPath(newPath);
  };

  useEffect(() => {
    fetchFiles('/');
  }, []);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2 text-slate-400">
          <span className="cursor-pointer hover:text-white" onClick={() => fetchFiles('/')}>root</span>
          {path.split('/').filter(Boolean).map((p, i, arr) => (
            <React.Fragment key={i}>
              <ChevronRight size={14} />
              <span className="cursor-pointer hover:text-white" onClick={() => fetchFiles('/' + arr.slice(0, i + 1).join('/'))}>
                {p}
              </span>
            </React.Fragment>
          ))}
        </div>
        <button className="bg-slate-800 p-2 rounded-lg hover:bg-slate-700"><Upload size={18} /></button>
      </div>

      <div className="bg-slate-900 rounded-xl border border-slate-800">
        <div className="divide-y divide-slate-800">
          {files.map(file => (
            <div 
              key={file.name} 
              className="flex items-center px-6 py-3 hover:bg-slate-800/30 cursor-pointer group"
              onClick={() => file.is_dir && fetchFiles(path === '/' ? `/${file.name}` : `${path}/${file.name}`)}
            >
              {file.is_dir ? <Folder className="text-indigo-400 mr-4" size={20} /> : <File className="text-slate-400 mr-4" size={20} />}
              <div className="flex-1">
                <p className="text-sm font-medium">{file.name}</p>
                <p className="text-xs text-slate-500">{file.mode} • {file.is_dir ? '--' : formatSize(file.size)}</p>
              </div>
              {!file.is_dir && (
                <button className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-slate-700 rounded text-slate-400">
                  <Edit size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FileManager;
