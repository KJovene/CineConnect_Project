import { useQuery } from "@tanstack/react-query";
import { searchMovies } from "@/features/media/api/omdbApi";

export function useSearchMovies(query: string) {
  return useQuery({
    queryKey: ["movies", "search", query],
    
    queryFn: () => searchMovies(query),
    
    enabled: !!query && query.length >= 3,
    
  });
}