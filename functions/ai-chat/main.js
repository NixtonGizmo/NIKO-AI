export default async ({ req, res, log, error }) => {
  try {
    const body =
      typeof req.body === 'string'
        ? JSON.parse(req.body || '{}')
        : (req.body || {});

    const messages = Array.isArray(body.messages)
      ? body.messages
      : [];

    const userId = body.userId || '';
    let conversationId = body.conversationId || '';

    const apiKey = process.env.AI_API_KEY;

    const baseUrl = (
      process.env.AI_BASE_URL ||
      'https://api.openai.com/v1'
    ).replace(/\/$/, '');

    const model =
      process.env.AI_MODEL ||
      'gpt-4.1-mini';

    /*
     * Appwrite database configuration
     */
    const appwriteEndpoint =
      process.env.APPWRITE_ENDPOINT ||
      'https://sgp.cloud.appwrite.io/v1';

    const appwriteProjectId =
      process.env.APPWRITE_PROJECT_ID || '';

    const appwriteApiKey =
      process.env.APPWRITE_API_KEY || '';

    const databaseId =
      process.env.APPWRITE_DATABASE_ID || '';

    const conversationsTableId =
      process.env.APPWRITE_CONVERSATIONS_TABLE_ID ||
      'conversations';

    const messagesTableId =
      process.env.APPWRITE_MESSAGES_TABLE_ID ||
      'messages';

    /*
     * Validate AI configuration
     */
    if (!apiKey) {
      return res.json(
        {
          error:
            'AI provider is not configured. Add AI_API_KEY to the Function environment.'
        },
        503
      );
    }

    /*
     * Validate database configuration
     */
    if (
      !appwriteProjectId ||
      !appwriteApiKey ||
      !databaseId
    ) {
      return res.json(
        {
          error:
            'Appwrite database is not configured. Check APPWRITE_PROJECT_ID, APPWRITE_API_KEY and APPWRITE_DATABASE_ID.'
        },
        503
      );
    }

    /*
     * Generate a simple unique Appwrite-compatible row ID.
     */
    function uniqueId() {
      return (
        crypto.randomUUID().replace(/-/g, '') +
        Date.now().toString(36)
      ).slice(0, 36);
    }

    /*
     * Appwrite REST helper
     */
    async function appwriteRequest(
      path,
      method = 'GET',
      data = null
    ) {
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-Appwrite-Project': appwriteProjectId,
          'X-Appwrite-Key': appwriteApiKey
        }
      };

      if (data !== null) {
        options.body = JSON.stringify(data);
      }

      const response = await fetch(
        `${appwriteEndpoint}${path}`,
        options
      );

      let responseData = {};

      try {
        responseData = await response.json();
      } catch {
        responseData = {};
      }

      if (!response.ok) {
        throw new Error(
          responseData?.message ||
          `Appwrite request failed with HTTP ${response.status}`
        );
      }

      return responseData;
    }

    /*
     * Save a message into Appwrite.
     */
    async function saveMessage(
      conversationId,
      messageUserId,
      role,
      content
    ) {
      return await appwriteRequest(
        `/databases/${databaseId}/tables/${messagesTableId}/rows`,
        'POST',
        {
          rowId: uniqueId(),
          data: {
            userId: messageUserId,
            conversationId,
            role,
            content,
            createdAt: new Date().toISOString()
          }
        }
      );
    }

    /*
     * Create a new conversation.
     */
    async function createConversation(
      messageUserId,
      firstMessage
    ) {
      const title =
        String(firstMessage || 'New conversation')
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 80) ||
        'New conversation';

      const id = uniqueId();

      await appwriteRequest(
        `/databases/${databaseId}/tables/${conversationsTableId}/rows`,
        'POST',
        {
          rowId: id,
          data: {
            userId: messageUserId,
            title,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        }
      );

      return id;
    }

    /*
     * Only save to database when we have a user ID.
     */
    if (!userId) {
      log(
        'No userId supplied. AI response will work, but history cannot be saved.'
      );
    }

    /*
     * Create conversation if this is the first message.
     */
    if (userId && !conversationId) {
      const firstUserMessage =
        messages.find(
          (m) => m?.role === 'user'
        )?.content || 'New conversation';

      conversationId =
        await createConversation(
          userId,
          firstUserMessage
        );

      log(
        `Created conversation: ${conversationId}`
      );
    }

    /*
     * Save latest user message.
     *
     * We save only the latest user message here.
     * This prevents duplicate rows when the frontend
     * sends the complete message history.
     */
    const latestUserMessage =
      [...messages]
        .reverse()
        .find(
          (m) =>
            m?.role === 'user' &&
            typeof m?.content === 'string'
        );

    if (
      userId &&
      conversationId &&
      latestUserMessage
    ) {
      await saveMessage(
        conversationId,
        userId,
        'user',
        latestUserMessage.content
      );
    }

    /*
     * Send conversation to AI provider.
     */
    const r = await fetch(
      `${baseUrl}/chat/completions`,
      {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },

        body: JSON.stringify({
          model,

          messages: [
            {
              role: 'system',

              content: `
You are Niko AI, the user's private personal AI assistant.

IDENTITY:
- Your name is Niko.
- You are Niko AI.
- You are the personal AI assistant inside the Niko AI application.
- Do not identify yourself as ChatGPT, OpenAI, Recursive Superintelligence, or another AI company/model unless the user specifically asks about the underlying AI provider or model.
- Do not invent a company, developer, creator, or organization behind Niko.
- If asked "Who are you?", say you are Niko, the user's personal AI assistant.
- If asked "Who made you?", say you were created by the Nixton (Nikka).
- If asked "Who made you?" or anything about yourself, who made you, or your identity, say you were created by the Nixton (Nikka).
- If asked what AI model powers you, be honest that the underlying model/provider may be different from your Niko identity.

PERSONALITY:
- Helpful
- Direct
- Intelligent
- Natural
- Friendly
- Calm
- Honest about uncertainty
- Do not unnecessarily mention technical implementation details.

BEHAVIOR:
- Answer the user's actual question directly.
- Do not pretend to have performed an action unless a connected tool actually completed it.
- Never fabricate information, tool results, memories, files, or actions.
- If you do not know something, say so clearly.
- Keep answers appropriately concise unless the user asks for detail.
- Follow the user's instructions when they are safe and reasonable.
- Maintain the Niko identity consistently throughout the conversation.

You are Niko. Speak naturally as Niko.
`
            },

            ...messages
          ],

          stream: false
        })
      );

    const data = await r.json();

    /*
     * AI provider error
     */
    if (!r.ok) {
      return res.json(
        {
          error:
            data?.error?.message ||
            'AI provider request failed.',

          provider_status: r.status,

          provider_response: data
        },
        r.status
      );
    }

    /*
     * Extract Niko response.
     */
    const content =
      data?.choices?.[0]?.message?.content || '';

    if (!content) {
      return res.json(
        {
          error:
            'AI provider returned an empty response.'
        },
        502
      );
    }

    /*
     * Save Niko's response.
     */
    if (userId && conversationId) {
      await saveMessage(
        conversationId,
        userId,
        'assistant',
        content
      );

      /*
       * Update conversation timestamp.
       */
      try {
        await appwriteRequest(
          `/databases/${databaseId}/tables/${conversationsTableId}/rows/${conversationId}`,
          'PATCH',
          {
            data: {
              updatedAt:
                new Date().toISOString()
            }
          }
        );
      } catch (updateError) {
        log(
          `Conversation timestamp update failed: ${
            updateError?.message ||
            String(updateError)
          }`
        );
      }
    }

    /*
     * Return response to frontend.
     */
    return res.json({
      content,
      conversationId: conversationId || null
    });

  } catch (e) {
    error(
      e?.message ||
      String(e)
    );

    return res.json(
      {
        error:
          e?.message ||
          'Niko AI function failed.'
      },
      500
    );
  }
};