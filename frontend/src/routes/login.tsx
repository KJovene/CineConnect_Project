import { createFileRoute } from "@tanstack/react-router";
import LoginPage from "@/page/Login";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});
