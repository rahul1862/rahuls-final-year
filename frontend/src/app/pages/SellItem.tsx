import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tag, Package, DollarSign, ImageIcon, MapPin, Mail, CheckCircle, ArrowRight, ShieldCheck, Zap, Globe, AlertCircle } from 'lucide-react';
import { api } from '../utils/api';

const categories = ['Electronics', 'Fashion', 'Home', 'Beauty', 'Food', 'Accessories', 'Art', 'Kitchen', 'Office', 'Toys'];
const conditions = ['New', 'Like New', 'Good', 'Fair', 'Poor'];
const countries = [
  'United States', 'United Kingdom', 'Germany', 'France', 'Japan',
  'South Korea', 'Italy', 'Switzerland', 'Canada', 'Australia',
  'Brazil', 'India', 'Mexico', 'Spain', 'Netherlands',
];

const CURRENCY_BY_COUNTRY: Record<string, { code: string; symbol: string }> = {
  'United States': { code: 'USD', symbol: '$' },
  'United Kingdom': { code: 'GBP', symbol: '£' },
  'Germany': { code: 'EUR', symbol: '€' },
  'France': { code: 'EUR', symbol: '€' },
  'Japan': { code: 'JPY', symbol: '¥' },
  'South Korea': { code: 'KRW', symbol: '₩' },
  'Italy': { code: 'EUR', symbol: '€' },
  'Switzerland': { code: 'CHF', symbol: 'CHF' },
  'Canada': { code: 'CAD', symbol: '$' },
  'Australia': { code: 'AUD', symbol: '$' },
  'Brazil': { code: 'BRL', symbol: 'R$' },
  'India': { code: 'INR', symbol: '₹' },
  'Mexico': { code: 'MXN', symbol: '$' },
  'Spain': { code: 'EUR', symbol: '€' },
  'Netherlands': { code: 'EUR', symbol: '€' },
};

interface ListingForm {
  name: string;
  category: string;
  condition: string;
  price: string;
  description: string;
  country: string;
  email: string;
  imageUrl: string;
}

const emptyForm: ListingForm = {
  name: '', category: '', condition: '', price: '',
  description: '', country: '', email: '', imageUrl: '',
};

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

const steps = [
  { step: '01', title: 'List your item', body: 'Fill in the details — name, price, condition, photos. Takes under 2 minutes.' },
  { step: '02', title: 'Buyers find you', body: 'Your listing goes live immediately and appears in search results across the globe.' },
  { step: '03', title: 'Get paid', body: 'Once sold, we transfer the funds directly to your account within 1–2 business days.' },
];

const perks = [
  { icon: ShieldCheck, label: 'Seller protection', desc: 'Every transaction is covered. We resolve disputes and protect your earnings.' },
  { icon: Zap, label: 'Fast payouts', desc: 'Money hits your account quickly — no waiting weeks to see your earnings.' },
  { icon: Globe, label: 'Global reach', desc: 'Reach buyers in 150+ countries without any extra effort on your part.' },
];

