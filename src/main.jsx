function Chat(){
  const [messages,setMessages]=useState([]);
  const [input,setInput]=useState('');
  const [busy,setBusy]=useState(false);

  async function send(){
    if(!input.trim() || busy) return;

    const text=input.trim();
    setInput('');

    const history=[
      ...messages,
      {role:'user',content:text}
    ];

    setMessages(m=>[
      ...m,
      {role:'user',content:text}
    ]);

    setBusy(true);

    try{
      const endpoint=
        import.meta.env.VITE_APPWRITE_ENDPOINT ||
        'https://sgp.cloud.appwrite.io/v1';

      const projectId=
        import.meta.env.VITE_APPWRITE_PROJECT_ID;

      const functionId=
        import.meta.env.VITE_APPWRITE_AI_FUNCTION_ID ||
        'niko_ai_api';

      if(!projectId){
        throw new Error('Missing VITE_APPWRITE_PROJECT_ID');
      }

      const response=await fetch(
        `${endpoint}/functions/${functionId}/executions`,
        {
          method:'POST',
          headers:{
            'Content-Type':'application/json',
            'X-Appwrite-Project':projectId
          },
          body:JSON.stringify({
            body:JSON.stringify({
              messages:history
            })
          })
        }
      );

      const data=await response.json();

      console.log('NIKO Function response:',data);

      if(!response.ok){
        throw new Error(
          data?.message ||
          data?.error ||
          `Appwrite Function error: ${response.status}`
        );
      }

      let out='';

      if(data.responseBody){
        try{
          const parsed=JSON.parse(data.responseBody);
          out=parsed.content || parsed.message || data.responseBody;
        }catch{
          out=data.responseBody;
        }
      }

      if(!out){
        throw new Error('Appwrite Function returned an empty response.');
      }

      setMessages(m=>[
        ...m,
        {
          role:'assistant',
          content:out
        }
      ]);

    }catch(e){
      console.error('NIKO AI error:',e);

      setMessages(m=>[
        ...m,
        {
          role:'assistant',
          content:`Niko connection error: ${e?.message || 'Unknown error'}`
        }
      ]);
    }finally{
      setBusy(false);
    }
  }

  return (
    <div className="chat-page">

      <div className="chat-top">
        <div>
          <span className="eyebrow">NIKO / CHAT</span>
          <h1>Talk to Niko</h1>
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

            <h2>What are we building today?</h2>

            <p>
              Ask Niko to think, explain, write, plan or analyze.
            </p>

            <div className="suggestions">
              <button onClick={()=>setInput('Help me plan a project')}>
                Plan a project
              </button>

              <button onClick={()=>setInput('Summarize a document')}>
                Summarize
              </button>

              <button onClick={()=>setInput('Help me write something')}>
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

                  {m.role==='assistant' && (
                    <div className="msg-actions">

                      <button
                        onClick={()=>
                          navigator.clipboard?.writeText(m.content)
                        }
                      >
                        <Copy size={14}/>
                        Copy
                      </button>

                      <button>
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

        <button className="icon-btn">
          <Paperclip size={19}/>
        </button>

        <textarea
          value={input}
          onChange={e=>setInput(e.target.value)}
          onKeyDown={e=>{
            if(e.key==='Enter' && !e.shiftKey){
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