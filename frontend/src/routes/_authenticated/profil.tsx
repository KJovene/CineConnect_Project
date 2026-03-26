import { createFileRoute } from "@tanstack/react-router";
import Profil from "@/page/Profil";

export const Route = createFileRoute("/_authenticated/profil")({
  component: Profil,
});
