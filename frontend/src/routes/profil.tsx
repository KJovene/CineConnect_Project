import { createFileRoute, redirect, isRedirect } from '@tanstack/react-router';
import { getSession } from '@/lib/auth-client';
import Profil from '@/page/Profil';

export const Route = createFileRoute('/profil')({
  beforeLoad: async () => {
    try {
      const { data } = await getSession();
      if (!data?.session) throw redirect({ to: '/login', replace: true });
    } catch (e) {
      if (isRedirect(e)) throw e;
      throw redirect({ to: '/login', replace: true });
    }
  },
  component: Profil,
});
