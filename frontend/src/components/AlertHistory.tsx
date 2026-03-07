import type { AlertData } from "../types/alert";
import { useLang } from "../context/LanguageContext";
import CitySearch from "./CitySearch";

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
        <CitySearch value={city} onChange={onCityChange} showClearButton />
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
