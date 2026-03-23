import { useRef, useState, useCallback } from 'react';
import api from '../api';

interface KeystrokeEvent {
  timestamp: number;
  type: 'keydown' | 'keyup';
}

interface PasteEvent {
  timestamp: number;
  length: number;
}

interface EditorProps {
  userEmail: string;
  onSessionSaved: () => void;
}

export default function Editor({ userEmail, onSessionSaved }: EditorProps) {
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [pasteWarning, setPasteWarning] = useState(false);

  // Feature 3: Keystroke timing — only timestamps, never the keys
  const keystrokeData = useRef<KeystrokeEvent[]>([]);
  // Feature 4: Paste detection
  const pasteEvents = useRef<PasteEvent[]>([]);
  const sessionStartTime = useRef<number>(Date.now());

  const handleKeyDown = useCallback(() => {
    keystrokeData.current.push({ timestamp: Date.now(), type: 'keydown' });
  }, []);

  const handleKeyUp = useCallback(() => {
    keystrokeData.current.push({ timestamp: Date.now(), type: 'keyup' });
  }, []);

  // Feature 4: Detect paste
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const pastedText = e.clipboardData.getData('text');
    pasteEvents.current.push({
      timestamp: Date.now(),
      length: pastedText.length,
    });
    setPasteWarning(true);
    setTimeout(() => setPasteWarning(false), 3000);
  }, []);

  // Feature 5: Save session
  const handleSave = async () => {
    if (!text.trim()) return;

    setSaving(true);
    setSaveMsg('');
    try {
      const totalTypingTime = Date.now() - sessionStartTime.current;
      await api.post('/sessions', {
        text,
        keystrokeData: keystrokeData.current,
        pasteEvents: pasteEvents.current,
        totalTypingTime,
      });
      setSaveMsg('Session saved successfully!');
      // Reset for next session
      setTimeout(() => {
        setText('');
        keystrokeData.current = [];
        pasteEvents.current = [];
        sessionStartTime.current = Date.now();
        setSaveMsg('');
        onSessionSaved();
      }, 1500);
    } catch {
      setSaveMsg('Failed to save session. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;
  const keystrokeCount = keystrokeData.current.length;
  const pasteCount = pasteEvents.current.length;

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>New Writing Session</h1>
          <p style={styles.sub}>Logged in as <strong>{userEmail}</strong></p>
        </div>
        <button
          className="btn btn-primary"
          onClick={handleSave}
          disabled={saving || !text.trim()}
        >
          {saving ? 'Saving...' : '💾 Save Session'}
        </button>
      </div>

      {/* Paste warning — Feature 4 */}
      {pasteWarning && (
        <div style={styles.pasteAlert}>
          ⚠️ <strong>Paste detected!</strong> This event has been recorded in your session metadata.
        </div>
      )}

      {saveMsg && (
        <div className={saveMsg.includes('Failed') ? 'error-msg' : 'success-msg'}>
          {saveMsg}
        </div>
      )}

      {/* Feature 1: Basic Writing Editor */}
      <textarea
        style={styles.editor}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        onPaste={handlePaste}
        placeholder="Start writing here... Your typing behavior is being recorded (not the actual keys, only the timing)."
        autoFocus
      />

      {/* Live stats */}
      <div style={styles.stats}>
        <span>📝 {wordCount} words</span>
        <span>🔤 {charCount} characters</span>
        <span>⌨️ {keystrokeCount} keystrokes captured</span>
        {pasteCount > 0 && (
          <span style={{ color: '#e85d4a' }}>📋 {pasteCount} paste event(s)</span>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: 800,
    margin: '0 auto',
    padding: '32px 24px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
    flexWrap: 'wrap' as const,
    gap: 16,
  },
  title: {
    fontSize: '1.6rem',
    fontWeight: 700,
    color: '#1a1a2e',
    marginBottom: 4,
  },
  sub: { color: '#6c757d', fontSize: '0.875rem' },
  pasteAlert: {
    background: '#fff3cd',
    border: '1px solid #ffc107',
    borderRadius: 8,
    padding: '10px 16px',
    marginBottom: 16,
    fontSize: '0.9rem',
    color: '#856404',
  },
  editor: {
    width: '100%',
    minHeight: 400,
    padding: '20px',
    fontSize: '1.05rem',
    lineHeight: '1.8',
    border: '2px solid #e9ecef',
    borderRadius: 12,
    fontFamily: 'Inter, sans-serif',
    resize: 'vertical' as const,
    outline: 'none',
    transition: 'border-color 0.2s',
    color: '#1a1a2e',
    background: '#fff',
  },
  stats: {
    display: 'flex',
    gap: 20,
    marginTop: 12,
    fontSize: '0.85rem',
    color: '#6c757d',
    flexWrap: 'wrap' as const,
  },
};
