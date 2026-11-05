import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';

import { createRoot } from 'react-dom/client';

import {
  BrowserRouter,
  useNavigate,
  useLocation,
  Routes,
  Route,
  Navigate,
  Link
} from 'react-router-dom';

import { supabase } from './lib/supabase';

import {
  LayoutDashboard,
  MessageSquare,
  Brain,
  Mic2,
  FolderOpen,
  Settings,
  User,
  Plus,
  Search,
  LogOut,
  Sparkles,
  Menu,
  X,
  Send,
  Copy,
  RefreshCw,
  Paperclip,
  Volume2,
  Square,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

import './styles.css';


/* =========================================================
   AUTH CONTEXT
========================================================= */

const AuthContext = createContext(null);

function useAuth() {
  return useContext(AuthContext);
}

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (mounted) {
        setUser(data?.session?.user || null);
        setLoading(false);
      }
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      setUser
    }),
    [user, loading]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}


/* =========================================================
   PROTECTED ROUTE
========================================================= */

function Protected({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}


/* =========================================================
   SHELL
========================================================= */

function Shell({ children }) {
  const { user, setUser } = useAuth();
  const nav = useNavigate();
  const location = useLocation();

  const [mobileMenu, setMobileMenu] = useState(false);

  async function logout() {
    await supabase.auth.signOut();
    setUser(null);
    nav('/login');
  }

  const navigation = [
    {
      path: '/app',
      label: 'Dashboard',
      icon: LayoutDashboard
    },
    {
      path: '/app/chat',
      label: 'Chat',
      icon: MessageSquare
    },
    {
      path: '/app/memory',
      label: 'Memory',
      icon: Brain
    },
    {
      path: '/app/voice',
      label: 'Voice',
      icon: Mic2
    },
    {
      path: '/app/files',
      label: 'Files',
      icon: FolderOpen
    },
    {
      path: '/app/settings',
      label: 'Settings',
      icon: Settings
    }
  ];

  return (
    <div className="app-shell">

      <aside className={mobileMenu ? 'sidebar mobile-open' : 'sidebar'}>

        <div className="brand">
          <div className="brand-mark">
            <Sparkles size={20} />
          </div>

          <div>
            <div className="brand-name">NIKO</div>
            <div className="brand-sub">AI ASSISTANT</div>
          </div>

          <button
            className="mobile-close"
            onClick={() => setMobileMenu(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="main-nav">

          {navigation.map(item => {
            const Icon = item.icon;

            const active =
              item.path === '/app'
                ? location.pathname === '/app'
                : location.pathname.startsWith(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={active ? 'nav-item active' : 'nav-item'}
                onClick={() => setMobileMenu(false)}
              >
                <Icon size={19} />
                <span>{item.label}</span>
              </Link>
            );
          })}

        </nav>

        <div className="sidebar-bottom">

          <div className="user-mini">

            <div className="avatar">
              {(user?.user_metadata?.name ||
                user?.email ||
                'U')
                .charAt(0)
                .toUpperCase()}
            </div>

            <div className="user-info">
              <div className="user-name">
                {user?.user_metadata?.name ||
                  user?.email?.split('@')[0] ||
                  'User'}
              </div>

              <div className="user-email">
                {user?.email || ''}
              </div>
            </div>

          </div>

          <button
            className="logout-btn"
            onClick={logout}
          >
            <LogOut size={17} />
            <span>Logout</span>
          </button>

        </div>

      </aside>

      {mobileMenu && (
        <div
          className="mobile-overlay"
          onClick={() => setMobileMenu(false)}
        />
      )}

      <main className="main-area">

        <button
          className="mobile-menu-btn"
          onClick={() => setMobileMenu(true)}
        >
          <Menu size={22} />
        </button>

        {children}

      </main>

    </div>
  );
}


/* =========================================================
   LOGIN / AUTH PAGE
========================================================= */

function AuthPage() {
  const nav = useNavigate();
  const { user } = useAuth();

  const [mode, setMode] = useState('login');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      nav('/app', { replace: true });
    }
  }, [user, nav]);

  async function googleLogin() {
    setErr('');
    setSuccess('');
    setBusy(true);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/app`
      }
    });

    if (error) {
      setErr(error.message);
      setBusy(false);
    }
  }

  async function signup(e) {
    e.preventDefault();

    setErr('');
    setSuccess('');

    if (!email || !password) {
      setErr('Email and password are required.');
      return;
    }

    if (password.length < 6) {
      setErr('Password must be at least 6 characters.');
      return;
    }

    setBusy(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name
        }
      }
    });

    if (error) {
      setErr(error.message);
      setBusy(false);
      return;
    }

    if (data?.session) {
      nav('/app');
      return;
    }

    setSuccess(
      'Account created. Check your email if email confirmation is enabled.'
    );

    setBusy(false);
  }

  async function login(e) {
    e.preventDefault();

    setErr('');
    setSuccess('');

    if (!email || !password) {
      setErr('Enter your email and password.');
      return;
    }

    setBusy(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      setErr(error.message);
      setBusy(false);
      return;
    }

    nav('/app');
  }

  return (
    <div className="auth-page">

      <div className="auth-glow glow-one"></div>
      <div className="auth-glow glow-two"></div>

      <div className="auth-card">

        <div className="auth-logo">
          <div className="brand-mark large">
            <Sparkles size={25} />
          </div>

          <div>
            <div className="brand-name">NIKO</div>
            <div className="brand-sub">YOUR AI ASSISTANT</div>
          </div>
        </div>

        <div className="auth-heading">
          <span className="eyebrow">WELCOME TO NIKO</span>

          <h1>
            Your intelligence.
            <br />
            Your assistant.
          </h1>

          <p>
            Your Intelligence. Your Assistant. Your Niko.
          </p>
        </div>

        <button
          className="google-btn"
          onClick={googleLogin}
          disabled={busy}
        >
          <span className="google-icon">G</span>
          Continue with Google
        </button>

        <div className="divider">
          <span>OR</span>
        </div>

        <div className="auth-tabs">

          <button
            className={mode === 'login' ? 'active' : ''}
            onClick={() => {
              setMode('login');
              setErr('');
              setSuccess('');
            }}
          >
            Sign in
          </button>

          <button
            className={mode === 'signup' ? 'active' : ''}
            onClick={() => {
              setMode('signup');
              setErr('');
              setSuccess('');
            }}
          >
            Create account
          </button>

        </div>

        <form
          onSubmit={mode === 'login' ? login : signup}
          className="auth-form"
        >

          {mode === 'signup' && (
            <label>
              <span>Name</span>

              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your name"
                autoComplete="name"
              />
            </label>
          )}

          <label>
            <span>Email</span>

            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </label>

          <label>
            <span>Password</span>

            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete={
                mode === 'login'
                  ? 'current-password'
                  : 'new-password'
              }
            />
          </label>

          {err && (
            <div className="form-error">
              {err}
            </div>
          )}

          {success && (
            <div className="form-success">
              {success}
            </div>
          )}

          <button
            type="submit"
            className="primary-btn"
            disabled={busy}
          >
            {busy ? (
              <span className="loader"></span>
            ) : mode === 'login' ? (
              'Sign in'
            ) : (
              'Create account'
            )}
          </button>

        </form>

        <div className="auth-footer">
          <ShieldCheck size={15} />
          <span>Secure authentication powered by Supabase</span>
        </div>

      </div>

    </div>
  );
}


/* =========================================================
   DASHBOARD
========================================================= */

function Dashboard() {
  const { user } = useAuth();
  const nav = useNavigate();

  const firstName =
    user?.user_metadata?.name?.split(' ')[0] ||
    user?.email?.split('@')[0] ||
    'there';

  return (
    <div className="page dashboard-page">

      <div className="page-top">

        <div>
          <span className="eyebrow">
            NIKO / DASHBOARD
          </span>

          <h1>
            Good to see you, {firstName}.
          </h1>

          <p className="page-subtitle">
            What are we building today?
          </p>
        </div>

        <button
          className="primary-btn compact"
          onClick={() => nav('/app/chat')}
        >
          <MessageSquare size={17} />
          Talk to Niko
        </button>

      </div>

      <div className="hero-card">

        <div className="hero-copy">

          <div className="hero-icon">
            <Sparkles size={28} />
          </div>

          <div>
            <span className="eyebrow">
              NIKO AI
            </span>

            <h2>
              Your Intelligence.
              <br />
              Your Assistant.
              <br />
              Your Niko.
            </h2>

            <p>
              Ask questions, plan projects, write content,
              analyze information and keep your ideas organized.
            </p>
          </div>

        </div>

        <button
          className="hero-action"
          onClick={() => nav('/app/chat')}
        >
          Start a conversation
          <ChevronRight size={18} />
        </button>

      </div>

      <div className="dashboard-grid">

        <button
          className="feature-card"
          onClick={() => nav('/app/chat')}
        >
          <div className="feature-icon">
            <MessageSquare size={21} />
          </div>

          <div>
            <h3>AI Chat</h3>
            <p>
              Have a conversation with Niko.
            </p>
          </div>

          <ChevronRight size={18} />
        </button>

        <button
          className="feature-card"
          onClick={() => nav('/app/memory')}
        >
          <div className="feature-icon">
            <Brain size={21} />
          </div>

          <div>
            <h3>Memory</h3>
            <p>
              Keep useful information available to Niko.
            </p>
          </div>

          <ChevronRight size={18} />
        </button>

        <button
          className="feature-card"
          onClick={() => nav('/app/voice')}
        >
          <div className="feature-icon">
            <Mic2 size={21} />
          </div>

          <div>
            <h3>Voice</h3>
            <p>
              Talk to Niko using your voice.
            </p>
          </div>

          <ChevronRight size={18} />
        </button>

        <button
          className="feature-card"
          onClick={() => nav('/app/files')}
        >
          <div className="feature-icon">
            <FolderOpen size={21} />
          </div>

          <div>
            <h3>Files</h3>
            <p>
              Store and manage your Niko files.
            </p>
          </div>

          <ChevronRight size={18} />
        </button>

      </div>

    </div>
  );
}


/* =========================================================
   CHAT
========================================================= */

function Chat() {

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);

  async function send() {

    if (!input.trim() || busy) {
      return;
    }

    const text = input.trim();

    setInput('');

    const nextMessages = [
      ...messages,
      {
        role: 'user',
        content: text
      }
    ];

    setMessages(nextMessages);
    setBusy(true);

    try {

      const endpoint =
        import.meta.env.VITE_APPWRITE_ENDPOINT ||
        'https://sgp.cloud.appwrite.io/v1';

      const functionId =
        import.meta.env.VITE_APPWRITE_AI_FUNCTION_ID ||
        'niko_ai_api';

      const projectId =
        import.meta.env.VITE_APPWRITE_PROJECT_ID;

      if (!projectId) {
        throw new Error(
          'VITE_APPWRITE_PROJECT_ID is missing from .env'
        );
      }

      const r = await fetch(
        `${endpoint}/functions/${functionId}/executions`,
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
            'X-Appwrite-Project': projectId
          },

          body: JSON.stringify({
            body: JSON.stringify({
              messages: nextMessages
            })
          })
        }
      );

      let data = {};

      try {
        data = await r.json();
      } catch {
        data = {};
      }

      if (!r.ok) {

        throw new Error(
          data?.message ||
          data?.error ||
          data?.responseBody ||
          `Appwrite error ${r.status}`
        );
      }

      let out = '';

      try {

        const responseBody =
          typeof data.responseBody === 'string'
            ? data.responseBody
            : JSON.stringify(data.responseBody || {});

        const parsed = JSON.parse(responseBody);

        out =
          parsed?.content ||
          parsed?.message ||
          responseBody;

      } catch {

        out =
          data?.responseBody ||
          data?.message ||
          data?.content ||
          '';

      }

      if (!out || String(out).trim() === '') {
        out = 'Niko returned an empty response.';
      }

      setMessages(m => [
        ...m,
        {
          role: 'assistant',
          content: String(out)
        }
      ]);

    } catch (e) {

      console.error('NIKO AI ERROR:', e);

      setMessages(m => [
        ...m,
        {
          role: 'assistant',
          content:
            `Niko connection error: ${
              e?.message || 'Unknown error'
            }`
        }
      ]);

    } finally {

      setBusy(false);

    }
  }

  function copyMessage(content) {

    navigator.clipboard
      .writeText(content)
      .catch(() => {});
  }

  return (
    <div className="chat-page">

      <div className="chat-top">

        <div>
          <span className="eyebrow">
            NIKO / CHAT
          </span>

          <h1>
            Talk to Niko
          </h1>
        </div>

        <button
          className="icon-btn"
          title="New chat"
          onClick={() => setMessages([])}
        >
          <Plus />
        </button>

      </div>

      <div className="chat-window">

        {messages.length === 0 ? (

          <div className="chat-empty">

            <div className="niko-mini">
              <Sparkles size={30} />
            </div>

            <h2>
              What are we building today?
            </h2>

            <p>
              Ask Niko to think, explain, write,
              plan or analyze.
            </p>

            <div className="suggestions">

              <button
                onClick={() =>
                  setInput('Help me plan a project')
                }
              >
                Plan a project
              </button>

              <button
                onClick={() =>
                  setInput('Summarize a document')
                }
              >
                Summarize
              </button>

              <button
                onClick={() =>
                  setInput('Help me write something')
                }
              >
                Write
              </button>

            </div>

          </div>

        ) : (

          <div className="messages">

            {messages.map((m, i) => (

              <div
                className={`message ${m.role}`}
                key={i}
              >

                <div className="message-avatar">

                  {m.role === 'assistant' ? (
                    <Sparkles size={15} />
                  ) : (
                    <User size={15} />
                  )}

                </div>

                <div className="bubble">

                  <div className="role">
                    {m.role === 'assistant'
                      ? 'Niko'
                      : 'You'}
                  </div>

                  <div className="content">
                    {m.content}
                  </div>

                  {m.role === 'assistant' && (

                    <div className="msg-actions">

                      <button
                        onClick={() =>
                          copyMessage(m.content)
                        }
                      >
                        <Copy size={14} />
                        Copy
                      </button>

                      <button
                        onClick={() =>
                          setInput(
                            'Regenerate the previous answer.'
                          )
                        }
                      >
                        <RefreshCw size={14} />
                        Regenerate
                      </button>

                    </div>

                  )}

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

      <div className="composer">

        <button
          className="icon-btn"
          type="button"
          title="Attach file"
        >
          <Paperclip size={19} />
        </button>

        <textarea
          value={input}
          onChange={e =>
            setInput(e.target.value)
          }
          onKeyDown={e => {

            if (
              e.key === 'Enter' &&
              !e.shiftKey
            ) {
              e.preventDefault();
              send();
            }

          }}
          placeholder="Message Niko…"
          rows="1"
        />

        <button
          className="send"
          onClick={send}
          disabled={busy || !input.trim()}
        >
          {busy ? (
            <span className="loader"></span>
          ) : (
            <Send size={18} />
          )}
        </button>

      </div>

      <div className="composer-note">
        Niko can make mistakes. Review important
        information before acting.
      </div>

    </div>
  );
}


/* =========================================================
   MEMORY
========================================================= */

function Memory() {
  return (
    <div className="page">

      <div className="page-top">

        <div>
          <span className="eyebrow">
            NIKO / MEMORY
          </span>

          <h1>
            Memory
          </h1>

          <p className="page-subtitle">
            Information Niko can keep available for future conversations.
          </p>
        </div>

      </div>

      <div className="empty-state-card">

        <div className="empty-icon">
          <Brain size={28} />
        </div>

        <h2>
          Memory is ready
        </h2>

        <p>
          Persistent memory storage will appear here.
        </p>

      </div>

    </div>
  );
}


/* =========================================================
   VOICE
========================================================= */

function Voice() {

  const [listening, setListening] = useState(false);

  return (
    <div className="page">

      <div className="page-top">

        <div>
          <span className="eyebrow">
            NIKO / VOICE
          </span>

          <h1>
            Voice
          </h1>

          <p className="page-subtitle">
            Talk to Niko naturally.
          </p>
        </div>

      </div>

      <div className="voice-card">

        <div
          className={
            listening
              ? 'voice-orb listening'
              : 'voice-orb'
          }
        >
          <Mic2 size={42} />
        </div>

        <h2>
          {listening
            ? 'Listening…'
            : 'Ready when you are'}
        </h2>

        <p>
          Voice interaction will connect to Niko AI.
        </p>

        <button
          className="primary-btn"
          onClick={() =>
            setListening(!listening)
          }
        >
          {listening ? (
            <>
              <Square size={16} />
              Stop
            </>
          ) : (
            <>
              <Mic2 size={17} />
              Start talking
            </>
          )}
        </button>

      </div>

    </div>
  );
}


/* =========================================================
   FILES
========================================================= */

function Files() {

  return (
    <div className="page">

      <div className="page-top">

        <div>
          <span className="eyebrow">
            NIKO / FILES
          </span>

          <h1>
            Files
          </h1>

          <p className="page-subtitle">
            Your files and documents for Niko.
          </p>
        </div>

        <button className="primary-btn compact">
          <Plus size={17} />
          Upload
        </button>

      </div>

      <div className="empty-state-card">

        <div className="empty-icon">
          <FolderOpen size={28} />
        </div>

        <h2>
          No files yet
        </h2>

        <p>
          Upload documents and files to use them with Niko.
        </p>

      </div>

    </div>
  );
}


/* =========================================================
   SETTINGS
========================================================= */

function SettingsPage() {

  const { user } = useAuth();

  return (
    <div className="page">

      <div className="page-top">

        <div>
          <span className="eyebrow">
            NIKO / SETTINGS
          </span>

          <h1>
            Settings
          </h1>

          <p className="page-subtitle">
            Manage your Niko account.
          </p>
        </div>

      </div>

      <div className="settings-grid">

        <div className="settings-card">

          <div className="settings-card-header">

            <div className="feature-icon">
              <User size={20} />
            </div>

            <div>
              <h3>
                Profile
              </h3>

              <p>
                Your account information.
              </p>
            </div>

          </div>

          <div className="setting-row">

            <span>
              Email
            </span>

            <strong>
              {user?.email || '—'}
            </strong>

          </div>

          <div className="setting-row">

            <span>
              Authentication
            </span>

            <strong>
              Supabase
            </strong>

          </div>

        </div>


        <div className="settings-card">

          <div className="settings-card-header">

            <div className="feature-icon">
              <ShieldCheck size={20} />
            </div>

            <div>
              <h3>
                Security
              </h3>

              <p>
                Your authentication is handled securely.
              </p>
            </div>

          </div>

          <div className="security-status">
            <ShieldCheck size={18} />
            <span>
              Account secured with Supabase Auth
            </span>
          </div>

        </div>

      </div>

    </div>
  );
}


/* =========================================================
   APP ROUTES
========================================================= */

function AppRoutes() {

  return (
    <Routes>

      <Route
        path="/login"
        element={<AuthPage />}
      />

      <Route
        path="/app"
        element={
          <Protected>
            <Shell>
              <Dashboard />
            </Shell>
          </Protected>
        }
      />

      <Route
        path="/app/chat"
        element={
          <Protected>
            <Shell>
              <Chat />
            </Shell>
          </Protected>
        }
      />

      <Route
        path="/app/memory"
        element={
          <Protected>
            <Shell>
              <Memory />
            </Shell>
          </Protected>
        }
      />

      <Route
        path="/app/voice"
        element={
          <Protected>
            <Shell>
              <Voice />
            </Shell>
          </Protected>
        }
      />

      <Route
        path="/app/files"
        element={
          <Protected>
            <Shell>
              <Files />
            </Shell>
          </Protected>
        }
      />

      <Route
        path="/app/settings"
        element={
          <Protected>
            <Shell>
              <SettingsPage />
            </Shell>
          </Protected>
        }
      />

      <Route
        path="/"
        element={<Navigate to="/app" replace />}
      />

      <Route
        path="*"
        element={<Navigate to="/app" replace />}
      />

    </Routes>
  );
}


/* =========================================================
   ROOT
========================================================= */

function App() {

  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}


createRoot(
  document.getElementById('root')
).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);