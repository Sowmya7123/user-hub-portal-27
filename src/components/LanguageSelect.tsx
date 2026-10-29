import { Globe } from "lucide-react";
import { LANGS } from "@/lib/change-i18n";
import { useLanguage } from "@/hooks/use-language";

export function LanguageSelect() {
  const { lang, setLang, t } = useLanguage();
  return (
    <label className="flex items-center gap-1.5 text-sm">
      <Globe className="h-4 w-4 shrink-0 text-muted-foreground" />
      <span className="sr-only">{t("langLabel")}</span>
      <select
        value={lang}
        onChange={(e) => setLang(e.target.value)}
        className="h-9 max-w-36 rounded-lg border bg-background px-2 text-sm text-foreground"
      >
        {LANGS.map((l) => (
          <option key={l.code} value={l.code}>{l.name}</option>
        ))}
      </select>
    </label>
  );
}
