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

/** Locale cố định vi-VN — space đã được cấu hình với locale này */
export async function getContentfulLocale(): Promise<string> {
  return 'vi-VN';
}

// ── Named re-export for convenience ─────────────────────────────────────────
export const contentfulClient = getContentfulClient();
