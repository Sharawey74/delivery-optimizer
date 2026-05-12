// frontend/src/components/StatCard.tsx
import React from 'react';
import { LucideIcon, ArrowUpRight } from 'lucide-react';

export interface StatCardProps {
  title: string;
  value: string | number;
  sub?: string;
  icon: LucideIcon;
  variant?: 'default' | 'active' | 'warning' | 'danger';
}

export function StatCard({ title, value, sub, icon: Icon, variant = 'default' }: StatCardProps) {
  const isDefault = variant === 'default';
  const isActive = variant === 'active';
  const isWarning = variant === 'warning';
  const isDanger = variant === 'danger';

  let borderClass = 'border-brand-surface-border';
  let shadowClass = '';
  let glowClass = '';
  let iconBgClass = 'bg-brand-surface-high text-brand-text-secondary';
  let accentLineClass = '';

  if (isActive) {
    borderClass = 'border-brand-indigo/40';
    shadowClass = 'shadow-brand-indigo/10 shadow-lg';
    glowClass = 'bg-brand-indigo/5';
    iconBgClass = 'bg-brand-indigo/15 text-brand-indigo-bright';
    accentLineClass = 'bg-gradient-to-r from-brand-indigo to-transparent';
  } else if (isWarning) {
    borderClass = 'border-brand-amber/40';
    shadowClass = 'shadow-brand-amber/10 shadow-lg';
    glowClass = 'bg-brand-amber/5';
    iconBgClass = 'bg-brand-amber/15 text-brand-amber';
    accentLineClass = 'bg-gradient-to-r from-brand-amber to-transparent';
  } else if (isDanger) {
    borderClass = 'border-brand-rose/40';
    shadowClass = 'shadow-brand-rose/10 shadow-lg';
    glowClass = 'bg-brand-rose/5';
    iconBgClass = 'bg-brand-rose/15 text-brand-rose-bright';
    accentLineClass = 'bg-gradient-to-r from-brand-rose to-transparent';
  }

  return (
    <div className={`bg-brand-surface-raised border rounded-xl p-5 relative overflow-hidden group transition-all duration-300 hover:scale-[1.02] hover:shadow-xl cursor-default ${borderClass} ${shadowClass}`}>
      
      {!isDefault && (
        <div className={`absolute rounded-full blur-2xl w-32 h-32 -top-4 -right-4 pointer-events-none ${glowClass}`} />
      )}

      <div className="flex items-center justify-between mb-4 relative z-10">
        <span className="text-xs font-semibold uppercase tracking-widest text-brand-text-muted">
          {title}
        </span>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${iconBgClass}`}>
          <Icon size={18} />
        </div>
      </div>

      <div className="text-3xl font-bold tracking-tight text-brand-text mt-1 relative z-10">
        {value}
      </div>

      {sub && (
        <div className="text-xs font-mono text-brand-text-muted mt-2 flex items-center gap-1 relative z-10">
          <ArrowUpRight size={12} className={iconBgClass.split(' ')[1]} />
          {sub}
        </div>
      )}

      {!isDefault && (
        <div className={`absolute bottom-0 left-0 right-0 h-[2px] ${accentLineClass}`} />
      )}
    </div>
  );
}