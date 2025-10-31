import clsx from 'clsx';
import type { HTMLAttributes } from 'react';

interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: 'lime' | 'gray' | 'orange';
}

export function Tag({ tone = 'gray', className, ...props }: TagProps) {
  const tones = {
    lime: 'bg-brand-lime/15 text-brand-lime border border-brand-lime/30',
    gray: 'bg-brand-gray-900/90 text-brand-gray-300 border border-brand-gray-800/80',
    orange: 'bg-orange-500/15 text-orange-300 border border-orange-400/30',
  } as const;

  return (
    <span
      className={clsx('pill select-none font-medium tracking-wide', tones[tone], className)}
      {...props}
    />
  );
}
