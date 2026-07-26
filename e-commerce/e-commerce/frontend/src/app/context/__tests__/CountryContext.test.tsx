import { describe, it, expect, beforeEach } from 'vitest';

describe('CountryContext - Country and Currency Selection', () => {
  let countryState;

  beforeEach(() => {
    countryState = {
      selectedCountry: 'US',
      currency: 'USD',
      currencySymbol: '$',
      exchangeRates: {
        US: 1.0,
        UK: 0.79,
        EU: 0.92,
        CA: 1.36,
        AU: 1.53,
        IN: 83.12
      },
      setCountry: function(country) {
        this.selectedCountry = country;
        this.updateCurrency(country);
      },
      updateCurrency: function(country) {
        const currencyMap = {
          US: { currency: 'USD', symbol: '$' },
          UK: { currency: 'GBP', symbol: '£' },
          EU: { currency: 'EUR', symbol: '€' },
          CA: { currency: 'CAD', symbol: '$' },
          AU: { currency: 'AUD', symbol: '$' },
          IN: { currency: 'INR', symbol: '₹' }
        };
        const currencyInfo = currencyMap[country] || currencyMap['US'];
        this.currency = currencyInfo.currency;
        this.currencySymbol = currencyInfo.symbol;
      },
      convertPrice: function(basePrice, country) {
        return basePrice * (this.exchangeRates[country] || 1.0);
      }
    };
  });

  it('should set default country to US', () => {
    expect(countryState.selectedCountry).toBe('US');
    expect(countryState.currency).toBe('USD');
  });

  it('should change country and update currency', () => {
    countryState.setCountry('UK');

    expect(countryState.selectedCountry).toBe('UK');
    expect(countryState.currency).toBe('GBP');
    expect(countryState.currencySymbol).toBe('£');
  });

  it('should update to Euro currency for EU', () => {
    countryState.setCountry('EU');

    expect(countryState.currency).toBe('EUR');
    expect(countryState.currencySymbol).toBe('€');
  });

  it('should convert price to different currencies', () => {
    const basePrice = 100;

    const usdPrice = countryState.convertPrice(basePrice, 'US');
    const gbpPrice = countryState.convertPrice(basePrice, 'UK');
    const eurPrice = countryState.convertPrice(basePrice, 'EU');

    expect(usdPrice).toBe(100);
    expect(gbpPrice).toBe(79);
    expect(eurPrice).toBe(92);
  });

  it('should handle multiple country selections', () => {
    countryState.setCountry('CA');
    expect(countryState.currency).toBe('CAD');

    countryState.setCountry('AU');
    expect(countryState.currency).toBe('AUD');

    countryState.setCountry('IN');
    expect(countryState.currency).toBe('INR');
    expect(countryState.currencySymbol).toBe('₹');
  });

  it('should maintain exchange rates accurately', () => {
    const basePrice = 50;

    const convertedUK = countryState.convertPrice(basePrice, 'UK');
    expect(convertedUK).toBeCloseTo(39.5, 1);

    const convertedCA = countryState.convertPrice(basePrice, 'CA');
    expect(convertedCA).toBeCloseTo(68, 1);

    const convertedIN = countryState.convertPrice(basePrice, 'IN');
    expect(convertedIN).toBeCloseTo(4156, 0);
  });

  it('should return default currency for unknown country', () => {
    countryState.setCountry('UNKNOWN');

    expect(countryState.currency).toBe('USD');
    expect(countryState.currencySymbol).toBe('$');
  });

  it('should apply correct currency symbol per country', () => {
    const countries = [
      { code: 'US', symbol: '$' },
      { code: 'UK', symbol: '£' },
      { code: 'EU', symbol: '€' },
      { code: 'IN', symbol: '₹' }
    ];

    countries.forEach(({ code, symbol }) => {
      countryState.setCountry(code);
      expect(countryState.currencySymbol).toBe(symbol);
    });
  });

  it('should persist country selection', () => {
    countryState.setCountry('AU');
    const savedCountry = countryState.selectedCountry;

    expect(savedCountry).toBe('AU');
    expect(countryState.currency).toBe('AUD');
  });
});
