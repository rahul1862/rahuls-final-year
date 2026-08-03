import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Menu, User, Lock, Bell, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { AccountSidebar } from '../components/AccountSidebar';

const inputCls = "w-full px-3.5 py-2.5 rounded-lg border text-sm text-[#0a0a0a] placeholder:text-[#a1a1aa] outline-none transition-colors";
const PHONE_RE = /^[0-9+()\-.\s]{7,20}$/;
const NOTIF_KEY = 'vendr-notification-prefs';

interface NotificationPrefs {
  orderUpdates: boolean;
  promotions: boolean;
  recommendations: boolean;
}

const DEFAULT_PREFS: NotificationPrefs = { orderUpdates: true, promotions: false, recommendations: true };

function loadPrefs(): NotificationPrefs {
  try {
    const saved = JSON.parse(localStorage.getItem(NOTIF_KEY) ?? 'null');
    return saved ? { ...DEFAULT_PREFS, ...saved } : DEFAULT_PREFS;
  } catch {
    return DEFAULT_PREFS;
  }
}

function Field({
  label, type = 'text', value, onChange, disabled = false, placeholder = '', error,
}: {
  label: string; type?: string; value: string;
  onChange?: (v: string) => void; disabled?: boolean; placeholder?: string; error?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-[#71717a] mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange?.(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className={`${inputCls} ${
          disabled ? 'bg-[#fafafa] text-[#a1a1aa] cursor-not-allowed border-[#e4e4e7]'
          : error ? 'border-red-400 focus:border-red-500'
          : 'border-[#e4e4e7] focus:border-[#c8102e]'
        }`}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function Notice({ type, msg }: { type: 'success' | 'error'; msg: string }) {
  return (
    <div className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium border ${
      type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'
    }`}>
      {type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
      {msg}
    </div>
  );
}

function SaveBtn({ loading, label = 'Save changes' }: { loading: boolean; label?: string }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-[#c8102e] hover:bg-[#a10d26] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? 'Saving…' : label}
    </button>
  );
}

