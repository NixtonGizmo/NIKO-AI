
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useRef
} from 'react';

import { createRoot } from 'react-dom/client';

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Link,
  useNavigate,
  useLocation,
  useSearchParams
} from 'react-router-dom';

import { supabase } from './lib/supabase';
import './index.css';
import {
  MessageSquare,
  History,
  Mic2,
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
  ArrowUp,
  MoreHorizontal,
  Trash2,
  PanelLeftClose,
  PanelLeft,
  Check,
  Settings2,
  Command,
  Sun,
  Moon,
  Headphones,
  Clock,
  Bot,
  Mic,
  StopCircle,
  Pencil,
  CircleHelp
} from 'lucide-react';


/* =========================================================
   NIKO AI - CREAM PREMIUM EDITION
   Everything is contained in this file.
========================================================= */


/* =========================================================
   GLOBAL STYLES
========================================================= */




/* =========================================================
   AUTH CONTEXT
========================================================= */

const AuthContext = createContext(null);

function AuthProvider({ children }) {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {

      if (mounted) {
        setUser(data.session?.user || null);
        setLoading(false);
      }

    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };

  }, []);

  const value = useMemo(
    () => ({ user, loading, setUser }),
    [user, loading]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );

}

const useAuth = () => useContext(AuthContext);


/* =========================================================
   LOCAL CHAT HISTORY
========================================================= */

function storageKey(userId) {
  return `niko_chat_history_${userId}`;
}

function makeId() {
  return (
    globalThis.crypto?.randomUUID?.() ||
    `niko_${Date.now()}_${Math.random().toString(36).slice(2)}`
  );
}

function readChats(userId) {

  try {
    return JSON.parse(
      localStorage.getItem(storageKey(userId)) || '[]'
    );
  } catch {
    return [];
  }

}

function writeChats(userId, chats) {

  try {
    localStorage.setItem(
      storageKey(userId),
      JSON.stringify(chats)
    );
  } catch (error) {
    console.error('History storage error:', error);
  }

}

