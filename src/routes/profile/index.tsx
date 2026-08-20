import { createFileRoute } from "@tanstack/react-router";
import { EconPicker } from "@/components/econ-profile";

export const Route = createFileRoute("/profile/")({ component: Page });

function Page() {
  return <EconPicker />;
}
