
import React from 'react';
import { LucideIcon } from 'lucide-react';

// --- UTILITIES ---
export const cn = (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(' ');

// --- PRIMITIVES ---
export const Surface = ({ children, className, variant='panel', active, ...props }: React.HTMLAttributes<HTMLDivElement> & { variant?: 'panel'|'element'|'ghost', active?: boolean }) => {
    const vars = { 
      panel: "bg-[var(--bg-panel)] border border-[var(--border)] rounded-xl", 
      element: "bg-[var(--bg-element)] border border-[var(--border)] rounded-lg shadow-sm", 
      ghost: "bg-transparent border border-transparent" 
    };
    return <div className={cn("transition-all duration-300", vars[variant], active && "border-[var(--accent)] bg-[var(--bg-surface)] ring-1 ring-[var(--accent)]", className)} {...props}>{children}</div>;
};

export const Button = ({ variant='secondary', size='md', className, children, icon: Icon, active, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary'|'secondary'|'ghost'|'danger', size?: 'sm'|'md'|'icon', icon?: LucideIcon, active?: boolean }) => {
    const v = { 
        primary: "bg-[var(--accent)] text-black shadow-lg shadow-[var(--accent)]/20 border-transparent hover:brightness-110", 
        secondary: "bg-[var(--bg-element)] text-[var(--text-main)] border-[var(--border)] hover:bg-[var(--bg-surface)]", 
        ghost: "bg-transparent text-[var(--text-muted)] border-transparent hover:text-[var(--text-main)]", 
        danger: "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20" 
    };
    const s = { sm: "px-2 h-6 text-[10px]", md: "px-3 h-8 text-xs", icon: "p-1.5 h-7 w-7" };
    
    return (
        <button className={cn("flex items-center justify-center gap-1.5 rounded-md font-medium transition-all disabled:opacity-50 outline-none focus:ring-2 focus:ring-[var(--accent)] shrink-0", v[variant], s[size], active && "bg-[var(--bg-surface)] text-[var(--text-main)] border-[var(--border)] shadow-sm", className)} {...props}>
            {Icon && <Icon size={size === 'sm' ? 12 : 14}/>}{children}
        </button>
    );
};

export const IconButton = (props: any) => <Button size="icon" variant="ghost" {...props} />;

export const Badge = ({children, variant='default', className}: any) => (
  <span className={cn("px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border select-none", variant==='accent'?"bg-[var(--accent)] text-black border-transparent":variant==='outline'?"border-[var(--border)] text-[var(--text-muted)]":"bg-[var(--bg-element)] text-[var(--text-muted)] border-[var(--border)]", className)}>{children}</span>
);

export const Stat = ({ label, value, icon: Icon, color }: any) => (
    <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded border border-white/5 select-none min-w-0 shrink">
        {Icon && <Icon size={10} className={cn(color, "shrink-0")} />}
        <div className="flex flex-col leading-none min-w-0">
            <span className="text-[7px] font-bold text-white/30 uppercase truncate">{label}</span>
            <span className="text-[9px] font-bold text-white/90 truncate max-w-[80px] sm:max-w-[120px]">{value}</span>
        </div>
    </div>
);

export const ToolbarGroup = ({ children, className }: { children?: React.ReactNode, className?: string }) => (
    <div className={cn("flex items-center bg-[var(--bg-element)] rounded-lg p-0.5 border border-[var(--border)] shrink-0 gap-0.5 min-w-0", className)}>{children}</div>
);

// --- ERROR BOUNDARY ---
export class GlobalErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: any}> {
  state = { hasError: false, error: null };
  readonly props!: Readonly<{ children: React.ReactNode }>;
  static getDerivedStateFromError(error: any) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) return <div className="p-10 bg-[#141110] text-[#d8c8b8] h-screen font-mono overflow-auto"><h1 className="text-xl text-[#d13a34] mb-4">Error</h1><pre className="bg-[#1c1817] p-4 rounded border border-[#38312e]">{this.state.error?.toString()}</pre></div>;
    return this.props.children;
  }
}
