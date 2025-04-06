import { supabase } from '@/lib/supabase';

// Define a base URL for API calls
const API_URL = 'http://localhost:5000/api';

/**
 * Base API service for making HTTP requests to the backend
 * Note: This service is now using Supabase directly instead of a separate API
 */
export const apiService = {
  /**
   * Get the authentication token from Supabase
   */
  async getToken(): Promise<string | null> {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || null;
  },

  /**
   * Make a GET request to the API
   * @param endpoint - API endpoint
   * @param params - Query parameters
   */
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const token = await this.getToken();
    const url = new URL(`${API_URL}${endpoint}`);

    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          url.searchParams.append(key, params[key]);
        }
      });
    }

    // Add a timeout to the fetch request to prevent it from hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500); // 1.5 second timeout

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId); // Clear the timeout if the request completes

      if (!response.ok) {
        try {
          const error = await response.json();
          throw new Error(error.message || `API error: ${response.status} ${response.statusText}`);
        } catch (jsonError) {
          // If we can't parse the error as JSON, throw a generic error with the status
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
      }

      return response.json();
    } catch (error: any) {
      // Handle timeout or network errors
      if (error.name === 'AbortError') {
        throw new Error('Request timed out. The server might be down or unreachable.');
      }
      throw error;
    }
  },

  /**
   * Make a POST request to the API
   * @param endpoint - API endpoint
   * @param data - Request body
   */
  async post<T>(endpoint: string, data?: any): Promise<T> {
    const token = await this.getToken();

    // Add a timeout to the fetch request to prevent it from hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500); // 1.5 second timeout

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(data),
        signal: controller.signal
      });

      clearTimeout(timeoutId); // Clear the timeout if the request completes

      if (!response.ok) {
        try {
          const error = await response.json();
          throw new Error(error.message || `API error: ${response.status} ${response.statusText}`);
        } catch (jsonError) {
          // If we can't parse the error as JSON, throw a generic error with the status
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
      }

      return response.json();
    } catch (error: any) {
      // Handle timeout or network errors
      if (error.name === 'AbortError') {
        throw new Error('Request timed out. The server might be down or unreachable.');
      }
      throw error;
    }
  },

  /**
   * Make a PUT request to the API
   * @param endpoint - API endpoint
   * @param data - Request body
   */
  async put<T>(endpoint: string, data?: any): Promise<T> {
    const token = await this.getToken();

    // Add a timeout to the fetch request to prevent it from hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500); // 1.5 second timeout

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(data),
        signal: controller.signal
      });

      clearTimeout(timeoutId); // Clear the timeout if the request completes

      if (!response.ok) {
        try {
          const error = await response.json();
          throw new Error(error.message || `API error: ${response.status} ${response.statusText}`);
        } catch (jsonError) {
          // If we can't parse the error as JSON, throw a generic error with the status
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
      }

      return response.json();
    } catch (error: any) {
      // Handle timeout or network errors
      if (error.name === 'AbortError') {
        throw new Error('Request timed out. The server might be down or unreachable.');
      }
      throw error;
    }
  },

  /**
   * Make a DELETE request to the API
   * @param endpoint - API endpoint
   */
  async delete<T>(endpoint: string): Promise<T> {
    const token = await this.getToken();

    // Add a timeout to the fetch request to prevent it from hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500); // 1.5 second timeout

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId); // Clear the timeout if the request completes

      if (!response.ok) {
        try {
          const error = await response.json();
          throw new Error(error.message || `API error: ${response.status} ${response.statusText}`);
        } catch (jsonError) {
          // If we can't parse the error as JSON, throw a generic error with the status
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
      }

      return response.json();
    } catch (error: any) {
      // Handle timeout or network errors
      if (error.name === 'AbortError') {
        throw new Error('Request timed out. The server might be down or unreachable.');
      }
      throw error;
    }
  }
};
