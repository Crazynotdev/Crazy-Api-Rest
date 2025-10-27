// index.js
require('dotenv').config();               // .env local (optional)
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

const app = express();
app.use(cors());
//app.use(express.static(__dirname)); // index.html, script.js, CSS…
const path = require('path');
app.use(express.static(path.join(__dirname, '/')));

const hf = new HfInference(process.env.HF_TOKEN);
const genius = new Genius.Client(process.env.GENIUS_TOKEN);

/* ---------- Helper ---------- */
const json = (res, obj) => res.json({ status: 200, creator: 'Crazy', ...obj });
const err = (res, msg) => res.status(500).json({ error: msg });

/* ---------- AI ---------- */
const ai = async (model, prompt) => {
  const out = await hf.textGeneration({
    model,
    inputs: prompt,
    parameters: { max_new_tokens: 180, temperature: 0.7 }
  });
  return out.generated_text;
};

app.get('/api/gptlogic', async (req, res) => {
  const { q, prompt = '' } = req.query;
  try { json(res, { response: await ai('google/gemma-2b-it', `${prompt} ${q}`) }); }
  catch (e) { err(res, e.message); }
});

app.get('/api/gpt-5', async (req, res) => {
  const { q } = req.query;
  try { json(res, { response: await ai('Qwen/Qwen2.5-72B-Instruct', q) }); }
  catch (e) { err(res, e.message); }
});

app.get('/api/qwen', async (req, res) => {
  const { q } = req.query;
  try { json(res, { response: await ai('Qwen/Qwen2.5-7B-Instruct', q) }); }
  catch (e) { err(res, e.message); }
});

/* ---------- Downloader ---------- */
app.get('/api/ytdl', async (req, res) => {
  const { url, format = 'highest' } = req.query;
  try {
    const info = await ytdl.getInfo(url);
    const fmt = ytdl.chooseFormat(info.formats, { quality: format });
    json(res, { downloadUrl: fmt.url });
  } catch (e) { err(res, e.message); }
});

app.get('/api/yta', async (req, res) => {
  const { url } = req.query;
  try {
    const info = await ytdl.getInfo(url);
    const fmt = ytdl.chooseFormat(info.formats, { quality: 'highestaudio' });
    json(res, { downloadUrl: fmt.url });
  } catch (e) { err(res, e.message); }
});

/* ---------- Search ---------- */
app.get('/api/pinterest', async (req, res) => {
  const { q } = req.query;
  try {
    const { data } = await axios.get(`https://api.unsplash.com/search/photos?query=${q}&client_id=YOUR_UNSPLASH_KEY`);
    json(res, { images: data.results.map(i => i.urls.small) });
  } catch (e) { err(res, e.message); }
});

app.get('/api/npmsearch', async (req, res) => {
  const { q } = req.query;
  try {
    const data = await npmFetch.json(`/v1/search?text=${q}`);
    json(res, { packages: data.objects.map(o => o.package) });
  } catch (e) { err(res, e.message); }
});

app.get('/api/lyrics', async (req, res) => {
  const { q } = req.query;
  try {
    const songs = await genius.songs.search(q);
    const lyrics = await songs[0].lyrics();
    json(res, { lyrics });
  } catch (e) { err(res, e.message); }
});

app.get('/api/ytplay', async (req, res) => {
  const { q } = req.query;
  try {
    const r = await ytSearch(q);
    json(res, { videos: r.videos.slice(0, 10) });
  } catch (e) { err(res, e.message); }
});

/* ---------- Tools ---------- */
app.get('/api/translate', async (req, res) => {
  const { text, to = 'en' } = req.query;
  try {
    const r = await translate(text, { to });
    json(res, { translated: r.text });
  } catch (e) { err(res, e.message); }
});

app.get('/api/enhance', async (req, res) => {
  const { url } = req.query;
  try {
    const img = await axios.get(url, { responseType: 'arraybuffer' });
    const out = await sharp(img.data).resize({ width: 1920, kernel: sharp.kernel.lanczos3 }).toBuffer();
    res.type('image/webp').send(out);
  } catch (e) { err(res, e.message); }
});

app.get('/api/removebg', async (req, res) => {
  const { url } = req.query;
  try {
    const { data } = await axios.post(
      'https://api.remove.bg/v1.0/removebg',
      { image_url: url },
      { headers: { 'X-Api-Key': process.env.REMOVE_BG_KEY }, responseType: 'arraybuffer' }
    );
    res.type('image/png').send(data);
  } catch (e) { err(res, e.message); }
});

app.get('/api/txt2img', async (req, res) => {
  const { q } = req.query;
  try {
    const img = await hf.textToImage({
      model: 'runwayml/stable-diffusion-v1-5',
      inputs: q
    });
    const buf = Buffer.from(await img.arrayBuffer());
    res.type(img.type).send(buf);
  } catch (e) { err(res, e.message); }
});

/* ---------- Random / Images ---------- */
app.get('/api/randomquotes', async (req, res) => {
  try {
    const { data } = await axios.get('https://api.quotable.io/random');
    json(res, { quote: data });
  } catch (e) { err(res, e.message); }
});

app.get('/api/waifu', async (req, res) => {
  try {
    const { data } = await axios.get('https://api.waifu.pics/sfw/waifu');
    json(res, { url: data.url });
  } catch (e) { err(res, e.message); }
});

/* ---------- Stats ---------- */
app.get('/api/stats', (req, res) => {
  json(res, { msg: 'Server is running', uptime: process.uptime() });
});

/* ---------- 404 fallback ---------- */
app.use((req, res) => res.status(404).json({ error: 'Not found' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API listening on ${PORT}`));
