import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { searchCities, type CitySearchResult } from "../api";

export const MIN_CITY_SEARCH_LENGTH = 3;

export function useCitySearch(
  query: string,
): UseQueryResult<CitySearchResult[], Error> {
  const trimmedQuery = query.trim();

  return useQuery({
    queryKey: ["city-search", trimmedQuery],
    queryFn: ({ signal }) => searchCities(trimmedQuery, signal),
    enabled: trimmedQuery.length >= MIN_CITY_SEARCH_LENGTH,
    retry: false,
    staleTime: 1000 * 60 * 10,
  });
}
