export type ProductCardData = {
  slug: string;
  name: string;
  code: string;
  price: string;
  originalPrice?: string;
  discount?: number;
  image: string;
  promotion?: string;
  brand?: string;
  warranty?: string;
  category?: string;
  categorySlug?: string;
  isBestseller?: boolean;
  isNew?: boolean;
  isSale?: boolean;
};

export type CategoryNavItem = {
  slug: string;
  label: string;
};

export type CategoryPageData = {
  slug: string;
  label: string;
  description: string;
  subcategories: string[];
  products: ProductCardData[];
};

export type SalesConsultantData = {
  name: string;
  phone: string;
  order?: number;
};
