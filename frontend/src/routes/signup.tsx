import { createFileRoute } from "@tanstack/react-router";
import SignupPage from "@/page/Signup";

export const Route = createFileRoute("/signup")({
  component: SignupPage,
});
