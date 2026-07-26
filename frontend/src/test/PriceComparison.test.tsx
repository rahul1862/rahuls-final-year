import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PriceComparison } from '../app/components/PriceComparison';
import { CountryProvider } from '../app/context/CountryContext';

const SUCCESS_RESPONSE = {
  result: 'success',
  base_code: 'USD',
  rates: { USD: 1, EUR: 0.9, GBP: 0.8, JPY: 150, INR: 83, CNY: 7.2, KRW: 1300, CHF: 0.88 },
};

function renderComparison(priceUsd = 100) {
  return render(
    <CountryProvider>
      <PriceComparison priceUsd={priceUsd} />
    </CountryProvider>
  );
}

describe('PriceComparison', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('is collapsed by default and does not fetch until expanded', () => {
    renderComparison();

    expect(screen.queryByText(/EUR/)).not.toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('expands, fetches live rates, and shows converted amounts', async () => {
    (fetch as any).mockResolvedValueOnce({ ok: true, json: async () => SUCCESS_RESPONSE });
    const user = userEvent.setup();
    renderComparison(100);

    await user.click(screen.getByRole('button', { name: /compare price in other currencies/i }));

    const eurRow = (await screen.findByText('EUR')).closest('li') as HTMLElement;
    expect(within(eurRow).getByText('€90.00')).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('highlights the currently selected country currency', async () => {
    localStorage.setItem('vendr-country', 'Germany');
    (fetch as any).mockResolvedValueOnce({ ok: true, json: async () => SUCCESS_RESPONSE });
    const user = userEvent.setup();
    renderComparison(100);

    await user.click(screen.getByRole('button', { name: /compare price in other currencies/i }));

    expect(await screen.findByText(/EUR · Germany/)).toBeInTheDocument();
  });

  it('shows an error state with a working retry on fetch failure', async () => {
    (fetch as any).mockRejectedValueOnce(new Error('network down'));
    const user = userEvent.setup();
    renderComparison();

    await user.click(screen.getByRole('button', { name: /compare price in other currencies/i }));
    expect(await screen.findByText('network down')).toBeInTheDocument();

    (fetch as any).mockResolvedValueOnce({ ok: true, json: async () => SUCCESS_RESPONSE });
    await user.click(screen.getByRole('button', { name: /retry/i }));

    expect(await screen.findByText('EUR')).toBeInTheDocument();
  });

  it('collapses again on a second click without refetching', async () => {
    (fetch as any).mockResolvedValueOnce({ ok: true, json: async () => SUCCESS_RESPONSE });
    const user = userEvent.setup();
    renderComparison();
    const toggle = screen.getByRole('button', { name: /compare price in other currencies/i });

    await user.click(toggle);
    await screen.findByText('EUR');
    await user.click(toggle);

    expect(screen.queryByText('EUR')).not.toBeInTheDocument();
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
