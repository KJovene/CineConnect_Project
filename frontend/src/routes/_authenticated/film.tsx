import { createFileRoute } from "@tanstack/react-router";
import Film from "../../page/Film";

export const Route = createFileRoute("/_authenticated/film")({
  component: Film,
});
