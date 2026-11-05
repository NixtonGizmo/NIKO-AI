import React, {createContext,useContext,useEffect,useMemo,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {BrowserRouter,useNavigate,useLocation,Routes,Route,Navigate,Link} from 'react-router-dom';
import {supabase} from './lib/supabase';
import {LayoutDashboard,MessageSquare,Brain,Mic2,FolderOpen,Settings,User,Plus,Search,LogOut,Sparkles,Menu,X,Send,Copy,RefreshCw,Paperclip,Volume2,Square,ChevronRight,ShieldCheck} from 'lucide-react';
import './styles.css';

const AuthContext=createContext(null);

function AuthProvider({children}){
  const [user,setUser]=useState(null),[loading,setLoading]=useState(true);

  useEffect(()=>{
    let mounted=true;

    supabase.auth.getSession().then(({data:{session}})=>{
      if(mounted){
        setUser(session?.user||null);
        setLoading(false);
      }
    });

    const {data:{subscription}}=supabase.auth.onAuthStateChange(
      (_event,session)=>{
        setUser(session?.user||null);
        setLoading(false);
      }
    );

    return ()=>{
      mounted=false;
      subscription.unsubscribe();
    };
  },[]);

  const value=useMemo(
    ()=>({user,loading,setUser}),
    [user,loading]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

const useAuth=()=>useContext(AuthContext);

function Protected({children}){
  const {user,loading}=useAuth();

  if(loading)return <Splash/>;

  return user
    ? children
    : <Navigate to="/login" replace/>;
}

function Splash(){
  return (
    <div className="splash">
      <div className="orb">
        <Sparkles/>
      </div>
      <div>NIKO AI</div>
    </div>
  );
}

function Logo(){
  return (
    <Link className="brand" to="/">
      <span className="logo-mark">
        <Sparkles size={18}/>
      </span>
      <span>NIKO <b>AI</b></span>
    </Link>
  );
}

function Shell({children}){
  const {user,setUser}=useAuth();
  const nav=useNavigate();
  const loc=useLocation();
  const [mobile,setMobile]=useState(false);

  const items=[
    ['/app','Overview',LayoutDashboard],
    ['/app/chat','Chat',MessageSquare],
    ['/app/memory','Memory',Brain],
    ['/app/voice','Voice',Mic2],
    ['/app/files','Files',FolderOpen],
    ['/app/settings','Settings',Settings],
    ['/app/profile','Profile',User]
  ];

  async function logout(){
    await supabase.auth.signOut();
    setUser(null);
    nav('/login');
  }

  return (
    <div className="app-shell">

      <aside className={mobile?'sidebar open':'sidebar'}>

        <div className="side-top">
          <Logo/>

          <button
            className="icon-btn mobile-only"
            onClick={()=>setMobile(false)}
          >
            <X/>
          </button>
        </div>

        <button
          className="new-chat"
          onClick={()=>nav('/app/chat')}
        >
          <Plus size={17}/>
          New chat
        </button>

        <nav>
          {items.map(([to,label,Icon])=>(
            <Link
              key={to}
              onClick={()=>setMobile(false)}
              className={loc.pathname===to?'active':''}
              to={to}
            >
              <Icon size={18}/>
              {label}
            </Link>
          ))}
        </nav>

        <div className="side-bottom">

          <div className="status">
            <span className="dot"></span>

            <div>
              <strong>Niko online</strong>
              <small>Ready to assist</small>
            </div>
          </div>

          <button
            className="profile-mini"
            onClick={()=>nav('/app/profile')}
          >
            <div className="avatar">
              {((user?.user_metadata?.name||user?.email||'N')[0]).toUpperCase()}
            </div>

            <div className="ellipsis">
              <strong>
                {user?.user_metadata?.name||'Niko user'}
              </strong>

              <small>
                {user?.email||''}
              </small>
            </div>
          </button>

          <button
            className="logout"
            onClick={logout}
          >
            <LogOut size={16}/>
            Sign out
          </button>

        </div>

      </aside>

      <main className="main">

        <header className="mobile-header">

          <button
            className="icon-btn"
            onClick={()=>setMobile(true)}
          >
            <Menu/>
          </button>

          <Logo/>

          <button
            className="icon-btn"
            onClick={()=>nav('/app/chat')}
          >
            <Plus/>
          </button>

        </header>

        {children}

      </main>

    </div>
  );
}

function Landing(){
  return (
    <div className="landing">

      <header className="landing-nav">
        <Logo/>

        <div className="nav-actions">
          <Link to="/login" className="text-link">
            Sign in
          </Link>

          <Link to="/signup" className="btn primary">
            Start chatting
          </Link>
        </div>
      </header>

      <section className="hero">

        <div className="hero-copy">

          <div className="eyebrow">
            <span className="pulse"></span>
            PERSONAL AI AGENT
          </div>

          <h1>
            Your Intelligence.
            <br/>
            <span>Your Assistant.</span>
            <br/>
            Your Niko.
          </h1>

          <p>
            Niko is a private AI workspace built to think with you,
            remember what you approve, understand your files and help
            turn ideas into action.
          </p>

          <div className="hero-actions">

            <Link
              to="/signup"
              className="btn primary large"
            >
              Start Chatting
              <ChevronRight size={18}/>
            </Link>

            <Link
              to="/login"
              className="btn ghost large"
            >
              I already have an account
            </Link>

          </div>

          <div className="trust">
            <ShieldCheck size={16}/>
            Supabase authentication & private cloud data
          </div>

        </div>

        <div className="hero-visual">

          <div className="halo halo-a"></div>
          <div className="halo halo-b"></div>

          <div className="niko-core">

            <div className="core-ring"></div>

            <div className="core-face">
              <Sparkles size={58}/>
              <span>NIKO</span>
            </div>

          </div>

          <div className="float-card card-one">
            <Sparkles size={16}/>

            <div>
              <b>Thinking with you</b>
              <small>Context + memory + tools</small>
            </div>
          </div>

          <div className="float-card card-two">
            <Mic2 size={16}/>

            <div>
              <b>Voice ready</b>
              <small>Talk naturally</small>
            </div>
          </div>

        </div>

      </section>

      <section className="features">

        <div className="section-head">

          <span className="eyebrow">
            BUILT FOR REAL WORK
          </span>

          <h2>
            More than a chatbot.
          </h2>

          <p>
            One assistant surface for conversation, memory,
            files, voice and agent workflows.
          </p>

        </div>

        <div className="feature-grid">

          {[
            [
              'Remember',
              'Keep user-approved memories available when they matter.'
            ],
            [
              'Understand',
              'Bring PDFs, documents and images into the conversation.'
            ],
            [
              'Act',
              'Connect tools and APIs through secure server-side functions.'
            ],
            [
              'Speak',
              'Use browser voice capabilities for natural hands-free interaction.'
            ]
          ].map(([t,d],i)=>(
            <div className="feature" key={t}>

              <div className="feature-icon">

                {(() => {
                  const Icon=[
                    Brain,
                    FolderOpen,
                    Sparkles,
                    Mic2
                  ][i];

                  return <Icon size={20}/>;
                })()}

              </div>

              <h3>{t}</h3>
              <p>{d}</p>

            </div>
          ))}

        </div>

      </section>

      <section className="demo">

        <div>
          <span className="eyebrow">
            THE NIKO LOOP
          </span>

          <h2>
            Ask. Remember. Act. Learn.
          </h2>

          <p>
            Niko keeps the interface simple while the architecture stays
            ready for secure tools, long-term memory and multi-step tasks.
          </p>
        </div>

        <div className="loop">
          <div>YOU</div>
          <div>NIKO</div>
          <div>TOOLS</div>
          <div>MEMORY</div>
        </div>

      </section>

      <footer>
        <Logo/>
        <span>
          © {new Date().getFullYear()} NIKO AI
        </span>
      </footer>

    </div>
  );
}

function AuthPage({signup=false}){

  const {setUser}=useAuth();
  const nav=useNavigate();

  const [name,setName]=useState('');
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [err,setErr]=useState('');
  const [busy,setBusy]=useState(false);

  async function googleLogin(){

    setErr('');
    setBusy(true);

    const {error}=await supabase.auth.signInWithOAuth({
      provider:'google',
      options:{
        redirectTo:`${window.location.origin}/app`
      }
    });

    if(error){
      setErr(error.message);
      setBusy(false);
    }
  }

  async function submit(e){

    e.preventDefault();
    setBusy(true);
    setErr('');

    try{

      if(signup){

        const {data,error}=await supabase.auth.signUp({
          email,
          password,
          options:{
            data:{
              name
            }
          }
        });

        if(error)throw error;

        if(data.session){
          setUser(data.user);
          nav('/app');
        }else{
          setErr(
            'Account created. Check your email to confirm your account.'
          );
        }

      }else{

        const {data,error}=await supabase.auth.signInWithPassword({
          email,
          password
        });

        if(error)throw error;

        setUser(data.user);
        nav('/app');
      }

    }catch(e){

      setErr(
        e?.message||'Authentication failed.'
      );

    }finally{

      setBusy(false);

    }
  }

  return (
    <div className="auth">

      <div className="auth-art">

        <Logo/>

        <div className="auth-orb">
          <Sparkles size={54}/>
        </div>

        <h2>
          {signup
            ? 'Meet your new AI layer.'
            : 'Welcome back.'}
        </h2>

        <p>
          Private conversations, approved memory and an
          architecture built for real agents.
        </p>

      </div>

      <div className="auth-card">

        <Link to="/" className="back">
          ← Back to Niko
        </Link>

        <div className="auth-inner">

          <span className="eyebrow">
            NIKO AI
          </span>

          <h1>
            {signup
              ? 'Create your account'
              : 'Sign in'}
          </h1>

          <p className="muted">
            {signup
              ? 'Start your private AI workspace.'
              : 'Continue to your Niko workspace.'}
          </p>

          {err&&(
            <div className="error">
              {err}
            </div>
          )}

          <button
            type="button"
            className="btn ghost full google-btn"
            onClick={googleLogin}
            disabled={busy}
          >
            <span className="google-mark">
              G
            </span>

            Continue with Google
          </button>

          <div className="auth-divider">
            <span>or</span>
          </div>

          <form onSubmit={submit}>

            {signup&&(
              <label>
                Name

                <input
                  value={name}
                  onChange={e=>setName(e.target.value)}
                  placeholder="Your name"
                  required
                />
              </label>
            )}

            <label>
              Email

              <input
                type="email"
                value={email}
                onChange={e=>setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </label>

            <label>
              Password

              <input
                type="password"
                value={password}
                onChange={e=>setPassword(e.target.value)}
                placeholder="••••••••"
                minLength={8}
                required
              />
            </label>

            <button
              className="btn primary full"
              disabled={busy}
            >
              {busy
                ? 'Please wait…'
                : signup
                  ? 'Create account'
                  : 'Sign in'}

              <ChevronRight size={17}/>
            </button>

          </form>

          <div className="switch">

            {signup
              ? 'Already have an account? '
              : 'New to Niko? '}

            <Link to={signup?'/login':'/signup'}>
              {signup
                ? 'Sign in'
                : 'Create one'}
            </Link>

          </div>

        </div>

      </div>

    </div>
  );
}

function Overview(){

  const {user}=useAuth();

  return (
    <Page
      title={`Good evening, ${
        user?.user_metadata?.name ||
        user?.email?.split('@')[0] ||
        'there'
      }.`}
      subtitle="Your intelligence layer is ready."
    >

      <div className="status-banner">

        <div className="status-orb">
          <Sparkles/>
        </div>

        <div>
          <b>Niko is online</b>

          <span>
            Conversation, memory and voice surfaces are ready.
          </span>
        </div>

        <Link
          to="/app/chat"
          className="btn primary"
        >
          Open chat
          <ChevronRight size={16}/>
        </Link>

      </div>

      <div className="section-head compact">

        <span className="eyebrow">
          QUICK ACTIONS
        </span>

        <h2>
          What do you want to do?
        </h2>

      </div>

      <div className="quick-grid">

        {[
          [
            'Start a conversation',
            'Chat with Niko about anything.',
            '/app/chat',
            MessageSquare
          ],
          [
            'Talk to Niko',
            'Hands-free voice conversation.',
            '/app/voice',
            Mic2
          ],
          [
            'Review memory',
            'See what Niko is allowed to remember.',
            '/app/memory',
            Brain
          ],
          [
            'Open files',
            'Upload and organize your AI workspace files.',
            '/app/files',
            FolderOpen
          ]
        ].map(([t,d,to,I])=>(
          <Link
            to={to}
            className="quick"
            key={t}
          >

            <div className="quick-icon">
              <I size={20}/>
            </div>

            <div>
              <h3>{t}</h3>
              <p>{d}</p>
            </div>

            <ChevronRight
              className="push"
              size={17}
            />

          </Link>
        ))}

      </div>

      <div className="panel">

        <div className="panel-head">

          <div>

            <span className="eyebrow">
              RECENT
            </span>

            <h2>
              Recent conversations
            </h2>

          </div>

          <Link to="/app/chat">
            View all
          </Link>

        </div>

        <div className="empty">

          <MessageSquare/>

          <div>
            <b>
              Your conversations will appear here.
            </b>

            <p>
              Start a chat and Niko will save it to
              your private Appwrite workspace.
            </p>
          </div>

        </div>

      </div>

    </Page>
  );
}

function Page({title,subtitle,children,actions}){

  return (
    <div className="page">

      <div className="page-head">

        <div>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>

        {actions}

      </div>

      {children}

    </div>
  );
}


/* =========================================================
   FIXED NIKO CHAT
========================================================= */

function Chat(){

  const [messages,setMessages]=useState([]);
  const [input,setInput]=useState('');
  const [busy,setBusy]=useState(false);
  const [conversationId,setConversationId]=useState('');

  const {user:authUser}=useAuth();

  async function send(){

    if(!input.trim()||busy)return;

    if(!authUser?.id){
      setMessages(m=>[...m,{role:'assistant',content:'Niko connection error: You must be signed in.'}]);
      return;
    }

    const text=input.trim();
    setInput('');

    const nextMessages=[
      ...messages,
      {
        role:'user',
        content:text
      }
    ];

    setMessages(nextMessages);
    setBusy(true);

    try{

      const endpoint=
        import.meta.env.VITE_APPWRITE_ENDPOINT ||
        'https://sgp.cloud.appwrite.io/v1';

      const functionId=
        import.meta.env.VITE_APPWRITE_AI_FUNCTION_ID ||
        'niko_ai_api';

      const projectId=
        import.meta.env.VITE_APPWRITE_PROJECT_ID;

      if(!projectId){
        throw new Error(
          'VITE_APPWRITE_PROJECT_ID is missing in .env'
        );
      }

      console.log('NIKO REQUEST:',{
        endpoint,
        functionId
      });

      const { data: { session }, error: sessionError } =
  await supabase.auth.getSession();

if (sessionError || !session?.access_token) {
  throw new Error('Your login session has expired. Please log in again.');
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
        supabaseAccessToken: session.access_token,
        conversationId: conversationId || '',
        messages: nextMessages
      }),
      async: false
    })
  }
);

      let data={};

      try{
        data=await r.json();
      }catch{
        data={};
      }

      console.log('NIKO APPWRITE RESPONSE:',data);

      if(!r.ok){

        throw new Error(
          data?.message ||
          data?.error ||
          data?.responseBody ||
          `Appwrite HTTP ${r.status}`
        );
      }

      let out='';
      let returnedConversationId='';

      /*
       * Appwrite execution normally returns:
       *
       * responseBody: "{\"content\":\"Hello...\"}"
       *
       * So first parse responseBody.
       */
      if(data?.responseBody){

        try{

          const body=
            typeof data.responseBody==='string'
              ? JSON.parse(data.responseBody)
              : data.responseBody;

          out=
            body?.content ||
            body?.message ||
            '';

          returnedConversationId=
            body?.conversationId ||
            '';

        }catch{

          /*
           * If responseBody itself is plain text
           */
          out=String(data.responseBody);

        }
      }

      /*
       * Additional fallback response formats
       */
      if(!out){

        out=
          data?.content ||
          data?.message ||
          '';
      }

      /*
       * If Appwrite returned no body
       */
      if(!out){

        console.error(
          'NIKO EMPTY APPWRITE RESPONSE:',
          data
        );

        throw new Error(
          'Appwrite Function returned no response.'
        );
      }

      setMessages(m=>[
        ...m,
        {
          role:'assistant',
          content:String(out)
        }
      ]);

    }catch(e){

      console.error(
        'NIKO CHAT ERROR:',
        e
      );

      setMessages(m=>[
        ...m,
        {
          role:'assistant',
          content:
            `Niko connection error: ${
              e?.message ||
              'Unknown error'
            }`
        }
      ]);

    }finally{

      setBusy(false);

    }
  }

  function copyMessage(content){

    navigator.clipboard
      .writeText(content)
      .catch(()=>{});

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
          onClick={()=>setMessages([])}
        >
          <Plus/>
        </button>

      </div>

      <div className="chat-window">

        {messages.length===0 ? (

          <div className="chat-empty">

            <div className="niko-mini">
              <Sparkles size={30}/>
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
                onClick={()=>
                  setInput('Help me plan a project')
                }
              >
                Plan a project
              </button>

              <button
                onClick={()=>
                  setInput('Summarize a document')
                }
              >
                Summarize
              </button>

              <button
                onClick={()=>
                  setInput('Help me write something')
                }
              >
                Write
              </button>

            </div>

          </div>

        ) : (

          <div className="messages">

            {messages.map((m,i)=>(

              <div
                className={'message '+m.role}
                key={i}
              >

                <div className="message-avatar">

                  {m.role==='assistant'
                    ? <Sparkles size={15}/>
                    : <User size={15}/>
                  }

                </div>

                <div className="bubble">

                  <div className="role">
                    {m.role==='assistant'
                      ? 'Niko'
                      : 'You'}
                  </div>

                  <div className="content">
                    {m.content}
                  </div>

                  {m.role==='assistant'&&(

                    <div className="msg-actions">

                      <button
                        onClick={()=>
                          copyMessage(m.content)
                        }
                      >
                        <Copy size={14}/>
                        Copy
                      </button>

                      <button
                        onClick={()=>
                          setInput(
                            'Regenerate the previous answer.'
                          )
                        }
                      >
                        <RefreshCw size={14}/>
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
        >
          <Paperclip size={19}/>
        </button>

        <textarea
          value={input}
          onChange={e=>
            setInput(e.target.value)
          }
          onKeyDown={e=>{

            if(
              e.key==='Enter' &&
              !e.shiftKey
            ){
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
          disabled={
            busy||
            !input.trim()
          }
        >

          {busy
            ? <span className="loader"></span>
            : <Send size={18}/>
          }

        </button>

      </div>

      <div className="composer-note">
        Niko can make mistakes. Review important information before acting.
      </div>

    </div>
  );
}


function Memory(){

  return (
    <Page
      title="Memory"
      subtitle="Control what Niko can remember about you."
    >

      <div className="panel">

        <div className="panel-head">

          <div>

            <span className="eyebrow">
              LONG-TERM MEMORY
            </span>

            <h2>
              Approved memories
            </h2>

          </div>

          <button className="btn primary">
            <Plus size={16}/>
            Add memory
          </button>

        </div>

        <div className="empty">

          <Brain/>

          <div>

            <b>
              No memories saved yet.
            </b>

            <p>
              When memory is enabled, Niko will only
              retain information you approve.
            </p>

          </div>

        </div>

      </div>

      <div className="privacy-card">

        <ShieldCheck/>

        <div>

          <b>
            Your control, always.
          </b>

          <p>
            Memories should be editable and deletable.
            Store only what is useful and appropriate.
          </p>

        </div>

      </div>

    </Page>
  );
}

function Voice(){

  const [listening,setListening]=useState(false);
  const [text,setText]=useState('');

  let rec=null;

  function toggle(){

    const SR=
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if(!SR){

      setText(
        'Speech recognition is not supported in this browser.'
      );

      return;
    }

    if(listening){

      rec?.stop();
      setListening(false);
      return;
    }

    rec=new SR();

    rec.lang='en-IN';
    rec.interimResults=true;
    rec.continuous=false;

    rec.onresult=e=>{
      setText(
        Array.from(e.results)
          .map(r=>r[0].transcript)
          .join('')
      );
    };

    rec.onend=()=>{
      setListening(false);
    };

    rec.start();
    setListening(true);
  }

  return (
    <Page
      title="Voice assistant"
      subtitle="Talk with Niko using your browser microphone and speech engine."
    >

      <div className="voice-stage">

        <div
          className={
            listening
              ? 'voice-orb listening'
              : 'voice-orb'
          }
        >
          <div className="voice-core">
            <Mic2 size={40}/>
          </div>
        </div>

        <span className="voice-state">
          {listening
            ? 'Listening…'
            : 'Ready when you are'}
        </span>

        <h2>
          {text||'Tap the microphone and speak.'}
        </h2>

        <div className="voice-actions">

          <button
            className={
              listening
                ? 'btn danger'
                : 'btn primary'
            }
            onClick={toggle}
          >
            {listening
              ? <Square size={16}/>
              : <Mic2 size={16}/>}

            {listening
              ? 'Stop listening'
              : 'Start voice'}
          </button>

          <button
            className="btn ghost"
            onClick={()=>{
              if(
                'speechSynthesis' in window &&
                text
              ){
                speechSynthesis.cancel();

                speechSynthesis.speak(
                  new SpeechSynthesisUtterance(text)
                );
              }
            }}
          >
            <Volume2 size={16}/>
            Speak text
          </button>

        </div>

        <p className="muted center">
          Voice features use browser APIs. A production
          server-side voice provider can be added without
          exposing its key to the client.
        </p>

      </div>

    </Page>
  );
}

function Files(){

  const [file,setFile]=useState(null);

  return (
    <Page
      title="File workspace"
      subtitle="Bring documents into Niko's context."
    >

      <div
        className="dropzone"
        onClick={()=>
          document
            .getElementById('fileInput')
            .click()
        }
      >

        <input
          id="fileInput"
          hidden
          type="file"
          onChange={e=>
            setFile(
              e.target.files?.[0]
            )
          }
        />

        <div className="upload-icon">
          <FolderOpen/>
        </div>

        <h2>
          {file
            ? file.name
            : 'Drop a file here'}
        </h2>

        <p>
          {file
            ? `${Math.round(file.size/1024)} KB selected`
            : 'PDF, TXT, DOCX and images can be wired to Appwrite Storage + an analysis function.'}
        </p>

        <button className="btn ghost">
          <Paperclip size={16}/>
          Choose file
        </button>

      </div>

      <div className="info-grid">

        <div className="panel">

          <span className="eyebrow">
            STORAGE
          </span>

          <h2>
            Appwrite Storage
          </h2>

          <p>
            Files can be uploaded to a private bucket
            with user-scoped permissions.
          </p>

        </div>

        <div className="panel">

          <span className="eyebrow">
            ANALYSIS
          </span>

          <h2>
            AI processing
          </h2>

          <p>
            Connect a server-side Function to extract
            text, vision data or summaries.
          </p>

        </div>

      </div>

    </Page>
  );
}

function SettingsPage(){

  return (
    <Page
      title="Settings"
      subtitle="Shape how Niko behaves."
    >

      <div className="settings-grid">

        <div className="panel">

          <span className="eyebrow">
            PERSONALITY
          </span>

          <h2>
            Niko personality
          </h2>

          <select defaultValue="balanced">

            <option value="balanced">
              Balanced — clear, helpful, direct
            </option>

            <option value="creative">
              Creative — expressive and exploratory
            </option>

            <option value="technical">
              Technical — precise and implementation-first
            </option>

          </select>

          <p className="muted">
            Store this preference in the user_settings
            table when connected.
          </p>

        </div>

        <div className="panel">

          <span className="eyebrow">
            PREFERENCES
          </span>

          <h2>
            Experience
          </h2>

          <label className="toggle">
            <input
              type="checkbox"
              defaultChecked
            />
            <span></span>
            Enable memory suggestions
          </label>

          <label className="toggle">
            <input
              type="checkbox"
              defaultChecked
            />
            <span></span>
            Show response actions
          </label>

          <label className="toggle">
            <input type="checkbox"/>
            <span></span>
            Compact chat layout
          </label>

        </div>

      </div>

    </Page>
  );
}

function Profile(){

  const {user}=useAuth();

  return (
    <Page
      title="Profile"
      subtitle="Your Niko account."
    >

      <div className="profile-card">

        <div className="profile-avatar">
          {((user?.user_metadata?.name||user?.email||'N')[0]).toUpperCase()}
        </div>

        <div>

          <span className="eyebrow">
            ACCOUNT
          </span>

          <h2>
            {user?.user_metadata?.name||'Niko user'}
          </h2>

          <p>
            {user?.email}
          </p>

          <span className="badge">
            Authenticated with Supabase
          </span>

        </div>

      </div>

    </Page>
  );
}

function App(){

  return (
    <AuthProvider>

      <Routes>

        <Route
          path="/"
          element={<Landing/>}
        />

        <Route
          path="/login"
          element={<AuthPage/>}
        />

        <Route
          path="/signup"
          element={<AuthPage signup/>}
        />

        <Route
          path="/app"
          element={
            <Protected>
              <Shell>
                <Overview/>
              </Shell>
            </Protected>
          }
        />

        <Route
          path="/app/chat"
          element={
            <Protected>
              <Shell>
                <Chat/>
              </Shell>
            </Protected>
          }
        />

        <Route
          path="/app/memory"
          element={
            <Protected>
              <Shell>
                <Memory/>
              </Shell>
            </Protected>
          }
        />

        <Route
          path="/app/voice"
          element={
            <Protected>
              <Shell>
                <Voice/>
              </Shell>
            </Protected>
          }
        />

        <Route
          path="/app/files"
          element={
            <Protected>
              <Shell>
                <Files/>
              </Shell>
            </Protected>
          }
        />

        <Route
          path="/app/settings"
          element={
            <Protected>
              <Shell>
                <SettingsPage/>
              </Shell>
            </Protected>
          }
        />

        <Route
          path="/app/profile"
          element={
            <Protected>
              <Shell>
                <Profile/>
              </Shell>
            </Protected>
          }
        />

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />

      </Routes>

    </AuthProvider>
  );
}

createRoot(
  document.getElementById('root')
).render(
  <BrowserRouter>
    <App/>
  </BrowserRouter>
);