
import React from 'react';
import { LucideIcon } from 'lucide-react';

// --- UTILITIES ---
export const cn = (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(' ');

// --- PRIMITIVES ---

// Unified Surface component for panels, cards, and tooltips
export const Surface = ({ children, className, variant='panel', active, ...props }: React.HTMLAttributes<HTMLDivElement> & { variant?: 'panel'|'element'|'ghost'|'overlay', active?: boolean }) => {
    const vars = { 
      panel: "bg-[var(--bg-panel)] border border-[var(--border)] rounded-xl", 
      element: "bg-[var(--bg-element)] border border-[var(--border)] rounded-lg shadow-sm", 
      ghost: "bg-transparent border border-transparent",
      overlay: "bg-black/80 backdrop-blur-xl border border-white/10 shadow-2xl rounded-lg"
    };
    return <div className={cn("transition-all duration-300", vars[variant], active && "border-[var(--accent)] bg-[var(--bg-surface)] ring-1 ring-[var(--accent)]", className)} {...props}>{children}</div>;
};

// Unified Button component handles both text buttons and icon-only buttons
export const Button = ({ variant='secondary', size='md', className, children, icon: Icon, active, title, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary'|'secondary'|'ghost'|'danger', size?: 'sm'|'md'|'icon', icon?: LucideIcon, active?: boolean }) => {
    const v = { 
        primary: "bg-[var(--accent)] text-black shadow-lg shadow-[var(--accent)]/20 border-transparent hover:brightness-110", 
        secondary: "bg-[var(--bg-element)] text-[var(--text-main)] border-[var(--border)] hover:bg-[var(--bg-surface)] hover:text-white", 
        ghost: "bg-transparent text-[var(--text-muted)] border-transparent hover:text-white hover:bg-white/5", 
        danger: "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20" 
    };
    const s = { sm: "px-2 h-6 text-[10px]", md: "px-3 h-8 text-xs", icon: "p-1.5 h-7 w-7" };
    
    return (
        <button 
            title={title}
            className={cn(
                "flex items-center justify-center gap-1.5 rounded-md font-medium transition-all disabled:opacity-50 outline-none focus:ring-2 focus:ring-[var(--accent)] shrink-0 select-none", 
                v[variant], s[size], 
                active && "bg-[var(--bg-surface)] text-white border-[var(--border)] shadow-inner", 
                className
            )} 
            {...props}
        >
            {Icon && <Icon size={size === 'sm' ? 12 : 14}/>}{children}
        </button>
    );
};

export const IconButton = (props: any) => <Button size="icon" variant="ghost" {...props} />;

export const Badge = ({children, variant='default', className}: any) => (
  <span className={cn("px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border select-none", variant==='accent'?"bg-[var(--accent)] text-black border-transparent":variant==='outline'?"border-[var(--border)] text-[var(--text-muted)]":"bg-[var(--bg-element)] text-[var(--text-muted)] border-[var(--border)]", className)}>{children}</span>
);

export const Stat = ({ label, value, icon: Icon, color }: any) => (
    <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded border border-white/5 select-none min-w-0 shrink transition-colors hover:bg-white/10">
        {Icon && <Icon size={10} className={cn(color, "shrink-0")} />}
        <div className="flex flex-col leading-none min-w-0">
            <span className="text-[7px] font-bold text-white/30 uppercase truncate">{label}</span>
            <span className="text-[9px] font-bold text-white/90 truncate max-w-[80px]">{value}</span>
        </div>
    </div>
);

export const DataPoint = ({ label, value, icon: Icon, color, className }: any) => (
    <div className={cn("flex flex-col bg-white/5 rounded p-2 border border-white/5 min-w-0", className)}>
        <span className="text-[7px] font-bold text-white/30 uppercase mb-0.5 truncate">{label}</span>
        <div className="flex items-center gap-1.5 min-w-0">
            {Icon && <Icon size={10} className={cn(color, "shrink-0")} />}
            <span className="text-[10px] font-medium text-white/90 truncate">{value}</span>
        </div>
    </div>
);

export const ToolbarGroup = ({ children, className }: { children?: React.ReactNode, className?: string }) => (
    <div className={cn("flex items-center bg-[var(--bg-element)] rounded-lg p-0.5 border border-[var(--border)] shrink-0 gap-0.5 min-w-0", className)}>{children}</div>
);

// --- DRAG HANDLE PRIMITIVE ---
export const DragHandle = ({ vertical = false, active, className, ...props }: any) => (
    <div className={cn("flex items-center justify-center transition-all group interact-base cursor-grab active:cursor-grabbing", vertical ? "w-4 h-full cursor-col-resize" : "h-4 w-full cursor-row-resize", className)} {...props}>
        <div className={cn("rounded-full bg-[var(--border)] transition-all group-hover:bg-[var(--accent)] opacity-50 group-hover:opacity-100", vertical ? "w-1 h-8" : "h-1 w-12", active && "bg-[var(--accent)] opacity-100 scale-110")} />
    </div>
);
