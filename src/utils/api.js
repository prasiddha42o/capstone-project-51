const DEFAULT_API_BASE_URL = "http://localhost:3001";

export function getApiBaseUrl() {
  const configuredUrl = import.meta.env.VITE_API_URL?.trim();
  return configuredUrl || DEFAULT_API_BASE_URL;
}

export function buildApiUrl(path) {
  const baseUrl = getApiBaseUrl().replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
}
