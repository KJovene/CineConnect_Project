import { useRef, useState, useCallback } from "react";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi2";
import { MovieCard } from "@/components/molecules";
import type { Film } from "@cineconnect/shared";

export interface CategoryCarouselProps {
  genre: string;
  films: Film[];
}

/**
 * Carousel horizontal pour une catégorie de films.
 * Affiche ~8 films visibles et permet de naviguer par groupe.
 */
export function CategoryCarousel({ genre, films }: CategoryCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  /** Met à jour l'état des boutons de navigation */
  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  /** Scroll par blocs de la largeur visible */
  const scroll = useCallback(
    (direction: "left" | "right") => {
      const el = scrollRef.current;
      if (!el) return;

      const scrollAmount = el.clientWidth;
      el.scrollBy({
        left: direction === "right" ? scrollAmount : -scrollAmount,
        behavior: "smooth",
      });

      // Attendre la fin de l'animation pour mettre à jour les boutons
      setTimeout(updateScrollState, 350);
    },
    [updateScrollState],
  );

  if (films.length === 0) return null;

  return (
    <section className="mb-10 md:mb-14">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold tracking-tight text-white">
          {genre}
        </h2>

        <div className="flex gap-2">
          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            aria-label={`Section précédente – ${genre}`}
            className="w-8 h-8 md:w-9 md:h-9 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition text-neutral-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <HiChevronLeft size={18} />
          </button>
          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            aria-label={`Section suivante – ${genre}`}
            className="w-8 h-8 md:w-9 md:h-9 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition text-neutral-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <HiChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Carousel */}
      <div
        ref={scrollRef}
        onScroll={updateScrollState}
        className="flex gap-3 md:gap-4 overflow-x-auto overflow-y-hidden scroll-smooth no-scrollbar snap-x snap-mandatory"
      >
        {films.map((film) => (
          <div
            key={film.film_id}
            className="shrink-0 snap-start w-[45%] sm:w-[30%] md:w-[23%] lg:w-[calc((100%-7*1rem)/8)]"
          >
            <MovieCard
              omdb_id={film.omdb_id}
              image={film.poster_url ?? ""}
              title={film.title}
              director={film.director ?? "Inconnu"}
              year={film.year?.toString() ?? ""}
              rating={film.imdb_rating ?? undefined}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
