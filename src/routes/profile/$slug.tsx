import { createFileRoute } from "@tanstack/react-router";
import { EconProfile } from "@/components/econ-profile";
import { TABS, type ProfileTab } from "@/lib/economy";

function parseRoom(search: Record<string, unknown>): { room?: ProfileTab } {
  const room = search.room;
  if (typeof room === "string" && TABS.some((t) => t.id === room)) {
    return { room: room as ProfileTab };
  }
  return {};
}

export const Route = createFileRoute("/profile/$slug")({
  validateSearch: parseRoom,
  component: Page,
});

function Page() {
  const { slug } = Route.useParams();
  const { room } = Route.useSearch();
  return <EconProfile slug={slug} initialTab={room} />;
}
