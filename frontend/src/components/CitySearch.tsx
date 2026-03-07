import { useState, useEffect, useRef } from "react";
import { useLang } from "../context/LanguageContext";

interface CitySearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onSelect?: (city: string) => void;
  filterSuggestions?: (cities: string[]) => string[];
  clearOnSelect?: boolean;
  showClearButton?: boolean;
}

export default function CitySearch({
  value,
  onChange,
  placeholder,
  onSelect,
  filterSuggestions,
  clearOnSelect = false,
  showClearButton = false,
}: CitySearchProps) {
  const [input, setInput] = useState(value);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { t } = useLang();

  // Sync external value changes
  useEffect(() => {
    setInput(value);
  }, [value]);

  // Fetch suggestions
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!input || input.length < 2) {
      setSuggestions([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/alerts/cities?q=${encodeURIComponent(input)}`);
        const cities: string[] = await res.json();
        const filtered = filterSuggestions ? filterSuggestions(cities) : cities;
        setSuggestions(filtered);
        setShowSuggestions(true);
      } catch {}
    }, 200);
  }, [input]);

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectCity = (city: string) => {
    if (clearOnSelect) {
      setInput("");
      setSuggestions([]);
    } else {
      setInput(city);
    }
    onChange(city);
    if (onSelect) onSelect(city);
    setShowSuggestions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && input.trim()) {
      selectCity(input.trim());
    }
  };

  const handleClear = () => {
    setInput("");
    onChange("");
    setSuggestions([]);
  };

  return (
    <div className="city-search" ref={wrapperRef}>
      <div className="search-input-wrapper">
        <input
          type="text"
          placeholder={placeholder ?? t.searchPlaceholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
        />
        {showClearButton && input && (
          <button className="search-clear" onClick={handleClear}>✕</button>
        )}
      </div>
      {showSuggestions && suggestions.length > 0 && (
        <ul className="suggestions-list">
          {suggestions.map((s) => (
            <li key={s} onClick={() => selectCity(s)}>
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
