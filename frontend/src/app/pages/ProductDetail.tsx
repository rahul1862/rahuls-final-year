import { useParams, Link } from 'react-router';
import { Star, ShoppingCart, ArrowLeft } from 'lucide-react';
import { products } from '../data/products';
import { useCart } from '../context/CartContext';
import { useState } from 'react';

export function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  const product = products.find(p => p.id === Number(id));

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h1 className="text-2xl mb-4">Product not found</h1>
        <Link to="/products" className="text-blue-600 hover:text-blue-700">
          Back to Products
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        to="/products"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Products
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Image */}
        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Product Info */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-500">{product.category}</div>
            <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full">
              <span className="text-2xl">{product.flag}</span>
              <span className="text-sm">Made in {product.country}</span>
            </div>
          </div>
          <h1 className="text-3xl mb-4">{product.name}</h1>

          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-1">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <span className="text-lg">{product.rating}</span>
            </div>
            <span className="text-gray-500">({product.reviews} reviews)</span>
          </div>

          <div className="text-4xl mb-6">${product.price.toFixed(2)}</div>

          <p className="text-gray-700 mb-8">{product.description}</p>

          {/* Quantity Selector */}
          <div className="mb-6">
            <label className="block text-sm mb-2">Quantity</label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 border rounded-lg hover:bg-gray-100"
              >
                -
              </button>
              <span className="text-lg w-12 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 border rounded-lg hover:bg-gray-100"
              >
                +
              </button>
            </div>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            className="w-full bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 mb-4"
          >
            <ShoppingCart className="w-5 h-5" />
            Add to Cart
          </button>

          {addedToCart && (
            <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg">
              Added to cart successfully!
            </div>
          )}

          {/* Product Details */}
          <div className="mt-8 border-t pt-8">
            <h3 className="text-lg mb-4">Product Details</h3>
            <ul className="space-y-2 text-gray-700">
              <li>• Free shipping on orders over $100</li>
              <li>• 30-day return policy</li>
              <li>• 1-year warranty included</li>
              <li>• Secure payment options</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}