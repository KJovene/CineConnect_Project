import React from "react";
import { Link } from "@tanstack/react-router";
import { Route } from "@/routes/_authenticated/film.category.$categoryId";
import { useFilmsByCategoryId } from "@/hooks/useFilmsByCategoryId";
import { MovieCard } from "@/components/molecules";
import { HiArrowLeft } from "react-icons/hi2";

const CategoryDetail: React.FC = () => {
  const { categoryId } = Route.useParams();
  const { name } = Route.useSearch();
  const { data: films, isLoading, error } = useFilmsByCategoryId(Number(categoryId));

  return (
    <div className="mt-18 min-h-screen" style={{ background: "var(--color-bg)" }}>
      <div className="px-4 pt-6 pb-4 md:px-8 md:pt-10 md:pb-6">

        <div className="flex items-center gap-3">
          <Link
            to="/film"
            className="flex items-center justify-center w-8 h-8 rounded-full transition-colors hover:bg-white/10"
            style={{ color: "var(--color-text-muted)" }}
          >
            <HiArrowLeft size={20} />
          </Link>

          <h1
            className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight"
            style={{ color: "var(--color-text)" }}
          >
            {name ?? "Catégorie"}
          </h1>
        </div>
        <p className="mt-2 text-sm sm:text-base" style={{ color: "var(--color-text-muted)" }}>
          {films?.length ?? "—"} films
        </p>
      </div>

      <div className="px-4 pb-10 md:px-8 md:pb-16">

        {isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse aspect-[2/3] rounded-xl"
                style={{ background: "var(--color-surface)" }}
              />
            ))}
          </div>
        )}

        {error && (
          <div className="text-center py-20">
            <p className="text-red-400 text-lg">Erreur lors du chargement des films</p>
            <p className="text-sm mt-2" style={{ color: "var(--color-text-muted)" }}>
              Veuillez réessayer plus tard
            </p>
          </div>
        )}

        {films && films.length === 0 && (
          <div className="text-center py-20">
            <p className="text-lg" style={{ color: "var(--color-text-muted)" }}>
              Aucun film dans cette catégorie
            </p>
          </div>
        )}

        {films && films.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {films.map((film) => (
              <MovieCard
                key={film.omdb_id}
                omdb_id={film.omdb_id}
                image={film.poster_url ?? ""}
                title={film.title}
                director={film.director ?? "Inconnu"}
                year={film.year?.toString() ?? ""}
                rating={film.average_rating ?? null}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryDetail;
