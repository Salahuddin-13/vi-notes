import { useState } from 'react';
import api from '../api';

interface AuthProps {
  onLogin: (token: string, email: string) => void;
}

export default function Auth({ onLogin }: AuthProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
      const res = await api.post(endpoint, { email, password });
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('userEmail', user.email);
      onLogin(token, user.email);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logo}>
          <span style={styles.logoIcon}>✍️</span>
          <span style={styles.logoText}>Vi-Notes</span>
        </div>
        <p style={styles.tagline}>Prove your writing is genuinely human</p>

        {/* Tabs */}
        <div style={styles.tabs}>
          <button
            style={{ ...styles.tab, ...(mode === 'login' ? styles.tabActive : {}) }}
            onClick={() => { setMode('login'); setError(''); }}
          >
            Login
          </button>
          <button
            style={{ ...styles.tab, ...(mode === 'register' ? styles.tabActive : {}) }}
            onClick={() => { setMode('register'); setError(''); }}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="error-msg">{error}</div>}

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 8 }} disabled={loading}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create Account'}
          </button>
        </form>

        <p style={styles.switchText}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <a href="#" onClick={(e) => { e.preventDefault(); setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}>
            {mode === 'login' ? 'Register' : 'Login'}
          </a>
        </p>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #fdecea 0%, #f8f9fa 100%)',
    padding: '20px',
  },
  card: {
    background: '#fff',
    borderRadius: 16,
    padding: '40px 36px',
    width: '100%',
    maxWidth: 420,
    boxShadow: '0 8px 32px rgba(232, 93, 74, 0.12)',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  logoIcon: { fontSize: '2rem' },
  logoText: { fontSize: '1.6rem', fontWeight: 700, color: '#1a1a2e' },
  tagline: { color: '#6c757d', fontSize: '0.9rem', marginBottom: 28 },
  tabs: {
    display: 'flex',
    background: '#f8f9fa',
    borderRadius: 8,
    padding: 4,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    padding: '8px 0',
    borderRadius: 6,
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    fontWeight: 500,
    fontSize: '0.9rem',
    color: '#6c757d',
    transition: 'all 0.2s',
  },
  tabActive: {
    background: '#fff',
    color: '#e85d4a',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  switchText: {
    textAlign: 'center' as const,
    marginTop: 20,
    fontSize: '0.875rem',
    color: '#6c757d',
  },
};
