const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export async function fetchApi<T = any>(
  endpoint: string,
  options: RequestInit = {},
): Promise<{ success: boolean; data?: T; message?: string; meta?: any }> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  // Retrieve token: sessionStorage takes priority (for per-tab impersonation), then localStorage
  if (typeof window !== 'undefined') {
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers,
      cache: options.cache || 'no-store',
    });

    const json = await res.json();
    return json;
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || 'Network connection error with backend API',
    };
  }
}

