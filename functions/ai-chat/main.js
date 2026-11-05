export default async ({ req, res, log, error }) => {
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const apiKey = process.env.AI_API_KEY;
    const baseUrl = (process.env.AI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '');
    const model = process.env.AI_MODEL || 'gpt-4.1-mini';
    if (!apiKey) return res.json({ error: 'AI provider is not configured. Add AI_API_KEY to the Function environment.' }, 503);
    const r = await fetch(`${baseUrl}/chat/completions`, { method:'POST', headers:{'Content-Type':'application/json','Authorization':`Bearer ${apiKey}`}, body:JSON.stringify({model,messages:[{role:'system',content:'You are Niko AI, a private personal assistant. Be helpful, direct, honest about uncertainty, and never claim an action happened unless a tool actually completed it.'},...messages],stream:false})});
    const data = await r.json();
    if (!r.ok) return res.json({ error: data?.error?.message || 'AI provider request failed.' }, r.status);
    return res.json({ content: data?.choices?.[0]?.message?.content || '' });
  } catch (e) { error(e?.message || String(e)); return res.json({ error:'Niko AI function failed.' },500); }
};
