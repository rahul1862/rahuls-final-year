import { useState } from 'react';
import { ChevronDown, ChevronUp, ExternalLink, Info } from 'lucide-react';
import { getStoreEstimates } from '../utils/storePricing';

interface StorePriceComparisonProps {
  productId: number;
  productName: string;
  priceEur: number;
}

export function StorePriceComparison({ productId, productName, priceEur }: StorePriceComparisonProps) {
  const [expanded, setExpanded] = useState(false);
  const estimates = getStoreEstimates(productId, productName, priceEur);

  return (
    <div className="rounded-lg border border-[#e4e4e7]">
      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        aria-expanded={expanded}
        className="w-full flex items-center justify-between px-5 py-4 text-sm font-medium text-[#0a0a0a]"
      >
        Compare with other stores
        {expanded ? <ChevronUp className="w-4 h-4 text-[#71717a]" /> : <ChevronDown className="w-4 h-4 text-[#71717a]" />}
      </button>

      {expanded && (
        <div className="px-5 pb-5 pt-1 border-t border-[#e4e4e7]">
          <ul className="divide-y divide-[#f0f0f0] pt-2">
            <li className="flex items-center justify-between py-2 text-sm">
              <span className="font-semibold text-[#0a0a0a]">Vendr</span>
              <span className="font-semibold text-[#0a0a0a]">€{priceEur.toFixed(2)}</span>
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
                    className="flex items-center gap-1.5 text-[#71717a] hover:text-[#0a0a0a] transition-colors"
                  >
                    {store}
                    <ExternalLink className="w-3 h-3" aria-hidden="true" />
                  </a>
                  <div className="flex items-center gap-2.5">
                    {!flat && (
                      <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${cheaper ? 'text-emerald-700 bg-emerald-50' : 'text-[#71717a] bg-[#f4f4f5]'}`}>
                        {cheaper ? '' : '+'}{deltaPercent}%
                      </span>
                    )}
                    <span className="font-medium text-[#71717a] tabular-nums">~€{price.toFixed(2)}</span>
                  </div>
                </li>
              );
            })}
          </ul>

          <p className="flex items-start gap-1.5 text-xs text-[#a1a1aa] mt-3">
            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            Estimated for comparison only — not real-time pricing from these retailers. Store links open a live product search on that site.
          </p>
        </div>
      )}
    </div>
  );
}
