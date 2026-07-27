import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrderContext';
import { CreditCard, Wallet, Smartphone, Lock, CheckCircle } from 'lucide-react';

type PaymentMethod = 'card' | 'paypal' | 'applepay' | 'googlepay';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  city: string;
  zipCode: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
}

type FormErrors = Partial<Record<keyof FormData, string>>;

const PAYMENT_METHODS: { id: PaymentMethod; label: string; Icon: typeof CreditCard }[] = [
  { id: 'card', label: 'Card', Icon: CreditCard },
  { id: 'paypal', label: 'PayPal', Icon: Wallet },
  { id: 'applepay', label: 'Apple Pay', Icon: Smartphone },
  { id: 'googlepay', label: 'Google Pay', Icon: Smartphone },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ZIP_RE = /^[A-Za-z0-9][A-Za-z0-9\- ]{2,9}$/;

function passesLuhn(digits: string): boolean {
  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = parseInt(digits[i], 10);
    if (double) { n *= 2; if (n > 9) n -= 9; }
    sum += n;
    double = !double;
  }
  return sum % 10 === 0;
}

function formatCardNumber(value: string) {
  return value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
}

function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
}

function validate(data: FormData, method: PaymentMethod): FormErrors {
  const errors: FormErrors = {};
  if (!data.firstName.trim()) errors.firstName = 'Required.';
  if (!data.lastName.trim()) errors.lastName = 'Required.';
  if (!data.email.trim()) errors.email = 'Required.';
  else if (!EMAIL_RE.test(data.email.trim())) errors.email = 'Enter a valid email address.';
  if (!data.address.trim()) errors.address = 'Required.';
  else if (data.address.trim().length < 5) errors.address = 'Enter a complete street address.';
  if (!data.city.trim()) errors.city = 'Required.';
  if (!data.zipCode.trim()) errors.zipCode = 'Required.';
  else if (!ZIP_RE.test(data.zipCode.trim())) errors.zipCode = 'Enter a valid ZIP / postal code.';

  if (method === 'card') {
    const digits = data.cardNumber.replace(/\s/g, '');
    if (!digits) errors.cardNumber = 'Required.';
    else if (digits.length < 13 || digits.length > 19 || !passesLuhn(digits)) {
      errors.cardNumber = 'Enter a valid card number.';
    }

    const match = data.expiry.match(/^(\d{2})\/(\d{2})$/);
    if (!data.expiry) errors.expiry = 'Required.';
    else if (!match) errors.expiry = 'Use MM/YY.';
    else {
      const month = parseInt(match[1], 10);
      const year = 2000 + parseInt(match[2], 10);
      const now = new Date();
      if (month < 1 || month > 12) errors.expiry = 'Invalid month.';
      else if (year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1)) {
        errors.expiry = 'Card has expired.';
      }
    }

    if (!data.cvv) errors.cvv = 'Required.';
    else if (data.cvv.length < 3 || data.cvv.length > 4) errors.cvv = '3 or 4 digits.';
  }

  return errors;
}

