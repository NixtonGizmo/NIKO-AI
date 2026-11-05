export default async ({ req, res, log, error }) => {
  try {
    /*
     * Parse the request body.
     */
    let body = req.body;

    if (typeof body === 'string') {
      body = JSON.parse(body || '{}');
    }

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      body = {};
    }

    if (body.body && typeof body.body === 'string') {
      try {
        body = JSON.parse(body.body);
      } catch {
        return res.json({ error: 'Invalid request body.' }, 400);
      }
    } else if (body.body && typeof body.body === 'object') {
      body = body.body;
    }

    const supabaseAccessToken =
      typeof body.supabaseAccessToken === 'string'
        ? body.supabaseAccessToken.trim()
        : '';

    const requestedConversationId =
      typeof body.conversationId === 'string'
        ? body.conversationId.trim()
        : '';

    const incomingMessages = Array.isArray(body.messages)
      ? body.messages
      : [];

    /*
     * Environment configuration.
     */
    const apiKey = process.env.AI_API_KEY;

    const baseUrl = (
      process.env.AI_BASE_URL || 'https://api.openai.com/v1'
    ).replace(/\/$/, '');

    const model = process.env.AI_MODEL || 'gpt-4.1-mini';

    const supabaseUrl = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

    const appwriteEndpoint = (
      process.env.APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1'
    ).replace(/\/$/, '');

    const appwriteProjectId = process.env.APPWRITE_PROJECT_ID || '';
    const appwriteApiKey = process.env.APPWRITE_API_KEY || '';
    const databaseId = process.env.APPWRITE_DATABASE_ID || '';

    const conversationsTableId =
      process.env.APPWRITE_CONVERSATIONS_TABLE_ID || 'conversations';

    const messagesTableId =
      process.env.APPWRITE_MESSAGES_TABLE_ID || 'messages';

    /*
     * Validate required configuration.
     */
    if (!supabaseUrl || !supabaseAnonKey) {
      return res.json(
        {
          error:
            'Supabase verification is not configured in the Function environment.'
        },
        503
      );
    }

    if (!appwriteProjectId || !appwriteApiKey || !databaseId) {
      return res.json(
        {
          error:
            'Appwrite database is not configured. Check APPWRITE_PROJECT_ID, APPWRITE_API_KEY and APPWRITE_DATABASE_ID.'
        },
        503
      );
    }

    if (!apiKey) {
      return res.json(
        {
          error:
            'AI provider is not configured. Add AI_API_KEY to the Function environment.'
        },
        503
      );
    }

    if (!supabaseAccessToken) {
      return res.json(
        { error: 'Authentication required. Please log in again.' },
        401
      );
    }

    /*
     * Verify the Supabase access token.
     * Never trust a userId supplied by the browser.
     */
    const authResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
      method: 'GET',
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAccessToken}`
      }
    });

    if (!authResponse.ok) {
      log(`Supabase token verification failed: HTTP ${authResponse.status}`);

      return res.json(
        {
          error:
            'Your login session is invalid or expired. Please log in again.'
        },
        401
      );
    }

    const supabaseUser = await authResponse.json();
    const userId = supabaseUser?.id;

    if (!userId || typeof userId !== 'string') {
      return res.json(
        { error: 'Unable to identify the authenticated user.' },
        401
      );
    }

    /*
     * Validate and normalize chat messages.
     */
    const messages = incomingMessages
      .filter(
        (message) =>
          message &&
          (message.role === 'user' || message.role === 'assistant') &&
          typeof message.content === 'string' &&
          message.content.trim().length > 0
      )
      .slice(-40)
      .map((message) => ({
        role: message.role,
        content: message.content
      }));

    if (messages.length === 0) {
      return res.json(
        { error: 'Please send a message to Niko.' },
        400
      );
    }

    const latestUserMessage = [...messages]
      .reverse()
      .find((message) => message.role === 'user');

    if (!latestUserMessage) {
      return res.json(
        { error: 'A user message is required.' },
        400
      );
    }

    /*
     * Generate an Appwrite-compatible row ID.
     */
    function uniqueId() {
      return crypto.randomUUID().replace(/-/g, '');
    }

    /*
     * Appwrite REST helper.
     */
    async function appwriteRequest(path, method = 'GET', data = null) {
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
        const message =
          responseData?.message ||
          `Appwrite request failed with HTTP ${response.status}`;

        throw new Error(message);
      }

      return responseData;
    }

    /*
     * Confirm conversation ownership.
     */
    async function verifyConversationOwnership(conversationId) {
      const row = await appwriteRequest(
        `/databases/${encodeURIComponent(databaseId)}/tables/${encodeURIComponent(conversationsTableId)}/rows/${encodeURIComponent(conversationId)}`,
        'GET'
      );

      const ownerId = row?.data?.userId ?? row?.userId;

      return ownerId === userId;
    }

    /*
     * Create a conversation row.
     */
    async function createConversation(firstMessage) {
      const title = String(firstMessage || 'New conversation')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 80) || 'New conversation';

      const id = uniqueId();
      const now = new Date().toISOString();

      await appwriteRequest(
        `/databases/${encodeURIComponent(databaseId)}/tables/${encodeURIComponent(conversationsTableId)}/rows`,
        'POST',
        {
          rowId: id,
          data: {
            userId,
            title,
            createdAt: now,
            updatedAt: now
          }
        }
      );

      return id;
    }

    /*
     * Save one message row.
     */
    async function saveMessage(conversationId, role, content) {
      return appwriteRequest(
        `/databases/${encodeURIComponent(databaseId)}/tables/${encodeURIComponent(messagesTableId)}/rows`,
        'POST',
        {
          rowId: uniqueId(),
          data: {
            userId,
            conversationId,
            role,
            content,
            createdAt: new Date().toISOString()
          }
        }
      );
    }

    /*
     * Use existing conversation only if it belongs to this user.
     */
    let conversationId = requestedConversationId;

    if (conversationId) {
      let belongsToUser = false;

      try {
        belongsToUser =
          await verifyConversationOwnership(conversationId);
      } catch (ownershipError) {
        log(
          `Conversation ownership check failed: ${ownershipError.message}`
        );

        return res.json(
          {
            error:
              'Conversation not found or you do not have access to it.'
          },
          404
        );
      }

      if (!belongsToUser) {
        return res.json(
          {
            error:
              'You do not have permission to access this conversation.'
          },
          403
        );
      }
    } else {
      conversationId = await createConversation(
        latestUserMessage.content
      );

      log(`Created conversation: ${conversationId}`);
    }

    /*
     * Save the latest user message once.
     */
    await saveMessage(
      conversationId,
      'user',
      latestUserMessage.content
    );

    /*
     * Niko AI system instructions.
     */
    const systemPrompt = `
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
`;

    /*
     * Send conversation to configured AI provider.
     */
    const aiResponse = await fetch(
      `${baseUrl}/chat/completions`,
      {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`
        },

        body: JSON.stringify({
          model,

          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            ...messages
          ],

          stream: false
        })
      }
    );

    let aiData = {};

    try {
      aiData = await aiResponse.json();
    } catch {
      aiData = {};
    }

    if (!aiResponse.ok) {
      log(
        `AI provider request failed: HTTP ${aiResponse.status}`
      );

      return res.json(
        {
          error:
            aiData?.error?.message ||
            'AI provider request failed.',

          provider_status: aiResponse.status
        },

        aiResponse.status >= 400 && aiResponse.status <= 599
          ? aiResponse.status
          : 502
      );
    }

    const content =
      aiData?.choices?.[0]?.message?.content;

    if (typeof content !== 'string' || !content.trim()) {
      return res.json(
        {
          error:
            'AI provider returned an empty response.'
        },
        502
      );
    }

    /*
     * Save Niko's reply and update conversation timestamp.
     */
    await saveMessage(
      conversationId,
      'assistant',
      content
    );

    try {
      await appwriteRequest(
        `/databases/${encodeURIComponent(databaseId)}/tables/${encodeURIComponent(conversationsTableId)}/rows/${encodeURIComponent(conversationId)}`,
        'PATCH',
        {
          data: {
            updatedAt: new Date().toISOString()
          }
        }
      );
    } catch (updateError) {
      log(
        `Conversation timestamp update failed: ${updateError.message}`
      );
    }

    /*
     * Return successful response.
     */
    return res.json({
      content,
      conversationId
    });

  } catch (e) {
    error(
      e?.stack || e?.message || String(e)
    );

    return res.json(
      {
        error:
          e?.message || 'Niko AI Function failed.'
      },
      500
    );
  }
};