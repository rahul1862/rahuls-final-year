import { forwardRef, type ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'accent';
export type ButtonSize = 'sm' | 'md' | 'lg';

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary-hover shadow-[0_1px_2px_rgba(33,29,24,0.04),0_2px_8px_rgba(33,29,24,0.04)]',
  secondary: 'bg-transparent text-foreground border border-border hover:border-primary hover:text-primary',
  ghost: 'bg-transparent text-muted-foreground hover:text-foreground hover:bg-secondary',
  accent: 'bg-accent-pine text-accent-pine-foreground hover:bg-accent-pine-hover',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'px-3.5 py-1.5 text-xs gap-1.5 rounded-lg',
  md: 'px-5 py-2.5 text-sm gap-2 rounded-lg',
  lg: 'px-7 py-3.5 text-sm gap-2 rounded-xl',
};

export function buttonClassName(variant: ButtonVariant = 'primary', size: ButtonSize = 'md', className = '') {
  return [
    'inline-flex items-center justify-center font-medium transition-colors duration-200',
    'disabled:opacity-50 disabled:pointer-events-none',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
    VARIANT_CLASSES[variant],
    SIZE_CLASSES[size],
    className,
  ].join(' ');
}

interface ButtonProps extends HTMLMotionProps<'button'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading, disabled, className = '', children, ...props },
  ref
) {
  const isDisabled = disabled || loading;
  return (
    <motion.button
      ref={ref}
      whileHover={isDisabled ? undefined : { scale: 1.02 }}
      whileTap={isDisabled ? undefined : { scale: 0.98 }}
      disabled={isDisabled}
      className={buttonClassName(variant, size, className)}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
      {children}
    </motion.button>
  );
});

interface LinkButtonProps extends LinkProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}

// A plain CSS scale transform (rather than framer-motion's whileHover/whileTap) sidesteps a real
// type collision between framer-motion's animation props and react-router's Link event handlers.
export function LinkButton({ variant = 'primary', size = 'md', className = '', ...props }: LinkButtonProps) {
  return (
    <Link
      className={buttonClassName(variant, size, `transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98] ${className}`)}
      {...props}
    />
  );
}
