import { RouterProvider } from 'react-router';
import { router } from './routes';
import { CartProvider } from './context/CartContext';
import { CountryProvider } from './context/CountryContext';
import { WishlistProvider } from './context/WishlistContext';
import { OrderProvider } from './context/OrderContext';
import { AuthProvider } from './context/AuthContext';
import { ProductsProvider } from './context/ProductsContext';
import { ToastProvider } from './context/ToastContext';

function App() {
  return (
    <AuthProvider>
      <ProductsProvider>
        <CountryProvider>
          <CartProvider>
            <WishlistProvider>
              <OrderProvider>
                <ToastProvider>
                  <RouterProvider router={router} />
                </ToastProvider>
              </OrderProvider>
            </WishlistProvider>
          </CartProvider>
        </CountryProvider>
      </ProductsProvider>
    </AuthProvider>
  );
}

export default App;
