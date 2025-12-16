import React, { useState } from 'react';
import { Trash2, Save, X, PenTool, FolderOpen, Music2 } from 'lucide-react';
import { useStore } from '../../lib';

interface ProjectLibraryProps {
    onClose: () => void;
}

    import { Button, IconButton } from '../ui';

    // ... imports

    export const ProjectLibrary: React.FC<ProjectLibraryProps> = ({ onClose }) => {
        const { savedProjects, saveProject, loadProject, deleteProject } = useStore();
        const [name, setName] = useState('');

        const handleSave = (e: React.FormEvent) => {
            e.preventDefault();
            if (!name.trim()) return;
            saveProject(name.trim());
            setName('');
        };

        return (
            <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="w-[420px] max-w-[90vw] max-h-[80vh] flex flex-col bg-[var(--bg-panel)] rounded-2xl shadow-2xl border border-[var(--border)] overflow-hidden relative">
                    
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)] bg-[var(--bg-surface)]">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-[var(--accent)]/10 rounded-lg text-[var(--accent)]">
                                <Save size={18} />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-[var(--text-main)]">Project Library</h2>
                                <p className="text-[10px] text-[var(--text-muted)] font-medium uppercase tracking-wider">Save & Load</p>
                            </div>
                        </div>
                        <IconButton onClick={onClose} icon={X} variant="ghost" className="rounded-full hover:bg-[var(--bg-element)]" />
                    </div>

                    <div className="flex-1 overflow-hidden flex flex-col">
                        
                         {/* Save New Section */}
                        <div className="p-5 bg-[var(--bg-soft)] border-b border-[var(--border)]">
                            <label className="text-[10px] uppercase font-bold text-[var(--text-dim)] mb-2 block tracking-wider">Save Current Project</label>
                            <form onSubmit={handleSave} className="flex gap-2">
                                <div className="flex-1 relative">
                                    <input
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Enter project name..."
                                        className="w-full h-10 px-3 pl-9 bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl text-sm text-[var(--text-main)] placeholder:text-[var(--text-dim)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all"
                                        autoFocus
                                    />
                                    <PenTool size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                                </div>
                                <Button 
                                    type="submit" 
                                    disabled={!name.trim()}
                                    variant="primary"
                                    icon={Save}
                                    className="rounded-xl px-4 font-bold shadow-lg shadow-[var(--accent)]/20"
                                >
                                    Save
                                </Button>
                            </form>
                        </div>

                        {/* File List */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1 bg-[var(--bg-main)]">
                            <label className="px-3 py-2 text-[10px] uppercase font-bold text-[var(--text-dim)] block tracking-wider sticky top-0 bg-[var(--bg-main)]/95 backdrop-blur-sm z-10">Saved Files ({savedProjects.length})</label>
                            
                            {savedProjects.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-[var(--text-dim)] gap-3 opacity-60">
                                    <FolderOpen size={32} strokeWidth={1} />
                                    <span className="text-xs italic">No saved projects yet</span>
                                </div>
                            ) : (
                                savedProjects.map((p) => (
                                    <div key={p.id} className="group flex items-center justify-between p-3 rounded-xl hover:bg-[var(--bg-surface)] border border-transparent hover:border-[var(--border)] transition-all cursor-default relative overflow-hidden">
                                        
                                        <div className="flex items-center gap-3 min-w-0 flex-1">
                                            <div className="w-10 h-10 rounded-lg bg-[var(--bg-element)] border border-[var(--border)] flex items-center justify-center shrink-0 text-[var(--text-muted)] group-hover:text-[var(--accent)] group-hover:border-[var(--accent)] transition-colors">
                                                <Music2 size={18} />
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-sm font-bold text-[var(--text-main)] truncate group-hover:text-[var(--accent)] transition-colors">{p.name}</span>
                                                <span className="text-[10px] text-[var(--text-muted)] flex items-center gap-1.5 truncate">
                                                    <span>{new Date(p.timestamp).toLocaleDateString()}</span>
                                                    <span className="w-0.5 h-0.5 rounded-full bg-[var(--text-dim)]" />
                                                    <span className="uppercase font-mono text-[9px] px-1 rounded bg-[var(--bg-element)] border border-[var(--border)]">{p.state.key} {p.state.scale}</span>
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 pl-2">
                                            <Button 
                                                onClick={() => { loadProject(p.id); onClose(); }}
                                                size="sm"
                                                variant="secondary"
                                                className="opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all rounded-lg text-[10px] font-bold uppercase shadow-sm"
                                            >
                                                Open
                                            </Button>
                                            <IconButton 
                                                onClick={(e: React.MouseEvent) => { e.stopPropagation(); deleteProject(p.id); }}
                                                icon={Trash2}
                                                size="sm"
                                                className="text-[var(--text-dim)] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/10 rounded-lg"
                                            />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };
