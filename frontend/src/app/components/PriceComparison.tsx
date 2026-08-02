import { memo, useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, RefreshCw, AlertCircle } from 'lucide-react';
import { getExchangeRates, convertFromUsd, ExchangeRates } from '../utils/exchangeRates';
import { useCountry } from '../context/CountryContext';

const DISPLAY_CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'INR', 'CNY', 'KRW', 'CHF'];

interface PriceComparisonProps {
  priceUsd: number;
}

function formatAmount(amount: number, currencyCode: string): string {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: currencyCode }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currencyCode}`;
  }
}

function PriceComparisonComponent({ priceUsd }: PriceComparisonProps) {
  const { selectedCountry, getCurrency } = useCountry();
  const [expanded, setExpanded] = useState(false);
  const [rates, setRates] = useState<ExchangeRates | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const localCurrency = getCurrency().code;

  const load = () => {
    setLoading(true);
    setError(null);
    getExchangeRates()
      .then(setRates)
      .catch(err => setError(err instanceof Error ? err.message : 'Unable to load exchange rates.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (expanded && !rates && !loading && !error) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expanded]);

  const currencyList = Array.from(new Set([localCurrency, ...DISPLAY_CURRENCIES]));

  return (
    <div className="rounded-xl border border-border">
      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        aria-expanded={expanded}
        className="w-full flex items-center justify-between px-5 py-4 text-sm font-medium text-foreground"
      >
        Compare price in other currencies
        {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>

      {expanded && (
        <div className="px-5 pb-5 pt-1 border-t border-border">
          {loading ? (
            <div className="space-y-2 pt-4" aria-label="Loading exchange rates">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-5 bg-secondary rounded animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground pt-4">
              <span className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </span>
              <button
                type="button"
                onClick={load}
                className="flex items-center gap-1.5 text-primary font-medium hover:underline underline-offset-2 shrink-0"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retry
              </button>
            </div>
          ) : rates ? (
            <>
              <ul className="divide-y divide-border pt-2">
                {currencyList.map(code => {
                  const converted = convertFromUsd(priceUsd, rates.rates, code);
                  const isLocal = code === localCurrency;
                  return (
                    <li key={code} className="flex items-center justify-between py-2 text-sm">
                      <span className={isLocal ? 'font-semibold text-foreground' : 'text-muted-foreground'}>
                        {code}
                        {isLocal && selectedCountry ? ` · ${selectedCountry}` : ''}
                      </span>
                      <span className={isLocal ? 'font-semibold text-foreground tabular-nums' : 'font-medium text-muted-foreground tabular-nums'}>
                        {converted !== null ? formatAmount(converted, code) : 'Not available'}
                      </span>
                    </li>
                  );
                })}
              </ul>
              <p className="text-xs text-muted-foreground mt-3">
                Live rates via exchangerate-api.com, as of {new Date(rates.fetchedAt).toLocaleString()}. For reference only — you're charged in USD at checkout.
              </p>
            </>
          ) : null}
        </div>
      )}
    </div>
  );
}

export const PriceComparison = memo(PriceComparisonComponent);
