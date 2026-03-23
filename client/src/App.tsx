import { useState } from 'react';
import Auth from './components/Auth';
import Editor from './components/Editor';
import Dashboard from './components/Dashboard';
import './index.css';

type View = 'auth' | 'editor' | 'dashboard';

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [userEmail, setUserEmail] = useState<string>(localStorage.getItem('userEmail') || '');
  const [view, setView] = useState<View>(token ? 'dashboard' : 'auth');
  const [sessionRefresh, setSessionRefresh] = useState(0);

  const handleLogin = (newToken: string, email: string) => {
    setToken(newToken);
    setUserEmail(email);
    setView('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    setToken(null);
    setUserEmail('');
    setView('auth');
  };

  const handleSessionSaved = () => {
    setSessionRefresh((r) => r + 1);
    setView('dashboard');
  };

  if (view === 'auth') {
    return <Auth onLogin={handleLogin} />;
  }

  if (view === 'editor') {
    return (
      <div>
        <div style={{ background: '#fff', borderBottom: '1px solid #e9ecef', padding: '10px 24px' }}>
          <button
            className="btn btn-outline"
            onClick={() => setView('dashboard')}
            style={{ fontSize: '0.85rem' }}
          >
            ← Back to Dashboard
          </button>
        </div>
        <Editor userEmail={userEmail} onSessionSaved={handleSessionSaved} />
      </div>
    );
  }

  return (
    <Dashboard
      userEmail={userEmail}
      onNewSession={() => setView('editor')}
      onLogout={handleLogout}
      refresh={sessionRefresh}
    />
  );
}

export default App;
