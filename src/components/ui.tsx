import React from 'react';
import { LucideIcon, ChevronRight, Home } from 'lucide-react';

// --- UTILITIES ---
export const cn = (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(' ');

// --- PRIMITIVES ---

// Unified Surface component for panels, cards, and tooltips
export const Surface = ({ children, className, variant='panel', active, ...props }: React.HTMLAttributes<HTMLDivElement> & { variant?: 'panel'|'element'|'ghost'|'overlay'|'tooltip', active?: boolean }) => {
    const vars = { 
      panel: "bg-[var(--bg-panel)] border border-[var(--border)] rounded-lg", 
      element: "bg-[var(--bg-element)] border border-[var(--border)] rounded-lg", 
      ghost: "bg-transparent border border-transparent",
      overlay: "bg-[var(--bg-panel)] border border-[var(--border)] rounded-lg",
      tooltip: "bg-[var(--bg-panel)] border border-[var(--border)] rounded-lg z-[100] text-xs text-[var(--text-main)] px-3 py-2 pointer-events-none"
    };
    return <div className={cn("transition-none", vars[variant], active && "border-[var(--accent)] bg-[var(--bg-surface)]", className)} {...props}>{children}</div>;
};

// Unified Button component handles both text buttons and icon-only buttons
export const Button = ({ variant='secondary', size='md', className, children, icon: Icon, active, title, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary'|'secondary'|'ghost'|'danger', size?: 'sm'|'md'|'icon', icon?: LucideIcon, active?: boolean }) => {
    const v = { 
        primary: "bg-[var(--accent)] text-black border-transparent hover:brightness-105", 
        secondary: "bg-[var(--bg-element)] text-[var(--text-main)] border-[var(--border)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-main)]", 
        ghost: "bg-transparent text-[var(--text-muted)] border-transparent hover:text-[var(--text-main)] hover:bg-[var(--bg-soft-hover)]", 
        danger: "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20" 
    };
    const s = { sm: "px-2 h-6 text-[10px]", md: "px-3 h-8 text-xs", icon: "p-1.5 h-7 w-7" };
    
    return (
        <button 
            title={title}
            className={cn(
                "flex items-center justify-center gap-1.5 rounded-md font-medium transition-none disabled:opacity-50 outline-none shrink-0 select-none", 
                v[variant], s[size], 
                active && "bg-[var(--bg-surface)] text-[var(--text-main)] border-[var(--border)]", 
                className
            )} 
            {...props}
        >
            {Icon && <Icon size={size === 'sm' ? 12 : 14}/>}{children}
        </button>
    );
};

export const IconButton = (props: React.ComponentProps<typeof Button>) => <Button size="icon" variant="ghost" {...props} />;

export const Badge = ({children, variant='default', className}: { children?: React.ReactNode; variant?: 'default' | 'accent' | 'outline'; className?: string }) => (
  <span className={cn("px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border select-none", variant==='accent'?"bg-[var(--accent)] text-black border-transparent":variant==='outline'?"border-[var(--border)] text-[var(--text-muted)]":"bg-[var(--bg-element)] text-[var(--text-muted)] border-[var(--border)]", className)}>{children}</span>
);

export const Stat = ({ label, value, icon: Icon, color }: { label: string; value: string; icon?: React.ComponentType<{ size?: number; className?: string }>; color?: string }) => (
    <div className="flex items-center gap-1.5 px-2 py-1 bg-[var(--bg-soft)] rounded border border-[var(--border-soft)] select-none min-w-0 shrink transition-colors hover:bg-[var(--bg-soft-hover)]">
        {Icon && <Icon size={10} className={cn(color, "shrink-0")} />}
        <div className="flex flex-col leading-none min-w-0">
            <span className="text-[7px] font-bold text-[var(--text-dim)] uppercase truncate">{label}</span>
            <span className="text-[9px] font-bold text-[var(--text-main)] truncate max-w-[80px]">{value}</span>
        </div>
    </div>
);

export const DataPoint = ({ label, value, icon: Icon, color, className }: { label: string; value: string; icon?: React.ComponentType<{ size?: number; className?: string }>; color?: string; className?: string }) => (
    <div className={cn("flex flex-col bg-[var(--bg-soft)] rounded p-2 border border-[var(--border-soft)] min-w-0", className)}>
        <span className="text-[7px] font-bold text-[var(--text-dim)] uppercase mb-0.5 truncate">{label}</span>
        <div className="flex items-center gap-1.5 min-w-0">
            {Icon && <Icon size={10} className={cn(color, "shrink-0")} />}
            <span className="text-[10px] font-medium text-[var(--text-main)] truncate">{value}</span>
        </div>
    </div>
);

export const ToolbarGroup = ({ children, className }: { children?: React.ReactNode, className?: string }) => (
    <div className={cn("flex items-center bg-[var(--bg-element)] rounded-lg p-0.5 border border-[var(--border)] shrink-0 gap-0.5 min-w-0", className)}>{children}</div>
);

// --- DRAG HANDLE PRIMITIVE ---
export const DragHandle = ({ vertical = false, active, className, ...props }: { vertical?: boolean; active?: boolean; className?: string } & React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn("flex items-center justify-center transition-none cursor-grab active:cursor-grabbing", vertical ? "w-4 h-full cursor-col-resize" : "h-4 w-full cursor-row-resize", className)} {...props}>
        <div className={cn("rounded-full bg-[var(--border)] hover:bg-[var(--accent)] opacity-50 hover:opacity-100", vertical ? "w-1 h-8" : "h-1 w-12", active && "bg-[var(--accent)] opacity-100")} />
    </div>
);

// --- BREADCRUMBS ---
export const Breadcrumbs = ({ items }: { items: { label: string, active?: boolean, onClick?: () => void }[] }) => {
    return (
        <nav aria-label="Breadcrumb" className="flex items-center h-full">
            <ol className="flex items-center gap-1.5">
                <li>
                    <button className="flex items-center text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors">
                        <Home size={10} />
                    </button>
                </li>
                {items.map((item, i) => (
                    <React.Fragment key={i}>
                        <ChevronRight size={10} className="text-[var(--text-dim)]" />
                        <li>
                            <button 
                                onClick={item.onClick}
                                disabled={!item.onClick}
                                className={cn(
                                    "text-[10px] uppercase tracking-wider font-bold transition-colors",
                                    item.active ? "text-[var(--text-main)] pointer-events-none" : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
                                )}
                            >
                                {item.label}
                            </button>
                        </li>
                    </React.Fragment>
                ))}
            </ol>
        </nav>
    );
};

// --- ERROR BOUNDARY ---
export class GlobalErrorBoundary extends React.Component<{children?: React.ReactNode}, {hasError: boolean}> {
    state = { hasError: false };

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
             return (
                <div className="flex items-center justify-center h-screen w-full bg-[#0a0a0a] text-red-400 font-sans">
                    <div className="text-center p-6 border border-red-900/50 rounded-xl bg-red-950/10">
                        <h2 className="text-sm font-bold uppercase tracking-widest mb-4">Application Error</h2>
                        <button 
                            onClick={() => window.location.reload()} 
                            className="px-4 py-2 bg-red-900/20 border border-red-500/30 rounded text-xs hover:bg-red-900/40 transition-colors"
                        >
                            Reload Interface
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}