import React, { useState } from "react";
import { useSearchMovies } from "@/hooks/useSearchMovies";
import { Link } from "@tanstack/react-router";
import { SearchBar } from "@/components/molecules";
import {
  HiMagnifyingGlass,
  HiChevronLeft,
  HiChevronRight,
} from "react-icons/hi2";
import { getPosterUrl } from "@/utils/poster";
import type { FilmSearchResult } from "@cineconnect/shared";

const SearchPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const { data, isLoading, error } = useSearchMovies(searchQuery, currentPage);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const results = React.useMemo(() => {
    if (!data?.results) return [];
    const seen = new Set<string>();
    return data.results.filter((movie: FilmSearchResult) => {
      if (seen.has(movie.omdb_id)) return false;
      seen.add(movie.omdb_id);
      return true;
    });
  }, [data]);

  const totalPages = data?.totalResults ? Math.ceil(data.totalResults / 10) : 0;
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  return (
    <div className="w-full min-h-screen flex flex-col items-center relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 bg-indigo-900/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-4xl mx-auto pt-24 px-6 pb-20 z-10">
        <div className="mb-10">
          <SearchBar
            placeholder="Rechercher un film"
            value={searchQuery}
            onChange={handleSearchChange}
            fullWidth={true}
          />
        </div>

        {searchQuery.length >= 3 && (
          <div className="mb-16">
            {/* Erreur */}
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl mb-6">
                ❌ {error instanceof Error ? error.message : "Erreur"}
              </div>
            )}

            {/* Chargement */}
            {isLoading && (
              <div className="text-center py-12">
                <div className="inline-block w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4" />
                <p
                  className="text-sm"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  Recherche en cours...
                </p>
              </div>
            )}

            {/* Aucun resultat */}
            {!isLoading && results.length === 0 && !error && (
              <div className="text-center py-12">
                <div
                  className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
                  style={{
                    background: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  <HiMagnifyingGlass
                    size={32}
                    style={{ color: "var(--color-text-muted)" }}
                  />
                </div>
                <p
                  className="text-lg"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  Aucun résultat pour{" "}
                  <span
                    className="font-medium"
                    style={{ color: "var(--color-text)" }}
                  >
                    "{searchQuery}"
                  </span>
                </p>
              </div>
            )}

            {/* Grille de resultats */}
            {!isLoading && results.length > 0 && (
              <>
                <div className="mb-4 px-2">
                  <p
                    className="text-sm"
                    style={{ color: "var(--color-text-muted)" }}
                  >
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
                      className="group relative aspect-[2/3] rounded-xl overflow-hidden cursor-pointer transition-all"
                      style={{
                        background: "var(--color-surface)",
                        border: "1px solid var(--color-border)",
                      }}
                    >
                      <img
                        src={getPosterUrl(movie.poster_url)}
                        alt={movie.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      {/* Degrade de superposition — reste sombre quel que soit le theme, c'est sur une image */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60 group-hover:opacity-90 transition-opacity" />
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

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-12 flex items-center justify-center gap-3">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={!hasPrevPage}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      style={{
                        border: "1px solid var(--color-border)",
                        color: "var(--color-text-muted)",
                      }}
                    >
                      <HiChevronLeft size={20} />
                    </button>

                    <div className="flex items-center gap-2">
                      <span
                        className="px-2 py-2 rounded-lg font-medium"
                        style={{ color: "var(--color-text)" }}
                      >
                        {currentPage}
                      </span>
                      <span style={{ color: "var(--color-text-muted)" }}>
                        sur
                      </span>
                      <span
                        className="font-medium"
                        style={{ color: "var(--color-text)" }}
                      >
                        {totalPages}
                      </span>
                    </div>

                    <button
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={!hasNextPage}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      style={{
                        border: "1px solid var(--color-border)",
                        color: "var(--color-text-muted)",
                      }}
                    >
                      <HiChevronRight size={20} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
