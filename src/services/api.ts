// src/services/api.ts
import { Track } from '../types/app.types';

// Интерфейсы для данных
export interface RegisterData {
  username: string;
  password: string;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  token?: string;
  user?: {
    username: string;
  };
}

export interface FavoriteAction {
  trackId: string;
}

// Интерфейс для ответа с пагинацией
export interface PaginatedTracksResponse {
  tracks: Track[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

const BASE_URL = 'http://localhost:8000/api';

export class ApiService {
  private static token: string | null = null;

  /**
   * Сохранение токена
   */
  static setToken(token: string): void {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  /**
   * Получение токена
   */
  static getToken(): string | null {
    if (this.token) return this.token;
    this.token = localStorage.getItem('auth_token');
    return this.token;
  }

  /**
   * Очистка токена (выход)
   */
  static clearToken(): void {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  /**
   * Получение заголовков для запросов
   */
  private static getHeaders(): HeadersInit {
    const headers: HeadersInit = { 
      'Content-Type': 'application/json'
    };
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  /**
   * Регистрация нового пользователя
   * POST /api/register
   */
  static async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Ошибка регистрации');
      }
      
      return result;
    } catch (error) {
      console.error('❌ Register error:', error);
      throw error;
    }
  }

  /**
   * Авторизация пользователя
   * POST /api/login
   */
  static async login(data: LoginData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Ошибка авторизации');
      }
      
      // Сохраняем токен при успешной авторизации
      if (result.token) {
        this.setToken(result.token);
      }
      
      return result;
    } catch (error) {
      console.error('❌ Login error:', error);
      throw error;
    }
  }

  /**
   * Получение списка треков с пагинацией
   * GET /api/tracks?page=1&limit=10
   */
  static async getTracks(page: number = 1, limit: number = 10): Promise<PaginatedTracksResponse> {
    try {
      const response = await fetch(`${BASE_URL}/tracks?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Бэкенд может возвращать просто массив или объект с pagination
      if (Array.isArray(data)) {
        return {
          tracks: data,
          pagination: {
            page,
            limit,
            total: data.length,
            totalPages: Math.ceil(data.length / limit),
            hasNextPage: page * limit < data.length,
            hasPrevPage: page > 1
          }
        };
      }
      
      return data;
    } catch (error) {
      console.error('❌ Error fetching tracks:', error);
      return {
        tracks: [],
        pagination: {
          page: 1,
          limit,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false
        }
      };
    }
  }

  /**
   * Получение списка избранного
   * GET /api/favorites
   */
  static async getFavorites(): Promise<Track[]> {
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      const token = this.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${BASE_URL}/favorites`, {
        method: 'GET',
        headers,
      });
      
      if (!response.ok) {
        console.warn(`⚠️ Favorites API returned ${response.status}`);
        return [];
      }
      
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('❌ Error fetching favorites:', error);
      return [];
    }
  }

  /**
   * Добавление трека в избранное
   * POST /api/favorites
   */
  static async addToFavorites(data: FavoriteAction): Promise<{ message: string }> {
    try {
      const response = await fetch(`${BASE_URL}/favorites`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка добавления в избранное');
      }
      
      return response.json();
    } catch (error) {
      console.error('❌ Error adding to favorites:', error);
      throw error;
    }
  }

  /**
   * Удаление трека из избранного
   * DELETE /api/favorites
   */
  static async removeFromFavorites(data: FavoriteAction): Promise<{ message: string }> {
    try {
      const response = await fetch(`${BASE_URL}/favorites`, {
        method: 'DELETE',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка удаления из избранного');
      }
      
      return response.json();
    } catch (error) {
      console.error('❌ Error removing from favorites:', error);
      throw error;
    }
  }

  /**
   * Проверка авторизации
   */
  static isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
   * Получение имени пользователя из токена
   */
  static getUsernameFromToken(): string {
    try {
      const token = this.getToken();
      if (!token) return 'Гость';
      
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const payload = JSON.parse(jsonPayload);
      return payload.username || 'Пользователь';
    } catch {
      return 'Пользователь';
    }
  }
}