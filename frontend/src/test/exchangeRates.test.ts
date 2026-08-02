import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getExchangeRates, convertFromUsd } from '../app/utils/exchangeRates';

const SUCCESS_RESPONSE = {
  result: 'success',
  base_code: 'USD',
  rates: { USD: 1, EUR: 0.9, GBP: 0.8, JPY: 150, INR: 83 },
};

describe('exchangeRates', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('fetches live rates and caches them in localStorage', async () => {
    (fetch as any).mockResolvedValueOnce({ ok: true, json: async () => SUCCESS_RESPONSE });

    const result = await getExchangeRates();

    expect(result.base).toBe('USD');
    expect(result.rates.EUR).toBe(0.9);
    expect(fetch).toHaveBeenCalledWith('https://open.er-api.com/v6/latest/USD');
    expect(JSON.parse(localStorage.getItem('vendr-exchange-rates') || '{}').rates.EUR).toBe(0.9);
  });

  it('serves the cache instead of refetching within the TTL window', async () => {
    (fetch as any).mockResolvedValueOnce({ ok: true, json: async () => SUCCESS_RESPONSE });
    await getExchangeRates();

    const result = await getExchangeRates();

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(result.rates.EUR).toBe(0.9);
  });

  it('refetches once the cache is older than the TTL', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
    (fetch as any).mockResolvedValue({ ok: true, json: async () => SUCCESS_RESPONSE });

    await getExchangeRates();
    vi.setSystemTime(new Date('2026-01-01T07:00:00Z'));
    await getExchangeRates();

    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('falls back to a stale cache when the network request fails', async () => {
    (fetch as any).mockResolvedValueOnce({ ok: true, json: async () => SUCCESS_RESPONSE });
    await getExchangeRates();

    vi.useFakeTimers();
    vi.setSystemTime(new Date(Date.now() + 7 * 60 * 60 * 1000));
    (fetch as any).mockRejectedValueOnce(new Error('network down'));

    const result = await getExchangeRates();

    expect(result.rates.EUR).toBe(0.9);
  });

  it('throws when the request fails and there is no cache to fall back on', async () => {
    (fetch as any).mockRejectedValueOnce(new Error('network down'));

    await expect(getExchangeRates()).rejects.toThrow('network down');
  });

  it('throws on a non-ok HTTP response', async () => {
    (fetch as any).mockResolvedValueOnce({ ok: false, status: 503, json: async () => ({}) });

    await expect(getExchangeRates()).rejects.toThrow('503');
  });

  it('throws on a malformed success-less response', async () => {
    (fetch as any).mockResolvedValueOnce({ ok: true, json: async () => ({ result: 'error' }) });

    await expect(getExchangeRates()).rejects.toThrow();
  });
});

describe('convertFromUsd', () => {
  it('converts using the given rate', () => {
    expect(convertFromUsd(100, { EUR: 0.9 }, 'EUR')).toBeCloseTo(90);
  });

  it('returns null for a currency with no known rate', () => {
    expect(convertFromUsd(100, { EUR: 0.9 }, 'MAD')).toBeNull();
  });
});
