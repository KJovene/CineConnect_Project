import { createFileRoute } from "@tanstack/react-router";
import FilmDetailPage from "@/page/FilmDetail";

export const Route = createFileRoute("/_authenticated/film/$id")({
  component: FilmDetailPage,
});
