import type { ReactNode } from "react";
import { toast } from "sonner";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";

export function AuthCard({ title, subtitle, children, footer }: { title: string; subtitle: string; children: ReactNode; footer: ReactNode }) {
  const google = async () => {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (r.error) toast.error("Google sign-in failed. Please try again.");
  };
  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-14">
      <div className="rounded-2xl border bg-card p-6 shadow-soft sm:p-8">
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="mt-1 text-muted-foreground">{subtitle}</p>
        <Button type="button" variant="outline" className="mt-6 h-11 w-full" onClick={google}>Continue with Google</Button>
        <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> or with email <span className="h-px flex-1 bg-border" />
        </div>
        {children}
      </div>
      <p className="mt-5 text-center text-sm text-muted-foreground">{footer}</p>
    </div>
  );
}
