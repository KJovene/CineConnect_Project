import { createFileRoute } from '@tanstack/react-router';
import SearchFilm from "@/page/SearchFilm";

export const Route = createFileRoute("/_authenticated/search")({
  component: SearchFilm,
});
