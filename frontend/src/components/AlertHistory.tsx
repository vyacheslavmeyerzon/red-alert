import { useState, useEffect, useRef } from "react";
import type { AlertData } from "../types/alert";
import { useLang } from "../context/LanguageContext";

interface Props {
  data: AlertData[];
  total: number;
  page: number;
  onPageChange: (page: number) => void;
  loading: boolean;
  city: string;
  onCityChange: (city: string) => void;
  category: number | null;
  onCategoryChange: (cat: number | null) => void;
}

function CitySearch({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [input, setInput] = useState(value);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { t } = useLang();

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
        setSuggestions(cities);
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
    setInput(city);
    onChange(city);
    setShowSuggestions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onChange(input);
      setShowSuggestions(false);
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
          placeholder={t.searchPlaceholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
        />
        {input && (
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

export default function AlertHistory({
  data, total, page, onPageChange, loading,
  city, onCityChange, category, onCategoryChange,
}: Props) {
  const { t } = useLang();
  const totalPages = Math.ceil(total / 50);

  return (
    <div className="alert-history">
      <h2>{t.alertHistory}</h2>

      <div className="history-filters">
        <CitySearch value={city} onChange={onCityChange} />
        <select
          className="category-select"
          value={category ?? ""}
          onChange={(e) => onCategoryChange(e.target.value ? Number(e.target.value) : null)}
        >
          <option value="">{t.allCategories}</option>
          {Object.entries(t.categories).map(([id, name]) => (
            <option key={id} value={id}>{name}</option>
          ))}
        </select>
      </div>

      <div className="history-meta">
        <span>{t.totalAlerts(total)}</span>
        {city && <span className="active-filter">🔍 {city}</span>}
        <span>{t.pageOf(page, totalPages || 1)}</span>
      </div>

      {loading ? (
        <div className="loading">{t.loading}</div>
      ) : (
        <table className="history-table">
          <thead>
            <tr>
              <th>{t.colTime}</th>
              <th>{t.colType}</th>
              <th>{t.colAreas}</th>
            </tr>
          </thead>
          <tbody>
            {data.map((alert, i) => (
              <tr key={`${alert.id}-${i}`}>
                <td className="td-time">
                  {new Date(alert.alerted_at).toLocaleString(t.locale)}
                </td>
                <td>{alert.category_desc}</td>
                <td className="td-cities">
                  {alert.cities.map((c, j) => (
                    <span
                      key={j}
                      className={`city-name ${c === city ? "highlighted" : ""}`}
                      onClick={() => onCityChange(c)}
                    >
                      {c}{j < alert.cities.length - 1 ? ", " : ""}
                    </span>
                  ))}
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={3} className="empty-row">
                  {city ? t.noAlertsFor(city) : t.noData}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      <div className="pagination">
        <button disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          {t.prevPage}
        </button>
        <button disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
          {t.nextPage}
        </button>
      </div>
    </div>
  );
}
