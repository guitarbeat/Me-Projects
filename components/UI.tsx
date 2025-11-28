
import React from 'react';
import { LucideIcon, ChevronDown, X } from 'lucide-react';

export const cn = (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(' ');

// -- Design Tokens --
const TRANSITION = "transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)]";
const GLASS = "bg-[#0a0a0c]/60 backdrop-blur-xl border border-white/5 shadow-2xl";
const FOCUS_RING = "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/20";

export interface SurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  glass?: boolean;
  variant?: 'default' | 'solid';
}

export const Surface: React.FC<SurfaceProps> = ({ children, className, interactive, glass = true, variant = 'default', ...props }) => (
  <div className={cn(
      "rounded-xl relative overflow-hidden",
      variant === 'solid' ? "bg-[#09090b] border border-white/5" : GLASS,
      interactive && `hover:bg-white/[0.03] hover:border-white/10 cursor-pointer hover:shadow-[0_0_20px_rgba(0,0,0,0.5)] hover:-translate-y-[1px] ${TRANSITION}`,
      className
  )} {...props}>
      {children}
  </div>
);

export interface CardProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className, active, ...props }) => (
    <button 
        className={cn(
            "flex flex-col text-left p-5 rounded-xl w-full select-none relative overflow-hidden group outline-none",
            TRANSITION, FOCUS_RING,
            active 
                ? "bg-zinc-900/80 border border-[var(--accent)]/50 text-zinc-100 shadow-[0_0_30px_-10px_var(--accent)]" 
                : "bg-transparent border border-white/5 text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.02] hover:border-white/10"
        )} 
        {...props}
    >
        {/* Glow Element */}
        <div className={cn("absolute inset-0 bg-gradient-to-br from-[var(--accent)]/5 to-transparent opacity-0 transition-opacity duration-500", active ? "opacity-100" : "group-hover:opacity-100")} />
        <div className="relative z-10 w-full">{children}</div>
    </button>
);

export interface TypoProps {
  variant?: 'h1'|'h2'|'h3'|'label'|'mono'|'body';
  children: React.ReactNode;
  className?: string;
  as?: any;
}

export const Typo: React.FC<TypoProps> = ({ variant='body', children, className, as }) => {
    const Component = as || (variant.startsWith('h') ? variant : 'div');
    const s = {
        h1: "text-4xl font-light tracking-tighter text-white",
        h2: "text-2xl font-light tracking-tight text-white/90",
        h3: "text-sm font-medium text-zinc-100 tracking-wide",
        label: "text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500",
        mono: "font-mono text-[10px] text-zinc-600",
        body: "text-sm text-zinc-400 leading-relaxed font-light"
    };
    return <Component className={cn(s[variant], className)}>{children}</Component>;
};

export interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'accent' | 'outline';
}

export const Badge: React.FC<BadgeProps> = ({children, className, variant = 'default'}) => (
    <span className={cn(
        "px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border",
        variant === 'accent' ? "bg-[var(--accent)] text-black border-[var(--accent)] shadow-[0_0_10px_var(--accent)]" : 
        variant === 'outline' ? "bg-transparent border-white/10 text-zinc-500" : 
        "bg-white/5 border-white/5 text-zinc-400",
        className
    )}>{children}</span>
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary'|'ghost'|'danger';
  icon?: LucideIcon;
}

export const Button: React.FC<ButtonProps> = ({ variant='ghost', className, children, icon: Icon, ...props }) => {
    const base = `flex items-center justify-center gap-2 rounded-lg px-5 py-2 text-[10px] font-bold uppercase tracking-widest disabled:opacity-50 h-9 ${TRANSITION} ${FOCUS_RING}`;
    const v = {
        primary: "bg-white text-black hover:bg-zinc-200 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:scale-105", 
        ghost: "text-zinc-500 hover:text-white hover:bg-white/5",
        danger: "text-red-400 hover:bg-red-950/30 hover:text-red-300 border border-transparent hover:border-red-900/50"
    };
    return <button className={cn(base, v[variant], className)} {...props}>{Icon && <Icon size={14} />}{children}</button>;
};

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  active?: boolean;
  size?: number;
}

export const IconButton: React.FC<IconButtonProps> = ({ icon: Icon, active, className, size=18, ...props }) => (
    <button className={cn(
        "w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-300 border border-transparent", 
        FOCUS_RING,
        active 
            ? "text-white bg-white/10 border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)]" 
            : "text-zinc-600 hover:text-zinc-200 hover:bg-white/5", 
        className
    )} {...props}>
        <Icon size={size} strokeWidth={1.5}/>
    </button>
);

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export const Select: React.FC<SelectProps> = ({ className, ...props }) => (
    <div className="relative group">
        <select 
            className={cn(
                "appearance-none bg-[#09090b] border border-white/10 rounded-lg px-4 py-1.5 pr-8 text-xs font-bold text-zinc-400 outline-none focus:border-white/20 cursor-pointer hover:bg-white/5 hover:text-zinc-200 transition-colors", 
                className
            )} 
            {...props} 
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600 group-hover:text-zinc-400 transition-colors">
            <ChevronDown size={12} />
        </div>
    </div>
);

export interface TabItem { id: string; label: string; icon?: LucideIcon; }
export interface TabsProps {
  items: TabItem[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ items, active, onChange, className }) => (
    <div className={cn("flex items-center p-1 bg-[#050507] border-b border-white/5 overflow-x-auto scrollbar-hide w-full", className)}>
        {items.map(t => (
            <button 
                key={t.id} 
                onClick={() => onChange(t.id)} 
                className={cn(
                    "flex-1 py-3 px-4 min-w-fit whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.15em] flex gap-2 justify-center items-center relative transition-colors outline-none",
                    active 
                        ? "text-zinc-100" 
                        : "text-zinc-600 hover:text-zinc-400"
                )}
            >
                {t.icon && <t.icon size={14} className={cn("transition-colors", active ? "text-[var(--accent)]" : "opacity-30")} />} 
                <span>{t.label}</span>
                {active && <div className="absolute bottom-0 left-0 w-full h-[1px] bg-[var(--accent)] shadow-[0_0_10px_var(--accent)]" />}
            </button>
        ))}
    </div>
);

export interface SectionHeaderProps {
  title: string;
  icon?: LucideIcon;
  children?: React.ReactNode;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, icon: Icon, children, className }) => (
    <div className={cn("px-6 py-5 flex justify-between items-center h-16 shrink-0 bg-[#09090b]/50 backdrop-blur-sm border-b border-white/5", className)}>
         <Typo variant="label" className="flex items-center gap-3 text-zinc-400">
            {Icon && <Icon size={14} className="text-[var(--accent)]" />}
            {title}
         </Typo>
         <div className="flex items-center gap-2">{children}</div>
    </div>
);

export interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({ title, onClose, children, className }) => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-300">
        <div className={cn("w-full max-w-lg bg-[#0c0c0e] border border-white/10 rounded-2xl overflow-hidden flex flex-col max-h-[90vh] shadow-2xl", className)}>
            <div className="flex justify-between items-center p-6 border-b border-white/5">
                <Typo variant="h3">{title}</Typo>
                <IconButton icon={X} onClick={onClose} />
            </div>
            <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">{children}</div>
        </div>
    </div>
);
