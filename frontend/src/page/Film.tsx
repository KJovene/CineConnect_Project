import React from "react";
import { useFilmsByGenre } from "@/hooks/useFilmsByGenre";
import { CategoryCarousel } from "@/components/organisms";

const Film: React.FC = () => {
  const { data: sections, isLoading, error } = useFilmsByGenre(24);

  return (
    <div className="min-h-screen bg-[#050505]">
      {/* Header */}
      <div className="px-4 pt-6 pb-4 md:px-8 md:pt-10 md:pb-6">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">
          Explorer par catégorie
        </h1>
        <p className="mt-2 text-sm sm:text-base text-neutral-400">
          Découvrez des films triés par genre — naviguez dans chaque section
        </p>
      </div>

      {/* Content */}
      <div className="px-4 pb-10 md:px-8 md:pb-16">
        {isLoading && (
          <div className="space-y-10">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-7 w-40 bg-white/10 rounded mb-6" />
                <div className="flex gap-3 md:gap-4 overflow-hidden">
                  {Array.from({ length: 8 }).map((_, j) => (
                    <div
                      key={j}
                      className="shrink-0 aspect-2/3 bg-white/5 rounded-xl"
                      style={{ width: "calc((100% - (7 * 1rem)) / 8)" }}
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
            <p className="text-neutral-500 text-sm mt-2">
              Veuillez réessayer plus tard
            </p>
          </div>
        )}

        {sections &&
          sections.map((section) => (
            <CategoryCarousel
              key={section.genre}
              genre={section.genre}
              films={section.films}
            />
          ))}
      </div>
    </div>
  );
};

export default Film;
