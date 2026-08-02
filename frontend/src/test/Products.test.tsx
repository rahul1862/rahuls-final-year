import { describe, it, expect, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { Products } from '../app/pages/Products';
import { AuthProvider } from '../app/context/AuthContext';
import { CartProvider } from '../app/context/CartContext';
import { WishlistProvider } from '../app/context/WishlistContext';
import { ProductsProvider } from '../app/context/ProductsContext';
import { products } from '../app/data/products';

function renderProducts(initialEntry = '/products') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <AuthProvider>
        <ProductsProvider initialProducts={products}>
          <CartProvider>
            <WishlistProvider>
              <Products />
            </WishlistProvider>
          </CartProvider>
        </ProductsProvider>
      </AuthProvider>
    </MemoryRouter>
  );
}

async function waitForLoaded() {
  return screen.findByRole('button', { name: 'Grid view' });
}

function visibleProductIds(container: HTMLElement): number[] {
  return Array.from(container.querySelectorAll<HTMLAnchorElement>('a[href^="/products/"]'))
    .map(a => Number(a.getAttribute('href')!.slice('/products/'.length)));
}

describe('Products page', () => {
  beforeAll(() => {
    window.scrollTo = () => {};
  });

  it('filters results via the ?q= search param in the URL', async () => {
    const { container } = renderProducts('/products?q=headphones');
    await waitForLoaded();

    const expectedIds = products
      .filter(p => [p.name, p.description, p.category, p.country].some(v => v.toLowerCase().includes('headphones')))
      .map(p => p.id);
    expect(expectedIds.length).toBeGreaterThan(0);

    expect(visibleProductIds(container)).toEqual(expectedIds.slice(0, 12));
    expect(screen.getByText('"headphones"')).toBeInTheDocument();
  });

  it('shows the "no products match" empty state for a search with no matches', async () => {
    renderProducts('/products?q=zzzznonexistentquery');

    expect(await screen.findByText('No products match your filters')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Clear filters' })).toBeInTheDocument();
  });

  it('clicking a category button filters the grid to that category', async () => {
    const user = userEvent.setup();
    const { container } = renderProducts();
    await waitForLoaded();

    const targetCategory = [...new Set(products.map(p => p.category))][0];
    await user.click(screen.getByRole('button', { name: targetCategory }));

    const expectedIds = products.filter(p => p.category === targetCategory).map(p => p.id).slice(0, 12);
    expect(visibleProductIds(container)).toEqual(expectedIds);
  });

  it('the sort dropdown reorders products by price ascending', async () => {
    const user = userEvent.setup();
    const { container } = renderProducts();
    await waitForLoaded();

    await user.selectOptions(screen.getByDisplayValue('Sort: Featured'), 'price-asc');

    const expectedIds = [...products].sort((a, b) => a.price - b.price).map(p => p.id).slice(0, 12);
    expect(visibleProductIds(container)).toEqual(expectedIds);
  });

  it('paginates: Next/Previous move between pages when the catalog exceeds 12 items', async () => {
    const user = userEvent.setup();
    const { container } = renderProducts();
    await waitForLoaded();

    expect(products.length).toBeGreaterThan(12);

    const page1Ids = products.slice(0, 12).map(p => p.id);
    expect(visibleProductIds(container)).toEqual(page1Ids);

    const nextButton = screen.getByRole('button', { name: 'Next page' });
    const prevButton = screen.getByRole('button', { name: 'Previous page' });
    expect(prevButton).toBeDisabled();

    await user.click(nextButton);

    const page2Ids = products.slice(12, 24).map(p => p.id);
    expect(visibleProductIds(container)).toEqual(page2Ids);
    expect(prevButton).not.toBeDisabled();

    await user.click(prevButton);
    expect(visibleProductIds(container)).toEqual(page1Ids);
  });

  it('toggles between grid and list view without changing which products are shown', async () => {
    const user = userEvent.setup();
    const { container } = renderProducts();
    await waitForLoaded();

    const gridButton = screen.getByRole('button', { name: 'Grid view' });
    const listButton = screen.getByRole('button', { name: 'List view' });
    const page1Ids = products.slice(0, 12).map(p => p.id);

    expect(visibleProductIds(container)).toEqual(page1Ids);

    await user.click(listButton);
    expect(visibleProductIds(container)).toEqual(page1Ids);

    await user.click(gridButton);
    expect(visibleProductIds(container)).toEqual(page1Ids);
  });
});
