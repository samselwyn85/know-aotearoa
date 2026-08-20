import { createFileRoute } from "@tanstack/react-router";
import { EconProfile } from "@/components/econ-profile";

export const Route = createFileRoute("/profile/$slug")({ component: Page });

function Page() {
  const { slug } = Route.useParams();
  return <EconProfile slug={slug} />;
}
