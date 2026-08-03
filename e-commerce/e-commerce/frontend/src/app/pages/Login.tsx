import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { motion } from 'framer-motion';
import { Eye, EyeOff, AlertCircle, WifiOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FieldErrors {
  email?: string;
  password?: string;
}

function isNetworkError(message: string): boolean {
  return /fetch|network|connection/i.test(message);
}

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError,   setFormError]   = useState('');
  const [offline,     setOffline]     = useState(false);
  const [loading,     setLoading]     = useState(false);

  const validate = (): FieldErrors => {
    const errors: FieldErrors = {};
    if (!email.trim()) errors.email = 'Email is required.';
    else if (!EMAIL_RE.test(email.trim())) errors.email = 'Enter a valid email address.';
    if (!password) errors.password = 'Password is required.';
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validate();
    setFieldErrors(errors);
    setFormError('');
    setOffline(false);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    const result = await login(email.trim(), password);
    if (result.ok) {
      navigate('/');
      return;
    }

    const message = result.error ?? 'Login failed.';
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

          <h1 className="text-2xl font-bold text-[#0a0a0a] mb-1">Welcome back</h1>
          <p className="text-sm text-[#71717a] mb-6">Sign in to your account to continue.</p>

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
              <label htmlFor="login-email" className="block text-sm text-[#71717a] mb-1.5">Email</label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); if (fieldErrors.email) setFieldErrors(f => ({ ...f, email: undefined })); }}
                className={inputCls(!!fieldErrors.email)}
                placeholder="you@email.com"
                autoComplete="email"
                aria-invalid={!!fieldErrors.email}
                autoFocus
              />
              {fieldErrors.email && <p className="text-xs text-red-600 mt-1.5">{fieldErrors.email}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="login-password" className="text-sm text-[#71717a]">Password</label>
                <button
                  type="button"
                  className="text-xs text-[#71717a] hover:text-[#0a0a0a] transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); if (fieldErrors.password) setFieldErrors(f => ({ ...f, password: undefined })); }}
                  className={`${inputCls(!!fieldErrors.password)} pr-10`}
                  placeholder="••••••••"
                  autoComplete="current-password"
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
              {fieldErrors.password && <p className="text-xs text-red-600 mt-1.5">{fieldErrors.password}</p>}
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.01 }}
              whileTap={{ scale: loading ? 1 : 0.99 }}
              className="w-full py-2.5 bg-[#c8102e] text-white text-sm font-medium rounded-lg hover:bg-[#a10d26] transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </motion.button>
          </form>
        </div>

        <p className="text-center text-sm text-[#71717a] mt-5">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-[#0a0a0a] hover:underline underline-offset-2">
            Create one
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
