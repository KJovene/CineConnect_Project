import { useMemo, type ReactNode } from "react";
import { Logo, ThemeToggle } from "@/components/atoms";
import { useTopRatedMovies } from "@/hooks/useTopRatedMovies/useTopRatedMovies";
import { getPosterUrl } from "@/utils/poster";

interface AuthPageLayoutProps {
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthPageLayout({
  title,
  children,
  footer,
}: AuthPageLayoutProps) {
  const COLUMN_COUNT = 7;
  const { data } = useTopRatedMovies(24);

  const posters = useMemo(() => {
    if (!data?.length) return [];

    return data
      .map((film) => getPosterUrl(film.poster_url))
      .filter((poster): poster is string => poster.length > 0);
  }, [data]);

  const repeatedPosters = useMemo(() => {
    if (posters.length === 0) return [];
    const base =
      posters.length >= 12 ? posters : [...posters, ...posters, ...posters];
    return [...base, ...base];
  }, [posters]);

  const columns = useMemo(() => {
    if (repeatedPosters.length === 0) return [] as string[][];

    return Array.from({ length: COLUMN_COUNT }, (_, columnIndex) =>
      repeatedPosters.filter(
        (_, index) => index % COLUMN_COUNT === columnIndex,
      ),
    );
  }, [repeatedPosters, COLUMN_COUNT]);

  const animationClasses = [
    "auth-scroll-up-fast",
    "auth-scroll-down-slow",
    "auth-scroll-up-slow",
    "auth-scroll-down-fast",
    "auth-scroll-up-fast",
    "auth-scroll-down-slow",
    "auth-scroll-up-slow",
  ];

  const columnVisibility = [
    "flex",
    "flex",
    "flex",
    "hidden sm:flex",
    "hidden md:flex",
    "hidden lg:flex",
    "hidden xl:flex",
  ];

  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={{ color: "var(--color-text)" }}
    >
      <style>{`
        @keyframes auth-scroll-up {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }

        @keyframes auth-scroll-down {
          0% { transform: translateY(-50%); }
          100% { transform: translateY(0); }
        }

        .auth-scroll-up-fast { animation: auth-scroll-up 35s linear infinite; }
        .auth-scroll-up-slow { animation: auth-scroll-up 52s linear infinite; }
        .auth-scroll-down-fast { animation: auth-scroll-down 40s linear infinite; }
        .auth-scroll-down-slow { animation: auth-scroll-down 58s linear infinite; }
      `}</style>

      <div
        className="fixed inset-0 z-0 flex items-start justify-center gap-4 p-4 scale-[1.25] -rotate-3 opacity-30 pointer-events-none"
        aria-hidden
      >
        {columns.map((column, columnIndex) => (
          <div
            key={`poster-column-${columnIndex}`}
            className={`${columnVisibility[columnIndex]} flex-col gap-4 w-32 sm:w-44 shrink-0 ${animationClasses[columnIndex]} ${columnIndex === 0 ? "mt-10" : ""} ${columnIndex === 2 ? "mt-20" : ""}`}
          >
            {column.map((poster, posterIndex) => (
              <img
                key={`${columnIndex}-${poster}-${posterIndex}`}
                className="w-full aspect-2/3 object-cover rounded-xl shadow-2xl"
                src={poster}
                alt="Affiche de film"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            ))}
          </div>
        ))}
      </div>

      <div className="fixed inset-0 z-10 bg-black/35" aria-hidden />

      <div className="relative z-20 min-h-screen flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="flex items-center justify-center mb-10">
            <Logo />
          </div>

          <div
            className="relative rounded-2xl p-8"
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
            }}
          >
            <div className="absolute top-4 right-4">
              <ThemeToggle />
            </div>

            <h1
              className="text-xl font-semibold mb-6 text-center"
              style={{ color: "var(--color-text)" }}
            >
              {title}
            </h1>
            {children}
            {footer && <div className="mt-6">{footer}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
