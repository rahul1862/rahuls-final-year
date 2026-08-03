import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Menu, CreditCard, Plus, Trash2, Pencil, X, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AccountSidebar } from '../components/AccountSidebar';

interface Card {
  id: string;
  name: string;
  last4: string;
  expiry: string;
  type: 'Visa' | 'Mastercard' | 'Amex' | 'Other';
  isDefault: boolean;
}

const STORAGE_KEY = 'vendr-payment-methods';

function loadCards(): Card[] {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as Card[];
    return raw.map((c, i) => ({ ...c, isDefault: c.isDefault ?? i === 0 }));
  } catch {
    return [];
  }
}

function saveCards(cards: Card[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
}

const inputCls = "w-full px-3.5 py-2.5 rounded-lg border border-[#e4e4e7] text-sm text-[#0a0a0a] placeholder:text-[#a1a1aa] outline-none focus:border-[#c8102e] transition-colors";
const labelCls = "block text-xs font-medium text-[#71717a] mb-1.5";

const EMPTY_FORM = { name: '', number: '', expiry: '', type: 'Visa' as Card['type'] };

export function PaymentMethods() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cards, setCards] = useState<Card[]>(loadCards);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [form, setForm] = useState(EMPTY_FORM);
  const [err, setErr] = useState('');

  if (!user) { navigate('/login'); return null; }

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
  };

  const startAdd = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setErr('');
    setShowForm(true);
  };

  const startEdit = (card: Card) => {
    setForm({ name: card.name, number: card.last4, expiry: card.expiry, type: card.type });
    setEditingId(card.id);
    setErr('');
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setErr('');
  };

  const submitForm = (e: React.FormEvent) => {
    e.preventDefault();
    const digits = form.number.replace(/\D/g, '');
    if (!form.name.trim()) { setErr('Name on card is required.'); return; }
    if (digits.length < 4) { setErr('Enter at least the last 4 digits.'); return; }
    if (!form.expiry.match(/^\d{2}\/\d{2}$/)) { setErr('Enter expiry as MM/YY.'); return; }

    if (editingId) {
      setCards(prev => {
        const next = prev.map(c => c.id === editingId
          ? { ...c, name: form.name.trim(), last4: digits.slice(-4), expiry: form.expiry, type: form.type }
          : c);
        saveCards(next);
        return next;
      });
      showToast('Card updated.');
    } else {
      const card: Card = {
        id: Date.now().toString(36),
        name: form.name.trim(),
        last4: digits.slice(-4),
        expiry: form.expiry,
        type: form.type,
        isDefault: cards.length === 0,
      };
      const next = [...cards, card];
      setCards(next);
      saveCards(next);
      showToast('Card added.');
    }
    closeForm();
  };

  const deleteCard = (id: string) => {
    setCards(prev => {
      const wasDefault = prev.find(c => c.id === id)?.isDefault;
      const next = prev.filter(c => c.id !== id);
      if (wasDefault && next.length > 0) next[0] = { ...next[0], isDefault: true };
      saveCards(next);
      return next;
    });
    setConfirmingDeleteId(null);
    showToast('Card removed.');
  };

  const makeDefault = (id: string) => {
    setCards(prev => {
      const next = prev.map(c => ({ ...c, isDefault: c.id === id }));
      saveCards(next);
      return next;
    });
    showToast('Default payment method updated.');
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="flex min-h-screen">
        <AccountSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-6 lg:hidden">
              <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg border border-[#e4e4e7] text-[#71717a]">
                <Menu className="w-5 h-5" />
              </button>
              <h1 className="text-lg font-bold text-[#0a0a0a]">Payment methods</h1>
            </div>

            <div className="flex items-center justify-between mb-8">
              <div className="hidden lg:block">
                <h1 className="text-3xl font-bold text-[#0a0a0a] mb-1 tracking-tight">Payment methods</h1>
                <p className="text-[#71717a] text-sm">Cards saved to your account for faster checkout.</p>
              </div>
              {cards.length > 0 && (
                <button
                  onClick={startAdd}
                  className="ml-auto flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-[#c8102e] hover:bg-[#a10d26] transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add card
                </button>
              )}
            </div>

            {cards.length === 0 && !showForm ? (
              <div className="text-center py-16 rounded-lg border border-[#e4e4e7]">
                <CreditCard className="w-10 h-10 mx-auto mb-4 text-[#a1a1aa]" />
                <p className="text-[#0a0a0a] font-semibold mb-1">No saved cards</p>
                <p className="text-sm text-[#71717a] mb-5">Add a card so you don't have to type it in at checkout.</p>
                <button
                  onClick={startAdd}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-[#c8102e] hover:bg-[#a10d26] transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add a card
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {cards.map(card => (
                  <div key={card.id} className="rounded-lg border border-[#e4e4e7] p-5">
                    {confirmingDeleteId === card.id ? (
                      <div>
                        <p className="text-sm text-[#0a0a0a] mb-3">Remove this card? This can't be undone.</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => deleteCard(card.id)}
                            className="flex-1 px-3 py-2 rounded-lg text-xs font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
                          >
                            Remove
                          </button>
                          <button
                            onClick={() => setConfirmingDeleteId(null)}
                            className="flex-1 px-3 py-2 rounded-lg text-xs font-medium border border-[#e4e4e7] text-[#71717a] hover:bg-[#fafafa] transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start justify-between mb-4">
                          <div className="w-9 h-9 rounded-lg border border-[#e4e4e7] flex items-center justify-center">
                            <CreditCard className="w-4 h-4 text-[#0a0a0a]" />
                          </div>
                          {card.isDefault && (
                            <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-[#0a0a0a] bg-[#fafafa] border border-[#e4e4e7] px-2 py-1 rounded-full">
                              <Star className="w-3 h-3 fill-current" /> Default
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-semibold text-[#0a0a0a]">{card.type} •••• {card.last4}</p>
                        <p className="text-xs mt-0.5 text-[#a1a1aa]">{card.name} · Expires {card.expiry}</p>

                        <div className="flex items-center gap-1 mt-4 pt-4 border-t border-[#e4e4e7]">
                          {!card.isDefault && (
                            <button
                              onClick={() => makeDefault(card.id)}
                              className="text-xs font-medium text-[#71717a] hover:text-[#0a0a0a] transition-colors px-2 py-1 rounded-lg hover:bg-[#fafafa]"
                            >
                              Make default
                            </button>
                          )}
                          <button
                            onClick={() => startEdit(card)}
                            className="ml-auto flex items-center gap-1 text-xs font-medium text-[#71717a] hover:text-[#0a0a0a] transition-colors px-2 py-1 rounded-lg hover:bg-[#fafafa]"
                          >
                            <Pencil className="w-3.5 h-3.5" /> Edit
                          </button>
                          <button
                            onClick={() => setConfirmingDeleteId(card.id)}
                            className="flex items-center gap-1 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors px-2 py-1 rounded-lg"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Remove
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}

            {showForm && (
              <div className="mt-4 rounded-lg border border-[#e4e4e7] p-6">
                <div className="flex items-center justify-between mb-5">
                  <p className="text-sm font-semibold text-[#0a0a0a]">{editingId ? 'Edit card' : 'Add new card'}</p>
                  <button onClick={closeForm} className="text-[#a1a1aa] hover:text-[#0a0a0a]">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={submitForm} className="space-y-4">
                  <div>
                    <label className={labelCls}>Card type</label>
                    <select
                      value={form.type}
                      onChange={e => setForm(f => ({ ...f, type: e.target.value as Card['type'] }))}
                      className={`${inputCls} cursor-pointer`}
                    >
                      <option value="Visa">Visa</option>
                      <option value="Mastercard">Mastercard</option>
                      <option value="Amex">American Express</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Name on card</label>
                    <input
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Jane Smith"
                      className={inputCls}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Card number (last 4)</label>
                      <input
                        value={form.number}
                        onChange={e => setForm(f => ({ ...f, number: e.target.value.replace(/\D/g, '').slice(0, 16) }))}
                        placeholder="•••• •••• •••• 1234"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Expiry (MM/YY)</label>
                      <input
                        value={form.expiry}
                        onChange={e => setForm(f => ({ ...f, expiry: formatExpiry(e.target.value) }))}
                        placeholder="MM/YY"
                        className={inputCls}
                      />
                    </div>
                  </div>

                  {err && <p className="text-xs font-medium text-red-600">{err}</p>}

                  <div className="flex justify-end gap-3 pt-1">
                    <button type="button" onClick={closeForm} className="px-4 py-2.5 rounded-lg text-sm font-medium border border-[#e4e4e7] text-[#71717a] hover:bg-[#fafafa] transition-colors">
                      Cancel
                    </button>
                    <button type="submit" className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-[#c8102e] hover:bg-[#a10d26] transition-colors">
                      {editingId ? 'Save changes' : 'Add card'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </main>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3.5 rounded-lg text-sm font-medium text-white bg-[#c8102e] shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
