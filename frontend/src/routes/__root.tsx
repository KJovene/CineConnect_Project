import { createRootRoute, Outlet } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

const RootLayout = () => (
  <QueryClientProvider client={queryClient}>
    <Outlet />
  </QueryClientProvider>
);

const NotFound = () => (
  <div className="flex items-center justify-center min-h-screen bg-[#050505] text-white">
    <div className="text-center">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <p className="text-neutral-400 mb-6">Page non trouvée</p>
      <a href="/" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors">
        Retour à l'accueil
      </a>
    </div>
  </div>
);

export const Route = createRootRoute({ 
  component: RootLayout,
  notFoundComponent: NotFound,
});
