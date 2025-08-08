declare global {
  interface Window {
    t: (key: string) => string;
  }
}

export {}