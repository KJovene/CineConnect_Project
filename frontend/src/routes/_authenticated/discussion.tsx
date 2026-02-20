import { createFileRoute } from "@tanstack/react-router";
import Discussion from "@/page/Discussion";

export const Route = createFileRoute("/_authenticated/discussion")({
  component: Discussion,
});
