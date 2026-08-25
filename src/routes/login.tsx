import { createFileRoute, Link } from "@tanstack/react-router";
import { GROK_PROVIDERS, authEnabled, signIn } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/login")({ component: Login });

export function Login() {
  const offline = import.meta.env.VITE_OFFLINE === "true";
  return (
    <main className="grid min-h-dvh place-items-center bg-paper px-6 py-12 text-ink">
      <div className="w-full max-w-sm">
        <p className="font-display text-sm tracking-wide text-lagoon">Know Aotearoa</p>
        <h1 className="mt-2 font-display text-4xl font-medium tracking-tight">Sign in</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Save a link from any device. The explorer itself stays public — no account required to read
          the numbers.
        </p>
        <div className="mt-8 space-y-3">
          {authEnabled || offline ? (
            GROK_PROVIDERS.map((p) => (
              <Button
                key={p.providerId}
                variant="secondary"
                className="w-full"
                onClick={() => {
                  if (offline) {
                    window.location.href = "https://know-aotearoa.vercel.app/login";
                    return;
                  }
                  void signIn(p.providerId, { callbackURL: "/" });
                }}
              >
                Continue with {p.label}
              </Button>
            ))
          ) : (
            <p className="text-sm text-muted">Sign-in is disabled.</p>
          )}
        </div>
        <Link
          to="/"
          className="mt-8 inline-block text-sm font-medium text-lagoon underline-offset-4 hover:underline"
        >
          Back to the map
        </Link>
      </div>
    </main>
  );
}
