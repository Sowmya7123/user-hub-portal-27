import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { LANGS, RTL, type CKey } from "@/lib/change-i18n";
import { SITE, type SKey } from "@/lib/site-i18n";

export type TKey = CKey | SKey;

// One merged dictionary per language: site strings + Patient Change Intelligence strings.
const MERGED: Record<string, Partial<Record<TKey, string>>> = {};
for (const l of LANGS) MERGED[l.code] = { ...SITE[l.code], ...l.t };

type LangCtx = { lang: string; setLang: (code: string) => void; t: (key: TKey) => string; rtl: boolean };

const LanguageCtx = createContext<LangCtx>({
  lang: "en",
  setLang: () => {},
  t: (k) => MERGED.en?.[k] ?? String(k),
  rtl: false,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Start in English, then read the saved choice in an effect to avoid hydration mismatches.
  const [lang, setLangState] = useState("en");
  useEffect(() => {
    try {
      const saved = localStorage.getItem("triagedesk-lang");
      if (saved && MERGED[saved]) setLangState(saved);
    } catch { /* storage unavailable */ }
  }, []);
  const setLang = (code: string) => {
    setLangState(code);
    try { localStorage.setItem("triagedesk-lang", code); } catch { /* storage unavailable */ }
  };
  const rtl = RTL.has(lang);
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = rtl ? "rtl" : "ltr";
  }, [lang, rtl]);
  const t = (key: TKey) => MERGED[lang]?.[key] ?? MERGED.en?.[key] ?? String(key);
  return <LanguageCtx.Provider value={{ lang, setLang, t, rtl }}>{children}</LanguageCtx.Provider>;
}

export function useLanguage() {
  return useContext(LanguageCtx);
}

export const LANG_CODES = LANGS.map((l) => l.code);
