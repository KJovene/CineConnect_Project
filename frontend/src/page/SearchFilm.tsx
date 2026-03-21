import React, { useState } from "react";
import { useSearchMovies } from "@/hooks/useSearchMovies";
import { Link } from "@tanstack/react-router";
import { SearchBar, CategoryDropdown } from "@/components/molecules";
import {
  HiSparkles,
  HiFilm,
  HiFire,
  HiHeart,
  HiDocumentText,
  HiWifi,
  HiBeaker,
  HiMagnifyingGlass,
  HiChevronLeft,
  HiChevronRight,
} from "react-icons/hi2";
import { getPosterUrl, handlePosterError } from "@/features/media/utils/poster";
import type { FilmSearchResult } from "@cineconnect/shared";

const SearchPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const [currentPage, setCurrentPage] = useState(1);
  const { data, isLoading, error } = useSearchMovies(searchQuery, currentPage);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  // éviter les doublons
  const results = React.useMemo(() => {
    if (!data?.results) return [];
    const seen = new Set<string>();
    return data.results.filter((movie: FilmSearchResult) => {
      if (seen.has(movie.omdb_id)) return false;
      seen.add(movie.omdb_id);
      return true;
    });
  }, [data]);

  const genres = [
    { name: "Science-Fiction", icon: <HiBeaker size={18} /> },
    { name: "Action", icon: <HiFire size={18} /> },
    { name: "Comédie", icon: <HiSparkles size={18} /> },
    { name: "Horreur", icon: <HiFilm size={18} /> },
    { name: "Romance", icon: <HiHeart size={18} /> },
    { name: "Drame", icon: <HiDocumentText size={18} /> },
    { name: "Thriller", icon: <HiWifi size={18} /> },
  ];

  // Calcule le nombre total de pages
  const totalPages = data?.totalResults ? Math.ceil(data.totalResults / 10) : 0;
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  return (
    <div className="w-full min-h-screen flex flex-col items-center relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 bg-indigo-900/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-4xl mx-auto pt-8 px-6 pb-20 z-10">
        {/* SEARCH INPUT AREA */}
        <div className="mb-16">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="w-full md:w-auto">
              <CategoryDropdown
                value={selectedCategory}
                onChange={setSelectedCategory}
              />
            </div>
            <div className="flex-1 w-full">
              <SearchBar
                placeholder="Rechercher un film, un réalisateur..."
                value={searchQuery}
                onChange={handleSearchChange}
                fullWidth={true}
              />
            </div>
          </div>
        </div>

        {/* BARRE DE RECHERCHE */}
        <div className="mb-12">
          <SearchBar
            placeholder="Rechercher un film, un réalisateur..."
            value={searchQuery}
            onChange={handleSearchChange}
            fullWidth={true}
          />
        </div>

        {/* RESULTS SECTION */}
        {searchQuery.length >= 3 && (
          <div className="mb-16">
            {/* Error */}
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl mb-6">
                ❌ {error instanceof Error ? error.message : "Erreur"}
              </div>
            )}

            {/* Loading */}
            {isLoading && (
              <div className="text-center py-12">
                <div className="inline-block w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4" />
                <p className="text-sm text-neutral-400">
                  Recherche en cours...
                </p>
              </div>
            )}

            {/* No results */}
            {!isLoading && results.length === 0 && !error && (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 border border-white/10 mb-4">
                  <HiMagnifyingGlass className="text-neutral-500" size={32} />
                </div>
                <p className="text-neutral-400 text-lg">
                  Aucun résultat pour{" "}
                  <span className="text-white font-medium">
                    "{searchQuery}"
                  </span>
                </p>
              </div>
            )}

            {/* Results grid */}
            {!isLoading && results.length > 0 && (
              <>
                <div className="mb-4 px-2">
                  <p className="text-sm text-neutral-400">
                    {data?.totalResults
                      ? `${data.totalResults} résultats trouvés`
                      : `${results.length} résultats`}
                  </p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                  {results.map((movie: FilmSearchResult) => (
                    <Link
                      key={movie.omdb_id}
                      to="/film/$id"
                      params={{ id: movie.omdb_id }}
                      className="group relative aspect-[2/3] rounded-xl overflow-hidden cursor-pointer bg-neutral-900 border border-white/5 hover:border-white/20 transition-all"
                    >
                      <img
                        src={getPosterUrl(movie.poster_url)}
                        alt={movie.title}
                        onError={handlePosterError}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60 group-hover:opacity-90 transition-opacity"></div>
                      <div className="absolute bottom-0 left-0 right-0 p-3 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                        <h3 className="text-white font-semibold tracking-tight mb-1 truncate text-xs">
                          {movie.title}
                        </h3>
                        <div className="flex items-center justify-between text-[10px] text-neutral-400 group-hover:text-neutral-300 transition-colors">
                          <span>{movie.year}</span>
                          <span className="capitalize">Film</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* PAGINATION */}
                {totalPages > 1 && (
                  <div className="mt-12 flex items-center justify-center gap-3">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={!hasPrevPage}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      <HiChevronLeft size={20} />
                      Précédent
                    </button>

                    <div className="flex items-center gap-2">
                      {/* Page courante */}
                      <span className="px-2 py-2 rounded-lg text-white font-medium">
                        {currentPage}
                      </span>
                      <span className="text-neutral-500">sur</span>
                      <span className="text-neutral-300 font-medium">
                        {totalPages}
                      </span>
                    </div>

                    <button
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={!hasNextPage}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      Suivant
                      <HiChevronRight size={20} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* GENRES (si pas de recherche) */}
        {searchQuery.length < 3 && (
          <>
            <div className="mb-16">
              <div className="flex items-center justify-between mb-6 px-2">
                <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  Explorer par genre
                </h2>
              </div>

              <div className="flex flex-wrap gap-3 px-2">
                {genres.map((genre) => (
                  <button
                    key={genre.name}
                    className="group relative px-5 py-2.5 rounded-xl border border-neutral-800 bg-neutral-900/30 text-neutral-400 hover:text-white hover:border-neutral-700 hover:bg-neutral-900 transition-all text-sm font-medium"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      {genre.icon} {genre.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* RECHERCHES RÉCENTES */}
            <div className="space-y-3">
              <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-4 px-2">
                Recherches récentes
              </h2>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
