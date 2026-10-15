import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/how-it-works", label: "How it works" },
  { to: "/triage", label: "Triage" },
  { to: "/about", label: "About" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const signOut = async () => {
    await supabase.auth.signOut();
    setOpen(false);
    navigate({ to: "/login", replace: true });
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link to="/" className="flex min-w-0 items-center gap-2 font-display text-lg font-bold">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Activity className="h-5 w-5" />
          </span>
          <span className="truncate">TriageDesk</span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              activeProps={{ className: "bg-secondary text-secondary-foreground" }} activeOptions={{ exact: true }}>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              <span className="max-w-40 truncate text-sm text-muted-foreground">{user.email}</span>
              <Button variant="outline" size="sm" onClick={signOut}>Sign out</Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm"><Link to="/login">Log in</Link></Button>
              <Button asChild size="sm"><Link to="/register">Register</Link></Button>
            </>
          )}
        </div>
        <button className="rounded-lg p-2 md:hidden" aria-label="Toggle menu" onClick={() => setOpen(!open)}>
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      {open && (
        <div className="border-t bg-background px-4 pb-4 md:hidden">
          <nav className="flex flex-col py-2">
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="rounded-lg px-3 py-3 text-base font-medium hover:bg-muted">
                {n.label}
              </Link>
            ))}
          </nav>
          {user ? (
            <Button variant="outline" className="w-full" onClick={signOut}>Sign out</Button>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Button asChild variant="outline"><Link to="/login" onClick={() => setOpen(false)}>Log in</Link></Button>
              <Button asChild><Link to="/register" onClick={() => setOpen(false)}>Register</Link></Button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:justify-between">
        <p>© 2026 TriageDesk — decision support, not a diagnosis.</p>
        <p>Always escalate to a clinician when in doubt.</p>
      </div>
    </footer>
  );
}
