const API_BASE_URL = 'http://localhost:5000/api';

export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('accessToken');

  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || `HTTP ${response.status}`);
  }

  return response.json();
};

// Convenience methods
export const api = {
  get: (endpoint: string) => apiCall(endpoint, { method: 'GET' }),
  post: (endpoint: string, data?: any) =>
    apiCall(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),
  put: (endpoint: string, data?: any) =>
    apiCall(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),
  delete: (endpoint: string) => apiCall(endpoint, { method: 'DELETE' }),
};
