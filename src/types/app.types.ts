export interface User {
  username: string;
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  coverUrl?: string;
  audioUrl?: string;
  duration?: number;
  uploadedAt?: string;
}

export interface AuthResponse {
  message: string;
  token?: string;
  user?: User;
}

export interface RegisterData {
  username: string;
  password: string;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface FavoriteAction {
  trackId: string;
}

export type PageName = 'auth' | 'tracks' | 'favorites' | 'profile';