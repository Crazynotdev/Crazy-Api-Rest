const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const cors = require('cors');
const axios = require('axios');
const ytdl = require('ytdl-core');
const { HfInference } = require('@huggingface/inference');
const sharp = require('sharp');
const puppeteer = require('puppeteer');
const translate = require('google-translate-api-x');
const geniusLyrics = require('genius-lyrics');
const ytSearch = require('yt-search');
const npmRegistryFetch = require('npm-registry-fetch');
const tiktokScraper = require('tiktok-scraper'); // For TikTok search and stalk
const igdl = require('igdl'); // For Instagram DL
const facebookDl = require('facebook-dl'); // For Facebook DL
const freyr = require('freyr-js'); // For Apple Music
const AniList = require('anilist-node');
const gogoanime = require('gogoanime-downloader'); // Assuming a library, adjust if needed
const downloadGitRepo = require('download-git-repo'); // For gitclone as zip

// Environment variables
const HF_TOKEN = process.env.HF_TOKEN; // Required for Hugging Face AI
const GENIUS_TOKEN = process.env.GENIUS_TOKEN; // For lyrics
const NEWS_API_KEY = process.env.NEWS_API_KEY; // For tech news (newsapi.org free tier)
const REMOVE_BG_KEY = process.env.REMOVE_BG_KEY; // For remove.bg

if (!HF_TOKEN) {
  console.warn('HF_TOKEN not set. AI endpoints may fail.');
}

const hf = new HfInference(HF_TOKEN);

// Enable CORS for all routes
app.use(cors());

// Serve static files
app.use(express.static(__dirname));

// Helper for AI generation
async function generateAIResponse(model, query, options = {}) {
  try {
    const response = await hf.textGeneration({
      model,
      inputs: query,
      parameters: { max_new_tokens: 200, temperature: 0.7, ...options },
    });
    return response.generated_text;
  } catch (error) {
    throw new Error(`AI generation failed: ${error.message}`);
  }
}

