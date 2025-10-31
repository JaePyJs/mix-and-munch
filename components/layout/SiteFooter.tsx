import Link from 'next/link';
import Image from 'next/image';
import { FOOTER_EXPLORE_LINKS, FOOTER_CONTACT_EMAIL } from '@/lib/constants';

export function SiteFooter() {
  return (
    <footer className="border-t border-brand-gray-900/80 bg-brand-gray-950/80 py-8 sm:py-10">
      <div className="page-grid grid gap-6 sm:gap-10 grid-cols-1 sm:grid-cols-2 md:grid-cols-[2fr,1fr,1fr]">
        {/* Brand section */}
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center gap-2 sm:gap-3 text-brand-lime">
            <Image
              src="/MixandMunch_LOGO.png"
              alt="Mix & Munch Logo"
              width={32}
              height={32}
              className="h-8 sm:h-10 w-8 sm:w-10 flex-shrink-0"
            />
            <div className="text-xs sm:text-sm uppercase tracking-widest text-brand-gray-400">
              Capstone Kitchen
            </div>
          </div>
          <p className="max-w-md text-xs sm:text-sm text-brand-gray-400 leading-relaxed">
            Mix &amp; Munch brings modern Filipino cuisine to life with pantry-aware recipes, AI-powered guidance, and chef transcripts.
          </p>
          <p className="text-xs text-brand-gray-500">
            Gemini 2.5 Pro + GLM 4.6 AI-powered Filipino recipe assistant.
          </p>
        </div>

        {/* Explore links */}
        <div className="min-w-0">
          <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-brand-gray-400 mb-3">Explore</h3>
          <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
            {FOOTER_EXPLORE_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-brand-gray-300 transition hover:text-brand-lime"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div className="min-w-0">
          <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-brand-gray-400 mb-3">Contact</h3>
          <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-brand-gray-300">
            <li>
              <a href={`mailto:${FOOTER_CONTACT_EMAIL}`} className="transition hover:text-brand-lime break-all">
                {FOOTER_CONTACT_EMAIL}
              </a>
            </li>
            <li className="text-brand-gray-500 text-xs">
              Capstone Portfolio
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="page-grid mt-6 sm:mt-10 border-t border-brand-gray-900/60 pt-4 sm:pt-6 text-xs text-brand-gray-500 text-center sm:text-left">
        © {new Date().getFullYear()} Mix &amp; Munch Studio. Crafted in the Philippines with flavor and code.
      </div>
    </footer>
  );
}