export function Settings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [profileFieldErrors, setProfileFieldErrors] = useState<{ name?: string; phone?: string }>({});
  const [profileStatus, setProfileStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwFieldErrors, setPwFieldErrors] = useState<{ currentPw?: string; newPw?: string; confirmPw?: string }>({});
  const [pwStatus, setPwStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [pwLoading, setPwLoading] = useState(false);

  const [prefs, setPrefs] = useState<NotificationPrefs>(loadPrefs);
  const [prefsSaved, setPrefsSaved] = useState(false);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    api.get<{ user: { name: string; phone: string } }>('/api/user/profile')
      .then(d => { setName(d.user.name); setPhone(d.user.phone ?? ''); })
      .catch(() => { setName(user.name); });
  }, [user]);

  if (!user) return null;

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: typeof profileFieldErrors = {};
    if (!name.trim()) errors.name = 'Name is required.';
    if (phone.trim() && !PHONE_RE.test(phone.trim())) errors.phone = 'Enter a valid phone number.';
    setProfileFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setProfileLoading(true);
    setProfileStatus(null);
    try {
      await api.put('/api/user/profile', { name: name.trim(), phone: phone.trim() });
      setProfileStatus({ type: 'success', msg: 'Profile updated.' });
    } catch (err) {
      setProfileStatus({ type: 'error', msg: err instanceof Error ? err.message : 'Update failed.' });
    } finally {
      setProfileLoading(false);
    }
  };

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: typeof pwFieldErrors = {};
    if (!currentPw) errors.currentPw = 'Current password is required.';
    if (!newPw) errors.newPw = 'New password is required.';
    else if (newPw.length < 6) errors.newPw = 'Must be at least 6 characters.';
    if (!confirmPw) errors.confirmPw = 'Please confirm your new password.';
    else if (newPw && confirmPw !== newPw) errors.confirmPw = 'Passwords do not match.';
    setPwFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setPwLoading(true);
    setPwStatus(null);
    try {
      await api.put('/api/user/password', { currentPassword: currentPw, newPassword: newPw });
      setPwStatus({ type: 'success', msg: 'Password changed successfully.' });
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
    } catch (err) {
      setPwStatus({ type: 'error', msg: err instanceof Error ? err.message : 'Password change failed.' });
    } finally {
      setPwLoading(false);
    }
  };

  const savePrefs = () => {
    localStorage.setItem(NOTIF_KEY, JSON.stringify(prefs));
    setPrefsSaved(true);
    setTimeout(() => setPrefsSaved(false), 2500);
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
              <h1 className="text-lg font-bold text-[#0a0a0a]">Settings</h1>
            </div>
            <div className="hidden lg:block mb-8">
              <h1 className="text-3xl font-bold text-[#0a0a0a] mb-1 tracking-tight">Settings</h1>
              <p className="text-[#71717a] text-sm">Manage your profile, security, and notifications.</p>
            </div>

            {/* Profile — bordered section, standard form pattern */}
            <section className="border border-[#e4e4e7] rounded-lg p-6 mb-6">
              <div className="flex items-center gap-3 mb-5">
                <User className="w-4 h-4 text-[#0a0a0a]" />
                <div>
                  <p className="text-sm font-semibold text-[#0a0a0a]">Profile</p>
                  <p className="text-xs text-[#a1a1aa]">Your name and contact number</p>
                </div>
              </div>

              <form onSubmit={saveProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Full name" value={name} onChange={v => { setName(v); setProfileFieldErrors(e => ({ ...e, name: undefined })); }} placeholder="Your name" error={profileFieldErrors.name} />
                  <Field label="Email" value={user.email} disabled />
                </div>
                <Field
                  label="Phone"
                  value={phone}
                  onChange={v => { setPhone(v); setProfileFieldErrors(e => ({ ...e, phone: undefined })); }}
                  placeholder="+1 555 000 0000"
                  error={profileFieldErrors.phone}
                />
                {profileStatus && <Notice type={profileStatus.type} msg={profileStatus.msg} />}
                <div className="flex justify-end pt-1">
                  <SaveBtn loading={profileLoading} />
                </div>
              </form>
            </section>

            {/* Password — same section pattern, different content */}
            <section className="border border-[#e4e4e7] rounded-lg p-6 mb-6">
              <div className="flex items-center gap-3 mb-5">
                <Lock className="w-4 h-4 text-[#0a0a0a]" />
                <div>
                  <p className="text-sm font-semibold text-[#0a0a0a]">Password</p>
                  <p className="text-xs text-[#a1a1aa]">Change your account password</p>
                </div>
              </div>

              <form onSubmit={savePassword} className="space-y-4">
                <Field
                  label="Current password" type="password" value={currentPw}
                  onChange={v => { setCurrentPw(v); setPwFieldErrors(e => ({ ...e, currentPw: undefined })); }}
                  placeholder="••••••••" error={pwFieldErrors.currentPw}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field
                    label="New password" type="password" value={newPw}
                    onChange={v => { setNewPw(v); setPwFieldErrors(e => ({ ...e, newPw: undefined })); }}
                    placeholder="Min 6 characters" error={pwFieldErrors.newPw}
                  />
                  <Field
                    label="Confirm new password" type="password" value={confirmPw}
                    onChange={v => { setConfirmPw(v); setPwFieldErrors(e => ({ ...e, confirmPw: undefined })); }}
                    placeholder="Repeat new password" error={pwFieldErrors.confirmPw}
                  />
                </div>
                {pwStatus && <Notice type={pwStatus.type} msg={pwStatus.msg} />}
                <div className="flex justify-end pt-1">
                  <SaveBtn loading={pwLoading} label="Change password" />
                </div>
              </form>
            </section>

            {/* Notifications — no card border, just a divider list, to avoid every
                section looking like a stamped copy of the same component. */}
            <section className="pt-2">
              <div className="flex items-center gap-3 mb-5">
                <Bell className="w-4 h-4 text-[#0a0a0a]" />
                <div>
                  <p className="text-sm font-semibold text-[#0a0a0a]">Notifications</p>
                  <p className="text-xs text-[#a1a1aa]">Choose what we email you about</p>
                </div>
              </div>

              <div className="divide-y divide-[#e4e4e7] border-t border-b border-[#e4e4e7] mb-4">
                {([
                  { key: 'orderUpdates', label: 'Order updates', desc: 'Shipping and delivery status for your orders' },
                  { key: 'promotions', label: 'Promotions', desc: 'Sales, discounts, and limited-time offers' },
                  { key: 'recommendations', label: 'Recommendations', desc: 'Products picked based on your activity' },
                ] as const).map(({ key, label, desc }) => (
                  <label key={key} className="flex items-center justify-between gap-4 py-4 cursor-pointer">
                    <div>
                      <p className="text-sm font-medium text-[#0a0a0a]">{label}</p>
                      <p className="text-xs text-[#a1a1aa]">{desc}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={prefs[key]}
                      onChange={e => setPrefs(p => ({ ...p, [key]: e.target.checked }))}
                      className="w-4 h-4 rounded border-[#e4e4e7] accent-[#c8102e]"
                    />
                  </label>
                ))}
              </div>

              {prefsSaved && <div className="mb-4"><Notice type="success" msg="Notification preferences saved." /></div>}

              <div className="flex justify-end">
                <button
                  onClick={savePrefs}
                  className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-[#c8102e] hover:bg-[#a10d26] transition-colors"
                >
                  Save preferences
                </button>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
