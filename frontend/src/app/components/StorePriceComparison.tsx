import { memo, useState } from 'react';
import { ChevronDown, ChevronUp, ExternalLink, Info } from 'lucide-react';
import { getStoreEstimates } from '../utils/storePricing';

interface StorePriceComparisonProps {
  productId: number;
  productName: string;
  priceUsd: number;
}

function StorePriceComparisonComponent({ productId, productName, priceUsd }: StorePriceComparisonProps) {
  const [expanded, setExpanded] = useState(false);
  const estimates = getStoreEstimates(productId, productName, priceUsd);

  return (
    <div className="rounded-xl border border-border">
      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        aria-expanded={expanded}
        className="w-full flex items-center justify-between px-5 py-4 text-sm font-medium text-foreground"
      >
        Compare with other stores
        {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>

      {expanded && (
        <div className="px-5 pb-5 pt-1 border-t border-border">
          <ul className="divide-y divide-border pt-2">
            <li className="flex items-center justify-between py-2 text-sm">
              <span className="font-semibold text-foreground">Vendr</span>
              <span className="font-semibold text-foreground tabular-nums">${priceUsd.toFixed(2)}</span>
            </li>
            {estimates.map(({ store, price, deltaPercent, searchUrl }) => {
              const cheaper = deltaPercent < 0;
              const flat = deltaPercent === 0;
              return (
                <li key={store} className="flex items-center justify-between py-2.5 text-sm gap-3">
                  <a
                    href={searchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors"
                  >
                    {store}
                    <ExternalLink className="w-3 h-3" aria-hidden="true" />
                  </a>
                  <div className="flex items-center gap-2.5">
                    {!flat && (
                      <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${cheaper ? 'text-accent-pine bg-accent-pine/10' : 'text-muted-foreground bg-secondary'}`}>
                        {cheaper ? '' : '+'}{deltaPercent}%
                      </span>
                    )}
                    <span className="font-medium text-muted-foreground tabular-nums">~${price.toFixed(2)}</span>
                  </div>
                </li>
              );
            })}
          </ul>

          <p className="flex items-start gap-1.5 text-xs text-muted-foreground mt-3">
            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            Estimated for comparison only and not real-time pricing from these retailers. Store links open a live product search on that site.
          </p>
        </div>
      )}
    </div>
  );
}

export const StorePriceComparison = memo(StorePriceComparisonComponent);
