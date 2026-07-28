const CACHE_KEY = 'vendr-exchange-rates';
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const API_URL = 'https://open.er-api.com/v6/latest/USD';

export interface ExchangeRates {
  base: string;
  rates: Record<string, number>;
  fetchedAt: number;
}

function readCache(): ExchangeRates | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.fetchedAt !== 'number' || typeof parsed.rates !== 'object') return null;
    return parsed as ExchangeRates;
  } catch {
    return null;
  }
}

function writeCache(data: ExchangeRates): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
  }
}

export async function getExchangeRates(): Promise<ExchangeRates> {
  const cached = readCache();
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached;
  }

  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error(`Exchange rate request failed (${res.status}).`);
    const data = await res.json();
    if (data?.result !== 'success' || !data.rates) throw new Error('Exchange rate response was malformed.');

    const result: ExchangeRates = {
      base: data.base_code || 'Euro',
      rates: data.rates,
      fetchedAt: Date.now(),
    };
    writeCache(result);
    return result;
  } catch (err) {
    if (cached) return cached;
    throw err instanceof Error ? err : new Error('Unable to load exchange rates.');
  }
}

export function convertFromUsd(amountUsd: number, rates: Record<string, number>, currencyCode: string): number | null {
  const rate = rates[currencyCode];
  if (typeof rate !== 'number') return null;
  return amountUsd * rate;
}
