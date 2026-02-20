import { createFileRoute } from "@tanstack/react-router";
import Home from "@/page/Home";

export const Route = createFileRoute("/_authenticated/")({
  component: Home,
});
