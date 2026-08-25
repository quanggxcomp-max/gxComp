/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly CONTENTFUL_SPACE_ID: string;
  readonly CONTENTFUL_ACCESS_TOKEN: string;
  readonly CONTENTFUL_ENVIRONMENT?: string;
  readonly CONTENTFUL_MANAGEMENT_TOKEN?: string;
}
