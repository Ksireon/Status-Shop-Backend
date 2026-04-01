import { API_URL } from './constants';
import { AuthResponse } from './types';

class ApiClient {
  private baseUrl: string;
  private accessToken: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('accessToken');
    }
  }

  setAccessToken(token: string | null) {
    this.accessToken = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('accessToken', token);
      } else {
        localStorage.removeItem('accessToken');
      }
    }
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    console.log(`API Request: ${options.method || 'GET'} ${url}`);
    
    const response = await fetch(url, {
      ...options,
      headers,
    });

    console.log(`API Response: ${response.status}`);

    if (response.status === 401) {
      const refreshed = await this.refreshToken();
      if (refreshed) {
        return this.request(endpoint, options);
      } else {
        this.logout();
        throw new Error('Session expired');
      }
    }

    const data = await response.json().catch(() => ({ message: 'Unknown error' }));
    console.log('API Data:', data);

    if (!response.ok) {
      throw new Error(data.message || data.error?.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const result = await this.request<{ data: AuthResponse }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    // Backend wraps response in "data" field
    const response = result.data;

    this.setAccessToken(response.accessToken);
    if (typeof window !== 'undefined') {
      localStorage.setItem('refreshToken', response.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.user));
    }

    return response;
  }

  async refreshToken(): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return false;

    try {
      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) return false;

      const data = await response.json();
      this.setAccessToken(data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      return true;
    } catch {
      return false;
    }
  }

  logout() {
    this.setAccessToken(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    const result = await this.request<{ data: T }>(endpoint, { method: 'GET' });
    return result.data;
  }

  async post<T>(endpoint: string, body: unknown): Promise<T> {
    const result = await this.request<{ data: T }>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return result.data;
  }

  async patch<T>(endpoint: string, body: unknown): Promise<T> {
    const result = await this.request<{ data: T }>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
    return result.data;
  }

  async delete<T>(endpoint: string): Promise<T> {
    const result = await this.request<{ data: T }>(endpoint, { method: 'DELETE' });
    return result.data;
  }
}

export const api = new ApiClient(API_URL);
