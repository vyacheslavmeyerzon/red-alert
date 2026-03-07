import { useCallback } from "react";
import { useLang } from "../context/LanguageContext";
import CitySearch from "./CitySearch";

interface Props {
  cities: string[];
  onAdd: (city: string) => void;
  onRemove: (city: string) => void;
}

export default function SavedCities({ cities, onAdd, onRemove }: Props) {
  const { t } = useLang();

  const filterSuggestions = useCallback(
    (results: string[]) => results.filter((c) => !cities.includes(c)),
    [cities]
  );

  return (
    <div className="saved-cities">
      <h3>{t.savedCitiesTitle}</h3>
      <p className="saved-cities-desc">{t.savedCitiesDesc}</p>

      <CitySearch
        value=""
        onChange={onAdd}
        placeholder={t.addCityPlaceholder}
        filterSuggestions={filterSuggestions}
        clearOnSelect
      />

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
