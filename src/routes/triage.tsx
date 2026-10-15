import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AlertTriangle, Lock, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { triage, LEVELS, type TriageResult } from "@/lib/triage";

export const Route = createFileRoute("/triage")({
  head: () => ({
    meta: [
      { title: "Triage a patient — TriageDesk" },
      { name: "description", content: "Enter vitals and complaint to get a triage level, department and red flags." },
      { property: "og:title", content: "Triage a patient — TriageDesk" },
      { property: "og:description", content: "Enter vitals and complaint to get a triage level, department and red flags." },
    ],
  }),
  component: TriagePage,
});

const EMPTY = { age: "", systolic: "", diastolic: "", pulse: "", tempC: "", spo2: "", complaint: "" };
const num = (s: string) => (s.trim() === "" ? undefined : Number(s));

function TriagePage() {
  const { user, loading } = useAuth();
  const [f, setF] = useState(EMPTY);
  const [result, setResult] = useState<TriageResult | null>(null);

  if (loading) return <div className="py-24 text-center text-muted-foreground">Loading…</div>;
  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <Lock className="mx-auto h-10 w-10 text-primary" />
        <h1 className="mt-4 text-3xl font-bold">Please log in</h1>
        <p className="mt-2 text-muted-foreground">You need an account to use the triage tool.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Button asChild variant="outline"><Link to="/login">Log in</Link></Button>
          <Button asChild><Link to="/register">Register</Link></Button>
        </div>
      </div>
    );
  }

  const set = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setResult(triage({ age: num(f.age), systolic: num(f.systolic), diastolic: num(f.diastolic), pulse: num(f.pulse), tempC: num(f.tempC), spo2: num(f.spo2), complaint: f.complaint }));
  };

  const fields: [keyof typeof EMPTY, string, string][] = [
    ["age", "Age (years)", "45"], ["systolic", "BP systolic", "120"], ["diastolic", "BP diastolic", "80"],
    ["pulse", "Pulse (bpm)", "82"], ["tempC", "Temp (°C)", "37.2"], ["spo2", "SpO₂ (%)", "97"],
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold sm:text-4xl">New patient</h1>
      <p className="mt-1 text-muted-foreground">Leave a field empty if it wasn't measured.</p>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        <form onSubmit={submit} className="space-y-5 rounded-2xl border bg-card p-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {fields.map(([k, label, ph]) => (
              <div key={k} className="space-y-1.5">
                <Label htmlFor={k}>{label}</Label>
                <Input id={k} type="number" inputMode="decimal" step="any" placeholder={ph} value={f[k]} onChange={set(k)} className="h-11" />
              </div>
            ))}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="complaint">Chief complaint (patient's words)</Label>
            <Textarea id="complaint" rows={4} placeholder="e.g. seene mein dard since morning, sweating" value={f.complaint} onChange={set("complaint")} />
          </div>
          <div className="flex gap-3">
            <Button type="submit" size="lg" className="flex-1">Assess patient</Button>
            <Button type="button" size="lg" variant="outline" onClick={() => { setF(EMPTY); setResult(null); }} aria-label="Reset form"><RotateCcw className="h-4 w-4" /></Button>
          </div>
        </form>
        <div aria-live="polite">{result ? <ResultCard r={result} /> : (
          <div className="grid h-full min-h-60 place-items-center rounded-2xl border border-dashed p-6 text-center text-muted-foreground">Result will appear here.</div>
        )}</div>
      </div>
    </div>
  );
}

function ResultCard({ r }: { r: TriageResult }) {
  if (r.abstain || r.level === null) {
    return (
      <div className="rounded-2xl border-2 border-accent bg-card p-6">
        <AlertTriangle className="h-8 w-8 text-accent-foreground" />
        <h2 className="mt-3 text-2xl font-bold">Cannot assess — send to nurse now</h2>
        <ul className="mt-3 list-disc pl-5 text-sm text-muted-foreground">{r.notes.map((n) => <li key={n}>{n}</li>)}</ul>
      </div>
    );
  }
  const lv = LEVELS[r.level];
  return (
    <div className={`overflow-hidden rounded-2xl border-2 bg-card border-level-${r.level}`}>
      <div className={`flex items-center gap-4 p-6 text-primary-foreground bg-level-${r.level}`}>
        <span className="font-display text-5xl font-extrabold">{r.level}</span>
        <div><p className="text-xl font-bold">{lv.name}</p><p className="text-sm opacity-90">See within: {lv.wait}</p></div>
      </div>
      <div className="space-y-4 p-6">
        <div><p className="text-xs font-semibold uppercase text-muted-foreground">Department</p><p className="text-lg font-semibold">{r.department}</p></div>
        {r.redFlags.length > 0 && (
          <div><p className="text-xs font-semibold uppercase text-muted-foreground">Red flags</p>
            <div className="mt-1 flex flex-wrap gap-2">{r.redFlags.map((x) => <span key={x} className="rounded-full bg-destructive/10 px-3 py-1 text-sm font-medium text-destructive">{x}</span>)}</div>
          </div>
        )}
        {r.rulesFired.length > 0 && (
          <div><p className="text-xs font-semibold uppercase text-muted-foreground">Safety rules triggered</p>
            <ul className="mt-1 list-disc pl-5 text-sm">{r.rulesFired.map((x) => <li key={x}>{x}</li>)}</ul>
          </div>
        )}
        {r.notes.length > 0 && <ul className="list-disc pl-5 text-sm text-muted-foreground">{r.notes.map((n) => <li key={n}>{n}</li>)}</ul>}
      </div>
    </div>
  );
}
