import { createBrowserRouter } from "react-router";
import { Root } from "./pages/Root";
import { Home } from "./pages/Home";
import { Products } from "./pages/Products";
import { ProductDetail } from "./pages/ProductDetail";
import { Cart } from "./pages/Cart";
import { Checkout } from "./pages/Checkout";
import { Payment } from "./pages/Payment";
import { Deals } from "./pages/Deals";
import { About } from "./pages/About";
import { Contact } from "./pages/Contact";
import { Help } from "./pages/Help";
import { PricingChart } from "./pages/PricingChart";
import { ComparisonChart } from "./pages/ComparisonChart";
import { Wishlist } from "./pages/Wishlist";
import { MyOrders } from "./pages/MyOrders";
import { Settings } from "./pages/Settings";
import { Addresses } from "./pages/Addresses";
import { PaymentMethods } from "./pages/PaymentMethods";
import { SellItem } from "./pages/SellItem";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { NotFound } from "./pages/NotFound";

export const router = createBrowserRouter([
  {
    Component: Root,
    children: [
      { path: "/", Component: Home },
      { path: "products", Component: Products },
      { path: "products/:id", Component: ProductDetail },
      { path: "cart", Component: Cart },
      { path: "checkout", Component: Checkout },
      { path: "payment", Component: Payment },
      { path: "deals", Component: Deals },
      { path: "about", Component: About },
      { path: "contact", Component: Contact },
      { path: "help", Component: Help },
      { path: "pricing", Component: PricingChart },
      { path: "comparison", Component: ComparisonChart },
      { path: "wishlist", Component: Wishlist },
      { path: "orders", Component: MyOrders },
      { path: "settings", Component: Settings },
      { path: "addresses", Component: Addresses },
      { path: "payment-methods", Component: PaymentMethods },
      { path: "sell", Component: SellItem },
      { path: "login", Component: Login },
      { path: "register", Component: Register },
      { path: "*", Component: NotFound },
    ],
  },
]);
