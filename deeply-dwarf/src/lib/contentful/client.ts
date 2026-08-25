import { createClient } from 'contentful';
import type { ContentfulClientApi } from 'contentful';

// ── Singleton client ─────────────────────────────────────────────────────────
let _client: ContentfulClientApi<any> | null = null;

export function getContentfulClient(): ContentfulClientApi<any> {
  if (!_client) {
    _client = createClient({
      space:       import.meta.env.CONTENTFUL_SPACE_ID,
      accessToken: import.meta.env.CONTENTFUL_ACCESS_TOKEN,
      environment: import.meta.env.CONTENTFUL_ENVIRONMENT ?? 'master',
    });
  }
  return _client;
}

/** Trả về locale ưu tiên: vi-VN nếu space có, fallback en-US */
let _locale: string | null = null;
export async function getContentfulLocale(): Promise<string> {
  if (_locale) return _locale;
  try {
    const client = getContentfulClient();
    const res = await client.getLocales();
    const viVN = res.items.find(l => l.code === 'vi-VN');
    _locale = viVN ? 'vi-VN' : 'en-US';
  } catch {
    _locale = 'en-US';
  }
  return _locale;
}

// ── Named re-export for convenience ─────────────────────────────────────────
export const contentfulClient = getContentfulClient();
