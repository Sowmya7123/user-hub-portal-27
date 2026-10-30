import { useState } from "react";
import { Clock, ShieldAlert, Info, GitCompare, Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { triage, type TriageResult } from "@/lib/triage";
import { compare, FIELD_LABELS, guard, reviewReasons, type RawInputs } from "@/lib/change-intel";
import { LANGS, RTL } from "@/lib/change-i18n";

export type Snapshot = { at: Date; inputs: RawInputs; result: TriageResult };

const num = (s: string) => (s.trim() === "" ? undefined : Number(s));
export const runTriage = (f: RawInputs) =>
  triage({ age: num(f.age), systolic: num(f.systolic), diastolic: num(f.diastolic), pulse: num(f.pulse), tempC: num(f.tempC), spo2: num(f.spo2), complaint: f.complaint });

const fmt = (d: Date) => d.toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
const lvl = (r: TriageResult) => (r.level === null ? "Not assessed" : `Level ${r.level}`);

export function PatientChangePanel({ baseline }: { baseline: Snapshot }) {
  const [lang, setLang] = useState("en");
  const L = LANGS.find((l) => l.code === lang) ?? LANGS[0]!;
  const t = L.t;
  const [onset, setOnset] = useState("");
  const [changes, setChanges] = useState<{ at: Date; text: string }[]>([]);
  const [changeText, setChangeText] = useState("");
  const [followUps, setFollowUps] = useState<Snapshot[]>([]);
  const [fu, setFu] = useState<RawInputs>({ ...baseline.inputs, complaint: "" });

  // Voice recording states for both sections
  const [isListeningMain, setIsListeningMain] = useState(false);
  const [isListeningFu, setIsListeningFu] = useState(false);

  // Reusable Speech Recognition Helper
  const startVoiceInput = (onResultText: (text: string) => void, setIsActive: (val: boolean) => void) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Google Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US'; // English text conversion
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsActive(true);
    recognition.onresult = (event) => {
      const speechToText = event.results[0][0].transcript;
      onResultText(speechToText);
    };
    recognition.onerror = () => setIsActive(false);
    recognition.onend = () => setIsActive(false);

    recognition.start();
  };

  const history = [baseline, ...followUps];
  const latest = history[history.length - 1] ?? baseline;
  const previous = history.length > 1 ? (history[history.length - 2] ?? null) : null;
  const g = guard(latest.inputs, { onset });
  const reasons = reviewReasons(latest.result, g);

  const addChange = () => {
    const text = changeText.trim().slice(0, 500);
    if (!text) return;
    setChanges([...changes, { at: new Date(), text }]);
    setChangeText("");
  };

  const recordFollowUp = (e: React.FormEvent) => {
    e.preventDefault();
    const inputs = { ...fu, complaint: fu.complaint.trim().slice(0, 1000) };
    setFollowUps([...followUps, { at: new Date(), inputs, result: runTriage(inputs) }]);
    setFu({ ...inputs, complaint: "" });
  };

  const vitalKeys = ["age", "systolic", "diastolic", "pulse", "tempC", "spo2"] as const;

  return (
    <section dir={RTL.has(lang) ? "rtl" : "ltr"} className="mt-10 space-y-6 rounded-2xl border bg-card p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold">{t.title}</h2>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Language</span>
          <select value={lang} onChange={(e) => setLang(e.target.value)} className="h-10 rounded-lg border bg-background px-3">
            {LANGS.map((l) => <option key={l.code} value={l.code}>{l.name}</option>)}
          </select>
        </label>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Timeline */}
        <div className="space-y-4">
          <h3 className="flex items-center gap-2 text-lg font-semibold"><Clock className="h-5 w-5 text-primary" />{t.timeline}</h3>
          <div className="space-y-1.5">
            <Label htmlFor="onset">{t.onset}</Label>
            <Input id="onset" type="datetime-local" value={onset} onChange={(e) => setOnset(e.target.value)} className="h-11" />
          </div>
          <div className="rounded-xl bg-muted p-3 text-sm">
            <p className="text-xs font-semibold uppercase text-muted-foreground">{t.original} · {fmt(baseline.at)}</p>
            <p className="mt-1">{baseline.inputs.complaint || "—"}</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="chg">{t.changes}</Label>
            <div className="flex gap-2">
              <Input id="chg" value={changeText} maxLength={500} onChange={(e) => setChangeText(e.target.value)} placeholder="e.g. pain spread to left arm" className="h-11" />
              <Button type="button" variant="outline" onClick={addChange} disabled={!changeText.trim()}>{t.addChange}</Button>
            </div>
            {changes.length > 0 && (
              <ol className="mt-2 space-y-1 border-s-2 border-primary ps-3 text-sm">
                {changes.map((c, i) => <li key={i}><span className="text-muted-foreground">{fmt(c.at)}:</span> {c.text}</li>)}
              </ol>
            )}
          </div>
          <div className="rounded-xl bg-muted p-3 text-sm">
            <p className="text-xs font-semibold uppercase text-muted-foreground">{t.current} · {fmt(latest.at)}</p>
            <p className="mt-1">{latest.inputs.complaint || "—"}</p>
          </div>
        </div>

        {/* Guard + Explain */}
        <div className="space-y-4">
          <h3 className="flex items-center gap-2 text-lg font-semibold"><ShieldAlert className="h-5 w-5 text-primary" />{t.guard}</h3>
          {g.empty.length + g.invalid.length + g.missingInfo.length === 0 ? (
            <p className="text-sm text-muted-foreground">No empty fields, unusable values or missing timeline information detected.</p>
          ) : (
            <ul className="space-y-1 text-sm">
              {g.empty.length > 0 && <li><b>Empty:</b> {g.empty.join(", ")}</li>}
              {g.invalid.length > 0 && <li className="text-destructive"><b>Invalid:</b> {g.invalid.join("; ")}</li>}
              {g.missingInfo.map((m) => <li key={m}><b>Missing:</b> {m}</li>)}
            </ul>
          )}

          <h3 className="flex items-center gap-2 text-lg font-semibold"><Info className="h-5 w-5 text-primary" />{t.explain}</h3>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm sm:grid-cols-3">
            {vitalKeys.map((k) => (
              <div key={k}><dt className="text-xs text-muted-foreground">{FIELD_LABELS[k]}</dt><dd className="font-medium">{latest.inputs[k] || "—"}</dd></div>
            ))}
          </dl>
          <p className="text-sm"><b>Result:</b> {lvl(latest.result)} · {latest.result.department}</p>
          {reasons.length > 0 && (
            <ul className="list-disc ps-5 text-sm">{reasons.map((r) => <li key={r}>{r}</li>)}</ul>
          )}
          <p className="rounded-lg border-2 border-accent p-3 text-sm font-medium">{t.review}: this is decision support only. Final urgency must be confirmed by a clinician.</p>
        </div>
      </div>

      {/* Follow-up */}
      <form onSubmit={recordFollowUp} className="space-y-4 border-t pt-6">
        <h3 className="text-lg font-semibold">{t.followUp}</h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {vitalKeys.map((k) => (
            <div key={k} className="space-y-1.5">
              <Label htmlFor={`fu-${k}`}>{FIELD_LABELS[k]}</Label>
              <Input id={`fu-${k}`} type="number" inputMode="decimal" step="any" value={fu[k]} onChange={(e) => setFu({ ...fu, [k]: e.target.value })} className="h-11" />
            </div>
          ))}
        </div>
        
        {/* Chief Complaint Box with Integrated Voice Button */}
        <div className="space-y-1.5 relative">
          <div className="flex justify-between items-center">
            <Label htmlFor="fu-c">{t.current}</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => startVoiceInput(
                (spokenText) => setFu((prev) => ({ ...prev, complaint: prev.complaint ? prev.complaint + " " + spokenText : spokenText })),
                setIsListeningFu
              )}
              className={`flex items-center gap-1 h-8 px-3 text-xs ${isListeningFu ? 'bg-red-500 text-white animate-pulse' : ''}`}
            >
              {isListeningFu ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5 text-primary" />}
              {isListeningFu ? "Listening..." : "Speak Complaint"}
            </Button>
          </div>
          <Textarea 
            id="fu-c" 
            rows={2} 
            maxLength={1000} 
            value={fu.complaint} 
            onChange={(e) => setFu({ ...fu, complaint: e.target.value })} 
            placeholder="Type or click 'Speak Complaint' to talk..."
          />
        </div>

        <Button type="submit">{t.save}</Button>
      </form>

      {previous && (
        <div className="space-y-3 border-t pt-6">
          <h3 className="flex items-center gap-2 text-lg font-semibold"><GitCompare className="h-5 w-5 text-primary" />{t.compare}</h3>
          <p className="text-sm text-muted-foreground">{fmt(previous.at)} → {fmt(latest.at)}</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-start text-muted-foreground"><th className="py-1 text-start">Field</th><th className="text-start">Previous</th><th className="text-start">Latest</th></tr></thead>
              <tbody>
                <tr className="border-t"><td className="py-1">Triage result</td><td>{lvl(previous.result)}</td><td className="font-semibold">{lvl(latest.result)}</td></tr>
                {compare(previous.inputs, latest.inputs).map((d) => (
                  <tr key={d.field} className="border-t"><td className="py-1">{d.field}</td><td>{d.before}</td><td className="font-semibold">{d.after}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <details className="text-sm">
            <summary className="cursor-pointer text-muted-foreground">All recorded assessments ({history.length})</summary>
            <ol className="mt-2 space-y-1">
              {history.map((h, i) => <li key={i}>{fmt(h.at)} — {lvl(h.result)} — {h.inputs.complaint || "—"}</li>)}
            </ol>
          </details>
        </div>
      )}
    </section>
  );
}