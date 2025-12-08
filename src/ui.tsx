
import React from 'react';
import { LucideIcon, ChevronRight, Home } from 'lucide-react';

// --- UTILITIES ---

export const cn = (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(' ');

// --- PRIMITIVES ---

export interface TypoProps extends React.HTMLAttributes<HTMLElement> {
    variant?: 'h1' | 'h2' | 'h3' | 'label' | 'mono' | 'body' | 'sub';
    as?: any;
    className?: string;
    children?: React.ReactNode;
}

export const Typo = ({ variant='body', as, children, className, ...props }: TypoProps) => {
    const Component = as || (variant?.startsWith('h') ? variant : 'div');
    const s = { 
      h1: "text-2xl font-light text-[var(--text-main)]", 
      h2: "text-lg font-medium text-[var(--text-main)]", 
      h3: "text-sm font-medium text-[var(--text-main)]", 
      label: "text-[9px] font-black uppercase tracking-wider text-[var(--text-dim)]", 
      mono: "font-mono text-[10px] text-[var(--text-muted)]", 
      body: "text-sm text-[var(--text-muted)] leading-relaxed", 
      sub: "text-xs text-[var(--text-dim)]" 
    };
    return <Component className={cn(s[variant as keyof typeof s] || 'body', className)} {...props}>{children}</Component>;
};

// Unified Surface component
export const Surface = ({ children, className, variant='panel', active, ...props }: React.HTMLAttributes<HTMLDivElement> & { variant?: 'panel'|'element'|'card'|'ghost'|'overlay'|'tooltip', active?: boolean }) => {
    const vars = { 
      panel: "bg-[var(--bg-panel)] border border-[var(--border)] rounded-xl", 
      element: "bg-[var(--bg-element)] border border-[var(--border)] rounded-lg shadow-sm", 
      card: "bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl shadow-sm", 
      ghost: "bg-transparent border border-transparent",
      overlay: "bg-[var(--bg-glass)] backdrop-blur-xl border border-[var(--border-soft)] shadow-2xl rounded-lg",
      tooltip: "bg-[var(--bg-glass)] backdrop-blur-xl border border-[var(--border-soft)] shadow-2xl rounded-lg z-[100] text-xs text-[var(--text-main)] px-3 py-2 pointer-events-none"
    };
    return <div className={cn("transition-all duration-300", vars[variant], active && "border-[var(--accent)] bg-[var(--bg-surface)] ring-1 ring-[var(--accent)]", className)} {...props}>{children}</div>;
};

// Unified Button component
export const Button = ({ variant='secondary', size='md', className, children, icon: Icon, active, title, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary'|'secondary'|'ghost'|'danger', size?: 'sm'|'md'|'icon', icon?: LucideIcon, active?: boolean }) => {
    const v = { 
        primary: "bg-[var(--accent)] text-black shadow-lg shadow-[var(--accent)]/20 border-transparent hover:brightness-110", 
        secondary: "bg-[var(--bg-element)] text-[var(--text-main)] border-[var(--border)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-main)]", 
        ghost: "bg-transparent text-[var(--text-muted)] border-transparent hover:text-[var(--text-main)] hover:bg-[var(--bg-soft-hover)]", 
        danger: "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20" 
    };
    const s = { sm: "px-2 h-6 text-[10px]", md: "px-3 h-8 text-xs", icon: "p-1.5 h-7 w-7" };
    
    return (
        <button 
            title={title}
            className={cn(
                "flex items-center justify-center gap-1.5 rounded-md font-medium transition-all disabled:opacity-50 outline-none focus:ring-2 focus:ring-[var(--accent)] shrink-0 select-none interact-push", 
                v[variant], s[size], 
                active && "bg-[var(--bg-surface)] text-[var(--text-main)] border-[var(--border)] shadow-inner", 
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
    <div className="flex items-center gap-1.5 px-2 py-1 bg-[var(--bg-soft)] rounded border border-[var(--border-soft)] select-none min-w-0 shrink transition-colors hover:bg-[var(--bg-soft-hover)]">
        {Icon && <Icon size={10} className={cn(color, "shrink-0")} />}
        <div className="flex flex-col leading-none min-w-0">
            <span className="text-[7px] font-bold text-[var(--text-dim)] uppercase truncate">{label}</span>
            <span className="text-[9px] font-bold text-[var(--text-main)] truncate max-w-[80px]">{value}</span>
        </div>
    </div>
);

export const DataPoint = ({ label, value, icon: Icon, color, className }: any) => (
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

export const DragHandle = ({ vertical = false, active, className, ...props }: any) => (
    <div className={cn("flex items-center justify-center transition-all group interact-base cursor-grab active:cursor-grabbing", vertical ? "w-4 h-full cursor-col-resize" : "h-4 w-full cursor-row-resize", className)} {...props}>
        <div className={cn("rounded-full bg-[var(--border)] transition-all group-hover:bg-[var(--accent)] opacity-50 group-hover:opacity-100", vertical ? "w-1 h-8" : "h-1 w-12", active && "bg-[var(--accent)] opacity-100 scale-110")} />
    </div>
);

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

export class GlobalErrorBoundary extends React.Component<{ children?: React.ReactNode }, { hasError: boolean; error: any }> {
  constructor(props: { children?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) { return { hasError: true, error }; }
  componentDidCatch(error: any, errorInfo: any) { console.error("Global Uncaught error:", error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{padding: 40, color: 'var(--text-main)', background: 'var(--bg-main)', height: '100vh', fontFamily: 'monospace', overflow: 'auto'}}>
          <h1 style={{fontSize: '24px', marginBottom: '20px', color: 'var(--accent)'}}>Application Error</h1>
          <pre style={{whiteSpace: 'pre-wrap', background: 'var(--bg-panel)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border)'}}>{this.state.error?.toString()}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}
