import { useQuery } from "@tanstack/react-query";
import { getMovieById } from "@/features/media/api/omdbApi";

export function useMovieDetails(imdbID: string) {
  return useQuery({
    queryKey: ["movies", "details", imdbID],
    queryFn: () => getMovieById(imdbID),
    enabled: !!imdbID,
  });
}