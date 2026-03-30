import { createFileRoute } from "@tanstack/react-router";
import ResetPasswordPage from "@/page/ResetPassword";

export const Route = createFileRoute("/reset-password")({
  validateSearch: (search: Record<string, unknown>) => ({
    token: (search.token as string) ?? "",
  }),
  component: function ResetPasswordRoute() {
    const { token } = Route.useSearch();
    return <ResetPasswordPage token={token} />;
  },
});