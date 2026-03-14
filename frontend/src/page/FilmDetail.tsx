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
    <div className="bg-[#050505] text-neutral-300 antialiased min-h-screen flex flex-col">
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
    <div className="bg-[#050505] min-h-screen">
      <div className="h-20 bg-neutral-900/50"></div>
      <div className="w-full h-[65vh] bg-neutral-900/50 animate-pulse"></div>
      <div className="max-w-6xl mx-auto px-12 -mt-32">
        <div className="space-y-4">
          <div className="h-12 bg-neutral-900/50 rounded animate-pulse w-1/2"></div>
          <div className="h-6 bg-neutral-900/50 rounded animate-pulse w-1/4"></div>
          <div className="h-32 bg-neutral-900/50 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

const ErrorState: React.FC<{ error: Error | null }> = ({ error }) => {
  return (
    <div className="bg-[#050505] min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">Film introuvable</h1>
        <p className="text-neutral-400 mb-8">
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