function saveConversation(userId, conversation) {

  const chats = readChats(userId);

  const index = chats.findIndex(
    item => item.id === conversation.id
  );

  if (index >= 0) {
    chats[index] = {
      ...chats[index],
      ...conversation,
      updatedAt: Date.now()
    };
  } else {
    chats.unshift({
      ...conversation,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
  }

  chats.sort((a, b) => b.updatedAt - a.updatedAt);

  writeChats(userId, chats.slice(0, 100));

}


/* =========================================================
   AUTH PROTECTION
========================================================= */

function NikoLogo({ size = 26, className = "" }) {
  return (
    <img
      src="/logo.png"
      alt="NIKO AI"
      className={`niko-logo ${className}`}
      style={{
        width: size,
        height: size,
        objectFit: "contain"
      }}
    />
  );
}

function Splash() {
  return (
    <div className="splash">
      <div className="logo-mark">
        <NikoLogo size={42} />
      </div>
      NIKO AI
    </div>
  );
}

function Protected({ children }) {

  const { user, loading } = useAuth();

  if (loading) return <Splash />;

  return user
    ? children
    : <Navigate to="/login" replace />;

}


/* =========================================================
   LOGO
========================================================= */

function Logo() {

  return (
    <Link className="brand" to="/app/chat">
      <span className="logo-mark">
        <img
          src="/logo.png"
          alt="NIKO AI"
          onError={(e) => console.log("Logo not found:", e.currentTarget.src)}
        />
      </span>
      <span>NIKO <b>AI</b></span>
    </Link>
  );

}


/* =========================================================
   APPLICATION SHELL
========================================================= */

function Shell({ children }) {

  const { user, setUser } = useAuth();

  const nav = useNavigate();
  const loc = useLocation();

  const [mobile, setMobile] = useState(false);

  const items = [
    ['/app/chat', 'Chat', MessageSquare],
    ['/app/history', 'Chat History', History],
    ['/app/voice', 'Voice', Mic2],
    ['/app/profile', 'Profile', User]
  ];

  async function logout() {

    await supabase.auth.signOut();

    setUser(null);

    nav('/login');

  }

  function newChat() {
    nav(`/app/chat?new=${Date.now()}`);
    setMobile(false);
  }

  return (

    <div className="app-shell">

      <aside className={mobile ? 'sidebar open' : 'sidebar'}>

        <div className="side-top">

          <Logo />

          <button
            className="icon-btn mobile-only"
            onClick={() => setMobile(false)}
          >
            <X size={19} />
          </button>

        </div>

        <button className="new-chat" onClick={newChat}>
          <Plus size={17} />
          New conversation
        </button>

        <div className="nav-label">
          WORKSPACE
        </div>

        <nav>

          {items.map(([to, label, Icon]) => {

            const active =
              to === '/app/chat'
                ? loc.pathname === '/app/chat'
                : loc.pathname === to;

            return (

              <Link
                key={to}
                to={to}
                onClick={() => setMobile(false)}
                className={active ? 'active' : ''}
              >
                <Icon size={18} />
                {label}
              </Link>

            );

          })}

        </nav>

        <div className="side-bottom">

          <div className="sidebar-divider" />

          <div className="status">
            <span className="status-dot" />

            <div>
              <strong>Niko online</strong>
              <small>Your AI companion</small>
            </div>
          </div>

          <button
            className="profile-mini"
            onClick={() => nav('/app/profile')}
          >

            <div className="avatar">
              {(
                user?.user_metadata?.name ||
                user?.email ||
                'N'
              )[0].toUpperCase()}
            </div>

            <div className="ellipsis">
              <strong>
                {user?.user_metadata?.name || 'Niko user'}
              </strong>
              <small>{user?.email}</small>
            </div>

          </button>

          <button className="logout" onClick={logout}>
            <LogOut size={15} />
            Sign out
          </button>

        </div>

      </aside>

      <main className="main">

        <header className="mobile-header">

          <button
            className="icon-btn"
            onClick={() => setMobile(true)}
          >
            <Menu size={20} />
          </button>

          <Logo />

          <button
            className="icon-btn"
            onClick={newChat}
          >
            <Plus size={19} />
          </button>

        </header>

        {children}

      </main>

    </div>

  );

}


/* =========================================================
   LANDING PAGE
========================================================= */

function Landing() {

  return (

    <div className="landing">

      <header className="landing-nav">

        <Logo />

        <div className="nav-actions">

          <Link to="/login" className="text-link">
            Sign in
          </Link>

          <Link to="/signup" className="btn primary">
            Get started
            <ChevronRight size={16} />
          </Link>

        </div>

      </header>

      <section className="hero">

        <div className="hero-copy">

          <span className="eyebrow">
            YOUR PERSONAL AI
          </span>

          <h1>
            Intelligence,
            <br />
            made <span>personal.</span>
          </h1>

          <p>
            Meet Niko. A thoughtful AI companion designed
            to help you think clearly, explore ideas,
            create things and get more done.
          </p>

          <div className="hero-actions">

            <Link to="/signup" className="btn primary">
              Start with Niko
              <ArrowUp size={16} />
            </Link>

            <Link to="/login" className="btn ghost">
              I have an account
            </Link>

          </div>

        </div>

        <div className="hero-visual">

          <div className="hero-core">
            <Sparkles size={55} />
            <strong>NIKO</strong>
          </div>

          <div className="hero-note one">
            <Sparkles size={13} />
            &nbsp; Thoughtful conversations
          </div>

          <div className="hero-note two">
            <Mic2 size={13} />
            &nbsp; Natural voice experience
          </div>

        </div>

      </section>

      <footer className="landing-footer">
        <Logo />
        <span>© {new Date().getFullYear()} NIKO AI</span>
      </footer>

    </div>

  );

}


/* =========================================================
   LOGIN / SIGNUP
========================================================= */

function AuthPage({ signup = false }) {

  const { setUser } = useAuth();
  const nav = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  async function googleLogin() {

    setErr('');
    setBusy(true);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/app/chat`
      }
    });

    if (error) {
      setErr(error.message);
      setBusy(false);
    }

  }

  async function submit(e) {

    e.preventDefault();

    setBusy(true);
    setErr('');

    try {

      if (signup) {

        const { data, error } = await supabase.auth.signUp({

          email,
          password,

          options: {
            data: { name }
          }

        });

        if (error) throw error;

        if (data.session) {
          setUser(data.user);
          nav('/app/chat');
        } else {
          setErr(
            'Account created. Please check your email to confirm your account.'
          );
        }

      } else {

        const { data, error } =
          await supabase.auth.signInWithPassword({
            email,
            password
          });

        if (error) throw error;

        setUser(data.user);

        nav('/app/chat');

      }

    } catch (error) {

      setErr(error?.message || 'Authentication failed.');

    } finally {

      setBusy(false);

    }

  }

  return (

    <div className="auth">

      <div className="auth-art">

        <Logo />

        <div className="auth-orb">
          <Sparkles size={55} />
        </div>

        <h2>
          A calmer space
          <br />
          to think.
        </h2>

        <p>
          Your ideas, conversations and creativity
          deserve a beautiful place.
        </p>

      </div>

      <div className="auth-card">

        <div className="auth-inner">

          <Link to="/" className="back">
            ← Back to Niko
          </Link>

          <span className="eyebrow">
            NIKO AI
          </span>

          <h1>
            {signup ? 'Create account' : 'Welcome back.'}
          </h1>

          <p>
            {signup
              ? 'Create your personal AI workspace.'
              : 'Continue your conversations with Niko.'}
          </p>

          {err && <div className="error">{err}</div>}

          <button
            type="button"
            className="btn ghost google-btn"
            onClick={googleLogin}
            disabled={busy}
          >
            <span className="google-mark">G</span>
            Continue with Google
          </button>

          <div className="auth-divider">
            <span>or continue with email</span>
          </div>

          <form onSubmit={submit}>

            {signup && (

              <label>
                Your name

                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your name"
                  required
                />

              </label>

            )}

            <label>
              Email address

              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />

            </label>

            <label>
              Password

              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter password"
                minLength={8}
                required
              />

            </label>

            <button
              className="btn primary full"
              disabled={busy}
            >
              {busy
                ? 'Please wait...'
                : signup
                  ? 'Create account'
                  : 'Sign in'}

              <ChevronRight size={17} />

            </button>

          </form>

          <div className="switch">

            {signup
              ? 'Already have an account? '
              : 'New to Niko? '}

            <Link to={signup ? '/login' : '/signup'}>
              {signup ? 'Sign in' : 'Create one'}
            </Link>

          </div>

        </div>

      </div>

    </div>

  );

}


/* =========================================================
   CHAT COMPONENT
========================================================= */

function Chat() {

  const { user } = useAuth();

  const navigate = useNavigate();

  const [params] = useSearchParams();

  const conversationParam = params.get('id');
  const newParam = params.get('new');

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);

  const [activeId, setActiveId] = useState('');
  const [serverId, setServerId] = useState('');

  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  /* Load existing conversation */

  useEffect(() => {

    if (!user?.id) return;

    if (conversationParam) {

      const chats = readChats(user.id);

      const found = chats.find(
        chat => chat.id === conversationParam
      );

      if (found) {

        setActiveId(found.id);
        setMessages(found.messages || []);
        setServerId(found.serverId || '');

      } else {

        setActiveId(conversationParam);
        setMessages([]);
        setServerId('');

      }

    } else {

      setActiveId(makeId());
      setMessages([]);
      setServerId('');

    }

    setInput('');

  }, [conversationParam, newParam, user?.id]);

  /* Scroll */

  useEffect(() => {

    bottomRef.current?.scrollIntoView({
      behavior: 'smooth'
    });

  }, [messages, busy]);

  /* Persist */

  function persist(nextMessages, id = activeId, remoteId = serverId) {

    if (!user?.id || !id) return;

    const firstUser = nextMessages.find(
      message => message.role === 'user'
    );

    saveConversation(user.id, {

      id,
      serverId: remoteId,

      title: firstUser
        ? firstUser.content.slice(0, 55)
        : 'New conversation',

      messages: nextMessages

    });

  }

  /* Send message */

  async function send() {

    if (!input.trim() || busy) return;

    if (!user?.id) return;

    const text = input.trim();

    setInput('');

    const currentId = activeId || makeId();

    const userMessage = {
      role: 'user',
      content: text
    };

    const nextMessages = [
      ...messages,
      userMessage
    ];

    setMessages(nextMessages);

    setBusy(true);

    persist(nextMessages, currentId);

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
          'VITE_APPWRITE_PROJECT_ID is missing in .env'
        );
      }

      const {
        data: { session },
        error: sessionError
      } = await supabase.auth.getSession();

      if (sessionError || !session?.access_token) {
        throw new Error(
          'Your login session has expired. Please sign in again.'
        );
      }

      const response = await fetch(
        `${endpoint}/functions/${functionId}/executions`,
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
            'X-Appwrite-Project': projectId
          },

          body: JSON.stringify({

            body: JSON.stringify({

              supabaseAccessToken: session.access_token,

              conversationId: serverId || null,

              messages: nextMessages

            }),

            async: false

          })

        }
      );

      let execution = {};

      try {
        execution = await response.json();
      } catch {
        throw new Error(
          'Appwrite returned an invalid response.'
        );
      }

      if (!response.ok) {
        throw new Error(
          execution.message ||
          execution.error ||
          `Appwrite HTTP ${response.status}`
        );
      }

      if (execution.status === 'failed') {
        throw new Error(
          execution.stderr ||
          execution.responseBody ||
          'Niko Function execution failed.'
        );
      }

      const responseBody = execution.responseBody;

      if (!responseBody) {
        throw new Error(
          'Function returned an empty response. Check Appwrite logs.'
        );
      }

      let result;

      try {
        result =
          typeof responseBody === 'string'
            ? JSON.parse(responseBody)
            : responseBody;
      } catch {
        throw new Error(
          'Invalid JSON returned from Niko Function.'
        );
      }

      if (
        execution.responseStatusCode &&
        execution.responseStatusCode >= 400
      ) {
        throw new Error(
          result?.error ||
          result?.message ||
          `Niko Function HTTP ${execution.responseStatusCode}`
        );
      }

      const output =
        result?.content ||
        result?.message ||
        '';

      if (!output) {
        throw new Error(
          result?.error ||
          'Niko returned no AI message.'
        );
      }

      const remoteConversationId = result.conversationId;

if (!remoteConversationId) {
  throw new Error(
    'Backend did not return a valid conversation ID.'
  );
}

setServerId(remoteConversationId);

      const finalMessages = [
        ...nextMessages,
        {
          role: 'assistant',
          content: String(output)
        }
      ];

      setMessages(finalMessages);

      persist(
        finalMessages,
        currentId,
        remoteConversationId
      );

      if (!conversationParam) {
        navigate(`/app/chat?id=${currentId}`, {
          replace: true
        });
      }

    } catch (error) {

      console.error('NIKO CHAT ERROR:', error);

      const errorMessages = [
        ...nextMessages,
        {
          role: 'assistant',
          content:
            `Niko connection error: ${
              error?.message || 'Unknown error'
            }`
        }
      ];

      setMessages(errorMessages);

      persist(errorMessages, currentId);

    } finally {

      setBusy(false);

    }

  }

  /* Copy */

  function copyMessage(content) {

    navigator.clipboard?.writeText(content)
      .catch(console.error);

  }

  /* Regenerate */

  function regenerate() {

    const lastUser = [...messages]
      .reverse()
      .find(message => message.role === 'user');

    if (!lastUser || busy) return;

    const previous = messages.slice(
      0,
      messages.lastIndexOf(lastUser) + 1
    );

    setMessages(previous);

    setInput(lastUser.content);

  }

  /* Input suggestions */

  function suggestion(text) {
    setInput(text);
    textareaRef.current?.focus();
  }

  return (

    <div className="chat-page">

      <div className="chat-top">

        <div>
          <span className="eyebrow">
            NIKO / PERSONAL ASSISTANT
          </span>

          <h1>Conversation</h1>
        </div>

        <button
          className="icon-btn"
          title="New conversation"
          onClick={() => navigate(`/app/chat?new=${Date.now()}`)}
        >
          <Plus size={20} />
        </button>

      </div>

      <div className="chat-window">

        {messages.length === 0 ? (

          <div className="chat-empty">

            <div className="niko-mini">
              <Sparkles size={30} />
            </div>

            <span className="eyebrow">
              A LITTLE SPACE FOR BIG IDEAS
            </span>

            <h2>
              What shall we explore today?
            </h2>

            <p>
              Ask Niko to think, explain, create,
              write or help you plan something.
            </p>

            <div className="suggestions">

              <button
                onClick={() => suggestion('Help me plan a new project.')}
              >
                <Command size={13} />
                &nbsp; Plan a project
              </button>

              <button
                onClick={() => suggestion('Teach me something new.')}
              >
                Learn something
              </button>

              <button
                onClick={() => suggestion('Help me write something.')}
              >
                Write something
              </button>

            </div>

          </div>

        ) : (

          <div className="messages">

            {messages.map((message, index) => (
  <div
    className={`message-row ${
      message.role === 'user' ? 'user-row' : 'ai-row'
    }`}
    key={`${index}-${message.role}`}
  >
    <div
      className={`message-bubble ${
        message.role === 'user' ? 'user-bubble' : 'ai-bubble'
      }`}
    >
      <div className="role">
        {message.role === 'assistant' ? 'Niko' : 'You'}
      </div>

      <div className="content">
        {message.content}
      </div>

      {message.role === 'assistant' && (
        <div className="msg-actions">
          <button onClick={() => copyMessage(message.content)}>
            <Copy size={13} /> Copy
          </button>

          {index === messages.length - 1 && (
            <button onClick={regenerate}>
              <RefreshCw size={13} /> Regenerate
            </button>
          )}
        </div>
      )}
    </div>
  </div>
))}

            {busy && (

              <div className="message assistant">

                <div className="message-avatar">
                  <Sparkles size={15} />
                </div>

                <div className="bubble">
                  <div className="role">Niko</div>
                  <div className="content">
                    Thinking...
                  </div>
                </div>

              </div>

            )}

            <div ref={bottomRef} />

          </div>

        )}

      </div>

      <div className="composer-wrap">

        <div className="composer">

          <div className="composer-tools">

            <button
              type="button"
              title="Voice"
              onClick={() => navigate('/app/voice')}
            >
              <Mic size={18} />
            </button>

          </div>

          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {

              if (
                e.key === 'Enter' &&
                !e.shiftKey
              ) {
                e.preventDefault();
                send();
              }

            }}
            placeholder="Message Niko..."
            rows="1"
          />

          <button
            className="send"
            onClick={send}
            disabled={busy || !input.trim()}
            title="Send message"
          >
            {busy
              ? <span className="loader" />
              : <ArrowUp size={20} />}
          </button>

        </div>

        <div className="composer-note">
          Niko can make mistakes. Review important information.
        </div>

      </div>

    </div>

  );

}


/* =========================================================
   CHAT HISTORY
========================================================= */

function ChatHistory() {

  const { user } = useAuth();

  const navigate = useNavigate();

  const [chats, setChats] = useState([]);

  const [search, setSearch] = useState('');

  function refresh() {
    if (user?.id) {
      setChats(readChats(user.id));
    }
  }

  useEffect(() => {
    refresh();
  }, [user?.id]);

  function deleteChat(id) {

    const updated = chats.filter(
      chat => chat.id !== id
    );

    writeChats(user.id, updated);

    setChats(updated);

  }

  const filtered = chats.filter(chat =>
    (chat.title || '').toLowerCase()
      .includes(search.toLowerCase())
  );

  function formatDate(timestamp) {

    if (!timestamp) return '';

    return new Date(timestamp).toLocaleString(
      undefined,
      {
        dateStyle: 'medium',
        timeStyle: 'short'
      }
    );

  }

  return (

    <div className="page">

      <div className="page-head">

        <div>
          <span className="eyebrow">
            YOUR PERSONAL ARCHIVE
          </span>

          <h1>Chat history</h1>

          <p>
            Revisit your conversations with Niko.
          </p>
        </div>

        <button
          className="btn primary"
          onClick={() => navigate(`/app/chat?new=${Date.now()}`)}
        >
          <Plus size={16} />
          New chat
        </button>

      </div>

      <div className="composer" style={{ marginBottom: 22 }}>

        <div className="composer-tools">
          <Search size={17} />
        </div>

        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search conversations..."
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            background: 'transparent',
            color: 'var(--brown)',
            fontSize: 13,
            padding: 10
          }}
        />

        {search && (
          <button
            className="icon-btn"
            onClick={() => setSearch('')}
          >
            <X size={15} />
          </button>
        )}

      </div>

      {filtered.length === 0 ? (

        <div className="empty-state">

          <History size={34} />

          <h2>
            {search
              ? 'No matching conversations'
              : 'Your story starts here.'}
          </h2>

          <p>
            {search
              ? 'Try another search term.'
              : 'Your saved conversations will appear here when you start chatting with Niko.'}
          </p>

          {!search && (

            <button
              className="btn primary"
              onClick={() => navigate('/app/chat')}
            >
              Start a conversation
              <ChevronRight size={15} />
            </button>

          )}

        </div>

      ) : (

        <div className="history-list">

          {filtered.map(chat => (

            <div
              className="history-item"
              key={chat.id}
            >

              <div
                className="history-main"
                onClick={() => navigate(`/app/chat?id=${chat.id}`)}
                style={{ cursor: 'pointer', flex: 1 }}
              >

                <div className="history-icon">
                  <MessageSquare size={18} />
                </div>

                <div style={{ minWidth: 0 }}>

                  <h3>{chat.title || 'New conversation'}</h3>

                  <p>
                    {formatDate(chat.updatedAt)}
                    {' · '}
                    {chat.messages?.length || 0} messages
                  </p>

                </div>

              </div>

              <div className="history-actions">

                <button
                  title="Open conversation"
                  onClick={() => navigate(`/app/chat?id=${chat.id}`)}
                >
                  <ChevronRight size={18} />
                </button>

                <button
                  className="delete"
                  title="Delete conversation"
                  onClick={() => deleteChat(chat.id)}
                >
                  <Trash2 size={16} />
                </button>

              </div>

            </div>

          ))}

        </div>

      )}

    </div>

  );

}


/* =========================================================
   VOICE ASSISTANT
========================================================= */


function Voice() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [listening, setListening] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [caption, setCaption] = useState('');
  const [status, setStatus] = useState('Tap Niko to begin');

  const recognitionRef = useRef(null);
  const transcriptRef = useRef('');
  const historyRef = useRef([]);
  const serverIdRef = useRef('');
  const localIdRef = useRef(makeId());

  const activeRef = useRef(false);
  const busyRef = useRef(false);
  const mountedRef = useRef(true);
  const restartTimerRef = useRef(null);

  useEffect(() => {
    mountedRef.current = true;
return (
  <div className="niko-voice-screen">

    <header className="niko-voice-header">
      <button
        className="niko-back"
        onClick={() => navigate('/app/chat')}
      >
        ←
      </button>

      <div className="niko-brand">
        <span className="niko-brand-icon">
          <Sparkles size={17} />
        </span>
        <span>NIKO <small>VOICE</small></span>
      </div>

      <div className="voice-live-indicator">
        <span />
        LIVE
      </div>
    </header>

    <main className="niko-voice-main">

      <div className="niko-voice-intro">
        <span className="niko-overline">
          YOUR PERSONAL AI COMPANION
        </span>
        <h1>I'm listening<span>.</span></h1>
        <p>A conversation beyond the screen.</p>
      </div>

      <div
        className={`niko-visualizer ${
          listening ? 'listening' :
          thinking ? 'thinking' :
          speaking ? 'speaking' : 'idle'
        }`}
        onClick={activateNiko}
        role="button"
        tabIndex={0}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            activateNiko();
          }
        }}
        aria-label="Activate Niko voice assistant"
      >
        <div className="visualizer-ring ring-1" />
        <div className="visualizer-ring ring-2" />
        <div className="visualizer-ring ring-3" />

        <div className="visualizer-particles">
          <i /><i /><i /><i /><i /><i />
        </div>

        <div className="niko-orb-core">
          <div className="orb-glow" />
          <Sparkles size={43} strokeWidth={1.4} />
        </div>
      </div>

      <div className="niko-voice-state">
        <span className="state-dot" />
        {thinking ? 'THINKING' :
         speaking ? 'SPEAKING' :
         listening ? 'LISTENING' : 'READY'}
      </div>

      <div className="niko-caption-panel">
        <div className="caption-heading">
          <span className="caption-line" />
          <span>NIKO'S RESPONSE</span>
          <span className="caption-line" />
        </div>

        {thinking ? (
          <div className="niko-thinking-text">
            Niko is thinking
            <span className="thinking-animation">•••</span>
          </div>
        ) : caption ? (
          <p className="niko-response-text">{caption}</p>
        ) : (
          <p className="niko-empty-caption">
            {listening
              ? 'Go ahead, I am listening.'
              : 'Tap the orb once to start talking.'}
          </p>
        )}
      </div>

      <div className="niko-voice-hint">
        {activeRef.current
          ? 'Speak naturally · Niko will respond automatically'
          : 'Tap the orb once to start your conversation'}
      </div>

    </main>

    <footer className="niko-voice-footer">
      <span>POWERED BY NIKO AI</span>
      <span>MADE TO LISTEN. BUILT TO THINK.</span>
    </footer>

  </div>
);
  }, []);

  function updateStatus(value) {
    if (mountedRef.current) setStatus(value);
  }

  function startRecognition() {
    if (!activeRef.current || busyRef.current) return;

    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      updateStatus('Use Chrome or Edge for voice support');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      // Hindi works best as the starting language for Hindi/Hinglish.
      recognition.lang = 'en-IN';
      recognition.continuous = false;
      recognition.interimResults = true;

      transcriptRef.current = '';

      recognition.onstart = () => {
        if (!mountedRef.current) return;

        setListening(true);
        updateStatus('Listening...');
      };

      recognition.onresult = event => {
        let finalText = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];

          if (result.isFinal) {
            finalText += result[0].transcript + ' ';
          }
        }

        if (finalText.trim()) {
          transcriptRef.current += finalText;
        }
      };

      recognition.onerror = event => {
        console.error('Speech recognition:', event.error);
        setListening(false);

        if (event.error === 'not-allowed' ||
            event.error === 'service-not-allowed') {
          activeRef.current = false;
          updateStatus('Microphone permission required');
        }
      };

      recognition.onend = () => {
        if (!mountedRef.current) return;

        setListening(false);

        const spokenText = transcriptRef.current.trim();
        transcriptRef.current = '';

        if (spokenText && activeRef.current) {
          askNiko(spokenText);
          return;
        }

        // Automatically listen again after silence.
        if (activeRef.current && !busyRef.current) {
          restartTimerRef.current = setTimeout(
            startRecognition,
            500
          );
        }
      };

      recognition.start();

    } catch (error) {
      console.error(error);

      if (activeRef.current) {
        restartTimerRef.current = setTimeout(
          startRecognition,
          1200
        );
      }
    }
  }

  function activateNiko() {
    if (activeRef.current) return;

    activeRef.current = true;
    updateStatus('Connecting microphone...');

    startRecognition();
  }

  function speakReply(message) {
    if (!('speechSynthesis' in window)) {
      updateStatus('Reply ready');
      startRecognition();
      return;
    }

    window.speechSynthesis.cancel();


    const utterance = new SpeechSynthesisUtterance(message);

utterance.lang = 'en-IN';;
    utterance.rate = 1;
    utterance.pitch = 1;

    utterance.onstart = () => {
      if (!mountedRef.current) return;

      setSpeaking(true);
      updateStatus('Niko is speaking...');
    };

    utterance.onend = () => {
      if (!mountedRef.current) return;

      setSpeaking(false);

      if (activeRef.current) {
        updateStatus('Listening...');
        startRecognition();
      }
    };

    utterance.onerror = () => {
      if (!mountedRef.current) return;

      setSpeaking(false);

      if (activeRef.current) {
        updateStatus('Listening...');
        startRecognition();
      }
    };

    window.speechSynthesis.speak(utterance);
  }

  async function askNiko(userText) {
    if (!user?.id || busyRef.current) return;

    busyRef.current = true;

    setThinking(true);
    setCaption('');
    updateStatus('Niko is thinking...');

    const nextMessages = [
      ...historyRef.current,
      {
        role: 'user',
        content: userText
      }
    ];

    historyRef.current = nextMessages;

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
        throw new Error('Appwrite project ID is missing.');
      }

      const {
        data: { session },
        error: sessionError
      } = await supabase.auth.getSession();

      if (sessionError || !session?.access_token) {
        throw new Error('Please sign in again.');
      }

      const response = await fetch(
        `${endpoint}/functions/${functionId}/executions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Appwrite-Project': projectId
          },
          body: JSON.stringify({
            body: JSON.stringify({
              supabaseAccessToken: session.access_token,
              conversationId: serverIdRef.current || null,
              messages: nextMessages
            }),
            async: false
          })
        }
      );

      const execution = await response.json();

      if (!response.ok) {
        throw new Error(
          execution.message || `Appwrite HTTP ${response.status}`
        );
      }

      if (execution.status === 'failed') {
        throw new Error(
          execution.stderr || 'Niko Function failed.'
        );
      }

      let result = execution.responseBody;

      if (typeof result === 'string') {
        result = JSON.parse(result);
      }

      if (
        execution.responseStatusCode &&
        execution.responseStatusCode >= 400
      ) {
        throw new Error(
          result?.error || result?.message || 'Niko request failed.'
        );
      }

      const output = result?.content || result?.message || '';

      if (!output) {
        throw new Error('Niko returned an empty response.');
      }

      if (!result.conversationId) {
        throw new Error('Conversation ID was not returned.');
      }

      serverIdRef.current = result.conversationId;

      const finalMessages = [
        ...nextMessages,
        {
          role: 'assistant',
          content: String(output)
        }
      ];

      historyRef.current = finalMessages;

      saveConversation(user.id, {
        id: localIdRef.current,
        serverId: result.conversationId,
        title: userText.slice(0, 55),
        messages: finalMessages
      });

      // Only Niko's reply is visible.
      if (mountedRef.current) {
        setCaption(String(output));
        setThinking(false);
      }

      busyRef.current = false;
      speakReply(String(output));

    } catch (error) {
      console.error('NIKO VOICE ERROR:', error);

      if (mountedRef.current) {
        setCaption(`Connection error: ${error.message}`);
        setThinking(false);
        updateStatus('Listening...');
      }

      busyRef.current = false;

      if (activeRef.current) {
        startRecognition();
      }
    }
  }

  return (
    <div className="voice-assistant">

      <div className="voice-header">
        <button
          className="voice-back"
          onClick={() => navigate('/app/chat')}
        >
          ← Back to chat
        </button>

        <span className="eyebrow">
          NIKO / VOICE ASSISTANT
        </span>
      </div>

      <div className="voice-center">

        <div
          className={`niko-orb ${
            listening ? 'is-listening' :
            thinking ? 'is-thinking' :
            speaking ? 'is-speaking' : ''
          }`}
          onClick={activateNiko}
          role="button"
          tabIndex={0}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              activateNiko();
            }
          }}
          aria-label="Activate Niko voice assistant"
        >
          <div className="orb-wave wave-one" />
          <div className="orb-wave wave-two" />
          <div className="orb-wave wave-three" />

          <div className="orb-core">
            <Sparkles size={42} />
          </div>
        </div>

        <h2>Niko</h2>

        <p className="voice-status">{status}</p>

        <div className="voice-caption">
          {thinking ? (
            <span className="caption-thinking">
              Niko is thinking...
            </span>
          ) : caption ? (
            <>
              <span className="caption-label">NIKO SAYS</span>
              <p>{caption}</p>
            </>
          ) : (
            <span className="caption-placeholder">
              {listening
                ? 'I am listening to you...'
                : 'Tap the orb to start talking'}
            </span>
          )}
        </div>

        <p className="voice-footer">
          {activeRef.current
            ? 'Talk naturally. Niko is listening.'
            : 'Tap Niko once to activate voice mode.'}
        </p>

      </div>
    </div>
  );
}


