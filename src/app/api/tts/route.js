import { getAudioUrl } from 'google-tts-api';
import { BASE_CHARS, RECIPES } from '@/app/data';

const GOOGLE_TTS_HOST = 'https://translate.google.com';
const MAX_AUDIO_BYTES = 1_000_000;
const AVAILABLE_CHARACTERS = new Set([
  ...Object.keys(BASE_CHARS),
  ...Object.values(RECIPES).map(({ result }) => result),
]);

const errorResponse = (message, status) =>
  Response.json(
    { error: message },
    {
      status,
      headers: {
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    }
  );

export async function GET(request) {
  const character = new URL(request.url).searchParams.get('text') ?? '';

  if (!AVAILABLE_CHARACTERS.has(character)) {
    return errorResponse('Unsupported character.', 400);
  }

  try {
    const audioUrl = getAudioUrl(character, {
      lang: 'zh-CN',
      slow: false,
      host: GOOGLE_TTS_HOST,
    });
    const upstream = await fetch(audioUrl, {
      cache: 'force-cache',
      signal: AbortSignal.timeout(8_000),
      headers: {
        Accept: 'audio/mpeg,audio/*;q=0.9',
      },
    });

    if (!upstream.ok) {
      return errorResponse('Pronunciation is temporarily unavailable.', 502);
    }

    const contentType = upstream.headers.get('content-type') ?? '';
    const contentLength = Number(upstream.headers.get('content-length') ?? 0);

    if (
      !contentType.toLowerCase().startsWith('audio/') ||
      (contentLength > 0 && contentLength > MAX_AUDIO_BYTES)
    ) {
      return errorResponse('Pronunciation is temporarily unavailable.', 502);
    }

    const audio = await upstream.arrayBuffer();
    if (audio.byteLength === 0 || audio.byteLength > MAX_AUDIO_BYTES) {
      return errorResponse('Pronunciation is temporarily unavailable.', 502);
    }

    return new Response(audio, {
      headers: {
        'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400',
        'Content-Length': String(audio.byteLength),
        'Content-Type': contentType,
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('TTS request failed:', error instanceof Error ? error.message : 'Unknown error');
    return errorResponse('Pronunciation is temporarily unavailable.', 502);
  }
}
