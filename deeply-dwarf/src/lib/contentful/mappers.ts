import type { Asset, Entry, EntrySkeletonType } from 'contentful';
import type { CategoryPageData, ProductCardData, SalesConsultantData } from './types';

type CategoryFields = {
  label: string;
  slug: string;
  description?: string;
  subcategories?: string[];
};

type ProductFields = {
  name: string;
  slug: string;
  code: string;
  brand?: string;
  warranty?: string;
  price: string;
  originalPrice?: string;
  discount?: number;
  promotion?: string;
  isBestseller?: boolean;
  isNew?: boolean;
  isSale?: boolean;
  image?: Asset;
  category?: Entry<EntrySkeletonType & { fields: CategoryFields }>;
};

type SalesConsultantFields = {
  name: string;
  phone: string;
  order?: number;
};

export function formatPrice(price: string): string {
  if (price.includes('₫')) return price;
  return price.replace(/\s*VND\s*$/i, ' ₫').trim();
}

export function productPlaceholderImage(name: string, size = '200x160'): string {
  const label = encodeURIComponent(name.slice(0, 24));
  return `https://placehold.co/${size}?text=${label}`;
}

function resolveAssetUrl(asset?: Asset): string | undefined {
  const url = asset?.fields?.file?.url;
  if (!url) return undefined;
  return url.startsWith('//') ? `https:${url}` : url;
}

export function mapProductEntry(
  entry: Entry<EntrySkeletonType & { fields: ProductFields }>,
  imageSize = '200x160'
): ProductCardData {
  const fields = entry.fields;

  // category có thể là Link chưa resolve hoặc Entry đã resolve
  const category = fields.category as any;
  const categoryFields = category?.fields as CategoryFields | undefined;
  const categoryLabel = categoryFields?.label as string | undefined;
  const categorySlug  = categoryFields?.slug  as string | undefined;

  // price đảm bảo luôn có giá trị
  const rawPrice = (fields.price as string) ?? 'Liên hệ';

  return {
    slug:          fields.slug  as string,
    name:          fields.name  as string,
    code:          fields.code  as string,
    price:         formatPrice(rawPrice),
    originalPrice: fields.originalPrice ? formatPrice(fields.originalPrice as string) : undefined,
    discount:      fields.discount      as number | undefined,
    promotion:     fields.promotion     as string | undefined,
    brand:         fields.brand         as string | undefined,
    warranty:      fields.warranty      as string | undefined,
    category:      categoryLabel,
    categorySlug:  categorySlug,
    isBestseller:  (fields.isBestseller as boolean) ?? false,
    isNew:         (fields.isNew        as boolean) ?? false,
    isSale:        (fields.isSale       as boolean) ?? false,
    image:         resolveAssetUrl(fields.image) ?? productPlaceholderImage(fields.name as string, imageSize),
  };
}

export function mapCategoryPageData(
  categoryEntry: Entry<EntrySkeletonType & { fields: CategoryFields }>,
  products: ProductCardData[]
): CategoryPageData {
  const fields = categoryEntry.fields;

  return {
    slug: fields.slug,
    label: fields.label,
    description: fields.description ?? '',
    subcategories: fields.subcategories ?? [],
    products,
  };
}

export function mapSalesConsultantEntry(
  entry: Entry<EntrySkeletonType & { fields: SalesConsultantFields }>
): SalesConsultantData {
  const fields = entry.fields;

  return {
    name: fields.name,
    phone: fields.phone,
    order: fields.order,
  };
}
