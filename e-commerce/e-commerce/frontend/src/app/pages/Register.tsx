import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { motion } from 'framer-motion';
import { Eye, EyeOff, AlertCircle, WifiOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
  confirm?: string;
}

// AuthContext swallows the fetch/API distinction into a single string, so we
// pattern-match the message to tell a dropped connection apart from a real
// error response from the server (e.g. "email already exists").
function isNetworkError(message: string): boolean {
  return /fetch|network|connection/i.test(message);
}

export function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name,      setName]      = useState('');
  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [confirm,   setConfirm]   = useState('');
  const [showPw,    setShowPw]    = useState(false);
  const [showConf,  setShowConf]  = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError,   setFormError]   = useState('');
  const [offline,     setOffline]     = useState(false);
  const [loading,     setLoading]     = useState(false);

  const validate = (): FieldErrors => {
    const errors: FieldErrors = {};
    if (!name.trim()) errors.name = 'Name is required.';
    if (!email.trim()) errors.email = 'Email is required.';
    else if (!EMAIL_RE.test(email.trim())) errors.email = 'Enter a valid email address.';
    if (!password) errors.password = 'Password is required.';
    else if (password.length < 8) errors.password = 'Use at least 8 characters.';
    else if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) errors.password = 'Include at least one letter and one number.';
    if (!confirm) errors.confirm = 'Confirm your password.';
    else if (password !== confirm) errors.confirm = 'Passwords do not match.';
    return errors;
  };

  const clearFieldError = (field: keyof FieldErrors) => {
    setFieldErrors(f => (f[field] ? { ...f, [field]: undefined } : f));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validate();
    setFieldErrors(errors);
    setFormError('');
    setOffline(false);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    const result = await register(name.trim(), email.trim(), password);
    if (result.ok) {
      navigate('/');
      return;
    }

    const message = result.error ?? 'Registration failed.';
    if (isNetworkError(message)) {
      setOffline(true);
    } else {
      setFormError(message);
    }
    setLoading(false);
  };

  const inputCls = (hasError: boolean) =>
    `w-full px-3.5 py-2.5 border rounded-lg bg-white text-[#0a0a0a] focus:outline-none placeholder-[#a1a1aa] text-sm transition-colors ${
      hasError ? 'border-red-400 focus:border-red-500' : 'border-[#e4e4e7] focus:border-[#c8102e]'
    }`;

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="w-full max-w-md"
      >
        <div className="bg-white border border-[#e4e4e7] rounded-2xl p-8">
          <button
            onClick={() => navigate('/')}
            className="text-xl font-bold tracking-tight text-[#0a0a0a] hover:opacity-70 transition-opacity mb-8 block"
          >
            Vendrr
          </button>

          <h1 className="text-2xl font-bold text-[#0a0a0a] mb-1">Create an account</h1>
          <p className="text-sm text-[#71717a] mb-6">Join Vendr to buy and sell globally.</p>

          {offline && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg px-4 py-3 mb-5 text-sm"
            >
              <WifiOff className="w-4 h-4 shrink-0 mt-0.5" />
              Can't reach the server right now. Check your connection and try again.
            </motion.div>
          )}

          {formError && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-5 text-sm"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              {formError}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label htmlFor="reg-name" className="block text-sm text-[#71717a] mb-1.5">Full name</label>
              <input
                id="reg-name"
                type="text"
                value={name}
                onChange={e => { setName(e.target.value); clearFieldError('name'); }}
                className={inputCls(!!fieldErrors.name)}
                placeholder="Jane Smith"
                autoComplete="name"
                aria-invalid={!!fieldErrors.name}
                autoFocus
              />
              {fieldErrors.name && <p className="text-xs text-red-600 mt-1.5">{fieldErrors.name}</p>}
            </div>

            <div>
              <label htmlFor="reg-email" className="block text-sm text-[#71717a] mb-1.5">Email</label>
              <input
                id="reg-email"
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); clearFieldError('email'); }}
                className={inputCls(!!fieldErrors.email)}
                placeholder="you@email.com"
                autoComplete="email"
                aria-invalid={!!fieldErrors.email}
              />
              {fieldErrors.email && <p className="text-xs text-red-600 mt-1.5">{fieldErrors.email}</p>}
            </div>

            <div>
              <label htmlFor="reg-password" className="block text-sm text-[#71717a] mb-1.5">Password</label>
              <div className="relative">
                <input
                  id="reg-password"
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); clearFieldError('password'); }}
                  className={`${inputCls(!!fieldErrors.password)} pr-10`}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  aria-invalid={!!fieldErrors.password}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a1a1aa] hover:text-[#0a0a0a] transition-colors"
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.password
                ? <p className="text-xs text-red-600 mt-1.5">{fieldErrors.password}</p>
                : <p className="text-xs text-[#a1a1aa] mt-1.5">At least 8 characters, with a letter and a number.</p>}
            </div>

            <div>
              <label htmlFor="reg-confirm" className="block text-sm text-[#71717a] mb-1.5">Confirm password</label>
              <div className="relative">
                <input
                  id="reg-confirm"
                  type={showConf ? 'text' : 'password'}
                  value={confirm}
                  onChange={e => { setConfirm(e.target.value); clearFieldError('confirm'); }}
                  className={`${inputCls(!!fieldErrors.confirm)} pr-10`}
                  placeholder="Re-enter password"
                  autoComplete="new-password"
                  aria-invalid={!!fieldErrors.confirm}
                />
                <button
                  type="button"
                  onClick={() => setShowConf(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a1a1aa] hover:text-[#0a0a0a] transition-colors"
                  aria-label={showConf ? 'Hide password' : 'Show password'}
                >
                  {showConf ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.confirm && <p className="text-xs text-red-600 mt-1.5">{fieldErrors.confirm}</p>}
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.01 }}
              whileTap={{ scale: loading ? 1 : 0.99 }}
              className="w-full py-2.5 bg-[#c8102e] text-white text-sm font-medium rounded-lg hover:bg-[#a10d26] transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Creating account…' : 'Create account'}
            </motion.button>
          </form>
        </div>

        <p className="text-center text-sm text-[#71717a] mt-5">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-[#0a0a0a] hover:underline underline-offset-2">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
