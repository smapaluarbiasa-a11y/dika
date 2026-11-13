/**
 * Smart API Fetch helper:
 * - On Node/Express or Vercel: calls `/api/<route>`
 * - On XAMPP Apache subfolder (`http://localhost/upload-soal/`): automatically falls back to `./api.php?route=<route>`
 */
export async function apiFetch(route: string, options?: RequestInit): Promise<Response> {
  const cleanRoute = route.replace(/^\/+/, '');

  try {
    const res = await fetch(`/api/${cleanRoute}`, options);
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      return res;
    }
    // If 4xx/5xx with valid JSON from Node/Vercel API, return it directly
    if (contentType.includes('application/json')) {
      return res;
    }
  } catch {
    // Continue to XAMPP PHP fallback
  }

  // Fallback to XAMPP PHP backend in the current directory (`./api.php?route=...`)
  const xamppMethod = (options?.method || 'GET').toUpperCase();
  const phpUrl = `./api.php?route=${encodeURIComponent(cleanRoute)}&_method=${xamppMethod}`;

  // Use POST when tunneling PATCH/DELETE for maximum Apache/XAMPP compatibility
  const fetchOptions: RequestInit =
    xamppMethod === 'PATCH' || xamppMethod === 'DELETE'
      ? {
          ...options,
          method: 'POST',
        }
      : options || {};

  return fetch(phpUrl, fetchOptions);
}
