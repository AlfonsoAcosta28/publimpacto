export interface ProductImage {
  id: number;
  product_id: number;
  image_url: string;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  title: string;
}

export interface Product {
  id: number;
  title: string;
  description: string;
  base_price: number;
  badge?: string;
  category_id: number;
  activo: boolean;
  created_at: string;
  updated_at: string;
  image?: string; // URL de la imagen principal
  ProductImages?: ProductImage[];
  category?: Category;
  discount_percentage?: number;
  personalization_price?: number;
}

export interface CreateProductData {
  title: string;
  description: string;
  base_price: number;
  badge?: string;
  category_id: number;
}

export interface UpdateProductData {
  title?: string;
  description?: string;
  base_price?: number;
  badge?: string;
  category_id?: number;
} 