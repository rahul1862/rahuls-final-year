import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Lock, ArrowLeft, CheckCircle, AlertCircle, ShieldCheck, CreditCard } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useCountry } from '../context/CountryContext';
import { Button, LinkButton } from '../components/ui/Button';

function formatCardNumber(value: string) {
  return value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
}

function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length >= 3) return digits.slice(0, 2) + ' / ' + digits.slice(2);
  if (digits.length === 2 && value.endsWith('/')) return digits + ' / ';
  return digits;
}

function getCardType(number: string): string {
  const n = number.replace(/\s/g, '');
  if (/^4/.test(n)) return 'Visa';
  if (/^5[1-5]/.test(n) || /^2[2-7]/.test(n)) return 'Mastercard';
  if (/^3[47]/.test(n)) return 'Amex';
  if (/^6(?:011|5)/.test(n)) return 'Discover';
  return '';
}

const DECLINE_SUFFIX = '0002';

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

function validateCard(number: string, expiry: string, cvc: string, name: string): string | null {
  const digits = number.replace(/\s/g, '');
  if (!digits) return 'Card number is required.';
  if (digits.length < 13 || digits.length > 19 || !passesLuhn(digits)) return 'Enter a valid card number.';
  const parts = expiry.replace(/\s/g, '').split('/');
  if (parts.length !== 2 || parts[0].length !== 2 || parts[1].length !== 2) return 'Expiry must be MM / YY.';
  const month = parseInt(parts[0], 10);
  const year = parseInt('20' + parts[1], 10);
  const now = new Date();
  if (month < 1 || month > 12) return 'Invalid expiry month.';
  if (year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1)) return 'Card has expired.';
  if (cvc.length < 3) return 'CVC must be 3 or 4 digits.';
  if (!name.trim()) return 'Cardholder name is required.';
  return null;
}

const inputCls = "w-full px-3.5 py-2.5 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors";
const labelCls = "block text-xs font-medium text-muted-foreground mb-1.5";

export function Payment() {
  const navigate = useNavigate();
  const { cart, getCartTotal, clearCart } = useCart();
  const { getCurrency } = useCountry();
  const currency = getCurrency();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [declined, setDeclined] = useState(false);
  const [succeeded, setSucceeded] = useState(false);
  const [last4, setLast4] = useState('');

  const subtotal = getCartTotal();
  const shipping = subtotal > 100 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;
  const cardType = getCardType(cardNumber);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setDeclined(false);

    const validationError = validateCard(cardNumber, expiry, cvc, name);
    if (validationError) { setError(validationError); return; }

    setProcessing(true);
    const digits = cardNumber.replace(/\s/g, '');
    await new Promise(res => setTimeout(res, 1400));
    setProcessing(false);

    if (digits.endsWith(DECLINE_SUFFIX)) {
      setDeclined(true);
      setError('Your card was declined. Try a different card or payment method.');
      return;
    }

    setLast4(digits.slice(-4));
    setSucceeded(true);
    clearCart();
    setTimeout(() => navigate('/products'), 3500);
  };

  if (cart.length === 0 && !succeeded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="mb-4 text-sm text-muted-foreground">Your cart is empty.</p>
          <LinkButton to="/products">Browse products</LinkButton>
        </div>
      </div>
    );
  }

  if (succeeded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center py-12 px-6">
          <div className="w-16 h-16 rounded-full bg-accent-pine flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-accent-pine-foreground" />
          </div>
          <h2 className="font-display text-2xl font-semibold text-foreground mb-2">Payment successful</h2>
          <p className="text-sm text-muted-foreground">
            {cardType || 'Card'} ending in {last4} was charged {currency.symbol}{total.toFixed(2)}.
          </p>
          <p className="text-xs text-muted-foreground/70 mt-4">Taking you back to products…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-semibold text-foreground mb-1 tracking-tight">Payment</h1>
          <p className="text-sm text-muted-foreground">Complete your purchase.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
            <div className="lg:col-span-3">
              <div className="border border-border rounded-xl p-6 divide-y divide-border bg-card">
                <div className="pb-6">
                  <h2 className="text-sm font-semibold text-foreground mb-4">Contact</h2>
                  <div className="space-y-4">
                    <div>
                      <label className={labelCls}>Full name</label>
                      <input required value={name} onChange={e => setName(e.target.value)} placeholder="Jane Smith" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Email</label>
                      <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="jane@example.com" className={inputCls} />
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-semibold text-foreground">Card details</h2>
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Lock className="w-3.5 h-3.5" /> Encrypted
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className={labelCls}>Card number</label>
                      <div className="relative">
                        <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                          type="text"
                          inputMode="numeric"
                          required
                          value={cardNumber}
                          onChange={e => setCardNumber(formatCardNumber(e.target.value))}
                          placeholder="1234 5678 9012 3456"
                          className={`${inputCls} pl-11 pr-16`}
                        />
                        {cardType && (
                          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium px-2 py-0.5 rounded-md bg-surface text-muted-foreground border border-border">
                            {cardType}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelCls}>Expiry</label>
                        <input
                          type="text" inputMode="numeric" required value={expiry}
                          onChange={e => setExpiry(formatExpiry(e.target.value))}
                          placeholder="MM / YY" className={inputCls}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>CVC</label>
                        <input
                          type="text" inputMode="numeric" required value={cvc}
                          onChange={e => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                          placeholder="123" className={inputCls}
                        />
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className={`mt-4 flex items-start gap-2 text-sm rounded-lg px-3.5 py-3 ${declined ? 'bg-destructive/10 text-destructive' : 'text-destructive'}`}>
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      {error}
                    </div>
                  )}

                  <div className="mt-5 flex items-center gap-5 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" /> 256-bit SSL</span>
                    <span>Visa · Mastercard · Amex · Discover</span>
                  </div>
                </div>
              </div>

              <Button type="submit" size="lg" loading={processing} className="mt-5 w-full">
                {processing ? 'Processing…' : <><Lock className="w-4 h-4" /> Pay {currency.symbol}{total.toFixed(2)}</>}
              </Button>

              <LinkButton to="/checkout" variant="ghost" className="mt-3 w-full">
                <ArrowLeft className="w-4 h-4" /> Back to checkout
              </LinkButton>
            </div>

            <div className="lg:col-span-2">
              <div className="border border-dashed border-border rounded-xl p-6 sticky top-24 bg-card">
                <h2 className="text-sm font-semibold text-foreground mb-5">Order summary</h2>
                <div className="space-y-3 mb-5 pb-5 border-b border-border">
                  {cart.map(item => (
                    <div key={item.id} className="flex gap-3">
                      <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 border border-border relative">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground line-clamp-2 leading-snug">{item.name}</p>
                        <p className="text-xs mt-0.5 text-muted-foreground">{item.flag} {item.country} · Qty {item.quantity}</p>
                      </div>
                      <p className="text-xs font-semibold text-foreground shrink-0">{currency.symbol}{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-2.5 text-sm font-mono">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground">{currency.symbol}{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="text-foreground">{shipping === 0 ? 'Free' : `${currency.symbol}${shipping.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax (8%)</span>
                    <span className="text-foreground">{currency.symbol}{tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-border font-semibold">
                    <span className="text-foreground">Total</span>
                    <span className="text-foreground">{currency.symbol}{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
