import React from "react";
import { HeroSection, MediaGrid, ReviewList } from "@/components/organisms";
import { useTopRatedMovies } from "@/hooks/useTopRatedMovies";
import { useLatestCommunityReviews } from "@/hooks/useLatestCommunityReviews";
import { getPosterUrl } from "@/utils/poster";
import type { Film } from "@cineconnect/shared";
import type { MovieCardProps } from "@/components/molecules";

const Home: React.FC = () => {
  const { data: topFilms, isLoading } = useTopRatedMovies(10);
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

  const featuredFilm = React.useMemo(() => {
    if (!topFilms?.length) {
      return undefined;
    }

    // Build a deterministic index from current film data to keep render pure.
    const seed = topFilms.reduce((accumulator, film, index) => {
      const source = `${film.omdb_id ?? film.title ?? ""}-${index}`;
      let value = accumulator;
      for (let i = 0; i < source.length; i += 1) {
        value = (value * 31 + source.charCodeAt(i)) >>> 0;
      }
      return value;
    }, 0);

    const featuredIndex = seed % topFilms.length;
    return topFilms[featuredIndex];
  }, [topFilms]);

  const trendingFilms = topFilms?.map(convertToMovieCard) || [];
  const recentReviews = communityReviews.slice(0, 4).map((review) => ({
    avatar: review.author.image,
    name: review.author.name,
    rating: review.rating,
    movie: review.film.title,
    review: review.comment,
    commentedAt: review.createdAt,
    omdbId: review.film.omdbId,
  }));

  return (
    <>
      <HeroSection film={featuredFilm} isLoading={isLoading} />

      <div className="px-8 py-8">
        {trendingFilms.length > 0 && (
          <MediaGrid title="Tendances Actuelles" movies={trendingFilms} />
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
