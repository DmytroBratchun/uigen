export function register() {
  // Fix Node.js 25+ Web Storage SSR compatibility.
  // Node 25 exposes global localStorage/sessionStorage via the experimental
  // Web Storage API. Without --localstorage-file these globals exist but are
  // non-functional, causing "localStorage.getItem is not a function" errors
  // during SSR. Removing them restores pre-25 behaviour.
  if (typeof globalThis !== "undefined" && typeof window === "undefined") {
    delete (globalThis as Record<string, unknown>).localStorage;
    delete (globalThis as Record<string, unknown>).sessionStorage;
  }
}
