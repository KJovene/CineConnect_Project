const DEFAULT_API_URL = "http://localhost:3000";

interface RuntimeConfig {
  __CINECONNECT_API_URL__?: string;
}

export function getApiBaseUrl(): string {
  const config = globalThis as RuntimeConfig;
  return config.__CINECONNECT_API_URL__ ?? DEFAULT_API_URL;
}
