import { useState, useEffect } from "react";
import { useLang } from "../context/LanguageContext";

interface Props {
  lastUpdated: Date | null;
}

export default function UpdatedAgo({ lastUpdated }: Props) {
  const { t } = useLang();
  const [, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 5000);
    return () => clearInterval(id);
  }, []);

  if (!lastUpdated) return null;

  const seconds = Math.floor((Date.now() - lastUpdated.getTime()) / 1000);
  const text = seconds < 5 ? t.updatedNow : t.updatedAgo(seconds);

  return <span className="updated-ago">{text}</span>;
}
