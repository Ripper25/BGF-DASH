import { API_URL } from '@/config';
import staffAuthService from './staff-auth.service';

/**
 * API client service
 */
const apiService = {
  /**
   * Make a GET request to the API
   * @param endpoint - API endpoint
   * @param options - Fetch options
   */
  async get<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.request<T>('GET', endpoint, undefined, options);
  },

  /**
   * Make a POST request to the API
   * @param endpoint - API endpoint
   * @param data - Request body
   * @param options - Fetch options
   */
  async post<T>(endpoint: string, data?: any, options: RequestInit = {}): Promise<T> {
    return this.request<T>('POST', endpoint, data, options);
  },

  /**
   * Make a PUT request to the API
   * @param endpoint - API endpoint
   * @param data - Request body
   * @param options - Fetch options
   */
  async put<T>(endpoint: string, data?: any, options: RequestInit = {}): Promise<T> {
    return this.request<T>('PUT', endpoint, data, options);
  },

  /**
   * Make a PATCH request to the API
   * @param endpoint - API endpoint
   * @param data - Request body
   * @param options - Fetch options
   */
  async patch<T>(endpoint: string, data?: any, options: RequestInit = {}): Promise<T> {
    return this.request<T>('PATCH', endpoint, data, options);
  },

  /**
   * Make a DELETE request to the API
   * @param endpoint - API endpoint
   * @param options - Fetch options
   */
  async delete<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.request<T>('DELETE', endpoint, undefined, options);
  },

  /**
   * Make a request to the API
   * @param method - HTTP method
   * @param endpoint - API endpoint
   * @param data - Request body
   * @param options - Fetch options
   */
  async request<T>(
    method: string,
    endpoint: string,
    data?: any,
    options: RequestInit = {}
  ): Promise<T> {
    // Build the URL
    const url = `${API_URL}${endpoint}`;

    // Build the request options
    const requestOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add the staff token to the request if available
    const staffToken = staffAuthService.getToken();
    if (staffToken) {
      requestOptions.headers = {
        ...requestOptions.headers,
        Authorization: `Bearer ${staffToken}`,
      };
    }

    // Add the request body if provided
    if (data) {
      requestOptions.body = JSON.stringify(data);
    }

    // Make the request
    const response = await fetch(url, requestOptions);

    // Handle the response
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'API request failed');
    }

    // Parse the response
    const responseData = await response.json();

    return responseData as T;
  },
};

export default apiService;
