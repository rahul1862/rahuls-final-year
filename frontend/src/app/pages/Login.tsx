import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Banner } from '../components/ui/Banner';

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
    `w-full px-3.5 py-2.5 border rounded-lg bg-card text-foreground focus:outline-none placeholder-muted-foreground text-sm transition-colors ${
      hasError ? 'border-destructive focus:border-destructive' : 'border-border focus:border-primary'
    }`;

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="w-full max-w-md"
      >
        <div className="bg-card border border-border rounded-2xl p-8 shadow-soft">
          <button
            onClick={() => navigate('/')}
            className="font-display italic text-xl font-semibold tracking-tight text-foreground hover:text-primary transition-colors mb-8 block"
          >
            Vendr
          </button>

          <h1 className="font-display text-2xl font-semibold text-foreground mb-1">Welcome back</h1>
          <p className="text-sm text-muted-foreground mb-6">Sign in to your account to continue.</p>

          {offline && (
            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
              <Banner variant="warning">Can't reach the server right now. Check your connection and try again.</Banner>
            </motion.div>
          )}

          {formError && (
            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
              <Banner variant="error">{formError}</Banner>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label htmlFor="login-email" className="block text-sm text-muted-foreground mb-1.5">Email</label>
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
              {fieldErrors.email && <p className="text-xs text-destructive mt-1.5">{fieldErrors.email}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="login-password" className="text-sm text-muted-foreground">Password</label>
                <button
                  type="button"
                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.password && <p className="text-xs text-destructive mt-1.5">{fieldErrors.password}</p>}
            </div>

            <Button type="submit" loading={loading} className="w-full mt-2">
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-5">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-primary hover:underline underline-offset-2">
            Create one
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
