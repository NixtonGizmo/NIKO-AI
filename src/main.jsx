function Chat(){

  const {user}=useAuth();

  const [messages,setMessages]=useState([]);
  const [input,setInput]=useState('');
  const [busy,setBusy]=useState(false);
  const [conversationId,setConversationId]=useState('');
  const [conversations,setConversations]=useState([]);
  const [historyOpen,setHistoryOpen]=useState(false);
  const [loadingHistory,setLoadingHistory]=useState(false);

  const endpoint=
    import.meta.env.VITE_APPWRITE_ENDPOINT ||
    'https://sgp.cloud.appwrite.io/v1';

  const functionId=
    import.meta.env.VITE_APPWRITE_AI_FUNCTION_ID ||
    'niko_ai_api';

  const projectId=
    import.meta.env.VITE_APPWRITE_PROJECT_ID;

  /*
   * Call the same Appwrite Function for both chat and
   * protected history operations.
   *
   * The Function must return:
   *
   * list_conversations:
   * {
   *   conversations:[...]
   * }
   *
   * get_messages:
   * {
   *   messages:[...]
   * }
   */
  async function executeFunction(payload){

    if(!projectId){
      throw new Error(
        'VITE_APPWRITE_PROJECT_ID is missing in .env'
      );
    }

    const r=await fetch(
      `${endpoint}/functions/${functionId}/executions`,
      {
        method:'POST',
        headers:{
          'Content-Type':'application/json',
          'X-Appwrite-Project':projectId
        },
        body:JSON.stringify({
          body:JSON.stringify(payload)
        })
      }
    );

    let data={};

    try{
      data=await r.json();
    }catch{
      data={};
    }

    if(!r.ok){
      throw new Error(
        data?.message ||
        data?.error ||
        data?.responseBody ||
        `Appwrite HTTP ${r.status}`
      );
    }

    let body=data;

    if(data?.responseBody){

      try{
        body=
          typeof data.responseBody==='string'
            ? JSON.parse(data.responseBody)
            : data.responseBody;
      }catch{
        body={
          content:String(data.responseBody)
        };
      }

    }

    return body;
  }

  async function loadConversations(){

    if(!user?.id)return;

    setLoadingHistory(true);

    try{

      const data=await executeFunction({
        action:'list_conversations',
        userId:user.id
      });

      const list=
        Array.isArray(data?.conversations)
          ? data.conversations
          : Array.isArray(data)
            ? data
            : [];

      setConversations(list);

    }catch(e){

      console.error(
        'NIKO HISTORY LOAD ERROR:',
        e
      );

    }finally{

      setLoadingHistory(false);

    }

  }

  async function loadConversation(id){

    if(!user?.id || !id || busy)return;

    setBusy(true);
    setHistoryOpen(false);

    try{

      const data=await executeFunction({
        action:'get_messages',
        userId:user.id,
        conversationId:id
      });

      const list=
        Array.isArray(data?.messages)
          ? data.messages
          : Array.isArray(data)
            ? data
            : [];

      const restored=list
        .filter(m=>
          m &&
          (m.role==='user' || m.role==='assistant')
        )
        .map(m=>({
          role:m.role,
          content:String(m.content || '')
        }));

      setConversationId(id);
      setMessages(restored);

    }catch(e){

      console.error(
        'NIKO CONVERSATION LOAD ERROR:',
        e
      );

      setMessages(m=>[
        ...m,
        {
          role:'assistant',
          content:
            `Niko history error: ${
              e?.message || 'Unable to load conversation.'
            }`
        }
      ]);

    }finally{

      setBusy(false);

    }

  }

  async function send(){

    if(!input.trim() || busy)return;

    if(!user?.id){

      setMessages(m=>[
        ...m,
        {
          role:'assistant',
          content:'Niko connection error: You must be signed in.'
        }
      ]);

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

      console.log('NIKO REQUEST:',{
        endpoint,
        functionId,
        userId:user.id,
        conversationId:conversationId || '(new)'
      });

      const data=await executeFunction({

        action:'chat',

        userId:user.id,

        conversationId:
          conversationId || '',

        messages:nextMessages

      });

      console.log(
        'NIKO APPWRITE RESPONSE:',
        data
      );

      let out=
        data?.content ||
        data?.message ||
        '';

      const returnedConversationId=
        data?.conversationId ||
        '';

      if(returnedConversationId){

        setConversationId(
          returnedConversationId
        );

      }

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

      /*
       * Refresh the conversation list after every
       * successful message so the new conversation
       * appears immediately.
       */
      loadConversations();

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
              e?.message || 'Unknown error'
            }`
        }
      ]);

    }finally{

      setBusy(false);

    }

  }

  function newChat(){

    setConversationId('');
    setMessages([]);
    setInput('');
    setHistoryOpen(false);

  }

  function copyMessage(content){

    navigator.clipboard
      .writeText(content)
      .catch(()=>{});

  }

  function formatConversationTitle(item){

    return (
      item?.title ||
      item?.name ||
      'New conversation'
    );

  }

  function formatConversationDate(item){

    const value=
      item?.updatedAt ||
      item?.createdAt;

    if(!value)return '';

    try{

      return new Date(value)
        .toLocaleDateString(
          undefined,
          {
            day:'numeric',
            month:'short'
          }
        );

    }catch{

      return '';

    }

  }

  useEffect(()=>{

    if(!user?.id)return;

    loadConversations();

  },[user?.id]);

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

        <div
          style={{
            display:'flex',
            alignItems:'center',
            gap:8
          }}
        >

          <button
            className="icon-btn"
            title="Chat history"
            onClick={()=>{
              setHistoryOpen(v=>!v);
              if(!historyOpen){
                loadConversations();
              }
            }}
          >
            <Search/>
          </button>

          <button
            className="icon-btn"
            title="New chat"
            onClick={newChat}
          >
            <Plus/>
          </button>

        </div>

      </div>

      {historyOpen && (

        <div
          className="chat-history"
          style={{
            marginBottom:12,
            maxHeight:260,
            overflowY:'auto'
          }}
        >

          <div
            style={{
              display:'flex',
              alignItems:'center',
              justifyContent:'space-between',
              marginBottom:8
            }}
          >

            <strong>
              Recent chats
            </strong>

            <button
              type="button"
              onClick={loadConversations}
              disabled={loadingHistory}
              style={{
                border:0,
                background:'transparent',
                cursor:'pointer',
                opacity:loadingHistory ? .5 : 1
              }}
            >
              {loadingHistory ? 'Loading…' : 'Refresh'}
            </button>

          </div>

          {conversations.length===0 ? (

            <div
              style={{
                padding:'12px 4px',
                opacity:.65
              }}
            >
              No saved conversations yet.
            </div>

          ) : (

            conversations.map(item=>{

              const id=
                item?.$id ||
                item?.id ||
                item?.conversationId;

              if(!id)return null;

              return (

                <button
                  key={id}
                  type="button"
                  onClick={()=>
                    loadConversation(id)
                  }
                  disabled={busy}
                  style={{
                    width:'100%',
                    textAlign:'left',
                    border:0,
                    background:
                      id===conversationId
                        ? 'rgba(255,255,255,.08)'
                        : 'transparent',
                    padding:'10px 8px',
                    borderRadius:10,
                    cursor:'pointer',
                    marginBottom:3
                  }}
                >

                  <div>
                    {formatConversationTitle(item)}
                  </div>

                  <small
                    style={{
                      opacity:.55
                    }}
                  >
                    {formatConversationDate(item)}
                  </small>

                </button>

              );

            })

          )}

        </div>

      )}

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
                  setInput(
                    'Help me plan a project'
                  )
                }
              >
                Plan a project
              </button>

              <button
                onClick={()=>
                  setInput(
                    'Summarize a document'
                  )
                }
              >
                Summarize
              </button>

              <button
                onClick={()=>
                  setInput(
                    'Help me write something'
                  )
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
                className={
                  'message '+m.role
                }
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
                          copyMessage(
                            m.content
                          )
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
          title="Attach file"
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
            busy ||
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

        Niko can make mistakes.
        Review important information before acting.

      </div>

    </div>
  );
}
