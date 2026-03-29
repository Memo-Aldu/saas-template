"use client";

const TOAST_STORAGE_KEY = "saas-template:toast";

export type QueuedToast = {
  description?: string;
  title: string;
  variant?: "error" | "success" | "info";
};

export function queueToast(payload: QueuedToast) {
  window.localStorage.setItem(TOAST_STORAGE_KEY, JSON.stringify(payload));
}

export { TOAST_STORAGE_KEY };
