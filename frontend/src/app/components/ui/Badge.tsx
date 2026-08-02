import type { ReactNode } from 'react';

export type BadgeVariant = 'sale' | 'new' | 'limited' | 'country' | 'neutral';

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  sale: 'bg-badge-sale text-badge-sale-foreground',
  new: 'bg-badge-new text-badge-new-foreground',
  limited: 'bg-badge-limited text-badge-limited-foreground',
  country: 'bg-white/90 text-foreground border border-border backdrop-blur-sm',
  neutral: 'bg-secondary text-secondary-foreground',
};

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}

export function Badge({ variant = 'neutral', children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold tracking-wide leading-none ${VARIANT_CLASSES[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
