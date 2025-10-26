const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Serve static files (your HTML, CSS, JS)
app.use(express.static(__dirname));

// --- AI Endpoints ---
app.get('/api/gptlogic', (req, res) => {
  const { q, prompt } = req.query;
  res.json({ status: 200, creator: 'Crazy', response: `GPT Logic response to "${q}" with prompt "${prompt}"` });
});

app.get('/api/copilot', (req, res) => {
  const { text } = req.query;
  res.json({ status: 200, creator: 'Crazy', response: `Copilot response to "${text}"` });
});

app.get('/api/gpt-5', (req, res) => {
  const { q } = req.query;
  res.json({ status: 200, creator: 'Crazy', response: `GPT-5 response to "${q}"` });
});

app.get('/api/deep-ai', (req, res) => {
  const { query } = req.query;
  res.json({ status: 200, creator: 'Crazy', response: `Deep AI response to "${query}"` });
});

app.get('/api/gemma2', (req, res) => {
  const { q } = req.query;
  res.json({ status: 200, creator: 'Crazy', response: `Gemma2 response to "${q}"` });
});

app.get('/api/qwen', (req, res) => {
  const { q } = req.query;
  res.json({ status: 200, creator: 'Crazy', response: `Qwen response to "${q}"` });
});

app.get('/api/cohere', (req, res) => {
  const { q } = req.query;
  res.json({ status: 200, creator: 'Crazy', response: `Cohere response to "${q}"` });
});

app.get('/api/deepseek-r1', (req, res) => {
  const { q } = req.query;
  res.json({ status: 200, creator: 'Crazy', response: `Deepseek R1 response to "${q}"` });
});

// --- Downloader Endpoints ---
app.get('/api/tiktok', (req, res) => {
  const { url } = req.query;
  res.json({ status: 200, creator: 'Crazy', response: `TikTok download for "${url}"` });
});

app.get('/api/igdl', (req, res) => {
  const { quality, url } = req.query;
  res.json({ status: 200, creator: 'Crazy', response: `Instagram download (quality ${quality}) for "${url}"` });
});

app.get('/api/tiktok2', (req, res) => {
  const { url } = req.query;
  res.json({ status: 200, creator: 'Crazy', response: `TikTok2 download for "${url}"` });
});

app.get('/api/facebook', (req, res) => {
  const { url } = req.query;
  res.json({ status: 200, creator: 'Crazy', response: `Facebook download for "${url}"` });
});

app.get('/api/applemusic', (req, res) => {
  const { q } = req.query;
  res.json({ status: 200, creator: 'Crazy', response: `Apple Music download for "${q}"` });
});

app.get('/api/ytdl', (req, res) => {
  const { format, url } = req.query;
  res.json({ status: 200, creator: 'Crazy', response: `YouTube download (format ${format}) for "${url}"` });
});

app.get('/api/yta', (req, res) => {
  const { url } = req.query;
  res.json({ status: 200, creator: 'Crazy', response: `YouTube audio download for "${url}"` });
});

app.get('/api/ytv', (req, res) => {
  const { url } = req.query;
  res.json({ status: 200, creator: 'Crazy', response: `YouTube video download for "${url}"` });
});

app.get('/api/ytplay', (req, res) => {
  const { q } = req.query;
  res.json({ status: 200, creator: 'Crazy', response: `YouTube play for "${q}"` });
});

app.get('/api/gitclone', (req, res) => {
  const { url } = req.query;
  res.json({ status: 200, creator: 'Crazy', response: `Git clone for "${url}"` });
});

// --- Search Endpoints ---
app.get('/api/pinterest', (req, res) => {
  const { q } = req.query;
  res.json({ status: 200, creator: 'Crazy', response: `Pinterest search for "${q}"` });
});

app.get('/api/npmsearch', (req, res) => {
  const { q } = req.query;
  res.json({ status: 200, creator: 'Crazy', response: `NPM search for "${q}"` });
});

app.get('/api/tiktoksearch', (req, res) => {
  const { q } = req.query;
  res.json({ status: 200, creator: 'Crazy', response: `TikTok search for "${q}"` });
});

app.get('/api/spotifysearch', (req, res) => {
  const { q } = req.query;
  res.json({ status: 200, creator: 'Crazy', response: `Spotify search for "${q}"` });
});

app.get('/api/lyrics', (req, res) => {
  const { q } = req.query;
  res.json({ status: 200, creator: 'Crazy', response: `Lyrics search for "${q}"` });
});

app.get('/api/technews', (req, res) => {
  res.json({ status: 200, creator: 'Crazy', response: `Latest tech news` });
});

