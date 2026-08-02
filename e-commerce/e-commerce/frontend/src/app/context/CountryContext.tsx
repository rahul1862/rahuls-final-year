import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

const COUNTRY_CURRENCY_MAP: Record<string, { code: string; symbol: string }> = {
  'United States': { code: 'USD', symbol: '$' },
  'Germany': { code: 'EUR', symbol: '€' },
  'South Korea': { code: 'KRW', symbol: '₩' },
  'Japan': { code: 'JPY', symbol: '¥' },
  'Italy': { code: 'EUR', symbol: '€' },
  'Switzerland': { code: 'CHF', symbol: 'CHF' },
  'France': { code: 'EUR', symbol: '€' },
  'Morocco': { code: 'MAD', symbol: 'د.م.' },
  'Mexico': { code: 'MXN', symbol: '$' },
  'India': { code: 'INR', symbol: '₹' },
  'Denmark': { code: 'DKK', symbol: 'kr' },
  'Brazil': { code: 'BRL', symbol: 'R$' },
  'Ghana': { code: 'GHS', symbol: '₵' },
  'China': { code: 'CNY', symbol: '¥' },
};

export interface CurrencyInfo {
  code: string;
  symbol: string;
}

interface CountryContextType {
  selectedCountry: string | null;
  setSelectedCountry: (country: string | null) => void;
  getCurrency: () => CurrencyInfo;
}

const COUNTRY_STORAGE_KEY = 'vendr-country';
const CountryContext = createContext<CountryContextType | undefined>(undefined);

export function CountryProvider({ children }: { children: ReactNode }) {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      return window.localStorage.getItem(COUNTRY_STORAGE_KEY);
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      if (selectedCountry) window.localStorage.setItem(COUNTRY_STORAGE_KEY, selectedCountry);
      else window.localStorage.removeItem(COUNTRY_STORAGE_KEY);
    } catch {
    }
  }, [selectedCountry]);

  const getCurrency = () => {
    if (!selectedCountry) return { code: 'USD', symbol: '$' };
    return COUNTRY_CURRENCY_MAP[selectedCountry] || { code: 'USD', symbol: '$' };
  };

  return (
    <CountryContext.Provider value={{ selectedCountry, setSelectedCountry, getCurrency }}>
      {children}
    </CountryContext.Provider>
  );
}

export function useCountry() {
  const context = useContext(CountryContext);
  if (!context) throw new Error('useCountry must be used within CountryProvider');
  return context;
}
