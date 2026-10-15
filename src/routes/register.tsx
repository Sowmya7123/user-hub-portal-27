import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { MailCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthCard } from "@/components/AuthCard";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create account — TriageDesk" },
      { name: "description", content: "Register for a free TriageDesk account." },
      { property: "og:title", content: "Create account — TriageDesk" },
      { property: "og:description", content: "Register for a free TriageDesk account." },
    ],
  }),
  component: Register,
});

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) return toast.error("Password must be at least 6 characters.");
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { emailRedirectTo: window.location.origin, data: { full_name: name } },
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    setSent(true);
  };

  if (sent) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <MailCheck className="mx-auto h-12 w-12 text-primary" />
        <h1 className="mt-4 text-3xl font-bold">Check your email</h1>
        <p className="mt-2 text-muted-foreground">We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account, then log in.</p>
        <Button asChild className="mt-6"><Link to="/login">Go to log in</Link></Button>
      </div>
    );
  }

  return (
    <AuthCard title="Create your account" subtitle="It takes less than a minute." footer={<>Already registered? <Link to="/login" className="font-semibold text-primary hover:underline">Log in</Link></>}>
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} className="h-11" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="h-11" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" autoComplete="new-password" required value={password} onChange={(e) => setPassword(e.target.value)} className="h-11" />
          <p className="text-xs text-muted-foreground">At least 6 characters.</p>
        </div>
        <Button type="submit" className="h-11 w-full" disabled={busy}>{busy ? "Creating…" : "Create account"}</Button>
      </form>
    </AuthCard>
  );
}
