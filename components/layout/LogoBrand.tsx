import Image from 'next/image';
import Link from 'next/link';

interface LogoBrandProps {
  variant?: 'full' | 'mobile';
  className?: string;
}

export function LogoBrand({ variant = 'full', className = '' }: LogoBrandProps) {
  const logoContent = (
    <>
      <Image
        src="/MixandMunch_LOGO.png"
        alt="Mix & Munch Logo"
        width={40}
        height={40}
        className="h-8 sm:h-10 w-8 sm:w-10 flex-shrink-0"
        priority
      />
      {variant === 'full' && (
        <span className="hidden sm:block leading-tight">
          Mix &amp; Munch
          <span className="block text-xs font-normal uppercase tracking-widest text-brand-gray-400">
            Filipino AI Kitchen
          </span>
        </span>
      )}
      {variant === 'mobile' && (
        <span className="sm:hidden leading-tight">
          <div className="text-brand-lime font-bold">Mix</div>
          <div className="text-xs text-brand-gray-400 font-normal">Munch</div>
        </span>
      )}
    </>
  );

  return (
    <Link
      href="/"
      className={`flex items-center gap-2 sm:gap-3 text-sm sm:text-base font-semibold text-brand-lime transition hover:text-brand-green flex-shrink-0 ${className}`}
    >
      {logoContent}
    </Link>
  );
}
