import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "red-alert-saved-cities";

export function useSavedCities() {
  const [cities, setCities] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cities));
  }, [cities]);

  const addCity = useCallback((city: string) => {
    const trimmed = city.trim();
    if (!trimmed) return;
    setCities((prev) => prev.includes(trimmed) ? prev : [...prev, trimmed]);
  }, []);

  const removeCity = useCallback((city: string) => {
    setCities((prev) => prev.filter((c) => c !== city));
  }, []);

  const hasMatch = useCallback(
    (alertCities: string[]) => {
      return alertCities.some(
        (ac) => cities.some((sc) => ac === sc || ac.includes(sc) || sc.includes(ac))
      );
    },
    [cities]
  );

  const getMatchedCities = useCallback(
    (alertCities: string[]) => {
      return alertCities.filter(
        (ac) => cities.some((sc) => ac === sc || ac.includes(sc) || sc.includes(ac))
      );
    },
    [cities]
  );

  return { cities, addCity, removeCity, hasMatch, getMatchedCities };
}
