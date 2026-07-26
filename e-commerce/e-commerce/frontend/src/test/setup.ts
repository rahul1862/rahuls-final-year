import '@testing-library/jest-dom';

// Clear localStorage before each test so state doesn't bleed between tests
beforeEach(() => {
  localStorage.clear();
});
