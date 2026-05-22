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
  /**
   * Optional live countdown shown after the message (e.g. "Retry in 12s").
   * The store ticks the value; the component re-renders. Dismissed when it
   * hits 0.
   */
  countdownSeconds?: number;
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
    countdownSeconds: opts.countdownSeconds,
  };

  toasts.update((list) => [...list, toast]);

  if (toast.countdownSeconds && toast.countdownSeconds > 0) {
    // Live tick: decrement once a second, auto-dismiss when it hits 0.
    const tick = (): void => {
      toasts.update((list) =>
        list.flatMap((entry) => {
          if (entry.id !== id) {
            return [entry];
          }

          const next = (entry.countdownSeconds ?? 0) - 1;

          if (next <= 0) {
            return [];
          }

          return [{ ...entry, countdownSeconds: next }];
        }),
      );

      // Re-check whether the toast is still present (user may have dismissed).
      const stillThere = currentList().some((entry) => entry.id === id);

      if (stillThere) {
        setTimeout(tick, 1000);
      }
    };

    setTimeout(tick, 1000);
  } else if (toast.duration > 0) {
    setTimeout(() => dismissToast(id), toast.duration);
  }

  return id;
}

function currentList(): Toast[] {
  let snapshot: Toast[] = [];
  const unsub = toasts.subscribe((value) => {
    snapshot = value;
  });

  unsub();

  return snapshot;
}

export function dismissToast(id: number): void {
  toasts.update((list) => list.filter((toast) => toast.id !== id));
}
