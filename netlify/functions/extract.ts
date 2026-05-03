import axios from 'axios';
import { Handler } from '@netlify/functions';

export const handler: Handler = async (event, context) => {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { url } = body;

    if (!url) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'URL is required' }),
      };
    }

    console.log(`Processing URL: ${url}`);
    
    const isTikTok = url.includes('tiktok.com');
    const isSnapchat = url.includes('snapchat.com');

    if (!isTikTok && !isSnapchat) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Unsupported URL. Please provide a TikTok or Snapchat link.' }),
      };
    }

    if (isSnapchat) {
      try {
        console.log(`Snapchat extraction started for: ${url}`);
        
        const mobileUA = 'Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36';
        
        const pageResp = await axios.get(url, {
          headers: { 
            'User-Agent': mobileUA,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          },
          timeout: 10000
        });

        const html = pageResp.data;
        
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

        return {
          statusCode: 200,
          body: JSON.stringify({
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
          })
        };
      } catch (snapError: any) {
        console.error('Snapchat extraction failed:', snapError.message);
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Failed to extract Snapchat video. Please ensure it is a valid Spotlight link.' })
        };
      }
    }

    if (isTikTok) {
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
        return {
          statusCode: 400,
          body: JSON.stringify({ error: data?.msg || 'TikTok extraction failed.' })
        };
      }

      const video = data.data;
      return {
        statusCode: 200,
        body: JSON.stringify({
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
        })
      };
    }

    return { statusCode: 400, body: JSON.stringify({ error: 'Unsupported URL' }) };

  } catch (error: any) {
    console.error('Extraction error:', error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to extract content.' })
    };
  }
};