function Field({
  label, error, children,
}: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-[#71717a] mb-1.5">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function inputCls(hasError?: boolean) {
  return `w-full px-3.5 py-2.5 rounded-lg border text-sm text-[#0a0a0a] placeholder:text-[#a1a1aa] outline-none transition-colors ${
    hasError ? 'border-red-400 focus:border-red-500' : 'border-[#e4e4e7] focus:border-[#0a0a0a]'
  }`;
}

export function Checkout() {
  const { cart, getCartTotal, clearCart } = useCart();
  const { addOrder } = useOrders();
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [formData, setFormData] = useState<FormData>({
    firstName: '', lastName: '', email: '', address: '', city: '', zipCode: '',
    cardNumber: '', expiry: '', cvv: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const subtotal = getCartTotal();
  const shipping = subtotal > 100 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  useEffect(() => {
    if (cart.length === 0 && !orderPlaced) navigate('/cart', { replace: true });
  }, [cart.length, orderPlaced, navigate]);

  if (cart.length === 0 && !orderPlaced) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let next = value;
    if (name === 'cardNumber') next = formatCardNumber(value);
    if (name === 'expiry') next = formatExpiry(value);
    if (name === 'cvv') next = value.replace(/\D/g, '').slice(0, 4);
    setFormData(prev => ({ ...prev, [name]: next }));
    if (errors[name as keyof FormData]) setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate(formData, paymentMethod);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setSubmitting(true);
    try {
      await addOrder({
        items: cart,
        subtotal,
        shipping,
        tax,
        total,
        shippingInfo: {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim(),
          address: formData.address.trim(),
          city: formData.city.trim(),
          zipCode: formData.zipCode.trim(),
        },
        paymentMethod,
      });
      setOrderPlaced(true);
      clearCart();
      setTimeout(() => navigate('/orders'), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center py-12 px-6">
          <div className="w-16 h-16 rounded-full bg-[#0a0a0a] flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-[#0a0a0a] mb-2">Order placed</h2>
          <p className="text-sm text-[#71717a] mb-1">You'll get a confirmation email shortly.</p>
          <p className="text-xs text-[#a1a1aa]">Taking you to your orders…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#0a0a0a] mb-1 tracking-tight">Checkout</h1>
          <p className="text-[#71717a] text-sm">{cart.length} item{cart.length !== 1 ? 's' : ''} in your cart</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              <div className="border border-[#e4e4e7] rounded-lg p-6">
                <h2 className="text-sm font-semibold text-[#0a0a0a] mb-5">Shipping information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="First name" error={errors.firstName}>
                    <input name="firstName" value={formData.firstName} onChange={handleChange} className={inputCls(!!errors.firstName)} />
                  </Field>
                  <Field label="Last name" error={errors.lastName}>
                    <input name="lastName" value={formData.lastName} onChange={handleChange} className={inputCls(!!errors.lastName)} />
                  </Field>
                  <div className="sm:col-span-2">
                    <Field label="Email" error={errors.email}>
                      <input type="email" name="email" value={formData.email} onChange={handleChange} className={inputCls(!!errors.email)} />
                    </Field>
                  </div>
                  <div className="sm:col-span-2">
                    <Field label="Street address" error={errors.address}>
                      <input name="address" value={formData.address} onChange={handleChange} placeholder="123 Main St, Apt 4B" className={inputCls(!!errors.address)} />
                    </Field>
                  </div>
                  <Field label="City" error={errors.city}>
                    <input name="city" value={formData.city} onChange={handleChange} className={inputCls(!!errors.city)} />
                  </Field>
                  <Field label="ZIP / postal code" error={errors.zipCode}>
                    <input name="zipCode" value={formData.zipCode} onChange={handleChange} className={inputCls(!!errors.zipCode)} />
                  </Field>
                </div>
              </div>

              <div className="border border-[#e4e4e7] rounded-lg p-6">
                <h2 className="text-sm font-semibold text-[#0a0a0a] mb-5">Payment method</h2>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                  {PAYMENT_METHODS.map(({ id, label, Icon }) => {
                    const active = paymentMethod === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setPaymentMethod(id)}
                        className={`flex flex-col items-center gap-2 p-3 rounded-lg border text-sm font-medium transition-colors ${
                          active ? 'border-[#0a0a0a] text-[#0a0a0a]' : 'border-[#e4e4e7] text-[#71717a] hover:bg-[#fafafa]'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        {label}
                      </button>
                    );
                  })}
                </div>

                {paymentMethod === 'card' ? (
                  <div className="space-y-4">
                    <Field label="Card number" error={errors.cardNumber}>
                      <input
                        name="cardNumber" inputMode="numeric" value={formData.cardNumber} onChange={handleChange}
                        placeholder="1234 5678 9012 3456" className={inputCls(!!errors.cardNumber)}
                      />
                    </Field>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Expiry" error={errors.expiry}>
                        <input name="expiry" inputMode="numeric" value={formData.expiry} onChange={handleChange} placeholder="MM/YY" className={inputCls(!!errors.expiry)} />
                      </Field>
                      <Field label="CVC" error={errors.cvv}>
                        <input name="cvv" inputMode="numeric" value={formData.cvv} onChange={handleChange} placeholder="123" className={inputCls(!!errors.cvv)} />
                      </Field>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-sm text-[#71717a]">
                      {paymentMethod === 'paypal' && "You'll be redirected to PayPal after placing your order."}
                      {paymentMethod === 'applepay' && 'Confirm with Apple Pay when prompted.'}
                      {paymentMethod === 'googlepay' && 'Confirm with Google Pay when prompted.'}
                    </p>
                  </div>
                )}

                <div className="mt-5 flex items-center gap-2 text-xs text-[#a1a1aa]">
                  <Lock className="w-3.5 h-3.5" />
                  256-bit SSL encrypted
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-lg text-sm font-medium text-white bg-[#0a0a0a] hover:bg-[#2a2a2a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Lock className="w-4 h-4" />
                {submitting ? 'Placing order…' : `Place order — $${total.toFixed(2)}`}
              </button>
            </form>
          </div>

          <div>
            <div className="border border-[#e4e4e7] rounded-lg p-6 sticky top-24">
              <h2 className="text-sm font-semibold text-[#0a0a0a] mb-5">Order summary</h2>

              <div className="space-y-3 mb-5 pb-5 border-b border-[#e4e4e7]">
                {cart.map(item => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 border border-[#e4e4e7]">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-[#0a0a0a] line-clamp-2 leading-snug">{item.name}</p>
                      <p className="text-xs mt-0.5 text-[#a1a1aa]">{item.flag} {item.country} · Qty {item.quantity}</p>
                    </div>
                    <p className="text-xs font-semibold text-[#0a0a0a] shrink-0">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#71717a]">Subtotal</span>
                  <span className="text-[#0a0a0a]">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#71717a]">Shipping</span>
                  <span className="text-[#0a0a0a]">{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#71717a]">Tax (8%)</span>
                  <span className="text-[#0a0a0a]">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-[#e4e4e7] font-semibold text-[#0a0a0a]">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
