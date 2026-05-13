import type { AuthResponse, LoginRequest, RegisterRequest } from '@dexkepo/shared';
import { api } from './client';

export function register(body: RegisterRequest): Promise<AuthResponse> {
  return api<AuthResponse>('/auth/register', { method: 'POST', body: JSON.stringify(body) });
}

export function login(body: LoginRequest): Promise<AuthResponse> {
  return api<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(body) });
}
