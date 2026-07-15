"use client";

import { useState, useRef, useEffect } from "react";
import { useLanguage, type Locale } from "@/lib/i18n";

const LANGUAGES: { locale: Locale; label: string; flag: string }[] = [
  { locale: "en", label: "English", flag: "🇺🇸" },
  { locale: "pt-BR", label: "Português", flag: "🇧🇷" },
  { locale: "es", label: "Español", flag: "🇪🇸" },
];

export function LanguageToggle() {
  const { locale, setLocale } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = LANGUAGES.find((l) => l.locale === locale) ?? LANGUAGES[0];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={`Select language: ${current.label}`}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        title={current.label}
        className="flex items-center gap-1.5 rounded-lg border border-arc-border bg-arc-surface/70 px-2.5 py-1.5 text-lg leading-none transition-colors hover:border-arc-cyan/40 hover:text-arc-text"
      >
        <span aria-hidden="true">{current.flag}</span>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" aria-hidden="true" className={`transition-transform ${open ? "rotate-180" : ""}`}>
          <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1.5 min-w-[130px] overflow-hidden rounded-lg border border-arc-border bg-arc-card shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.locale}
              type="button"
              onClick={() => { setLocale(lang.locale); setOpen(false); }}
              className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-[12px] font-mono transition-colors ${
                locale === lang.locale
                  ? "bg-arc-cyan/10 text-arc-cyan"
                  : "text-arc-muted hover:bg-arc-surface hover:text-arc-text"
              }`}
            >
              <span className="w-6 shrink-0 text-base leading-none" aria-hidden="true">{lang.flag}</span>
              <span>{lang.label}</span>
              {locale === lang.locale && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="ml-auto text-arc-cyan" aria-hidden="true">
                  <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