app.get('/api/yts', (req, res) => {
  const { q } = req.query;
  res.json({ status: 200, creator: 'Crazy', response: `YouTube search for "${q}"` });
});

app.get('/api/searchimage', (req, res) => {
  const { query } = req.query;
  res.json({ status: 200, creator: 'Crazy', response: `Image search for "${query}"` });
});

// --- Anime Endpoints ---
app.get('/api/anisearch', (req, res) => {
  const { q } = req.query;
  res.json({ status: 200, creator: 'Crazy', response: `Anime search for "${q}"` });
});

app.get('/api/anidl', (req, res) => {
  const { url } = req.query;
  res.json({ status: 200, creator: 'Crazy', response: `Anime download for "${url}"` });
});

app.get('/api/animesearch', (req, res) => {
  const { q } = req.query;
  res.json({ status: 200, creator: 'Crazy', response: `Alternative anime search for "${q}"` });
});

// --- Stalk Endpoints ---
app.get('/api/tiktokstalk', (req, res) => {
  const { q } = req.query;
  res.json({ status: 200, creator: 'Crazy', response: `TikTok stalk for "${q}"` });
});

// --- Tool Endpoints ---
app.get('/api/enhance', (req, res) => {
  const { url } = req.query;
  res.json({ status: 200, creator: 'Crazy', response: `Image enhance for "${url}"` });
});

app.get('/api/randomImage', (req, res) => {
  res.json({ status: 200, creator: 'Crazy', response: `Random image` });
});

app.get('/api/ssweb', (req, res) => {
  const { url } = req.query;
  res.json({ status: 200, creator: 'Crazy', response: `Screenshot for "${url}"` });
});

app.get('/api/tinyurl', (req, res) => {
  const { url } = req.query;
  res.json({ status: 200, creator: 'Crazy', response: `Shortened URL for "${url}"` });
});

app.get('/api/translate', (req, res) => {
  const { text, to } = req.query;
  res.json({ status: 200, creator: 'Crazy', response: `Translation of "${text}" to "${to}"` });
});

app.get('/api/removebg', (req, res) => {
  const { url } = req.query;
  res.json({ status: 200, creator: 'Crazy', response: `Remove background for "${url}"` });
});

app.get('/api/txt2img', (req, res) => {
  const { q } = req.query;
  res.json({ status: 200, creator: 'Crazy', response: `Text to image for "${q}"` });
});

// --- Random Endpoints ---
app.get('/api/randomquotes', (req, res) => {
  res.json({ status: 200, creator: 'Crazy', response: `Random quote` });
});

app.get('/api/facts', (req, res) => {
  res.json({ status: 200, creator: 'Crazy', response: `Random fact` });
});

// --- Images Endpoints ---
app.get('/api/waifu', (req, res) => {
  res.json({ status: 200, creator: 'Crazy', response: `Waifu image` });
});

app.get('/api/cosplay', (req, res) => {
  res.json({ status: 200, creator: 'Crazy', response: `Cosplay image` });
});

app.get('/api/couplepp', (req, res) => {
  res.json({ status: 200, creator: 'Crazy', response: `Couple PP image` });
});

app.get('/api/bluearchive', (req, res) => {
  res.json({ status: 200, creator: 'Crazy', response: `Blue Archive image` });
});

app.get('/api/wallpaper/technology', (req, res) => {
  res.json({ status: 200, creator: 'Crazy', response: `Technology wallpaper` });
});

app.get('/api/wallpaper/programming', (req, res) => {
  res.json({ status: 200, creator: 'Crazy', response: `Programming wallpaper` });
});

// --- NSFW Endpoints ---
app.get('/api/nsfw/pussy', (req, res) => {
  res.json({ status: 200, creator: 'Crazy', response: `NSFW pussy content` });
});

app.get('/api/nsfw/cuckold', (req, res) => {
  res.json({ status: 200, creator: 'Crazy', response: `NSFW cuckold content` });
});

app.get('/api/nsfw/yuri', (req, res) => {
  res.json({ status: 200, creator: 'Crazy', response: `NSFW yuri content` });
});

app.get('/api/nsfw/milf', (req, res) => {
  res.json({ status: 200, creator: 'Crazy', response: `NSFW milf content` });
});

app.get('/api/nsfw/blowjob', (req, res) => {
  res.json({ status: 200, creator: 'Crazy', response: `NSFW blowjob content` });
});

// --- Stats Endpoint (from your HTML card) ---
app.get('/api/stats', (req, res) => {
  res.json({ status: true, creator: 'Crazy', msg: 'Server is running', uptime: process.uptime() });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
