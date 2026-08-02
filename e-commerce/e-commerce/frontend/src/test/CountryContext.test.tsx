import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { CountryProvider, useCountry } from '../app/context/CountryContext';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <CountryProvider>{children}</CountryProvider>
);

describe('CountryContext', () => {
  it('starts with no country selected', () => {
    const { result } = renderHook(() => useCountry(), { wrapper });
    expect(result.current.selectedCountry).toBeNull();
  });

  it('defaults to USD when no country is selected', () => {
    const { result } = renderHook(() => useCountry(), { wrapper });
    const currency = result.current.getCurrency();
    expect(currency.code).toBe('USD');
    expect(currency.symbol).toBe('$');
  });

  it('updates selectedCountry when setSelectedCountry is called', () => {
    const { result } = renderHook(() => useCountry(), { wrapper });

    act(() => {
      result.current.setSelectedCountry('Germany');
    });

    expect(result.current.selectedCountry).toBe('Germany');
  });

  it('returns EUR currency for Germany', () => {
    const { result } = renderHook(() => useCountry(), { wrapper });

    act(() => {
      result.current.setSelectedCountry('Germany');
    });

    const currency = result.current.getCurrency();
    expect(currency.code).toBe('EUR');
    expect(currency.symbol).toBe('€');
  });

  it('returns INR currency for India', () => {
    const { result } = renderHook(() => useCountry(), { wrapper });

    act(() => {
      result.current.setSelectedCountry('India');
    });

    const currency = result.current.getCurrency();
    expect(currency.code).toBe('INR');
    expect(currency.symbol).toBe('₹');
  });

  it('returns JPY currency for Japan', () => {
    const { result } = renderHook(() => useCountry(), { wrapper });

    act(() => {
      result.current.setSelectedCountry('Japan');
    });

    const currency = result.current.getCurrency();
    expect(currency.code).toBe('JPY');
    expect(currency.symbol).toBe('¥');
  });

  it('returns USD as fallback for unknown country', () => {
    const { result } = renderHook(() => useCountry(), { wrapper });

    act(() => {
      result.current.setSelectedCountry('Atlantis');
    });

    const currency = result.current.getCurrency();
    expect(currency.code).toBe('USD');
  });

  it('persists selected country to localStorage', () => {
    const { result } = renderHook(() => useCountry(), { wrapper });

    act(() => {
      result.current.setSelectedCountry('India');
    });

    expect(localStorage.getItem('vendr-country')).toBe('India');
  });

  it('clears localStorage when country is set to null', () => {
    const { result } = renderHook(() => useCountry(), { wrapper });

    act(() => {
      result.current.setSelectedCountry('India');
    });
    act(() => {
      result.current.setSelectedCountry(null);
    });

    expect(localStorage.getItem('vendr-country')).toBeNull();
  });
});
