import { createFileRoute } from "@tanstack/react-router";
import CategoryDetail from "@/page/CategoryDetail";

export const Route = createFileRoute(
  "/_authenticated/film/category/$categoryId",
)({
  validateSearch: (search: Record<string, unknown>) => ({
    name: typeof search.name === "string" ? search.name : undefined,
  }),
  component: CategoryDetail,
});
