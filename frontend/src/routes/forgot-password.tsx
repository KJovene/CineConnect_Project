import { createFileRoute } from "@tanstack/react-router";
import ForgotPasswordPage from "@/page/ForgotPassword";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPasswordPage,
});