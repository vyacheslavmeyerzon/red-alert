import { useState, useEffect } from "react";

const VISIBLE_THRESHOLD = 6;

interface Props {
  cities: string[];
  interval?: number;
  renderCity: (city: string, index: number) => React.ReactNode;
}

export default function CityCarousel({ cities, interval = 1500, renderCity }: Props) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (cities.length <= VISIBLE_THRESHOLD) return;
    setCurrent(0);
    const id = setInterval(() => {
      setCurrent((prev) => (prev + 1) % cities.length);
    }, interval);
    return () => clearInterval(id);
  }, [cities, interval]);

  if (cities.length === 0) return null;

  // Show all cities when count is small enough
  if (cities.length <= VISIBLE_THRESHOLD) {
    return (
      <div className="city-carousel city-carousel-all">
        {cities.map((city, i) => (
          <span key={i} className="city-carousel-item">{renderCity(city, i)}</span>
        ))}
      </div>
    );
  }

  // Rotate for large lists
  return (
    <div className="city-carousel">
      <div className="city-carousel-slide" key={current}>
        {renderCity(cities[current], current)}
      </div>
      <span className="city-carousel-counter">
        {current + 1}/{cities.length}
      </span>
    </div>
  );
}
