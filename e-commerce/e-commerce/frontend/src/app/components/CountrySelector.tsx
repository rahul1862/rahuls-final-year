import { useMemo } from 'react';
import { Globe } from 'lucide-react';
import { useCountry } from '../context/CountryContext';
import { products } from '../data/products';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@ui/select';

const ALL_VALUE = 'ALL_COUNTRIES';

export function CountrySelector() {
  const { selectedCountry, setSelectedCountry } = useCountry();

  const countries = useMemo(
    () =>
      Array.from(
        new Map(products.map(product => [product.country, { flag: product.flag, country: product.country }])).values()
      ).sort((a, b) => a.country.localeCompare(b.country)),
    []
  );

  return (
    <Select
      value={selectedCountry ?? ALL_VALUE}
      onValueChange={(value) => setSelectedCountry(value === ALL_VALUE ? null : value)}
    >
      <SelectTrigger className="w-48 gap-2" aria-label="Filter products by country">
        <Globe className="w-4 h-4 text-[#71717a] shrink-0" aria-hidden="true" />
        <SelectValue placeholder="Select a country" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL_VALUE}>All Countries</SelectItem>
        {countries.map(({ flag, country }) => (
          <SelectItem key={country} value={country}>
            {flag} {country}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
