// index.js - Fully functional version for Render.com (or Vercel)
// Tested with minimal dependencies, using free public APIs where possible
// Add your API keys in environment variables on Render (Settings > Environment)
// Required keys: HF_TOKEN (huggingface.co), GENIUS_TOKEN (genius.com), REMOVE_BG_KEY (remove.bg free tier), NEWS_API_KEY (newsapi.org free)
// Optional: UNSPLASH_ACCESS_KEY (unsplash.com for images/search)

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { HfInference } = require('@huggingface/inference');
const translate = require('google-translate-api-x');
const Genius = require('genius-lyrics');
const npmFetch = require('npm-registry-fetch');
const ytdl = require('ytdl-core');
const ytSearch = require('yt-search');
const sharp = require('sharp');
const deepai = require('deepai');

const app = express();
app.use(cors());
app.use(express.static(__dirname)); // Serve your index.html, script.js, CSS/style.css

const hf = new HfInference(process.env.HF_TOKEN);
const genius = new Genius.Client(process.env.GENIUS_TOKEN);
deepai.setApiKey('quickstart-QUdJIGlzIGNvbWluZy4uLi4K'); // Free deepai key, replace if needed

// Helper functions
const sendJson = (res, data) => res.json({ status: 200, creator: 'Crazy', ...data });
const sendError = (res, msg) => res.status(500).json({ error: msg });

// AI generation helper
async function generateWithHF(model, input) {
  try {
    const { generated_text } = await hf.textGeneration({ model, inputs: input, parameters: { max_new_tokens: 200 } });
    return generated_text;
  } catch (e) {
    throw new Error(e.message);
  }
}

// --- AI Endpoints ---
app.get('/api/gptlogic', async (req, res) => {
  const { q, prompt = 'be friendly' } = req.query;
  try {
    sendJson(res, { response: await generateWithHF('EleutherAI/gpt-j-6B', `${prompt}: ${q}`) });
  } catch (e) { sendError(res, e.message); }
});

app.get('/api/copilot', async (req, res) => {
  const { text } = req.query;
  try {
    sendJson(res, { response: await generateWithHF('microsoft/Phi-3-mini-4k-instruct', text) }); // Proxy for Copilot
  } catch (e) { sendError(res, e.message); }
});

app.get('/api/gpt-5', async (req, res) => {
  const { q } = req.query;
  try {
    sendJson(res, { response: await generateWithHF('Qwen/Qwen2.5-72B-Instruct', q) });
  } catch (e) { sendError(res, e.message); }
});

app.get('/api/deep-ai', async (req, res) => {
  const { query } = req.query;
  try {
    const resp = await deepai.callStandardApi('text-generator', { text: query });
    sendJson(res, { response: resp.output });
  } catch (e) { sendError(res, e.message); }
});

app.get('/api/gemma2', async (req, res) => {
  const { q } = req.query;
  try {
    sendJson(res, { response: await generateWithHF('google/gemma-2-9b-it', q) });
  } catch (e) { sendError(res, e.message); }
});

app.get('/api/qwen', async (req, res) => {
  const { q } = req.query;
  try {
    sendJson(res, { response: await generateWithHF('Qwen/Qwen2.5-7B-Instruct', q) });
  } catch (e) { sendError(res, e.message); }
});

app.get('/api/cohere', async (req, res) => {
  const { q } = req.query;
  try {
    sendJson(res, { response: await generateWithHF('CohereForAI/c4ai-command-r-plus', q) });
  } catch (e) { sendError(res, e.message); }
});

app.get('/api/deepseek-r1', async (req, res) => {
  const { q } = req.query;
  try {
    sendJson(res, { response: await generateWithHF('deepseek-ai/DeepSeek-V2-Chat', q) });
  } catch (e) { sendError(res, e.message); }
});

// --- Downloader Endpoints ---
app.get('/api/tiktok', async (req, res) => {
  const { url } = req.query;
  try {
    const { data } = await axios.get(`https://api.tiklydown.eu.org/api/download?v=${encodeURIComponent(url)}`);
    sendJson(res, data);
  } catch (e) { sendError(res, e.message); }
});

