function Chat(){

  const {user}=useAuth();

  const [messages,setMessages]=useState([]);
  const [input,setInput]=useState('');
  const [busy,setBusy]=useState(false);
  const [conversationId,setConversationId]=useState('');

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
        functionId,
        userId:user.id,
        conversationId:conversationId || '(new)'
      });

      const r=await fetch(
        `${endpoint}/functions/${functionId}/executions`,
        {
          method:'POST',

          headers:{
            'Content-Type':'application/json',
            'X-Appwrite-Project':projectId
          },

          body:JSON.stringify({

            body:JSON.stringify({

              /*
               * Supabase authenticated user
               */
              userId:user.id,

              /*
               * Existing conversation.
               * Empty on first message.
               */
              conversationId:conversationId || '',

              /*
               * Full conversation sent to AI
               */
              messages:nextMessages

            })

          })
        }
      );

      let data={};

      try{

        data=await r.json();

      }catch{

        data={};

      }

      console.log(
        'NIKO APPWRITE RESPONSE:',
        data
      );

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
       * Appwrite Function execution response
       *
       * responseBody may contain:
       *
       * {
       *   "content":"Hello",
       *   "conversationId":"..."
       * }
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
           * responseBody was plain text
           */
          out=String(data.responseBody);

        }

      }

      /*
       * Fallback formats
       */
      if(!out){

        out=
          data?.content ||
          data?.message ||
          '';

      }

      /*
       * Conversation ID may also be returned
       * directly by Appwrite.
       */
      if(!returnedConversationId){

        returnedConversationId=
          data?.conversationId ||
          '';

      }

      /*
       * Save conversation ID in React state.
       *
       * First request creates the conversation.
       * All following requests use the same ID.
       */
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

      /*
       * Add Niko response to UI.
       */
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

      /*
       * Remove the optimistic user message if
       * the request itself failed.
       */
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

  function newChat(){

    /*
     * Clear current conversation ID.
     *
     * Next message will create a completely
     * new conversation in Appwrite.
     */
    setConversationId('');

    setMessages([]);

    setInput('');
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
          onClick={newChat}
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