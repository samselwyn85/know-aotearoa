import { createFileRoute } from "@tanstack/react-router";
import { Explorer } from "@/components/explorer";

export const Route = createFileRoute("/place/$slug")({ component: PlacePage });

function PlacePage() {
  const { slug } = Route.useParams();
  return <Explorer initialSlug={slug} />;
}
