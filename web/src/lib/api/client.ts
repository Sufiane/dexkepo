import { get } from 'svelte/store';
import { auth, logout } from '../stores/auth';

const BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:7777';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export async function api<T>(
  path: string,
  init: RequestInit & { auth?: boolean } = {}
): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (init.auth) {
    const state = get(auth);
    if (state) headers.set('Authorization', `Bearer ${state.token}`);
  }
  const res = await fetch(BASE + path, { ...init, headers });
  if (res.status === 401 && init.auth) {
    logout();
  }
  if (!res.ok) {
    let msg = res.statusText;
    try {
      const j = await res.json();
      msg = (j as { message?: string | string[] }).message?.toString() ?? msg;
    } catch {
      /* noop */
    }
    throw new ApiError(res.status, msg);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