export function SellItem() {
  const [form, setForm] = useState<ListingForm>(emptyForm);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [errors, setErrors] = useState<Partial<ListingForm>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof ListingForm]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = (): boolean => {
    const e: Partial<ListingForm> = {};
    if (!form.name.trim())        e.name        = 'Item name is required';
    if (!form.category)           e.category    = 'Select a category';
    if (!form.condition)          e.condition   = 'Select a condition';
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0)
                                  e.price       = 'Enter a valid price';
    if (!form.description.trim()) e.description = 'Add a short description';
    if (!form.country)            e.country     = 'Select your country';
    if (!form.email.trim())       e.email       = 'Contact email is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setSubmitError('');

    try {
      await api.post('/product', {
        title: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        discountedPrice: 0,
        quantity: 1,
        stock: true,
        live: true,
        country: form.country,
        imageUrl: form.imageUrl.trim() || null,
        category: form.category,
        rating: 0,
        reviews: 0,
      });
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to submit listing. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setForm(emptyForm);
    setErrors({});
    setSubmitted(false);
  };

  const currency = CURRENCY_BY_COUNTRY[form.country] ?? { code: 'USD', symbol: '$' };

  const inputCls = (field: keyof ListingForm) =>
    `w-full px-3.5 py-2.5 border rounded-lg bg-white text-[#0a0a0a] focus:outline-none placeholder-[#a1a1aa] text-sm transition-colors ${
      errors[field] ? 'border-red-400 focus:border-red-500' : 'border-[#e4e4e7] focus:border-[#0a0a0a]'
    }`;

  return (
    <div className="min-h-screen bg-white">
      <section className="pt-20 pb-12 border-b border-[#e4e4e7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-[#a1a1aa] mb-3">
              Seller Hub
            </p>
            <h1 className="text-4xl lg:text-5xl font-bold text-[#0a0a0a] mb-4 tracking-tight">
              Turn your items<br className="hidden sm:block" /> into cash
            </h1>
            <p className="text-[#71717a] text-lg max-w-xl">
              List anything — electronics, fashion, art, collectibles. Reach millions of buyers worldwide with zero listing fees.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-semibold text-[#0a0a0a] mb-8">How it works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {steps.map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: i * 0.1, ease }}
                className="bg-[#fafafa] rounded-xl p-6 border border-[#e4e4e7]"
              >
                <span className="text-3xl font-bold text-[#e4e4e7]">{item.step}</span>
                <h3 className="text-[#0a0a0a] font-semibold mt-3 mb-1">{item.title}</h3>
                <p className="text-[#71717a] text-sm leading-relaxed">{item.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

            <div className="space-y-4 order-2 lg:order-1">
              <h3 className="text-sm font-semibold text-[#0a0a0a] uppercase tracking-wide">Why sell on Vendr</h3>
              {perks.map(item => (
                <div key={item.label} className="flex items-start gap-3 p-4 rounded-lg border border-[#e4e4e7] bg-white">
                  <item.icon className="w-5 h-5 text-[#0a0a0a] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[#0a0a0a] text-sm font-medium">{item.label}</p>
                    <p className="text-[#71717a] text-xs mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}

              <div className="p-4 rounded-lg border border-[#e4e4e7] bg-[#fafafa]">
                <p className="text-[#0a0a0a] text-sm font-medium mb-1">Fees</p>
                <p className="text-[#71717a] text-xs leading-relaxed">
                  Listing is <span className="font-semibold text-[#0a0a0a]">free</span>. We take a small 5% commission only when your item sells — so we only win when you do.
                </p>
              </div>
            </div>

            <div className="lg:col-span-2 order-1 lg:order-2">
              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4, ease }}
                    className="bg-white rounded-xl border border-[#e4e4e7] p-8 lg:p-12 text-center"
                  >
                    <div className="w-14 h-14 bg-[#f4f4f5] rounded-full flex items-center justify-center mx-auto mb-5">
                      <CheckCircle className="w-7 h-7 text-[#0a0a0a]" />
                    </div>
                    <h2 className="text-2xl font-bold text-[#0a0a0a] mb-2">Listing submitted!</h2>
                    <p className="text-[#71717a] text-sm max-w-sm mx-auto mb-8">
                      Your item <span className="font-semibold text-[#0a0a0a]">"{form.name}"</span> is now under review and will go live within the hour.
                    </p>

                    <div className="max-w-xs mx-auto bg-[#fafafa] rounded-xl border border-[#e4e4e7] overflow-hidden text-left mb-8">
                      <div className="aspect-video bg-[#f4f4f5] flex items-center justify-center overflow-hidden">
                        {form.imageUrl ? (
                          <img src={form.imageUrl} alt={form.name} className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-8 h-8 text-[#d4d4d8]" />
                        )}
                      </div>
                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-semibold uppercase tracking-wide text-[#71717a] bg-[#e4e4e7] rounded px-1.5 py-0.5">
                            {form.category}
                          </span>
                          <span className="text-[10px] text-[#a1a1aa]">{form.condition}</span>
                        </div>
                        <p className="text-[#0a0a0a] text-sm font-semibold line-clamp-1">{form.name}</p>
                        <p className="text-[#0a0a0a] font-bold mt-1">{currency.symbol}{Number(form.price).toFixed(2)}</p>
                        <p className="text-[#a1a1aa] text-xs mt-1">{form.country}</p>
                      </div>
                    </div>

                    <button
                      onClick={handleReset}
                      className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#0a0a0a] text-white text-sm font-medium rounded-lg hover:bg-[#2a2a2a] transition-colors"
                    >
                      List another item
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="bg-white rounded-xl border border-[#e4e4e7] p-6 lg:p-8"
                  >
                    <h2 className="text-xl font-semibold text-[#0a0a0a] mb-6">Item details</h2>

                    {submitError && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-5 text-sm"
                      >
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        {submitError}
                      </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                      <div>
                        <label className="flex items-center gap-1.5 text-sm text-[#71717a] mb-1.5">
                          <Tag className="w-3.5 h-3.5" /> Item name
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={form.name}
                          onChange={handleChange}
                          className={inputCls('name')}
                          placeholder="e.g. Sony WH-1000XM5 Headphones"
                        />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="flex items-center gap-1.5 text-sm text-[#71717a] mb-1.5">
                            <Package className="w-3.5 h-3.5" /> Category
                          </label>
                          <select
                            name="category"
                            value={form.category}
                            onChange={handleChange}
                            className={inputCls('category')}
                          >
                            <option value="">Select category...</option>
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                          {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
                        </div>
                        <div>
                          <label className="block text-sm text-[#71717a] mb-1.5">Condition</label>
                          <select
                            name="condition"
                            value={form.condition}
                            onChange={handleChange}
                            className={inputCls('condition')}
                          >
                            <option value="">Select condition...</option>
                            {conditions.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                          {errors.condition && <p className="text-red-500 text-xs mt-1">{errors.condition}</p>}
                        </div>
                      </div>

                      <div>
                        <label className="flex items-center gap-1.5 text-sm text-[#71717a] mb-1.5">
                          <DollarSign className="w-3.5 h-3.5" /> Asking price ({currency.code})
                        </label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a1a1aa] text-sm">{currency.symbol}</span>
                          <input
                            type="number"
                            name="price"
                            value={form.price}
                            onChange={handleChange}
                            min="0.01"
                            step="0.01"
                            className={`${inputCls('price')} pl-7`}
                            placeholder="0.00"
                          />
                        </div>
                        {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
                        <p className="text-[#a1a1aa] text-xs mt-1">
                          Priced in your local currency. Buyers abroad see it converted automatically at checkout.
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm text-[#71717a] mb-1.5">Description</label>
                        <textarea
                          name="description"
                          value={form.description}
                          onChange={handleChange}
                          rows={4}
                          className={`${inputCls('description')} resize-none`}
                          placeholder="Describe your item — include brand, model, any defects, what's included in the box..."
                        />
                        {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                      </div>

                      <div>
                        <label className="flex items-center gap-1.5 text-sm text-[#71717a] mb-1.5">
                          <ImageIcon className="w-3.5 h-3.5" /> Photo URL <span className="text-[#a1a1aa]">(optional)</span>
                        </label>
                        <input
                          type="url"
                          name="imageUrl"
                          value={form.imageUrl}
                          onChange={handleChange}
                          className={inputCls('imageUrl')}
                          placeholder="https://..."
                        />
                        <p className="text-[#a1a1aa] text-xs mt-1">
                          Direct photo upload is on the way — for now, paste a link to an image
                          hosted elsewhere (Imgur, Google Drive share link, etc).
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="flex items-center gap-1.5 text-sm text-[#71717a] mb-1.5">
                            <MapPin className="w-3.5 h-3.5" /> Your country
                          </label>
                          <select
                            name="country"
                            value={form.country}
                            onChange={handleChange}
                            className={inputCls('country')}
                          >
                            <option value="">Select country...</option>
                            {countries.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                          {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country}</p>}
                        </div>
                        <div>
                          <label className="flex items-center gap-1.5 text-sm text-[#71717a] mb-1.5">
                            <Mail className="w-3.5 h-3.5" /> Contact email
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            className={inputCls('email')}
                            placeholder="you@email.com"
                          />
                          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                        </div>
                      </div>

                      <div className="pt-2 flex items-center gap-4">
                        <motion.button
                          type="submit"
                          disabled={submitting}
                          whileHover={{ scale: submitting ? 1 : 1.02 }}
                          whileTap={{ scale: submitting ? 1 : 0.98 }}
                          className="px-6 py-2.5 bg-[#0a0a0a] text-white text-sm font-medium rounded-lg hover:bg-[#2a2a2a] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {submitting ? 'Submitting…' : 'Submit listing'}
                        </motion.button>
                        <p className="text-[#a1a1aa] text-xs">Free to list · 5% on sale</p>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
