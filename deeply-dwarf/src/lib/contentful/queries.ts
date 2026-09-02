import type { Entry, EntrySkeletonType } from 'contentful';
import { getContentfulClient, getContentfulLocale } from './client';
import { mapCategoryPageData, mapProductEntry, mapSalesConsultantEntry } from './mappers';
import type { CategoryNavItem, CategoryPageData, ProductCardData, SalesConsultantData } from './types';

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

type SalesConsultantFields = {
  name: string;
  phone: string;
  order?: number;
};

const PRODUCT_SELECT = [
  'fields.name',
  'fields.slug',
  'fields.code',
  'fields.brand',
  'fields.warranty',
  'fields.price',
  'fields.originalPrice',
  'fields.discount',
  'fields.promotion',
  'fields.isBestseller',
  'fields.isNew',
  'fields.isSale',
  'fields.image',
  'fields.category',
  'sys.id',
].join(',');

async function fetchAllProducts(): Promise<ProductCardData[]> {
  const client = getContentfulClient();
  const locale = await getContentfulLocale();
  const limit = 100;
  let skip = 0;
  const items: ProductCardData[] = [];

  while (true) {
    const response = await client.getEntries<EntrySkeletonType & { fields: ProductFields }>({
      content_type: 'product',
      locale,
      include: 2,
      limit,
      skip,
      select: PRODUCT_SELECT,
    });

    items.push(...response.items.map((entry) => mapProductEntry(entry)));

    if (skip + response.items.length >= response.total) break;
    skip += limit;
  }

  return items;
}

async function fetchAllCategoryEntries() {
  const client = getContentfulClient();
  const locale = await getContentfulLocale();
  const limit = 100;
  let skip = 0;
  const items: Entry<EntrySkeletonType & { fields: CategoryFields }>[] = [];

  while (true) {
    const response = await client.getEntries<EntrySkeletonType & { fields: CategoryFields }>({
      content_type: 'category',
      locale,
      limit,
      skip,
      order: ['fields.label'],
    });

    items.push(...response.items);

    if (skip + response.items.length >= response.total) break;
    skip += limit;
  }

  return items;
}

export async function getCategoryNavItems(): Promise<CategoryNavItem[]> {
  const categories = await fetchAllCategoryEntries();
  return categories
    .map((entry) => ({
      slug:  entry.fields.slug  as string,
      label: entry.fields.label as string,
    }))
    .filter(c => c.slug && c.label); // lọc bỏ entries lỗi
}

export async function getProductsByFlag(
  flag: 'isBestseller' | 'isNew' | 'isSale'
): Promise<ProductCardData[]> {
  const client = getContentfulClient();
  const locale = await getContentfulLocale();
  const response = await client.getEntries<EntrySkeletonType & { fields: ProductFields }>({
    content_type: 'product',
    locale,
    include: 2,
    [`fields.${flag}`]: true,
    select: PRODUCT_SELECT,
  });

  return response.items.map((entry) => mapProductEntry(entry));
}

export async function getCategoriesWithProducts(): Promise<CategoryPageData[]> {
  const [categories, products] = await Promise.all([
    fetchAllCategoryEntries(),
    fetchAllProducts(),
  ]);

  return categories.map((category) => {
    const categoryProducts = products.filter(
      (product) => product.categorySlug === category.fields.slug
    );
    return mapCategoryPageData(category, categoryProducts);
  });
}

export async function getAllProductsForPages(): Promise<ProductCardData[]> {
  return fetchAllProducts();
}

export async function getSalesConsultants(): Promise<SalesConsultantData[]> {
  const client = getContentfulClient();
  const locale = await getContentfulLocale();
  const response = await client.getEntries<EntrySkeletonType & { fields: SalesConsultantFields }>({
    content_type: 'salesConsultant',
    locale,
    order: ['fields.order', 'sys.createdAt'],
  });

  return response.items.map((entry) => mapSalesConsultantEntry(entry));
}
