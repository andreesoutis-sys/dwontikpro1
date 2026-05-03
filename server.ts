import express from 'express';
import axios from 'axios';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Extraction API supporting TikTok and Instagram
  app.post('/api/extract', async (req, res) => {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    try {
      console.log(`Processing URL: ${url}`);
      
      const isTikTok = url.includes('tiktok.com');
      const isSnapchat = url.includes('snapchat.com');

      if (!isTikTok && !isSnapchat) {
        return res.status(400).json({ error: 'Unsupported URL. Please provide a TikTok or Snapchat link.' });
      }

      if (isSnapchat) {
        try {
          console.log(`Snapchat extraction started for: ${url}`);
          
          const mobileUA = 'Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36';
          const agent = new (await import('https')).Agent({ rejectUnauthorized: false });

          // Try direct scrape for Snapchat Spotlight
          const pageResp = await axios.get(url, {
            headers: { 
              'User-Agent': mobileUA,
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
            },
            httpsAgent: agent,
            timeout: 10000
          });

          const html = pageResp.data;
          
          // Regex to find video URL in Snapchat Spotlight page
          // Usually found in a script tag or as a direct meta tag
          const videoMatch = html.match(/"contentUrl":"([^"]+)"/) || html.match(/"streamingUrl":"([^"]+)"/);
          const titleMatch = html.match(/"description":"([^"]+)"/) || html.match(/<title>([^<]+)<\/title>/);
          const posterMatch = html.match(/"thumbnailUrl":"([^"]+)"/) || html.match(/property="og:image" content="([^"]+)"/);
          const authorMatch = html.match(/"creatorName":"([^"]+)"/) || html.match(/"creatorNickname":"([^"]+)"/);

          if (!videoMatch) {
            throw new Error('Could not find Snapchat video source. The content might be private or expired.');
          }

          const videoUrl = videoMatch[1].replace(/\\u002F/g, '/');
          const title = titleMatch ? titleMatch[1].replace(/\\u002F/g, '/') : 'Snapchat Spotlight';
          const poster = posterMatch ? posterMatch[1].replace(/\\u002F/g, '/') : '';
          const author = authorMatch ? authorMatch[1] : 'Snapchat User';

          return res.json({
            platform: 'snapchat',
            id: `snap_${Date.now()}`,
            title: title,
            author: {
              username: author.toLowerCase().replace(/\s+/g, '_'),
              nickname: author,
              avatar: ''
            },
            stats: {
              views: 0,
              likes: 0,
              comments: 0,
              shares: 0
            },
            video: {
              noWatermark: videoUrl,
              sd: videoUrl,
              hd: videoUrl,
              cover: poster
            },
            music: null
          });
        } catch (snapError: any) {
          console.error('Snapchat extraction failed:', snapError.message);
          return res.status(400).json({ 
            error: 'Failed to extract Snapchat video. Please ensure it is a valid Spotlight link.'
          });
        }
      }

      if (isTikTok) {
        // TikTok Extraction (using tikwm as before)
        const response = await axios.post('https://www.tikwm.com/api/', {
          url: url
        }, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          },
          transformRequest: [(data) => {
            return Object.entries(data).map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value as string)}`).join('&');
          }]
        });

        const data = response.data;
        if (!data || data.code !== 0) {
          return res.status(400).json({ error: data?.msg || 'TikTok extraction failed.' });
        }

        const video = data.data;
        return res.json({
          platform: 'tiktok',
          id: video.id,
          title: video.title || 'TikTok Video',
          author: {
            username: video.author.unique_id,
            nickname: video.author.nickname,
            avatar: video.author.avatar
          },
          stats: {
            views: video.play_count,
            likes: video.digg_count,
            comments: video.comment_count,
            shares: video.share_count
          },
          video: {
            noWatermark: video.play,
            watermark: video.wmplay,
            hd: video.hdplay || video.play,
            cover: video.cover
          },
          images: video.images || null,
          music: {
            title: video.music_info?.title,
            author: video.music_info?.author,
            play: video.music_info?.play
          }
        });
      }
    } catch (error: any) {
      console.error('Extraction error:', error.message);
      res.status(500).json({ 
        error: 'Failed to extract content. The profile might be private or the link is expired.' 
      });
    }
  });

  // Proxy download to bypass CORS and force file saving
  app.get('/api/proxy-download', async (req, res) => {
    const { url, filename } = req.query;

    if (!url) {
      return res.status(400).send('URL is required');
    }

    try {
      const agent = new (await import('https')).Agent({ rejectUnauthorized: false });
      const response = await axios({
        method: 'get',
        url: url as string,
        responseType: 'stream',
        httpsAgent: agent,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36'
        }
      });

      const name = (filename as string) || `video_${Date.now()}.mp4`;
      const isPhoto = name.toLowerCase().endsWith('.jpg') || name.toLowerCase().endsWith('.jpeg') || name.toLowerCase().endsWith('.png');
      const isAudio = name.toLowerCase().endsWith('.mp3');
      
      res.setHeader('Content-Disposition', `attachment; filename="${name}"`);
      res.setHeader('Content-Type', isPhoto ? 'image/jpeg' : (isAudio ? 'audio/mpeg' : 'video/mp4'));
      
      response.data.pipe(res);
    } catch (error: any) {
      console.error('Download proxy error:', error.message);
      res.status(500).send('Failed to proxy download');
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
