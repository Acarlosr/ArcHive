"use client";

import { useLanguage } from "@/lib/i18n";

export function LanguageToggle() {
  const { locale, setLocale } = useLanguage();

  return (
    <div
      aria-label="Language selector"
      className="flex items-center rounded-lg border border-arc-border bg-arc-surface/70 p-1"
    >
      <button
        type="button"
        aria-pressed={locale === "en"}
        onClick={() => setLocale("en")}
        className={`rounded-md px-2.5 py-1.5 text-[11px] font-mono font-semibold transition-colors ${
          locale === "en"
            ? "bg-arc-cyan/15 text-arc-cyan"
            : "text-arc-muted hover:text-arc-text"
        }`}
      >
        EN
      </button>
      <button
        type="button"
        aria-pressed={locale === "pt-BR"}
        onClick={() => setLocale("pt-BR")}
        className={`rounded-md px-2.5 py-1.5 text-[11px] font-mono font-semibold transition-colors ${
          locale === "pt-BR"
            ? "bg-arc-green/15 text-arc-green"
            : "text-arc-muted hover:text-arc-text"
        }`}
      >
        PTBR
      </button>
    </div>
  );
}
