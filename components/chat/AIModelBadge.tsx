import clsx from 'clsx';
import { AI_MODEL_CONFIG, type AIModelType } from '@/lib/constants';

interface AIModelBadgeProps {
  model?: AIModelType | 'unknown';
  isLoading?: boolean;
}

export function AIModelBadge({ model, isLoading }: AIModelBadgeProps) {
  if (isLoading) {
    return null;
  }

  const modelKey = (model && model in AI_MODEL_CONFIG ? model : 'default') as keyof typeof AI_MODEL_CONFIG;
  const info = AI_MODEL_CONFIG[modelKey];

  return (
    <div className={clsx(
      'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border',
      info.color
    )}>
      <span>{info.icon}</span>
      <span>Mix AI</span>
    </div>
  );
}
