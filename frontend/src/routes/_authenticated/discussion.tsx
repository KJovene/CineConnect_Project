import { createFileRoute } from "@tanstack/react-router";
import Discussion from "@/page/Discussion";

export const Route = createFileRoute("/_authenticated/discussion")({
  validateSearch: (search: Record<string, unknown>) => ({
    friendId: typeof search.friendId === "string" ? search.friendId : undefined,
  }),
  component: Discussion,
});
