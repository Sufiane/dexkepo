import { writable } from 'svelte/store';

export type ToastVariant = 'info' | 'success' | 'warning' | 'error';

export type Toast = {
  id: number;
  message: string;
  variant: ToastVariant;
  /** ms until auto-dismiss. 0 = persistent (user must dismiss). */
  duration: number;
  /** Optional action button. `onClick` fires synchronously, then the toast dismisses. */
  action?: { label: string; onClick: () => void };
};

const toasts = writable<Toast[]>([]);

export { toasts };

let nextId = 1;

type ShowOptions = Omit<Toast, 'id'> & { id?: never };

export function showToast(opts: Omit<ShowOptions, 'variant' | 'duration'> & {
  variant?: ToastVariant;
  duration?: number;
}): number {
  const id = nextId++;
  const toast: Toast = {
    id,
    message: opts.message,
    variant: opts.variant ?? 'info',
    duration: opts.duration ?? 4000,
    action: opts.action,
  };

  toasts.update((list) => [...list, toast]);

  if (toast.duration > 0) {
    setTimeout(() => dismissToast(id), toast.duration);
  }

  return id;
}

export function dismissToast(id: number): void {
  toasts.update((list) => list.filter((toast) => toast.id !== id));
}
