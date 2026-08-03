import { Mail, Phone, MessageSquare, MapPin, CheckCircle2, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

type FormErrors = Partial<Record<keyof FormData, string>>;
type Status = 'idle' | 'sending' | 'success' | 'error';

const emptyForm: FormData = { name: '', email: '', subject: '', message: '' };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(form: FormData): FormErrors {
  const errors: FormErrors = {};
  if (!form.name.trim()) errors.name = 'Enter your name';
  if (!form.email.trim()) errors.email = 'Enter your email address';
  else if (!EMAIL_RE.test(form.email.trim())) errors.email = "That doesn't look like a valid email";
  if (!form.subject) errors.subject = 'Pick a topic so it reaches the right team';
  if (!form.message.trim()) errors.message = 'Tell us what happened';
  else if (form.message.trim().length < 20) errors.message = `A bit more detail helps (${form.message.trim().length}/20 characters minimum)`;
  return errors;
}

export function Contact() {
  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<Status>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors = validate(formData);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setStatus('error');
      return;
    }
    setStatus('sending');
    window.setTimeout(() => setStatus('success'), 700);
  };

  const handleReset = () => {
    setFormData(emptyForm);
    setErrors({});
    setStatus('idle');
  };

  const inputCls = (field: keyof FormData) =>
    `w-full px-3.5 py-2.5 border rounded-lg bg-white text-[#0a0a0a] focus:outline-none placeholder-[#a1a1aa] text-sm transition-colors ${
      errors[field] ? 'border-red-400 focus:border-red-500' : 'border-[#e4e4e7] focus:border-[#c8102e]'
    }`;

  return (
    <div className="min-h-screen bg-white">
      <section className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl lg:text-5xl font-bold text-[#0a0a0a] mb-4 tracking-tight">
            Get in touch
          </h1>
          <p className="text-[#71717a] text-lg max-w-xl">
            Have a question about an order, a product, or something else? Fill in the form below —
            a real person reads every message, usually within a day.
          </p>
        </div>
      </section>

      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="space-y-4">
              {[
                { icon: Mail, label: 'Email', value: 'support@vendr.com', detail: 'General inquiries, replies within 24 hours' },
                { icon: Phone, label: 'Phone', value: '+1 (312) 555-0148', detail: 'Order and shipping questions only' },
                { icon: MessageSquare, label: 'Live chat', value: 'Available 24/7', detail: 'Usually under 5 minutes' },
                { icon: MapPin, label: 'Registered office', value: '26 Amiens Street, Dublin 1, Ireland', detail: 'Not a retail location — no walk-ins' },
              ].map(item => (
                <div key={item.label} className="bg-white rounded-lg p-5 border border-[#e4e4e7]">
                  <div className="flex items-start gap-3">
                    <item.icon className="w-5 h-5 text-[#a1a1aa] mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[#0a0a0a] text-sm font-medium">{item.label}</p>
                      <p className="text-[#71717a] text-sm">{item.value}</p>
                      <p className="text-[#a1a1aa] text-xs mt-1">{item.detail}</p>
                    </div>
                  </div>
                </div>
              ))}

              <div className="bg-white rounded-lg p-5 border border-[#e4e4e7]">
                <p className="text-[#0a0a0a] text-sm font-medium mb-3">Support hours (GMT)</p>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between"><span className="text-[#a1a1aa]">Mon – Fri</span><span className="text-[#3f3f46]">9am – 6pm</span></div>
                  <div className="flex justify-between"><span className="text-[#a1a1aa]">Saturday</span><span className="text-[#3f3f46]">10am – 4pm</span></div>
                  <div className="flex justify-between"><span className="text-[#a1a1aa]">Sunday</span><span className="text-[#a1a1aa]">Closed</span></div>
                </div>
                <p className="text-[#a1a1aa] text-xs mt-3 leading-relaxed">
                  Live chat runs around the clock regardless of these hours — it's answered by a rotating team across time zones.
                </p>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg p-6 lg:p-8 border border-[#e4e4e7]">
                {status === 'success' ? (
                  <div className="py-6 text-center">
                    <div className="w-12 h-12 bg-[#f4f4f5] rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-6 h-6 text-[#0a0a0a]" />
                    </div>
                    <h2 className="text-xl font-semibold text-[#0a0a0a] mb-2">Message sent</h2>
                    <p className="text-[#71717a] text-sm max-w-sm mx-auto mb-6">
                      We got it — expect a reply at <span className="text-[#0a0a0a] font-medium">{formData.email}</span> within
                      24 hours. Keep an eye on your spam folder just in case.
                    </p>
                    <button
                      onClick={handleReset}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#c8102e] text-white text-sm font-medium rounded-lg hover:bg-[#a10d26] transition-colors"
                    >
                      Send another message
                    </button>
                  </div>
                ) : (
                  <>
                    <h2 className="text-xl font-semibold text-[#0a0a0a] mb-6">Send a message</h2>

                    {status === 'error' && (
                      <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-5">
                        <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                        <p className="text-red-700 text-sm">Check the fields below — a couple of things need fixing before this can send.</p>
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-[#71717a] mb-1.5">Name</label>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className={inputCls('name')}
                            placeholder="Your name"
                          />
                          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                        </div>
                        <div>
                          <label className="block text-sm text-[#71717a] mb-1.5">Email</label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={inputCls('email')}
                            placeholder="you@email.com"
                          />
                          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm text-[#71717a] mb-1.5">What's this about?</label>
                        <select
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          className={`${inputCls('subject')} appearance-none`}
                        >
                          <option value="">Pick a topic...</option>
                          <option value="order">Order issue</option>
                          <option value="shipping">Shipping</option>
                          <option value="return">Return or refund</option>
                          <option value="product">Product question</option>
                          <option value="seller">Selling on Vendr</option>
                          <option value="other">Something else</option>
                        </select>
                        {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject}</p>}
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="block text-sm text-[#71717a]">Message</label>
                          <span className="text-xs text-[#a1a1aa]">{formData.message.trim().length}/20 min</span>
                        </div>
                        <textarea
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          rows={5}
                          className={`${inputCls('message')} resize-none`}
                          placeholder="Include your order number if this is about a purchase — it speeds things up a lot."
                        />
                        {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
                      </div>

                      <button
                        type="submit"
                        disabled={status === 'sending'}
                        className="bg-[#c8102e] text-white font-medium py-2.5 px-6 rounded-lg hover:bg-[#a10d26] transition-colors text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {status === 'sending' ? 'Sending...' : 'Send message'}
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#fafafa] rounded-lg border border-[#e4e4e7] p-6 lg:p-8">
            <h2 className="text-lg font-semibold text-[#0a0a0a] mb-4">Before you write in</h2>
            <p className="text-[#71717a] text-sm mb-4 leading-relaxed">
              Most order and shipping questions are answered faster in the Help Center — it covers
              tracking, customs charges, and returns without waiting for a reply.
            </p>
            <ul className="space-y-2 mb-5">
              <li className="text-[#71717a] text-sm flex gap-2">
                <span className="text-[#a1a1aa]">·</span> Have your order number ready — it's in your confirmation email and under Orders in your account.
              </li>
              <li className="text-[#71717a] text-sm flex gap-2">
                <span className="text-[#a1a1aa]">·</span> For damaged or wrong items, attach a photo when you email — it skips a back-and-forth.
              </li>
              <li className="text-[#71717a] text-sm flex gap-2">
                <span className="text-[#a1a1aa]">·</span> Orders with items from more than one seller ship separately, each with its own tracking number.
              </li>
            </ul>
            <Link
              to="/help"
              className="inline-flex items-center gap-2 text-[#0a0a0a] text-sm font-medium hover:underline"
            >
              Visit the Help Center →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