// --- AI Endpoints ---
app.get('/api/gptlogic', async (req, res) => {
  const { q, prompt } = req.query;
  try {
    const responseText = await generateAIResponse('EleutherAI/gpt-j-6B', `${prompt}: ${q}`); // Free GPT alternative
    res.json({ status: 200, creator: 'Crazy', response: responseText });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/copilot', async (req, res) => {
  const { text } = req.query;
  try {
    const responseText = await generateAIResponse('CohereForAI/c4ai-command-r-plus', text);
    res.json({ status: 200, creator: 'Crazy', response: responseText });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/gpt-5', async (req, res) => {
  const { q } = req.query;
  try {
    const responseText = await generateAIResponse('Qwen/Qwen2.5-72B-Instruct', q); // Large model as GPT-5 proxy
    res.json({ status: 200, creator: 'Crazy', response: responseText });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/deep-ai', async (req, res) => {
  const { query } = req.query;
  try {
    const deepai = require('deepai');
    deepai.setApiKey('quickstart-QUdJIGlzIGNvbWluZy4uLi4K'); // Free quickstart key, replace with real
    const resp = await deepai.callStandardApi("text-generator", { text: query });
    res.json({ status: 200, creator: 'Crazy', response: resp.output });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/gemma2', async (req, res) => {
  const { q } = req.query;
  try {
    const responseText = await generateAIResponse('google/gemma-2-9b-it', q);
    res.json({ status: 200, creator: 'Crazy', response: responseText });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/qwen', async (req, res) => {
  const { q } = req.query;
  try {
    const responseText = await generateAIResponse('Qwen/Qwen2.5-7B-Instruct', q);
    res.json({ status: 200, creator: 'Crazy', response: responseText });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/cohere', async (req, res) => {
  const { q } = req.query;
  try {
    const responseText = await generateAIResponse('CohereForAI/c4ai-command-r-plus', q);
    res.json({ status: 200, creator: 'Crazy', response: responseText });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/deepseek-r1', async (req, res) => {
  const { q } = req.query;
  try {
    const responseText = await generateAIResponse('deepseek-ai/DeepSeek-V2-Chat', q);
    res.json({ status: 200, creator: 'Crazy', response: responseText });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- Downloader Endpoints ---
app.get('/api/tiktok', async (req, res) => {
  const { url } = req.query;
  try {
    const data = await tiktokScraper.getVideoNoWaterMark(url);
    res.json({ status: 200, creator: 'Crazy', data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/igdl', async (req, res) => {
  const { quality, url } = req.query;
  try {
    const data = await igdl.instagramDl(url);
    // Assume quality filtering if supported
    res.json({ status: 200, creator: 'Crazy', data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/tiktok2', async (req, res) => {
  const { url } = req.query;
  try {
    const data = await tiktokScraper.getVideoNoWaterMark(url); // Alternative or same
    res.json({ status: 200, creator: 'Crazy', data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/facebook', async (req, res) => {
  const { url } = req.query;
  try {
    const data = await facebookDl(url);
    res.json({ status: 200, creator: 'Crazy', data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/applemusic', async (req, res) => {
  const { q } = req.query;
  try {
    // freyr requires CLI, so simulate or use API
    // For simplicity, search and return link; actual download needs more
    const data = await axios.get(`https://itunes.apple.com/search?term=${q}&media=music`);
    res.json({ status: 200, creator: 'Crazy', results: data.data.results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/ytdl', async (req, res) => {
  const { format, url } = req.query;
  try {
    const info = await ytdl.getInfo(url);
    const downloadFormat = ytdl.chooseFormat(info.formats, { quality: 'highest' });
    res.json({ status: 200, creator: 'Crazy', downloadUrl: downloadFormat.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/yta', async (req, res) => {
  const { url } = req.query;
  try {
    const info = await ytdl.getInfo(url);
    const audioFormat = ytdl.chooseFormat(info.formats, { quality: 'highestaudio' });
    res.json({ status: 200, creator: 'Crazy', downloadUrl: audioFormat.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/ytv', async (req, res) => {
  const { url } = req.query;
  try {
    const info = await ytdl.getInfo(url);
    const videoFormat = ytdl.chooseFormat(info.formats, { quality: 'highestvideo' });
    res.json({ status: 200, creator: 'Crazy', downloadUrl: videoFormat.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/ytplay', async (req, res) => {
  const { q } = req.query;
  try {
    const result = await ytSearch(q);
    res.json({ status: 200, creator: 'Crazy', results: result.videos });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/gitclone', (req, res) => {
  const { url } = req.query;
  try {
    const repo = url.replace('https://github.com/', '');
    downloadGitRepo(repo, './temp', { clone: false }, (err) => {
      if (err) throw err;
      res.download('./temp.zip'); // Assume zipped
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- Search Endpoints ---
app.get('/api/pinterest', async (req, res) => {
  const { q } = req.query;
  try {
    const data = await axios.get(`https://api.pinterest.com/v3/pidgets/search/pins/?query=${q}`); // Unofficial, may need adjustment
    res.json({ status: 200, creator: 'Crazy', results: data.data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/npmsearch', async (req, res) => {
  const { q } = req.query;
  try {
    const data = await npmRegistryFetch.json(`/v1/search?text=${q}`);
    res.json({ status: 200, creator: 'Crazy', results: data.objects });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/tiktoksearch', async (req, res) => {
  const { q } = req.query;
  try {
    const data = await tiktokScraper.hashtag(q, { number: 10 });
    res.json({ status: 200, creator: 'Crazy', results: data.collector });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/spotifysearch', async (req, res) => {
  const { q } = req.query;
  try {
    // Requires Spotify API key for real, but for free, use public search if possible
    const data = await axios.get(`https://api.spotify.com/v1/search?q=${q}&type=track`, { headers: { Authorization: 'Bearer YOUR_TOKEN' } });
    res.json({ status: 200, creator: 'Crazy', results: data.data.tracks.items });
  } catch (error) {
    res.status(500).json({ error: 'Spotify requires API token' });
  }
});

app.get('/api/lyrics', async (req, res) => {
  const { q } = req.query;
  try {
    const Client = new geniusLyrics.Client(GENIUS_TOKEN);
    const searches = await Client.songs.search(q);
    const lyrics = await searches[0].lyrics();
    res.json({ status: 200, creator: 'Crazy', lyrics });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/technews', async (req, res) => {
  try {
    const data = await axios.get(`https://newsapi.org/v2/top-headlines?category=technology&apiKey=${NEWS_API_KEY}`);
    res.json({ status: 200, creator: 'Crazy', articles: data.data.articles });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/yts', async (req, res) => {
  const { q } = req.query;
  try {
    const result = await ytSearch(q);
    res.json({ status: 200, creator: 'Crazy', results: result.all });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/searchimage', async (req, res) => {
  const { query } = req.query;
  try {
    const data = await axios.get(`https://customsearch.googleapis.com/customsearch/v1?q=${query}&searchType=image&key=YOUR_GOOGLE_KEY&cx=YOUR_CSE_ID`);
    res.json({ status: 200, creator: 'Crazy', items: data.data.items });
  } catch (error) {
    res.status(500).json({ error: 'Requires Google API key' });
  }
});

// --- Anime Endpoints ---
app.get('/api/anisearch', async (req, res) => {
  const { q } = req.query;
  try {
    const anilist = new AniList();
    const data = await anilist.search('anime', q);
    res.json({ status: 200, creator: 'Crazy', results: data.media });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/anidl', async (req, res) => {
  const { url } = req.query;
  try {
    // Assuming gogoanime library
    const data = await gogoanime.download(url);
    res.json({ status: 200, creator: 'Crazy', download: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/animesearch', async (req, res) => {
  const { q } = req.query;
  try {
    const anilist = new AniList();
    const data = await anilist.search('anime', q);
    res.json({ status: 200, creator: 'Crazy', results: data.media });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- Stalk Endpoints ---
app.get('/api/tiktokstalk', async (req, res) => {
  const { q } = req.query;
  try {
    const data = await tiktokScraper.user(q, { number: 1 });
    res.json({ status: 200, creator: 'Crazy', profile: data.collector[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- Tool Endpoints ---
app.get('/api/enhance', async (req, res) => {
  const { url } = req.query;
  try {
    const imageBuffer = await axios.get(url, { responseType: 'arraybuffer' });
    const enhanced = await sharp(imageBuffer.data).resize({ width: 2 * await sharp(imageBuffer.data).metadata().width, kernel: sharp.kernel.lanczos3 }).toBuffer();
    res.type('image/png').send(enhanced);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/randomImage', async (req, res) => {
  try {
    const { data } = await axios.get('https://source.unsplash.com/random');
    res.json({ status: 200, creator: 'Crazy', url: data.request.res.responseUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/ssweb', async (req, res) => {
  const { url } = req.query;
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);
    const screenshot = await page.screenshot({ fullPage: true });
    await browser.close();
    res.type('image/png').send(screenshot);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/tinyurl', async (req, res) => {
  const { url } = req.query;
  try {
    const { data } = await axios.get(`http://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`);
    res.json({ status: 200, creator: 'Crazy', shortUrl: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/translate', async (req, res) => {
  const { text, to } = req.query;
  try {
    const result = await translate(text, { to });
    res.json({ status: 200, creator: 'Crazy', translated: result.text });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/removebg', async (req, res) => {
  const { url } = req.query;
  try {
    const { data } = await axios.post('https://api.remove.bg/v1.0/removebg', { image_url: url, size: 'auto' }, { headers: { 'X-Api-Key': REMOVE_BG_KEY }, responseType: 'arraybuffer' });
    res.type('image/png').send(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/txt2img', async (req, res) => {
  const { q } = req.query;
  try {
    const blob = await hf.textToImage({ model: 'CompVis/stable-diffusion-v1-4', inputs: q, parameters: { negative_prompt: 'blurry' } });
    const buffer = Buffer.from(await blob.arrayBuffer());
    res.type(blob.type).send(buffer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- Random Endpoints ---
app.get('/api/randomquotes', async (req, res) => {
  try {
    const { data } = await axios.get('https://api.quotable.io/random');
    res.json({ status: 200, creator: 'Crazy', quote: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/facts', async (req, res) => {
  try {
    const { data } = await axios.get('https://api.api-ninjas.com/v1/facts', { headers: { 'X-Api-Key': 'free' } }); // Free with limits
    res.json({ status: 200, creator: 'Crazy', fact: data[0].fact });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- Images Endpoints ---
app.get('/api/waifu', async (req, res) => {
  try {
    const { data } = await axios.get('https://api.waifu.pics/sfw/waifu');
    res.json({ status: 200, creator: 'Crazy', url: data.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/cosplay', async (req, res) => {
  try {
    // Use waifu.pics or similar for cosplay, assume custom
    const { data } = await axios.get('https://api.waifu.pics/sfw/shinobu'); // Placeholder
    res.json({ status: 200, creator: 'Crazy', url: data.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/couplepp', async (req, res) => {
  try {
    const { data } = await axios.get('https://api.waifu.pics/sfw/couple');
    res.json({ status: 200, creator: 'Crazy', url: data.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/bluearchive', async (req, res) => {
  try {
    // Custom, use Pinterest or waifu alternative
    const { data } = await axios.get('https://api.waifu.pics/sfw/waifu');
    res.json({ status: 200, creator: 'Crazy', url: data.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/wallpaper/technology', async (req, res) => {
  try {
    const { data } = await axios.get('https://source.unsplash.com/random/?technology');
    res.json({ status: 200, creator: 'Crazy', url: data.request.res.responseUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/wallpaper/programming', async (req, res) => {
  try {
    const { data } = await axios.get('https://source.unsplash.com/random/?programming');
    res.json({ status: 200, creator: 'Crazy', url: data.request.res.responseUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- NSFW Endpoints ---
app.get('/api/nsfw/pussy', async (req, res) => {
  try {
    const { data } = await axios.get('https://api.waifu.pics/nsfw/waifu'); // waifu.pics has NSFW, adjust category
    res.json({ status: 200, creator: 'Crazy', url: data.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/nsfw/cuckold', async (req, res) => {
  try {
    const { data } = await axios.get('https://api.waifu.pics/nsfw/waifu');
    res.json({ status: 200, creator: 'Crazy', url: data.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/nsfw/yuri', async (req, res) => {
  try {
    const { data } = await axios.get('https://api.waifu.pics/nsfw/yuri');
    res.json({ status: 200, creator: 'Crazy', url: data.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/nsfw/milf', async (req, res) => {
  try {
    const { data } = await axios.get('https://api.waifu.pics/nsfw/waifu');
    res.json({ status: 200, creator: 'Crazy', url: data.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/nsfw/blowjob', async (req, res) => {
  try {
    const { data } = await axios.get('https://api.waifu.pics/nsfw/blowjob');
    res.json({ status: 200, creator: 'Crazy', url: data.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- Stats Endpoint ---
app.get('/api/stats', (req, res) => {
  res.json({ status: true, creator: 'Crazy', msg: 'Server is running', uptime: process.uptime() });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
