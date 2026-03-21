import React from "react";
import { useParams, Link } from "@tanstack/react-router";
import { HiArrowLeft } from "react-icons/hi2";
import { useMovieDetails } from "@/hooks/useMovieDetails";
import { FilmDetailHeader } from "@/components/organisms/FilmDetailHeader";
import { FilmDetailOverview } from "@/components/organisms/FilmDetailOverview";
import { FilmCommunityReviews } from "@/components/organisms/FilmCommunityReviews";

const FilmDetailPage: React.FC = () => {
  //récupérer l'id depuis l'url
  const { id } = useParams({ from: "/_authenticated/film/$id" });

  const { data: movie, isLoading, error } = useMovieDetails(id);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error || !movie) {
    return <ErrorState error={error} />;
  }

  return (
    <div
      className="antialiased min-h-screen flex flex-col"
      style={{
        background: "var(--color-bg)",
        color: "var(--color-text)",
      }}
    >
      <FilmDetailHeader />

      <main className="flex-1 w-full pb-20">
        <FilmDetailOverview movie={movie} />
        <div className="w-full max-w-6xl mx-auto px-6 lg:px-12">
          <FilmCommunityReviews omdbId={id} />
        </div>
      </main>
    </div>
  );
};

const LoadingSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen" style={{ background: "var(--color-bg)" }}>
      {/* Barre de nav factice */}
      <div
        className="h-20"
        style={{ background: "var(--color-surface)" }}
      />
      {/* Hero factice */}
      <div
        className="w-full h-[65vh] animate-pulse"
        style={{ background: "var(--color-surface)" }}
      />
      {/* Contenu factice */}
      <div className="max-w-6xl mx-auto px-12 -mt-32">
        <div className="space-y-4">
          <div
            className="h-12 rounded animate-pulse w-1/2"
            style={{ background: "var(--color-surface)" }}
          />
          <div
            className="h-6 rounded animate-pulse w-1/4"
            style={{ background: "var(--color-surface)" }}
          />
          <div
            className="h-32 rounded animate-pulse"
            style={{ background: "var(--color-surface)" }}
          />
        </div>
      </div>
    </div>
  );
};

const ErrorState: React.FC<{ error: Error | null }> = ({ error }) => {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "var(--color-bg)" }}
    >
      <div className="text-center">
        <h1
          className="text-4xl font-bold mb-4"
          style={{ color: "var(--color-text)" }}
        >
          Film introuvable
        </h1>
        <p className="mb-8" style={{ color: "var(--color-text-muted)" }}>
          {error?.message || "Ce film n'existe pas ou a été supprimé."}
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors"
        >
          <HiArrowLeft size={20} />
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
};

export default FilmDetailPage;