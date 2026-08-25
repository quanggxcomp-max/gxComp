import { createClient } from 'contentful';

const LOCALE_CANDIDATES = ['vi-VN', 'en-US'] as const;

let resolvedLocale: string | null = null;

export function getContentfulClient() {
  const space = import.meta.env.CONTENTFUL_SPACE_ID;
  const accessToken = import.meta.env.CONTENTFUL_ACCESS_TOKEN;
  const environment = import.meta.env.CONTENTFUL_ENVIRONMENT ?? 'master';

  if (!space || !accessToken) {
    throw new Error(
      'Missing Contentful credentials. Add CONTENTFUL_SPACE_ID and CONTENTFUL_ACCESS_TOKEN to deeply-dwarf/.env'
    );
  }

  return createClient({ space, accessToken, environment });
}

export async function getContentfulLocale(): Promise<string> {
  if (resolvedLocale) return resolvedLocale;

  const client = getContentfulClient();

  for (const locale of LOCALE_CANDIDATES) {
    const probe = await client.getEntries({
      content_type: 'category',
      locale,
      limit: 1,
    });

    if (probe.total > 0) {
      resolvedLocale = locale;
      return locale;
    }
  }

  resolvedLocale = LOCALE_CANDIDATES[0];
  return resolvedLocale;
}
