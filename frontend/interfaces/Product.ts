export interface ProductImage {
  id: string;
  image_url: string;
}

export interface Inventory {
  stock_quantity: number;
  reserved_quantity: number;
  min_stock_level: number;
  status: 'active' | 'inactive' | 'discontinued';
}

export interface ProductInterface {
  id: string;
  title: string;
  description: string;
  price: number;
  image?: string;
  ProductImages?: ProductImage[];
  inventory?: Inventory;
  category_id?: number;
}