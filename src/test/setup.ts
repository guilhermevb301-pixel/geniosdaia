import "@testing-library/jest-dom";

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

Object.defineProperty(globalThis, "ResizeObserver", {
  configurable: true,
  writable: true,
  value: class {
    observe() {}
    unobserve() {}
    disconnect() {}
  },
});
