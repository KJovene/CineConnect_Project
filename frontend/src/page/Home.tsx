import React from "react";
import { HeroSection, MediaGrid, ReviewList } from "@/components/organisms";
import { useTopRatedMovies } from "@/hooks/useTopRatedMovies";
import { useLatestCommunityReviews } from "@/hooks/useLatestCommunityReviews";
import { getPosterUrl } from "@/features/media/utils/poster";
import type { Film } from "@cineconnect/shared";
import type { MovieCardProps } from "@/components/molecules";

const Home: React.FC = () => {
  const { data: topFilms, isLoading } = useTopRatedMovies(5);
  const { data: communityReviews = [], isLoading: isLoadingCommunityReviews } =
    useLatestCommunityReviews(4);

  const convertToMovieCard = (film: Film): MovieCardProps => ({
    image: getPosterUrl(film.poster_url),
    title: film.title,
    director: film.director || film.genre || "Film",
    year: film.year?.toString() || "N/A",
    rating: film.average_rating ?? null,
    omdb_id: film.omdb_id,
  });

  const featuredFilm = topFilms?.[0];
  const trendingFilms = topFilms?.slice(1, 5).map(convertToMovieCard) || [];
  const recentReviews = communityReviews.slice(0, 4).map((review) => ({
    avatar: review.author.image,
    name: review.author.name,
    rating: review.rating,
    movie: review.film.title,
    review: review.comment,
    commentedAt: review.createdAt,
  }));

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
          reviews={recentReviews}
          isLoading={isLoadingCommunityReviews}
        />
      </div>
    </>
  );
};

export default Home;
