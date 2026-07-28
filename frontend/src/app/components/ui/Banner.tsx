import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { AlertCircle, CheckCircle, WifiOff } from 'lucide-react';

export type BannerVariant = 'success' | 'error' | 'warning';

const ICONS: Record<BannerVariant, LucideIcon> = {
  success: CheckCircle,
  error: AlertCircle,
  warning: WifiOff,
};

const VARIANT_CLASSES: Record<BannerVariant, string> = {
  success: 'bg-accent-pine/10 text-accent-pine border-accent-pine/30',
  error: 'bg-destructive/10 text-destructive border-destructive/30',
  warning: 'bg-badge-limited/10 text-badge-limited border-badge-limited/30',
};

interface BannerProps {
  variant: BannerVariant;
  children: ReactNode;
  icon?: LucideIcon;
  className?: string;
}

export function Banner({ variant, children, icon, className = '' }: BannerProps) {
  const Icon = icon ?? ICONS[variant];
  return (
    <div className={`flex items-start gap-2.5 rounded-lg border px-4 py-3 text-sm ${VARIANT_CLASSES[variant]} ${className}`}>
      <Icon className="w-4 h-4 shrink-0 mt-0.5" />
      <span>{children}</span>
    </div>
  );
}
