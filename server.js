import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json({ limit: '25mb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/chat', async (req, res) => {
  try {
    const { prompt, images } = req.body || {};
    if (!prompt) return res.status(400).json({ error: 'prompt required' });
    const body = { model: 'openai', messages: [{ role: 'user', content: prompt }] };
    if (Array.isArray(images) && images.length) {
      body.messages[0].content = [
        { type: 'text', text: prompt },
        ...images.slice(0, 5).map(url => ({ type: 'image_url', image_url: { url } }))
      ];
    }
    const r = await fetch('https://text.pollinations.ai/openai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!r.ok) return res.status(500).json({ error: 'AI error ' + r.status });
    const data = await r.json();
    const text = data?.choices?.[0]?.message?.content || '';
    res.json({ text, truncated: false });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.listen(process.env.PORT || 3000, () => console.log('\n✅ Forge → http://localhost:3000\n'));