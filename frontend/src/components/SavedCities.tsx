import { useState, useEffect, useRef } from "react";
import { useLang } from "../context/LanguageContext";

interface Props {
  cities: string[];
  onAdd: (city: string) => void;
  onRemove: (city: string) => void;
}

export default function SavedCities({ cities, onAdd, onRemove }: Props) {
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { t } = useLang();

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!input || input.length < 2) {
      setSuggestions([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/alerts/cities?q=${encodeURIComponent(input)}`);
        const data: string[] = await res.json();
        setSuggestions(data.filter((c) => !cities.includes(c)));
        setShowSuggestions(true);
      } catch {}
    }, 200);
  }, [input, cities]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const addCity = (city: string) => {
    onAdd(city);
    setInput("");
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <div className="saved-cities">
      <h3>{t.savedCitiesTitle}</h3>
      <p className="saved-cities-desc">{t.savedCitiesDesc}</p>

      <div className="saved-cities-search" ref={wrapperRef}>
        <div className="search-input-wrapper">
          <input
            type="text"
            placeholder={t.addCityPlaceholder}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && input.trim()) {
                addCity(input.trim());
              }
            }}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          />
        </div>
        {showSuggestions && suggestions.length > 0 && (
          <ul className="suggestions-list">
            {suggestions.map((s) => (
              <li key={s} onClick={() => addCity(s)}>{s}</li>
            ))}
          </ul>
        )}
      </div>

      {cities.length === 0 ? (
        <p className="saved-cities-empty">{t.noCitiesSelected}</p>
      ) : (
        <div className="saved-cities-list">
          {cities.map((city) => (
            <span key={city} className="saved-city-tag">
              {city}
              <button onClick={() => onRemove(city)}>✕</button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
