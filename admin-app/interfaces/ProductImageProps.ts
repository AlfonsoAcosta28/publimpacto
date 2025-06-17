export interface ProductImageDisplayProps {
    images: {
      id: number;
      image_url: string;
      is_primary: boolean;
    }[];
  }