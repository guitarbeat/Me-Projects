import React from 'react';
import { LucideIcon } from 'lucide-react';

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

export interface SurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'panel' | 'element' | 'card' | 'ghost' | 'tooltip';
    interactive?: boolean;
    active?: boolean;
    className?: string;
    children?: React.ReactNode;
}

export const Surface = ({ children, className, interactive, variant='panel', active, ...props }: SurfaceProps) => {
    const v = { 
      panel: "bg-[var(--bg-panel)] border border-[var(--border)] rounded-xl", 
      element: "bg-[var(--bg-element)] border border-[var(--border)] rounded-lg shadow-sm", 
      card: "bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl shadow-sm", 
      ghost: "bg-transparent border border-transparent rounded-lg", 
      tooltip: "bg-[#09090b]/90 backdrop-blur-xl border border-white/10 shadow-2xl rounded-lg z-[100] text-xs text-[var(--text-main)] px-3 py-2 pointer-events-none" 
    };
    return <div className={cn("interact-base", v[variant as keyof typeof v], interactive && "cursor-pointer interact-lift", active && "border-[var(--accent)] bg-[var(--bg-surface)] ring-1 ring-[var(--accent)]", className)} {...props}>{children}</div>;
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'icon';
    icon?: LucideIcon;
    active?: boolean;
    className?: string;
    children?: React.ReactNode;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    title?: string;
}

export const Button = ({ variant='secondary', size='md', className, children, icon: Icon, active, ...props }: ButtonProps) => {
    const v = { 
        primary: "bg-[var(--accent)] text-black shadow-lg shadow-[var(--accent)]/20 border border-transparent", 
        secondary: "bg-[var(--bg-element)] text-[var(--text-main)] border border-[var(--border)]", 
        ghost: "bg-transparent text-[var(--text-muted)] border border-transparent", 
        danger: "bg-red-500/10 text-red-400 border border-red-500/20" 
    };
    const s = { 
        sm: "px-2 py-0 h-7 text-[10px]", 
        md: "px-4 py-2 text-sm h-10", 
        icon: "p-2 h-8 w-8" 
    };
    const interactionClass = (variant === 'ghost' || size === 'icon') ? 'interact-scale' : 'interact-push';
    return <button className={cn("flex items-center justify-center gap-1.5 rounded-md font-medium interact-base disabled:opacity-50 disabled:pointer-events-none outline-none select-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-1 focus:ring-offset-black", v[variant as keyof typeof v], s[size as keyof typeof s], interactionClass, active && "bg-[var(--bg-surface)] text-[var(--text-main)] border-[var(--border)]", className)} {...props}>{Icon && <Icon size={14}/>}{children}</button>;
};

export const IconButton = ({size='icon', ...props}: ButtonProps) => <Button size={size} variant="ghost" {...props} />;

export const Badge = ({children, variant='default', className}: any) => 
  <span className={cn("px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border select-none interact-base", variant==='accent'?"bg-[var(--accent)] text-black border-transparent":variant==='outline'?"bg-transparent border-[var(--border)] text-[var(--text-muted)]":variant==='scientific'?"bg-[var(--bg-main)] border-[var(--accent)] text-[var(--accent)]":"bg-[var(--bg-element)] text-[var(--text-muted)] border-[var(--border)]", className)}>{children}</span>;

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

export const Stat = ({ label, value, icon: Icon, color }: any) => (
    <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded border border-white/5 select-none min-w-0 shrink">
        {Icon && <Icon size={10} className={cn(color, "shrink-0")} />}
        <div className="flex flex-col leading-none min-w-0">
            <span className="text-[7px] font-bold text-white/30 uppercase truncate">{label}</span>
            <span className="text-[9px] font-bold text-white/90 truncate max-w-[80px] sm:max-w-[120px]">{value}</span>
        </div>
    </div>
);

// --- ERROR BOUNDARY ---

interface ErrorBoundaryProps {
  children?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: any;
}

export class GlobalErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };
  readonly props!: Readonly<ErrorBoundaryProps>;

  constructor(props: ErrorBoundaryProps) {
    super(props);
  }

  static getDerivedStateFromError(error: any): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Global Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{padding: 40, color: '#d8c8b8', background: '#141110', height: '100vh', fontFamily: 'monospace', overflow: 'auto'}}>
          <h1 style={{fontSize: '24px', marginBottom: '20px', color: '#d13a34'}}>Application Error</h1>
          <pre style={{whiteSpace: 'pre-wrap', background: '#1c1817', padding: '20px', borderRadius: '8px', border: '1px solid #38312e'}}>
            {this.state.error?.toString()}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}