/* =========================================================
   PROFILE
========================================================= */

function Profile() {

  const { user } = useAuth();

  const name =
    user?.user_metadata?.name ||
    user?.email?.split('@')[0] ||
    'Niko user';

  const initial = name[0].toUpperCase();

  const chats = readChats(user?.id);

  return (

    <div className="page">

      <div className="page-head">

        <div>
          <span className="eyebrow">
            YOUR ACCOUNT
          </span>

          <h1>Profile</h1>

          <p>
            Your personal Niko account.
          </p>
        </div>

      </div>

      <div className="profile-card">

        <div className="profile-avatar">
          {initial}
        </div>

        <div>

          <span className="eyebrow">
            NIKO MEMBER
          </span>

          <h2>{name}</h2>

          <p>{user?.email}</p>

          <span
            style={{
              fontSize: 10,
              color: 'var(--success)',
              fontWeight: 700
            }}
          >
            <Check size={12} style={{ display: 'inline' }} />
            &nbsp; Account authenticated
          </span>

        </div>

      </div>

      <div className="profile-info">

        <h3>Account information</h3>

        <div className="profile-row">
          <span>Full name</span>
          <strong>{name}</strong>
        </div>

        <div className="profile-row">
          <span>Email address</span>
          <strong>{user?.email}</strong>
        </div>

        <div className="profile-row">
          <span>Account provider</span>
          <strong>Supabase</strong>
        </div>

        <div className="profile-row">
          <span>Saved conversations</span>
          <strong>{chats.length}</strong>
        </div>

      </div>

      <div className="profile-info">

        <h3>About Niko</h3>

        <p
          className="muted"
          style={{ lineHeight: 1.9 }}
        >
          Niko is your personal AI workspace for
          thoughtful conversations, creativity,
          learning and everyday assistance.
        </p>

      </div>

    </div>

  );

}


/* =========================================================
   MAIN APP
========================================================= */

function App() {

  return (

    <AuthProvider>

      <style>{styles}</style>

      <Routes>

        <Route
          path="/"
          element={<Landing />}
        />

        <Route
          path="/login"
          element={<AuthPage />}
        />

        <Route
          path="/signup"
          element={<AuthPage signup />}
        />

        <Route
          path="/app"
          element={<Navigate to="/app/chat" replace />}
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
          path="/app/history"
          element={
            <Protected>
              <Shell>
                <ChatHistory />
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
          path="/app/profile"
          element={
            <Protected>
              <Shell>
                <Profile />
              </Shell>
            </Protected>
          }
        />

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>

    </AuthProvider>

  );

}


/* =========================================================
   RENDER
========================================================= */

createRoot(
  document.getElementById('root')
).render(

  <BrowserRouter>
    <App />
  </BrowserRouter>

);
