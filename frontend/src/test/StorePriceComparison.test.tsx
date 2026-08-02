import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StorePriceComparison } from '../app/components/StorePriceComparison';

describe('StorePriceComparison', () => {
  it('is collapsed by default', () => {
    render(<StorePriceComparison productId={1} productName="Test Product" priceUsd={100} />);

    expect(screen.queryByText('Amazon')).not.toBeInTheDocument();
  });

  it('expands to show Vendr plus all four store estimates with a disclaimer', async () => {
    const user = userEvent.setup();
    render(<StorePriceComparison productId={1} productName="Test Product" priceUsd={100} />);

    await user.click(screen.getByRole('button', { name: /compare with other stores/i }));

    expect(screen.getByText('Vendr')).toBeInTheDocument();
    expect(screen.getByText('$100.00')).toBeInTheDocument();
    for (const store of ['Amazon', 'eBay', 'Etsy', 'Tesco']) {
      expect(screen.getByText(store)).toBeInTheDocument();
    }
    expect(screen.getByText(/estimated for comparison only/i)).toBeInTheDocument();
  });

  it('links each store to a real product search, opened in a new tab', async () => {
    const user = userEvent.setup();
    render(<StorePriceComparison productId={1} productName="Test Product" priceUsd={100} />);
    await user.click(screen.getByRole('button', { name: /compare with other stores/i }));

    const amazonLink = screen.getByRole('link', { name: /amazon/i });
    expect(amazonLink).toHaveAttribute('href', 'https://www.amazon.com/s?k=Test%20Product');
    expect(amazonLink).toHaveAttribute('target', '_blank');
    expect(amazonLink).toHaveAttribute('rel', expect.stringContaining('noopener'));
  });

  it('renders the same estimates on remount for the same product (deterministic, not random per render)', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<StorePriceComparison productId={7} productName="Widget" priceUsd={50} />);
    await user.click(screen.getByRole('button', { name: /compare with other stores/i }));
    const firstPass = screen.getByRole('link', { name: /amazon/i }).parentElement!.textContent;
    unmount();

    render(<StorePriceComparison productId={7} productName="Widget" priceUsd={50} />);
    await user.click(screen.getByRole('button', { name: /compare with other stores/i }));
    const secondPass = screen.getByRole('link', { name: /amazon/i }).parentElement!.textContent;

    expect(firstPass).toBe(secondPass);
  });
});
