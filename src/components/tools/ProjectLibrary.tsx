import React, { useState } from 'react';
import { Trash2, Save, FolderOpen } from 'lucide-react';
import { useStore } from '../../lib';
import { cn } from '../ui';

export const ProjectLibrary: React.FC = () => {
    const { savedProjects, saveProject, loadProject, deleteProject } = useStore();
    const [name, setName] = useState('');

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        saveProject(name.trim());
        setName('');
    };

    return (
        <div className="h-full w-full flex flex-col bg-[var(--bg-panel)] overflow-hidden">
            
            {/* Save Input - Minimal */}
            <div className="p-2 bg-[var(--bg-soft)] border-b border-[var(--border)]">
                <form onSubmit={handleSave} className="flex gap-1">
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Save as..."
                        className="flex-1 h-7 px-2 bg-[var(--bg-surface)] border border-[var(--border)] rounded text-[10px] text-[var(--text-main)] placeholder:text-[var(--text-dim)] focus:outline-none focus:border-[var(--accent)]"
                        autoFocus
                    />
                    <button 
                        type="submit" 
                        disabled={!name.trim()}
                        className={cn(
                            "w-7 h-7 flex items-center justify-center rounded transition-all",
                            name.trim() 
                                ? "bg-[var(--accent)] text-white hover:opacity-90" 
                                : "bg-[var(--bg-surface)] text-[var(--text-dim)] border border-[var(--border)]"
                        )}
                    >
                        <Save size={12} />
                    </button>
                </form>
            </div>

            {/* Project List - Minimal */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-1 space-y-0.5">
                {savedProjects.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-[var(--text-dim)] opacity-40">
                        <FolderOpen size={24} strokeWidth={1} />
                        <span className="text-[9px] mt-2">No projects</span>
                    </div>
                ) : (
                    savedProjects.map((p) => (
                        <div key={p.id} className="group flex items-center gap-1.5 p-1.5 rounded hover:bg-[var(--bg-surface)] transition-all">
                            <div className="flex-1 min-w-0">
                                <div className="text-[10px] font-bold text-[var(--text-main)] truncate group-hover:text-[var(--accent)]">{p.name}</div>
                                <div className="text-[8px] text-[var(--text-muted)] font-mono">{p.state.key} {p.state.scale}</div>
                            </div>
                            <button 
                                onClick={() => loadProject(p.id)}
                                className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded bg-[var(--accent)] text-white text-[8px] font-bold transition-all"
                            >
                                ▶
                            </button>
                            <button 
                                onClick={(e) => { e.stopPropagation(); deleteProject(p.id); }}
                                className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded hover:bg-red-500/10 text-[var(--text-dim)] hover:text-red-500 transition-all"
                            >
                                <Trash2 size={10} />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
