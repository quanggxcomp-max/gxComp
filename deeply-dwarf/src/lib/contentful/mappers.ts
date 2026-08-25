import type { Entry, EntrySkeletonType } from 'contentful';
import type { CategoryPageData, ProductCardData } from './types';

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
  category?: Entry<EntrySkeletonType & { fields: CategoryFields }>;
};

export function formatPrice(price: string): string {
  if (price.includes('₫')) return price;
  return price.replace(/\s*VND\s*$/i, ' ₫').trim();
}

export function productPlaceholderImage(name: string, size = '200x160'): string {
  const label = encodeURIComponent(name.slice(0, 24));
  return `https://placehold.co/${size}?text=${label}`;
}

export function mapProductEntry(
  entry: Entry<EntrySkeletonType & { fields: ProductFields }>,
  imageSize = '200x160'
): ProductCardData {
  const fields = entry.fields;
  const category = fields.category;
  const categoryFields = category?.fields as CategoryFields | undefined;

  return {
    slug: fields.slug,
    name: fields.name,
    code: fields.code,
    price: formatPrice(fields.price),
    originalPrice: fields.originalPrice ? formatPrice(fields.originalPrice) : undefined,
    discount: fields.discount,
    promotion: fields.promotion,
    brand: fields.brand,
    warranty: fields.warranty,
    category: categoryFields?.label,
    categorySlug: categoryFields?.slug,
    isBestseller: fields.isBestseller ?? false,
    isNew: fields.isNew ?? false,
    isSale: fields.isSale ?? false,
    image: productPlaceholderImage(fields.name, imageSize),
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
