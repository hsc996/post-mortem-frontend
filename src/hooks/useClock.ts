import { useEffect, useState } from "react";

/** A live clock, ticking every second — the wire desk's persistent "now". */
export function useClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  return now;
}
