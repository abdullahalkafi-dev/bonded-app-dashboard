"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { MapPin, Loader2 } from "lucide-react";
import { apiClient } from "@/lib/api-client";

export interface LocationResult {
  displayName: string;
  venueName: string | null;
  city: string | null;
  country: string | null;
  address: string;
  latitude: number;
  longitude: number;
}

interface LocationSearchProps {
  onSelect: (location: LocationResult) => void;
  placeholder?: string;
  defaultValue?: string;
}

export function LocationSearch({
  onSelect,
  placeholder = "Search for a venue or location...",
  defaultValue = "",
}: LocationSearchProps) {
  const [query, setQuery] = useState(defaultValue);
  const [results, setResults] = useState<LocationResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState(defaultValue);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    if (query === selectedLabel) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await apiClient<{ data: LocationResult[] }>(
          "/admin/events/search-location",
          { params: { q: query, limit: 5 } },
        );
        setResults(res.data ?? []);
        setIsOpen((res.data ?? []).length > 0);
      } catch {
        setResults([]);
        setIsOpen(false);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, selectedLabel]);

  function handleSelect(result: LocationResult) {
    setSelectedLabel(result.displayName);
    setQuery(result.displayName);
    setResults([]);
    setIsOpen(false);
    onSelect(result);
  }

  function handleChange(value: string) {
    setQuery(value);
    setSelectedLabel("");
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          placeholder={placeholder}
          className="pl-9"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md">
          {results.map((result, index) => (
            <button
              key={index}
              type="button"
              className="flex w-full items-start gap-2 px-3 py-2 text-left text-sm hover:bg-accent"
              onClick={() => handleSelect(result)}
            >
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0">
                <p className="truncate font-medium">{result.venueName ?? result.displayName}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {[result.city, result.country].filter(Boolean).join(", ")}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {!isOpen && selectedLabel && (
        <p className="mt-1 text-xs text-muted-foreground">
          Selected: {selectedLabel}
        </p>
      )}
    </div>
  );
}
