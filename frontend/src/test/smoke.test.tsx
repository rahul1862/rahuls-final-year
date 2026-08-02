import { describe, it, expect, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import App from '../app/App';
import { AuthProvider } from '../app/context/AuthContext';
import { CountryProvider } from '../app/context/CountryContext';
import { CartProvider } from '../app/context/CartContext';
import { WishlistProvider } from '../app/context/WishlistContext';
import { OrderProvider } from '../app/context/OrderContext';
import { ProductsProvider } from '../app/context/ProductsContext';
import { ToastProvider } from '../app/context/ToastContext';
import { products } from '../app/data/products';
import { Home } from '../app/pages/Home';
import { Products } from '../app/pages/Products';
import { Cart } from '../app/pages/Cart';
import { Login } from '../app/pages/Login';
import { Register } from '../app/pages/Register';
import { About } from '../app/pages/About';
import { NotFound } from '../app/pages/NotFound';

function withProviders(children: React.ReactNode, initialEntry = '/') {
  return (
    <MemoryRouter initialEntries={[initialEntry]}>
      <AuthProvider>
        <ProductsProvider initialProducts={products}>
          <CountryProvider>
            <CartProvider>
              <WishlistProvider>
                <OrderProvider>
                  <ToastProvider>{children}</ToastProvider>
                </OrderProvider>
              </WishlistProvider>
            </CartProvider>
          </CountryProvider>
        </ProductsProvider>
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('smoke: full app', () => {
  beforeAll(() => {
    window.scrollTo = () => {};
  });

  it('mounts <App /> at the default route without throwing, showing header nav and footer landmarks', async () => {
    expect(() => render(<App />)).not.toThrow();

    expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument();
    expect(screen.getAllByText('Vendr').length).toBeGreaterThan(0);

    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });
});

describe('smoke: individual pages render without throwing', () => {
  beforeAll(() => {
    window.scrollTo = () => {};
  });

  it('Home', async () => {
    expect(() => render(withProviders(<Home />))).not.toThrow();
    expect(await screen.findByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('Products', async () => {
    expect(() => render(withProviders(<Products />, '/products'))).not.toThrow();
    expect(await screen.findByText('All products')).toBeInTheDocument();
  });

  it('Cart', () => {
    expect(() => render(withProviders(<Cart />, '/cart'))).not.toThrow();
    expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
  });

  it('Login', () => {
    expect(() => render(withProviders(<Login />, '/login'))).not.toThrow();
    expect(screen.getByRole('heading', { name: 'Welcome back' })).toBeInTheDocument();
  });

  it('Register', () => {
    expect(() => render(withProviders(<Register />, '/register'))).not.toThrow();
    expect(screen.getByRole('heading', { name: 'Create an account' })).toBeInTheDocument();
  });

  it('About', () => {
    expect(() => render(withProviders(<About />, '/about'))).not.toThrow();
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('NotFound (nonexistent route)', () => {
    expect(() => render(withProviders(<NotFound />, '/this-route-does-not-exist'))).not.toThrow();
    expect(screen.getByText('Error 404')).toBeInTheDocument();
  });
});
