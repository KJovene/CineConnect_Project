import React from "react";
import { Outlet, useRouterState } from "@tanstack/react-router";
import { useFilmsByCategory } from "@/hooks/useFilmsByCategory";
import { CategoryCarousel } from "@/components/organisms";
import type { CategorySection } from "@cineconnect/shared";

const Film: React.FC = () => {
  // Détecter si on est sur la route enfant /film/$id
  // Si oui, déléguer le rendu à <Outlet /> (FilmDetail)
  const isOnDetail = useRouterState({
    select: (s) =>
      s.matches.some((m) => m.routeId === "/_authenticated/film/$id"),
  });

  // ⚠️ Le hook doit être avant tout return conditionnel (règles de React)
  const { data: sections, isLoading, error } = useFilmsByCategory(24);

  if (isOnDetail) return <Outlet />;

  return (
    <div className="mt-18 min-h-screen" style={{ background: "var(--color-bg)" }}>
      <div className="px-4 pt-6 pb-4 md:px-8 md:pt-10 md:pb-6">
        <h1
          className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight"
          style={{ color: "var(--color-text)" }}
        >
          Explorer par catégorie
        </h1>
        <p className="mt-2 text-sm sm:text-base" style={{ color: "var(--color-text-muted)" }}>
          Découvrez des films triés par genre — naviguez dans chaque section
        </p>
      </div>

      <div className="px-4 pb-10 md:px-8 md:pb-16">

        {isLoading && (
          <div className="space-y-10">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div
                  className="h-7 w-40 rounded mb-6"
                  style={{ background: "var(--color-border)" }}
                />
                <div className="flex gap-3 md:gap-4">
                  {Array.from({ length: 8 }).map((_, j) => (
                    <div
                      key={j}
                      className="shrink-0 aspect-2/3 rounded-xl"
                      style={{
                        background: "var(--color-surface)",
                        width: "calc((100% - (7 * 1rem)) / 8)",
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="text-center py-20">
            <p className="text-red-400 text-lg">
              Erreur lors du chargement des films
            </p>
            <p className="text-sm mt-2" style={{ color: "var(--color-text-muted)" }}>
              Veuillez réessayer plus tard
            </p>
          </div>
        )}

        {sections &&
          sections.map((section: CategorySection) => (
            <CategoryCarousel
              key={section.category.category_id}
              genre={section.category.name}
              films={section.films}
            />
          ))}
      </div>
    </div>
  );
};

export default Film;