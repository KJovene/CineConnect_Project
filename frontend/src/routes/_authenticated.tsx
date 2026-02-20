import {
  createFileRoute,
  Outlet,
  redirect,
  isRedirect,
} from "@tanstack/react-router";
import { AppLayout } from "@/components/templates";
import type { SidebarNavSection } from "@/components/organisms";
import { useAuth } from "@/hooks/useAuth";
import {
  HiOutlineFilm,
  HiOutlinePlayCircle,
  HiOutlineUsers,
  HiOutlineChatBubbleLeftRight,
} from "react-icons/hi2";
import { getSession, useSession } from "@/lib/auth-client";

const SIDEBAR_SECTIONS: SidebarNavSection[] = [
  {
    title: "Exploration",
    items: [
      {
        id: "discover",
        icon: <HiOutlineFilm size={20} />,
        label: "Découvrir",
        href: "/",
        isActive: true,
      },
      {
        id: "films",
        icon: <HiOutlineFilm size={20} />,
        label: "Films",
        href: "/films",
      },
      {
        id: "series",
        icon: <HiOutlinePlayCircle size={20} />,
        label: "Séries",
        href: "/series",
      },
      {
        id: "notes",
        icon: <HiOutlinePlayCircle size={20} />,
        label: "Mes Notes",
        href: "/mes-notes",
      },
    ],
  },
  {
    title: "Social",
    items: [
      {
        id: "community",
        icon: <HiOutlineUsers size={20} />,
        label: "Profil",
        href: "/profil",
        showNotification: true,
      },
      {
        id: "discussions",
        icon: <HiOutlineChatBubbleLeftRight size={20} />,
        label: "Discussions",
        href: "/discussion",
      },
    ],
  },
];

const AuthenticatedLayout = () => {
  const { isAuthenticated, isLoading, handleLogout } = useAuth();
  const { data: session } = useSession();

  const currentUser = session?.user;

  return (
    <AppLayout
      sidebarSections={SIDEBAR_SECTIONS}
      user={{
        name: currentUser?.name ?? "Utilisateur",
        badge: "Membre",
        avatar:
          currentUser?.image ??
          `https://i.pravatar.cc/150?u=${currentUser?.id}`,
      }}
      isAuthenticated={isAuthenticated}
      isLoading={isLoading}
      onLogout={handleLogout}
    >
      <Outlet />
    </AppLayout>
  );
};

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async () => {
    try {
      const { data } = await getSession();
      if (!data?.session) throw redirect({ to: "/login", replace: true });
    } catch (e) {
      if (isRedirect(e)) throw e;
      throw redirect({ to: "/login", replace: true });
    }
  },
  component: AuthenticatedLayout,
});
