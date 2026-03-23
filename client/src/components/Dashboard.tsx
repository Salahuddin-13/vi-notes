import { useEffect, useState } from 'react';
import api from '../api';

interface Session {
  _id: string;
  text: string;
  keystrokeData: { timestamp: number; type: string }[];
  pasteEvents: { timestamp: number; length: number }[];
  totalTypingTime: number;
  createdAt: string;
}

interface DashboardProps {
  userEmail: string;
  onNewSession: () => void;
  onLogout: () => void;
  refresh: number;
}

export default function Dashboard({ userEmail, onNewSession, onLogout, refresh }: DashboardProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Session | null>(null);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await api.get('/sessions');
        setSessions(res.data);
      } catch {
        setSessions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, [refresh]);

  const formatDate = (d: string) =>
    new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

  const getAuthScore = (session: Session) => {
    const pasteRatio = session.pasteEvents.length > 0
      ? session.pasteEvents.reduce((sum, p) => sum + p.length, 0) / Math.max(session.text.length, 1)
      : 0;
    const score = Math.max(20, Math.round((1 - pasteRatio) * 95));
    return score;
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.logo}>✍️ <span style={styles.logoText}>Vi-Notes</span></div>
        <div style={styles.headerRight}>
          <span style={styles.emailBadge}>👤 {userEmail}</span>
          <button className="btn btn-primary" onClick={onNewSession}>+ New Session</button>
          <button className="btn btn-outline" onClick={onLogout}>Logout</button>
        </div>
      </div>

      <div style={styles.body}>
        {/* Session list */}
        <div style={styles.sidebar}>
          <h2 style={styles.sidebarTitle}>Your Sessions</h2>
          {loading ? (
            <p style={{ color: '#6c757d', fontSize: '0.9rem' }}>Loading...</p>
          ) : sessions.length === 0 ? (
            <div style={styles.emptyState}>
              <p>No sessions yet.</p>
              <p>Click <strong>+ New Session</strong> to start writing!</p>
            </div>
          ) : (
            sessions.map((s) => {
              const score = getAuthScore(s);
              return (
                <div
                  key={s._id}
                  style={{ ...styles.sessionCard, ...(selected?._id === s._id ? styles.sessionCardActive : {}) }}
                  onClick={() => setSelected(s)}
                >
                  <div style={styles.sessionPreview}>
                    {s.text.substring(0, 80)}{s.text.length > 80 ? '...' : ''}
                  </div>
                  <div style={styles.sessionMeta}>
                    <span>{formatDate(s.createdAt)}</span>
                    <span style={{ color: score >= 70 ? '#28a745' : '#e85d4a', fontWeight: 600 }}>
                      {score}% human
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Session detail */}
        <div style={styles.detail}>
          {selected ? (
            <>
              <h2 style={styles.detailTitle}>Session Report</h2>
              <p style={styles.detailDate}>{formatDate(selected.createdAt)}</p>

              {/* Authenticity score */}
              <div style={styles.scoreCard}>
                <div style={styles.scoreLabel}>Authenticity Score</div>
                <div style={{ ...styles.score, color: getAuthScore(selected) >= 70 ? '#28a745' : '#e85d4a' }}>
                  {getAuthScore(selected)}%
                </div>
                <div style={styles.scoreNote}>
                  Based on {selected.keystrokeData.length} keystroke events and {selected.pasteEvents.length} paste event(s)
                </div>
              </div>

              {/* Stats */}
              <div style={styles.statsGrid}>
                <div style={styles.statBox}>
                  <div style={styles.statValue}>{selected.text.trim().split(/\s+/).length}</div>
                  <div style={styles.statLabel}>Words</div>
                </div>
                <div style={styles.statBox}>
                  <div style={styles.statValue}>{selected.keystrokeData.length}</div>
                  <div style={styles.statLabel}>Keystrokes</div>
                </div>
                <div style={styles.statBox}>
                  <div style={{ ...styles.statValue, color: selected.pasteEvents.length > 0 ? '#e85d4a' : '#28a745' }}>
                    {selected.pasteEvents.length}
                  </div>
                  <div style={styles.statLabel}>Paste Events</div>
                </div>
                <div style={styles.statBox}>
                  <div style={styles.statValue}>{Math.round(selected.totalTypingTime / 1000)}s</div>
                  <div style={styles.statLabel}>Session Time</div>
                </div>
              </div>

              {/* Written text */}
              <h3 style={styles.sectionTitle}>Written Content</h3>
              <div style={styles.textPreview}>{selected.text}</div>
            </>
          ) : (
            <div style={styles.detailEmpty}>
              <p style={{ fontSize: '3rem' }}>📄</p>
              <p>Select a session to view its report</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { minHeight: '100vh', background: '#f8f9fa' },
  header: {
    background: '#fff',
    borderBottom: '1px solid #e9ecef',
    padding: '14px 28px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap' as const,
    gap: 12,
  },
  logo: { display: 'flex', alignItems: 'center', gap: 8, fontSize: '1.4rem' },
  logoText: { fontWeight: 700, color: '#1a1a2e' },
  headerRight: { display: 'flex', alignItems: 'center', gap: 12 },
  emailBadge: { fontSize: '0.85rem', color: '#6c757d' },
  body: { display: 'flex', height: 'calc(100vh - 64px)' },
  sidebar: { width: 320, background: '#fff', borderRight: '1px solid #e9ecef', padding: 20, overflowY: 'auto' as const },
  sidebarTitle: { fontSize: '1rem', fontWeight: 700, marginBottom: 16, color: '#1a1a2e' },
  emptyState: { color: '#6c757d', fontSize: '0.875rem', lineHeight: 1.8 },
  sessionCard: {
    padding: 14, borderRadius: 10, cursor: 'pointer',
    marginBottom: 10, border: '1.5px solid #e9ecef',
    transition: 'all 0.15s',
  },
  sessionCardActive: { borderColor: '#e85d4a', background: '#fdf5f4' },
  sessionPreview: { fontSize: '0.875rem', color: '#1a1a2e', marginBottom: 6, lineHeight: 1.5 },
  sessionMeta: { display: 'flex', justifyContent: 'space-between', fontSize: '0.77rem', color: '#6c757d' },
  detail: { flex: 1, padding: 32, overflowY: 'auto' as const },
  detailTitle: { fontSize: '1.4rem', fontWeight: 700, marginBottom: 4 },
  detailDate: { color: '#6c757d', fontSize: '0.875rem', marginBottom: 24 },
  scoreCard: {
    background: 'linear-gradient(135deg, #fdecea, #fff)', border: '1.5px solid #fbd5d0',
    borderRadius: 12, padding: '20px 24px', marginBottom: 24, textAlign: 'center' as const,
  },
  scoreLabel: { fontSize: '0.85rem', color: '#6c757d', fontWeight: 600, marginBottom: 8 },
  score: { fontSize: '3.5rem', fontWeight: 800 },
  scoreNote: { fontSize: '0.8rem', color: '#6c757d', marginTop: 6 },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 },
  statBox: { background: '#fff', border: '1.5px solid #e9ecef', borderRadius: 10, padding: '14px 12px', textAlign: 'center' as const },
  statValue: { fontSize: '1.5rem', fontWeight: 700, color: '#1a1a2e' },
  statLabel: { fontSize: '0.75rem', color: '#6c757d', marginTop: 4 },
  sectionTitle: { fontWeight: 600, marginBottom: 10, fontSize: '0.95rem' },
  textPreview: {
    background: '#f8f9fa', borderRadius: 8, padding: 16,
    fontSize: '0.9rem', lineHeight: 1.7, color: '#1a1a2e',
    maxHeight: 200, overflowY: 'auto' as const,
  },
  detailEmpty: {
    display: 'flex', flexDirection: 'column' as const,
    alignItems: 'center', justifyContent: 'center',
    height: '100%', color: '#6c757d', gap: 12,
  },
};
