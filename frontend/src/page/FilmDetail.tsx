import React from "react";
import { useParams, Link } from "@tanstack/react-router";
import {
  HiArrowLeft,
  HiBell,
  HiPlay,
  HiPencil,
  HiBookmark,
  HiStar,
  HiHeart,
  HiChatBubbleLeftRight,
} from "react-icons/hi2";
import { useMovieDetails } from "@/hooks/useMovieDetails";
import { getPosterUrl, handlePosterError } from "@/features/media/utils/poster";

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

  //parsing des données de détails du film
  const genres = movie.Genre ? movie.Genre.split(", ") : [];
  const actors = movie.Actors ? movie.Actors.split(", ") : [];

  return (
    <div className="bg-[#050505] text-neutral-300 antialiased min-h-screen flex flex-col">
      
      {/* HEADER */}
      <header className="h-20 flex items-center justify-between px-6 lg:px-12 fixed top-0 w-full z-50 bg-gradient-to-b from-black/80 to-transparent backdrop-blur-sm">
        <div className="flex items-center gap-6">
          {/* Bouton retour */}
          <Link
            to="/"
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <HiArrowLeft size={20} className="text-white" />
          </Link>
        </div>

        <div className="flex items-center gap-6">
          <button className="relative text-neutral-300 hover:text-white transition-colors">
            <HiBell size={22} />
          </button>
          <div className="h-6 w-px bg-white/10"></div>
          <button className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img
              src="https://i.pravatar.cc/150?img=33"
              alt="Avatar"
              className="w-8 h-8 rounded-full object-cover ring-2 ring-white/10"
            />
          </button>
        </div>
      </header>

      <main className="flex-1 w-full pb-20">
        {/* Image horizontale */}
        <div className="relative w-full h-[60vh] lg:h-[65vh]">
          <img
            src={getPosterUrl(movie.Poster)}
            className="w-full h-full object-cover object-center"
            alt={movie.Title}
            onError={handlePosterError}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent"></div>
        </div>

        {/* CONTENU DÉTAILS */}
        <div className="relative z-10 -mt-32 w-full max-w-6xl mx-auto px-6 lg:px-12">
          <div className="flex flex-col lg:flex-row gap-12">
            <div className="flex-1 space-y-8">
              {/* Titre */}
              <div>
                <h1 className="text-4xl lg:text-6xl font-bold text-white tracking-tight mb-4 drop-shadow-xl">
                  {movie.Title}
                </h1>

                <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm lg:text-base font-medium text-neutral-300">
                  <span className="text-white">{movie.Year}</span>
                  <span className="w-1 h-1 rounded-full bg-neutral-600"></span>
                  <span className="px-2 py-0.5 border border-neutral-700 rounded text-xs text-neutral-400">
                    {movie.Rated}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-neutral-600"></span>
                  <span>{movie.Runtime}</span>

                  {/* Note IMDb */}
                  {movie.imdbRating && movie.imdbRating !== "N/A" && (
                    <div className="flex-1 lg:flex-none lg:ml-auto flex items-center gap-2 bg-neutral-900/50 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                      <HiStar className="text-amber-400" size={18} />
                      <span className="text-white font-semibold">{movie.imdbRating}</span>
                      <span className="text-neutral-500 text-xs">/ 10</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="flex flex-wrap items-center gap-4">
                <button className="flex items-center gap-3 bg-white text-black px-8 py-3.5 rounded-xl font-semibold hover:bg-neutral-200 transition-all active:scale-95">
                  <HiPlay size={20} />
                  Lecture
                </button>
                <button className="flex items-center gap-3 bg-white/10 backdrop-blur-md text-white border border-white/10 px-6 py-3.5 rounded-xl font-medium hover:bg-white/20 transition-all active:scale-95">
                  <HiPencil size={20} />
                  Écrire mon avis
                </button>
                <button className="w-12 h-12 flex items-center justify-center rounded-xl border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-600 hover:bg-neutral-900/50 transition-all ml-auto lg:ml-0">
                  <HiBookmark size={20} />
                </button>
              </div>

              {/* Synopsis */}
              <div className="max-w-3xl">
                <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-3">
                  Résumé
                </h3>
                <p className="text-lg text-neutral-300 leading-relaxed">
                  {movie.Plot !== "N/A" ? movie.Plot : "Aucun synopsis disponible."}
                </p>
              </div>

              {/* Détails techniques */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-8 border-y border-neutral-800/50">
                <div>
                  <h4 className="text-xs text-neutral-500 mb-1">Réalisateur</h4>
                  <p className="text-white font-medium">{movie.Director}</p>
                </div>
                <div>
                  <h4 className="text-xs text-neutral-500 mb-1">Scénariste</h4>
                  <p className="text-neutral-300 text-sm">
                    {movie.Writer !== "N/A" ? movie.Writer : "Inconnu"}
                  </p>
                </div>
                <div className="col-span-2">
                  <h4 className="text-xs text-neutral-500 mb-2">Genres</h4>
                  <div className="flex flex-wrap gap-2">
                    {genres.map((genre) => (
                      <span
                        key={genre}
                        className="px-3 py-1 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-neutral-400"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Distribution */}
              <div>
                <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-4">
                  Distribution
                </h3>
                <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                  {actors.slice(0, 5).map((actor, index) => (
                    <div key={index} className="flex-shrink-0 w-24 text-center group">
                      <div className="w-20 h-20 mx-auto mb-2 rounded-full overflow-hidden border border-neutral-800 group-hover:border-indigo-500/50 transition-colors bg-neutral-900 flex items-center justify-center">
                        <span className="text-xs text-neutral-600 font-medium">
                          {actor.charAt(0)}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-white truncate">{actor}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="hidden lg:block lg:w-12"></div>
          </div>

          {/* SECTION AVIS */}
          <div className="mt-20 pt-10 border-t border-neutral-900">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-semibold text-white tracking-tight">
                Avis de la communauté
              </h2>
              <div className="flex items-center gap-2 text-sm text-neutral-500">
                <span className="text-white font-medium">
                  {movie.imdbVotes !== "N/A" ? movie.imdbVotes : "0"}
                </span>{" "}
                avis
              </div>
            </div>

            <div className="text-center py-12 bg-neutral-900/30 border border-neutral-800/50 rounded-2xl">
              <p className="text-neutral-500">
                Les avis de la communauté seront affichés ici une fois le backend connecté.
              </p>
            </div>
          </div>
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