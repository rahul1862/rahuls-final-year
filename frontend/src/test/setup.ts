import '@testing-library/jest-dom';

if (typeof globalThis.IntersectionObserver === 'undefined') {
  class MockIntersectionObserver implements IntersectionObserver {
    readonly root: Element | Document | null = null;
    readonly rootMargin: string = '';
    readonly thresholds: ReadonlyArray<number> = [];
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords(): IntersectionObserverEntry[] { return []; }
  }
  // @ts-expect-error - partial polyfill sufficient for jsdom test rendering
  globalThis.IntersectionObserver = MockIntersectionObserver;
}

beforeEach(() => {
  localStorage.clear();
});
