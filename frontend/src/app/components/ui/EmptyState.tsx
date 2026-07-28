import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-5 text-center py-20 px-4">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-secondary border border-border">
        <Icon className="w-7 h-7 text-muted-foreground" aria-hidden="true" />
      </div>
      <div className="space-y-1.5">
        <h2 className="font-display text-2xl font-semibold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
      </div>
      {action}
    </div>
  );
}
