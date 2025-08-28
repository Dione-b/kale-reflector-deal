// Simple JSON localStorage helper with safe parse/stringify

type JsonValue = unknown;

export function readFromLocalStorage<T extends JsonValue>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch (_error) {
    return fallback;
  }
}

export function writeToLocalStorage<T extends JsonValue>(key: string, value: T): void {
  try {
    const serialized = JSON.stringify(value);
    window.localStorage.setItem(key, serialized);
  } catch (_error) {
    // no-op
  }
}

export const STORAGE_KEYS = {
  offers: "kale.offers",
  myLoans: "kale.myLoans",
  myDebts: "kale.myDebts",
  walletAddress: "kale.walletAddress",
} as const;


