import clsx from 'clsx';
import Link from 'next/link';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline';
type Size = 'sm' | 'md' | 'lg';

const baseStyles =
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime/70 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-gray-950 active:scale-95';

const sizeStyles: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 sm:px-5 py-2 text-xs sm:text-sm',
  lg: 'px-6 py-3 text-sm sm:text-base',
};

const variantStyles: Record<Variant, string> = {
  primary:
    'bg-brand-lime text-brand-gray-950 shadow-glow hover:bg-brand-green hover:text-brand-gray-950 disabled:opacity-60 disabled:cursor-not-allowed',
  secondary:
    'border border-brand-gray-700 bg-brand-gray-900 text-brand-gray-200 hover:border-brand-lime/60 hover:text-brand-lime disabled:opacity-60 disabled:cursor-not-allowed',
  ghost: 'text-brand-gray-300 hover:text-brand-lime hover:bg-brand-gray-900/60 disabled:opacity-60 disabled:cursor-not-allowed',
  outline: 'border border-brand-gray-600 text-brand-gray-200 hover:border-brand-lime hover:text-brand-lime hover:bg-brand-gray-900/30 disabled:opacity-60 disabled:cursor-not-allowed',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
}

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  icon,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(baseStyles, sizeStyles[size], variantStyles[variant], className)}
      {...props}
    >
      {icon && <span className="text-base sm:text-lg">{icon}</span>}
      <span>{children}</span>
    </button>
  );
}

interface ButtonLinkProps {
  href: string;
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  className?: string;
}

export function ButtonLink({ href, children, variant = 'primary', size = 'md', icon, className }: ButtonLinkProps) {
  return (
    <Link className={clsx(baseStyles, sizeStyles[size], variantStyles[variant], className)} href={href}>
      {icon && <span className="text-base sm:text-lg">{icon}</span>}
      <span>{children}</span>
    </Link>
  );
}
