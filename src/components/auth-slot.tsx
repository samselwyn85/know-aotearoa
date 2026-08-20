import { Link } from "@tanstack/react-router";
import { UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export function AuthSlot() {
  const { user, isPending } = useCurrentUserState();
  if (isPending) {
    return <div className="h-9 w-20 animate-pulse rounded-full bg-hair/80" />;
  }
  if (user) return <UserButton />;
  return (
    <Link
      to="/login"
      className="rounded-full border border-hair bg-panel px-3 py-2 text-sm font-medium text-ink transition hover:border-lagoon hover:text-lagoon"
    >
      Sign in
    </Link>
  );
}
