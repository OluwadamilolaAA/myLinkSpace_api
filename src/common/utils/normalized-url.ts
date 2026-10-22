export function normalizeUrl(value: string): string {
  const url = new URL(value);

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Only HTTP and HTTPS URLs are allowed");
  }

  url.hash = "";

  const normalized = url.toString();

  return normalized.endsWith("/")
    ? normalized.slice(0, -1)
    : normalized;
}