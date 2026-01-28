import { createFileRoute, redirect, isRedirect } from "@tanstack/react-router";
import { getSession } from "@/lib/auth-client";
import Home from "@/page/Home";

export const Route = createFileRoute("/")({
  beforeLoad: async () => {
    try {
      const { data } = await getSession();
      if (!data?.session) throw redirect({ to: "/login", replace: true });
    } catch (e) {
      if (isRedirect(e)) throw e;
      throw redirect({ to: "/login", replace: true });
    }
  },
  component: Home,
});
