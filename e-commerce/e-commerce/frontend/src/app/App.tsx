import { RouterProvider } from 'react-router';
import { router } from './routes';
import { CartProvider } from './context/CartContext';
import { CountryProvider } from './context/CountryContext';
import { WishlistProvider } from './context/WishlistContext';
import { OrderProvider } from './context/OrderContext';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <CountryProvider>
        <CartProvider>
          <WishlistProvider>
            <OrderProvider>
              <RouterProvider router={router} />
            </OrderProvider>
          </WishlistProvider>
        </CartProvider>
      </CountryProvider>
    </AuthProvider>
  );
}

export default App;
