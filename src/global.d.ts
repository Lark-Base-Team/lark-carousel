declare global {
  interface Window {
    t: (key: string, params?: Record<string, string>) => string;
  }
}

export {}