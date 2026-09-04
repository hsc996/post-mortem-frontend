/** Wire-service style clock, e.g. "14:32:07Z" — timestamps read like dispatch copy. */
export function formatWireClock(date: Date): string {
  const h = String(date.getUTCHours()).padStart(2, "0");
  const m = String(date.getUTCMinutes()).padStart(2, "0");
  const s = String(date.getUTCSeconds()).padStart(2, "0");
  return `${h}:${m}:${s}Z`;
}

export function formatWireDate(iso: string): string {
  const d = new Date(iso);
  const h = String(d.getUTCHours()).padStart(2, "0");
  const m = String(d.getUTCMinutes()).padStart(2, "0");
  return `${h}:${m}Z`;
}

/** "4H 12M AGO" — how long a bulletin has stood. */
export function formatElapsed(iso: string, now: Date): string {
  const ms = now.getTime() - new Date(iso).getTime();
  const totalMinutes = Math.max(0, Math.floor(ms / 60_000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}M AGO`;
  return `${hours}H ${String(minutes).padStart(2, "0")}M AGO`;
}

export interface MitigationClock {
  isExpired: boolean;
  /** "MM:SS" remaining, or elapsed-past-due when expired. */
  display: string;
}

/** Read-time TTL evaluation — mirrors the backend's is_expired, computed live. */
export function mitigationClock(appliedAtIso: string, ttlMinutes: number, now: Date): MitigationClock {
  const appliedAt = new Date(appliedAtIso).getTime();
  const expiresAt = appliedAt + ttlMinutes * 60_000;
  const remainingMs = expiresAt - now.getTime();
  const isExpired = remainingMs <= 0;
  const absMs = Math.abs(remainingMs);
  const totalSeconds = Math.floor(absMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const display = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  return { isExpired, display };
}
