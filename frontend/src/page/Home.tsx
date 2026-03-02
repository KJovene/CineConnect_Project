import React from "react";
import { HeroSection, MediaGrid, ReviewList } from "@/components/organisms";
import { useTopRatedMovies } from "@/hooks/useTopRatedMovies";
import { getPosterUrl } from "@/features/media/utils/poster";
import type { Film } from "@cineconnect/shared";
import type { MovieCardProps } from "@/components/molecules";

const RECENT_REVIEWS = [
  {
    avatar: "https://i.pravatar.cc/150?img=12",
    name: "Sophie M.",
    badge: "Membre Verified",
    rating: 5,
    movie: "Interstellar Echoes",
    review:
      "Une photographie époustouflante. Probablement le meilleur film de l'année. La bande son est tout simplement magistrale.",
    time: "Il y a 2h",
    likes: 24,
    comments: 4,
  },
  {
    avatar: "https://i.pravatar.cc/150?img=8",
    name: "Marc L.",
    badge: "Critique Amateur",
    rating: 4,
    movie: "Neo Tokyo",
    review:
      "L'intrigue est un peu lente au début, mais le final rattrape tout. Incroyable performance d'acteur sur la scène finale.",
    time: "Il y a 5h",
    likes: 12,
    comments: 1,
  },
];

const Home: React.FC = () => {
  const { data: topFilms, isLoading, error } = useTopRatedMovies(5);

  const convertToMovieCard = (film: Film): MovieCardProps => ({
    image: getPosterUrl(film.poster_url),
    title: film.title,
    director: film.director || film.genre || "Film",
    year: film.year?.toString() || "N/A",
    rating: film.imdb_rating || undefined,
    isPercentage: false,
    omdb_id: film.omdb_id,
  });

  const featuredFilm = topFilms?.[0];
  const trendingFilms = topFilms?.slice(1, 5).map(convertToMovieCard) || [];

  return (
    <>
      <HeroSection film={featuredFilm} isLoading={isLoading} />

      <div className="px-8 py-8">
        {trendingFilms.length > 0 && (
          <MediaGrid
            title="Tendances Actuelles"
            badge="Cette semaine"
            movies={trendingFilms}
          />
        )}
        <ReviewList
          title="Derniers Avis de la communauté"
          reviews={RECENT_REVIEWS}
          onViewAll={() => {}}
          onWriteReview={() => {}}
        />
      </div>
    </>
  );
};

export default Home;
