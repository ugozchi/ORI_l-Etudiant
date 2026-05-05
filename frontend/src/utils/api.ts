export function getApiBaseUrl(): string {
  return '/api/backend';
}

export function apiUrl(path: string): string {
  const base = getApiBaseUrl();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalizedPath.replace(/^\/+/, '/')}`;
}
