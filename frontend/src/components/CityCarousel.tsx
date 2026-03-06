import { useState, useEffect } from "react";

interface Props {
  cities: string[];
  interval?: number;
  renderCity: (city: string, index: number) => React.ReactNode;
}

export default function CityCarousel({ cities, interval = 1500, renderCity }: Props) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (cities.length <= 1) return;
    setCurrent(0);
    const id = setInterval(() => {
      setCurrent((prev) => (prev + 1) % cities.length);
    }, interval);
    return () => clearInterval(id);
  }, [cities, interval]);

  if (cities.length === 0) return null;

  return (
    <div className="city-carousel">
      <div className="city-carousel-slide" key={current}>
        {renderCity(cities[current], current)}
      </div>
      {cities.length > 1 && (
        <span className="city-carousel-counter">
          {current + 1}/{cities.length}
        </span>
      )}
    </div>
  );
}
