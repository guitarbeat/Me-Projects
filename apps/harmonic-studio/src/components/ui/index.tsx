import React from 'react';
import { LucideIcon } from 'lucide-react';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- UTILITIES ---
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- PRIMITIVES ---

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
// --- EXPORTS ---
export * from './GuitarChord';