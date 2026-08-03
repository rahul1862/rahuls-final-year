import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Menu, MapPin, Plus, Pencil, Trash2, X, Star, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { AccountSidebar } from '../components/AccountSidebar';

interface Address {
  id: string;
  address: string;
  city: string;
  zip: string;
  country: string;
  isDefault: boolean;
}

interface ProfileAddress {
  address: string;
  city: string;
  zip: string;
  country: string;
}

const STORAGE_KEY = 'vendr-addresses';
const MIGRATED_KEY = 'vendr-addresses-migrated';

function loadAddresses(): Address[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]'); } catch { return []; }
}

function saveAddresses(list: Address[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

const inputCls = "w-full px-3.5 py-2.5 rounded-lg border border-[#e4e4e7] text-sm text-[#0a0a0a] placeholder:text-[#a1a1aa] outline-none focus:border-[#c8102e] transition-colors";
const labelCls = "block text-xs font-medium text-[#71717a] mb-1.5";
const EMPTY_FORM = { address: '', city: '', zip: '', country: '' };

export function Addresses() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [addresses, setAddresses] = useState<Address[]>(loadAddresses);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof typeof EMPTY_FORM, string>>>({});
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    if (localStorage.getItem(MIGRATED_KEY)) return;
    api.get<{ user: ProfileAddress }>('/api/user/profile').then(d => {
      if (d.user.address && addresses.length === 0) {
        const seeded: Address = {
          id: 'seed-' + Date.now().toString(36),
          address: d.user.address,
          city: d.user.city ?? '',
          zip: d.user.zip ?? '',
          country: d.user.country ?? '',
          isDefault: true,
        };
        setAddresses([seeded]);
        saveAddresses([seeded]);
      }
    }).catch(() => {}).finally(() => {
      localStorage.setItem(MIGRATED_KEY, '1');
    });
  }, [user]);

  if (!user) return null;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const syncDefaultToProfile = (addr: Address) => {
    api.put('/api/user/profile', { address: addr.address, city: addr.city, zip: addr.zip, country: addr.country }).catch(() => {});
  };

  const startAdd = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setFormErrors({});
    setShowForm(true);
  };

  const startEdit = (addr: Address) => {
    setForm({ address: addr.address, city: addr.city, zip: addr.zip, country: addr.country });
    setEditingId(addr.id);
    setFormErrors({});
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormErrors({});
  };

  const validate = (): boolean => {
    const errors: typeof formErrors = {};
    if (!form.address.trim()) errors.address = 'Street address is required.';
    if (!form.city.trim()) errors.city = 'City is required.';
    if (!form.zip.trim()) errors.zip = 'ZIP / postal code is required.';
    if (!form.country.trim()) errors.country = 'Country is required.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const submitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (editingId) {
      setAddresses(prev => {
        const next = prev.map(a => a.id === editingId ? { ...a, ...form } : a);
        saveAddresses(next);
        const updated = next.find(a => a.id === editingId);
        if (updated?.isDefault) syncDefaultToProfile(updated);
        return next;
      });
      showToast('Address updated.');
    } else {
      const addr: Address = { id: Date.now().toString(36), ...form, isDefault: addresses.length === 0 };
      const next = [...addresses, addr];
      setAddresses(next);
      saveAddresses(next);
      if (addr.isDefault) syncDefaultToProfile(addr);
      showToast('Address added.');
    }
    closeForm();
  };

  const deleteAddress = (id: string) => {
    setAddresses(prev => {
      const wasDefault = prev.find(a => a.id === id)?.isDefault;
      const next = prev.filter(a => a.id !== id);
      if (wasDefault && next.length > 0) {
        next[0] = { ...next[0], isDefault: true };
        syncDefaultToProfile(next[0]);
      }
      saveAddresses(next);
      return next;
    });
    setConfirmingDeleteId(null);
    showToast('Address removed.');
  };

  const makeDefault = (id: string) => {
    setAddresses(prev => {
      const next = prev.map(a => ({ ...a, isDefault: a.id === id }));
      saveAddresses(next);
      const newDefault = next.find(a => a.id === id);
      if (newDefault) syncDefaultToProfile(newDefault);
      return next;
    });
    showToast('Default address updated.');
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="flex min-h-screen">
        <AccountSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-6 lg:hidden">
              <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg border border-[#e4e4e7] text-[#71717a]">
                <Menu className="w-5 h-5" />
              </button>
              <h1 className="text-lg font-bold text-[#0a0a0a]">Addresses</h1>
            </div>

            <div className="flex items-center justify-between mb-8">
              <div className="hidden lg:block">
                <h1 className="text-3xl font-bold text-[#0a0a0a] mb-1 tracking-tight">Addresses</h1>
                <p className="text-[#71717a] text-sm">Shipping addresses saved to your account.</p>
              </div>
              {addresses.length > 0 && (
                <button
                  onClick={startAdd}
                  className="ml-auto flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-[#c8102e] hover:bg-[#a10d26] transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add address
                </button>
              )}
            </div>

            {addresses.length === 0 && !showForm ? (
              <div className="text-center py-16 rounded-lg border border-[#e4e4e7]">
                <MapPin className="w-10 h-10 mx-auto mb-4 text-[#a1a1aa]" />
                <p className="text-[#0a0a0a] font-semibold mb-1">No saved addresses</p>
                <p className="text-sm text-[#71717a] mb-5">Add one so you don't have to re-type it at checkout.</p>
                <button
                  onClick={startAdd}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-[#c8102e] hover:bg-[#a10d26] transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add an address
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {addresses.map(addr => (
                  <div key={addr.id} className="rounded-lg border border-[#e4e4e7] p-5">
                    {confirmingDeleteId === addr.id ? (
                      <div className="flex items-center gap-3">
                        <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                        <p className="text-sm text-[#0a0a0a] flex-1">Remove this address?</p>
                        <button
                          onClick={() => deleteAddress(addr.id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
                        >
                          Remove
                        </button>
                        <button
                          onClick={() => setConfirmingDeleteId(null)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[#e4e4e7] text-[#71717a] hover:bg-[#fafafa] transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-start gap-4">
                        <div className="w-9 h-9 rounded-lg border border-[#e4e4e7] flex items-center justify-center shrink-0">
                          <MapPin className="w-4 h-4 text-[#0a0a0a]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-medium text-[#0a0a0a]">{addr.address}</p>
                            {addr.isDefault && (
                              <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-[#0a0a0a] bg-[#fafafa] border border-[#e4e4e7] px-2 py-0.5 rounded-full">
                                <Star className="w-3 h-3 fill-current" /> Default
                              </span>
                            )}
                          </div>
                          <p className="text-xs mt-1 text-[#71717a]">{addr.city}, {addr.zip} · {addr.country}</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {!addr.isDefault && (
                            <button
                              onClick={() => makeDefault(addr.id)}
                              className="text-xs font-medium text-[#71717a] hover:text-[#0a0a0a] transition-colors px-2 py-1 rounded-lg hover:bg-[#fafafa]"
                            >
                              Make default
                            </button>
                          )}
                          <button
                            onClick={() => startEdit(addr)}
                            className="p-1.5 rounded-lg text-[#71717a] hover:text-[#0a0a0a] hover:bg-[#fafafa] transition-colors"
                            aria-label="Edit address"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setConfirmingDeleteId(addr.id)}
                            className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                            aria-label="Remove address"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {showForm && (
              <div className="mt-4 rounded-lg border border-[#e4e4e7] p-6">
                <div className="flex items-center justify-between mb-5">
                  <p className="text-sm font-semibold text-[#0a0a0a]">{editingId ? 'Edit address' : 'Add new address'}</p>
                  <button onClick={closeForm} className="text-[#a1a1aa] hover:text-[#0a0a0a]">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={submitForm} className="space-y-4">
                  <div>
                    <label className={labelCls}>Street address</label>
                    <input
                      value={form.address}
                      onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                      placeholder="123 Main St"
                      className={inputCls}
                    />
                    {formErrors.address && <p className="mt-1 text-xs text-red-600">{formErrors.address}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>City</label>
                      <input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} placeholder="New York" className={inputCls} />
                      {formErrors.city && <p className="mt-1 text-xs text-red-600">{formErrors.city}</p>}
                    </div>
                    <div>
                      <label className={labelCls}>ZIP / postal code</label>
                      <input value={form.zip} onChange={e => setForm(f => ({ ...f, zip: e.target.value }))} placeholder="10001" className={inputCls} />
                      {formErrors.zip && <p className="mt-1 text-xs text-red-600">{formErrors.zip}</p>}
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Country</label>
                    <input value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} placeholder="United States" className={inputCls} />
                    {formErrors.country && <p className="mt-1 text-xs text-red-600">{formErrors.country}</p>}
                  </div>

                  <div className="flex justify-end gap-3 pt-1">
                    <button type="button" onClick={closeForm} className="px-4 py-2.5 rounded-lg text-sm font-medium border border-[#e4e4e7] text-[#71717a] hover:bg-[#fafafa] transition-colors">
                      Cancel
                    </button>
                    <button type="submit" className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-[#c8102e] hover:bg-[#a10d26] transition-colors">
                      {editingId ? 'Save changes' : 'Add address'}
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