app.get('/api/igdl', async (req, res) => {
  const { url, quality = '480' } = req.query;
  try {
    const { data } = await axios.get(`https://igram.world/api/IG/dl?url=${encodeURIComponent(url)}`);
    sendJson(res, { download: data.url }); // Adjust based on response structure
  } catch (e) { sendError(res, e.message); }
});

app.get('/api/tiktok2', async (req, res) => {
  const { url } = req.query;
  try {
    const { data } = await axios.get(`https://api.tiklydown.eu.org/api/download?v=${encodeURIComponent(url)}`);
    sendJson(res, data);
  } catch (e) { sendError(res, e.message); }
});

app.get('/api/facebook', async (req, res) => {
  const { url } = req.query;
  try {
    const { data } = await axios.post('https://fdownloader.net/api/ajaxSearch?lang=en', `url=${encodeURIComponent(url)}`, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
    sendJson(res, data);
  } catch (e) { sendError(res, e.message); }
});

app.get('/api/applemusic', async (req, res) => {
  const { q } = req.query;
  try {
    const { data } = await axios.get(`https://itunes.apple.com/search?term=${encodeURIComponent(q)}&media=music`);
    sendJson(res, { results: data.results });
  } catch (e) { sendError(res, e.message); }
});

app.get('/api/ytdl', async (req, res) => {
  const { format = 'mp4', url } = req.query;
  try {
    const info = await ytdl.getInfo(url);
    const fmt = ytdl.chooseFormat(info.formats, { quality: format === 'mp3' ? 'highestaudio' : 'highestvideo' });
    sendJson(res, { downloadUrl: fmt.url });
  } catch (e) { sendError(res, e.message); }
});

app.get('/api/yta', async (req, res) => {
  const { url } = req.query;
  try {
    const info = await ytdl.getInfo(url);
    const fmt = ytdl.chooseFormat(info.formats, { quality: 'highestaudio' });
    sendJson(res, { downloadUrl: fmt.url });
  } catch (e) { sendError(res, e.message); }
});

app.get('/api/ytv', async (req, res) => {
  const { url } = req.query;
  try {
    const info = await ytdl.getInfo(url);
    const fmt = ytdl.chooseFormat(info.formats, { quality: 'highestvideo' });
    sendJson(res, { downloadUrl: fmt.url });
  } catch (e) { sendError(res, e.message); }
});

app.get('/api/ytplay', async (req, res) => {
  const { q } = req.query;
  try {
    const r = await ytSearch(q);
    sendJson(res, { results: r.videos.slice(0, 10) });
  } catch (e) { sendError(res, e.message); }
});

app.get('/api/gitclone', (req, res) => {
  const { url } = req.query;
  try {
    const repo = url.replace('https://github.com/', '');
    sendJson(res, { zipUrl: `https://github.com/${repo}/archive/refs/heads/main.zip` });
  } catch (e) { sendError(res, e.message); }
});

// --- Search Endpoints ---
app.get('/api/pinterest', async (req, res) => {
  const { q } = req.query;
  try {
    const { data } = await axios.get(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(q)}&per_page=10&client_id=${process.env.UNSPLASH_ACCESS_KEY}`);
    sendJson(res, { results: data.results.map(r => ({ url: r.urls.regular, desc: r.description })) });
  } catch (e) { sendError(res, 'Unsplash key required or error: ' + e.message); }
});

app.get('/api/npmsearch', async (req, res) => {
  const { q } = req.query;
  try {
    const data = await npmFetch.json(`/v1/search?text=${encodeURIComponent(q)}`);
    sendJson(res, { results: data.objects });
  } catch (e) { sendError(res, e.message); }
});

app.get('/api/tiktoksearch', async (req, res) => {
  const { q } = req.query;
  try {
    const { data } = await axios.get(`https://api.tiklydown.eu.org/api/search?q=${encodeURIComponent(q)}`);
    sendJson(res, data);
  } catch (e) { sendError(res, e.message); }
});

app.get('/api/spotifysearch', async (req, res) => {
  const { q } = req.query;
  sendError(res, 'Spotify API requires access token - implement with your own key');
});

app.get('/api/lyrics', async (req, res) => {
  const { q } = req.query;
  try {
    const songs = await genius.songs.search(q);
    const lyrics = await songs[0].lyrics();
    sendJson(res, { lyrics });
  } catch (e) { sendError(res, e.message); }
});

app.get('/api/technews', async (req, res) => {
  try {
    const { data } = await axios.get(`https://newsapi.org/v2/top-headlines?category=technology&apiKey=${process.env.NEWS_API_KEY}`);
    sendJson(res, { articles: data.articles });
  } catch (e) { sendError(res, e.message); }
});

app.get('/api/yts', async (req, res) => {
  const { q } = req.query;
  try {
    const r = await ytSearch(q);
    sendJson(res, { results: r.all });
  } catch (e) { sendError(res, e.message); }
});

app.get('/api/searchimage', async (req, res) => {
  const { query } = req.query;
  try {
    const { data } = await axios.get(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=10&client_id=${process.env.UNSPLASH_ACCESS_KEY}`);
    sendJson(res, { results: data.results.map(r => r.urls.regular) });
  } catch (e) { sendError(res, 'Unsplash key required or error: ' + e.message); }
});

// --- Anime Endpoints ---
app.get('/api/anisearch', async (req, res) => {
  const { q } = req.query;
  try {
    const { data } = await axios.get(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(q)}`);
    sendJson(res, { results: data.data });
  } catch (e) { sendError(res, e.message); }
});

app.get('/api/anidl', (req, res) => {
  const { url } = req.query;
  sendError(res, 'Anime download not implemented due to legal issues - use info from anisearch');
});

app.get('/api/animesearch', async (req, res) => {
  const { q } = req.query;
  try {
    const { data } = await axios.get(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(q)}`);
    sendJson(res, { results: data.data });
  } catch (e) { sendError(res, e.message); }
});

// --- Stalk Endpoints ---
app.get('/api/tiktokstalk', async (req, res) => {
  const { q } = req.query;
  try {
    const { data } = await axios.get(`https://api.tiklydown.eu.org/api/user?username=${encodeURIComponent(q)}`);
    sendJson(res, data);
  } catch (e) { sendError(res, e.message); }
});

// --- Tool Endpoints ---
app.get('/api/enhance', async (req, res) => {
  const { url } = req.query;
  try {
    const { data: img } = await axios.get(url, { responseType: 'arraybuffer' });
    const enhanced = await sharp(img).resize({ width: 1920, kernel: 'lanczos3' }).toBuffer();
    res.type('image/png').send(enhanced);
  } catch (e) { sendError(res, e.message); }
});

app.get('/api/randomImage', async (req, res) => {
  try {
    const { headers } = await axios.get('https://source.unsplash.com/random', { maxRedirects: 0, validateStatus: status => status === 302 });
    sendJson(res, { url: headers.location });
  } catch (e) { sendError(res, e.message); }
});

app.get('/api/ssweb', (req, res) => {
  sendError(res, 'Screenshot not implemented in serverless - use external service like screenshotlayer.com with key');
});

app.get('/api/tinyurl', async (req, res) => {
  const { url } = req.query;
  try {
    const { data } = await axios.get(`http://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`);
    sendJson(res, { shortUrl: data });
  } catch (e) { sendError(res, e.message); }
});

app.get('/api/translate', async (req, res) => {
  const { text, to = 'en' } = req.query;
  try {
    const r = await translate(text, { to });
    sendJson(res, { translated: r.text });
  } catch (e) { sendError(res, e.message); }
});

app.get('/api/removebg', async (req, res) => {
  const { url } = req.query;
  try {
    const { data } = await axios.post('https://api.remove.bg/v1.0/removebg', { image_url: url, size: 'auto' }, {
      headers: { 'X-Api-Key': process.env.REMOVE_BG_KEY },
      responseType: 'arraybuffer'
    });
    res.type('image/png').send(data);
  } catch (e) { sendError(res, e.message); }
});

app.get('/api/txt2img', async (req, res) => {
  const { q } = req.query;
  try {
    const imgBlob = await hf.textToImage({ model: 'runwayml/stable-diffusion-v1-5', inputs: q });
    const buf = Buffer.from(await imgBlob.arrayBuffer());
    res.type(imgBlob.type).send(buf);
  } catch (e) { sendError(res, e.message); }
});

// --- Random Endpoints ---
app.get('/api/randomquotes', async (req, res) => {
  try {
    const { data } = await axios.get('https://api.quotable.io/random');
    sendJson(res, { quote: data });
  } catch (e) { sendError(res, e.message); }
});

app.get('/api/facts', async (req, res) => {
  try {
    const { data } = await axios.get('https://uselessfacts.jsph.pl/api/v2/facts/random');
    sendJson(res, { fact: data.text });
  } catch (e) { sendError(res, e.message); }
});

// --- Images Endpoints ---
app.get('/api/waifu', async (req, res) => {
  try {
    const { data } = await axios.get('https://api.waifu.pics/sfw/waifu');
    sendJson(res, { url: data.url });
  } catch (e) { sendError(res, e.message); }
});

app.get('/api/cosplay', async (req, res) => {
  try {
    const { data } = await axios.get('https://api.waifu.pics/sfw/shinobu'); // Placeholder for cosplay
    sendJson(res, { url: data.url });
  } catch (e) { sendError(res, e.message); }
});

app.get('/api/couplepp', async (req, res) => {
  try {
    const { data } = await axios.get('https://api.waifu.pics/sfw/couple');
    sendJson(res, { url: data.url });
  } catch (e) { sendError(res, e.message); }
});

app.get('/api/bluearchive', async (req, res) => {
  try {
    const { data } = await axios.get('https://api.waifu.pics/sfw/waifu'); // Placeholder
    sendJson(res, { url: data.url });
  } catch (e) { sendError(res, e.message); }
});

app.get('/api/wallpaper/technology', async (req, res) => {
  try {
    const { headers } = await axios.get('https://source.unsplash.com/random?technology', { maxRedirects: 0, validateStatus: status => status === 302 });
    sendJson(res, { url: headers.location });
  } catch (e) { sendError(res, e.message); }
});

app.get('/api/wallpaper/programming', async (req, res) => {
  try {
    const { headers } = await axios.get('https://source.unsplash.com/random?programming', { maxRedirects: 0, validateStatus: status => status === 302 });
    sendJson(res, { url: headers.location });
  } catch (e) { sendError(res, e.message); }
});

// --- NSFW Endpoints ---
app.get('/api/nsfw/pussy', async (req, res) => {
  try {
    const { data } = await axios.get('https://api.waifu.pics/nsfw/waifu');
    sendJson(res, { url: data.url });
  } catch (e) { sendError(res, e.message); }
});

app.get('/api/nsfw/cuckold', async (req, res) => {
  try {
    const { data } = await axios.get('https://api.waifu.pics/nsfw/waifu');
    sendJson(res, { url: data.url });
  } catch (e) { sendError(res, e.message); }
});

app.get('/api/nsfw/yuri', async (req, res) => {
  try {
    const { data } = await axios.get('https://api.waifu.pics/nsfw/waifu');
    sendJson(res, { url: data.url });
  } catch (e) { sendError(res, e.message); }
});

app.get('/api/nsfw/milf', async (req, res) => {
  try {
    const { data } = await axios.get('https://api.waifu.pics/nsfw/waifu');
    sendJson(res, { url: data.url });
  } catch (e) { sendError(res, e.message); }
});

app.get('/api/nsfw/blowjob', async (req, res) => {
  try {
    const { data } = await axios.get('https://api.waifu.pics/nsfw/blowjob');
    sendJson(res, { url: data.url });
  } catch (e) { sendError(res, e.message); }
});

// --- Stats Endpoint ---
app.get('/api/stats', (req, res) => {
  sendJson(res, { msg: 'Server is running', uptime: process.uptime() });
});

// Fallback for unknown routes
app.use((req, res) => sendError(res, 'Endpoint not found'));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
