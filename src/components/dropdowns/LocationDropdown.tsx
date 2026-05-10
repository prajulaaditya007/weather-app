import { useEffect, useId, useRef, useState } from "react";
import { toast } from "sonner";
import type { CitySearchResult } from "../../api";
import { useCoords } from "../../context/useCoords";
import {
  MIN_CITY_SEARCH_LENGTH,
  useCitySearch,
} from "../../hooks/useCitySearch";

const CITY_SEARCH_DEBOUNCE_MS = 300;

function LocationDropdown() {
  const { setCoords } = useCoords();
  const listboxId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, CITY_SEARCH_DEBOUNCE_MS);
  const citySearchQuery = useCitySearch(debouncedSearch);
  const [selectedCityId, setSelectedCityId] = useState<string>();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!citySearchQuery.error) return;

    const message =
      citySearchQuery.error instanceof Error
        ? citySearchQuery.error.message
        : "City search failed.";

    toast.error("City search unavailable", {
      description: message,
    });
  }, [citySearchQuery.error]);

  useEffect(() => {
    function handleDocumentClick(event: MouseEvent) {
      if (
        event.target instanceof Node &&
        !containerRef.current?.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleDocumentClick);

    return () => {
      document.removeEventListener("mousedown", handleDocumentClick);
    };
  }, []);

  function handleCitySelect(city: CitySearchResult) {
    setSelectedCityId(city.id);
    setSearch(city.name);
    setIsOpen(false);

    setCoords(
      { lat: city.lat, lng: city.lon },
      {
        location: {
          name: city.name,
          state: city.state,
          country: city.country,
        },
      },
    );
  }

  const cities = citySearchQuery.data ?? [];
  const isSearching =
    citySearchQuery.isFetching &&
    debouncedSearch.trim().length >= MIN_CITY_SEARCH_LENGTH;
  const showDropdown =
    isOpen && search.trim().length >= MIN_CITY_SEARCH_LENGTH;

  return (
    <div ref={containerRef} className="relative w-[220px]">
      <input
        type="search"
        value={search}
        onChange={(event) => {
          setSearch(event.target.value);
          setSelectedCityId(undefined);
          setIsOpen(true);
        }}
        onFocus={() => {
          if (search.trim().length >= MIN_CITY_SEARCH_LENGTH) {
            setIsOpen(true);
          }
        }}
        role="combobox"
        aria-autocomplete="list"
        aria-controls={listboxId}
        aria-expanded={showDropdown}
        placeholder="Search city"
        className="h-8 w-full rounded-none border border-input bg-transparent px-2.5 text-xs outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50"
      />

      {showDropdown && (
        <div
          id={listboxId}
          role="listbox"
          className="absolute top-9 left-0 z-1001 max-h-64 w-full overflow-y-auto rounded-none bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10"
        >
          {isSearching && (
            <p className="px-2 py-2 text-xs text-muted-foreground">
              Searching...
            </p>
          )}

          {!isSearching &&
            cities.map((city) => (
              <button
                key={city.id}
                type="button"
                role="option"
                aria-selected={selectedCityId === city.id}
                onClick={() => {
                  handleCitySelect(city);
                }}
                className="flex w-full cursor-default items-center px-2 py-2 text-left text-xs outline-hidden hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
              >
                {[city.name, city.state, city.country]
                  .filter(Boolean)
                  .join(", ")}
              </button>
            ))}

          {!isSearching && cities.length === 0 && (
            <p className="px-2 py-2 text-xs text-muted-foreground">
              No cities found.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default LocationDropdown;

function useDebouncedValue(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [delay, value]);

  return debouncedValue;
}
