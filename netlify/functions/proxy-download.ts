import axios from 'axios';
import { Handler } from '@netlify/functions';

export const handler: Handler = async (event, context) => {
  const url = event.queryStringParameters?.url;
  const filename = event.queryStringParameters?.filename;

  if (!url) {
    return { statusCode: 400, body: 'URL is required' };
  }

  try {
    const response = await axios({
      method: 'get',
      url: url as string,
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36'
      }
    });

    const name = filename || `video_${Date.now()}.mp4`;
    const isPhoto = name.toLowerCase().endsWith('.jpg') || name.toLowerCase().endsWith('.jpeg') || name.toLowerCase().endsWith('.png');
    const isAudio = name.toLowerCase().endsWith('.mp3');
    
    const contentType = isPhoto ? 'image/jpeg' : (isAudio ? 'audio/mpeg' : 'video/mp4');

    return {
      statusCode: 200,
      headers: {
        'Content-Disposition': `attachment; filename="${name}"`,
        'Content-Type': contentType,
      },
      body: Buffer.from(response.data).toString('base64'),
      isBase64Encoded: true,
    };
  } catch (error: any) {
    console.error('Download proxy error:', error.message);
    return { statusCode: 500, body: 'Failed to proxy download' };
  }
};
