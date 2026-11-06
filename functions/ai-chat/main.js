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
const model = process.env.AI_MODEL || 'gemini-2.5-flash';

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

const transliteratedUserText =
  await transliterateToRoman(latestUserMessage.content);

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

        throw new Error(
  `Appwrite HTTP ${response.status}: ${message} | ${path}`
);
      }

      return responseData;
    }

    /*
     * Confirm conversation ownership.
     */
    async function verifyConversationOwnership(conversationId) {
      const row = await appwriteRequest(
        `/tablesdb/${encodeURIComponent(databaseId)}/tables/${encodeURIComponent(conversationsTableId)}/rows/${encodeURIComponent(conversationId)}`,
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
        `/tablesdb/${encodeURIComponent(databaseId)}/tables/${encodeURIComponent(conversationsTableId)}/rows`,
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


    
async function transliterateToRoman(text) {
  const apiKey = process.env.APIHIVER_API_KEY;

  if (!text || !apiKey) {
    return text || "";
  }

  // Skip API calls for text that is already in Roman script.
  if (!/[\u0900-\u097F]/.test(text)) {
    return text;
  }

  try {
    const response = await fetch(
      "https://language-detection.p.apihiver.com/v1/transliterate",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "X-API-Key": apiKey
        },
        body: JSON.stringify({
          text: text
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      log(`APIHiver failed: HTTP ${response.status}`);
      return text;
    }

    return typeof data.output === "string"
      ? data.output
      : text;

  } catch (err) {
    log(`Transliteration error: ${err.message}`);
    return text;
  }
}

    /*
     * Save one message row.
     */
    async function saveMessage(conversationId, role, content) {
      return appwriteRequest(
        `/tablesdb/${encodeURIComponent(databaseId)}/tables/${encodeURIComponent(messagesTableId)}/rows`,
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

IMPORTANT LANGUAGE RULES:
- Understand both Hindi and English.
- Reply in the same language the user uses.
- If the user speaks Hindi, reply in natural Hindi using Devanagari script or hinglish as appropriate.
- If the user speaks English, reply in natural English.
- If the user mixes Hindi and English, respond naturally using both.

`;

    /*
     * Send conversation to configured AI provider.
     */
    
const aiResponse = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [
          { text: systemPrompt }
        ]
      },

      contents: messages.map((message) => ({
        role: message.role === 'assistant' ? 'model' : 'user',
        parts: [
          { text: message.content }
        ]
      })),

      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048
      }
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
  log(`Gemini API failed: HTTP ${aiResponse.status}`);

  return res.json(
    {
      error:
        aiData?.error?.message ||
        'Gemini API request failed.',
      provider_status: aiResponse.status
    },
    aiResponse.status >= 400 && aiResponse.status <= 599
      ? aiResponse.status
      : 502
  );
}

  const content = (
        aiData?.candidates?.[0]?.content?.parts || []
)
  .map((part) => part.text || '')
  .join('')
  .trim();

if (!content) {
  log(
    `Gemini returned no text. Block reason: ${
      aiData?.promptFeedback?.blockReason || 'Unknown'
    }`
  );

  return res.json(
    {
      error: 'Gemini returned an empty response. Please try again.'
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
        `/tablesdb/${encodeURIComponent(databaseId)}/tables/${encodeURIComponent(conversationsTableId)}/rows/${encodeURIComponent(conversationId)}`,
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
  conversationId,
  transliteratedUserText
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