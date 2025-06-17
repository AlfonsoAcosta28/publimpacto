import { useCart } from "@/contexts/cartContext";

interface Product {
  id: string;
  title: string;
  price: number;
  image: string;
  quantity?: number;
}

export function useAddToCart() {
  const { addToCart } = useCart();

  const handleAddToCart = (product: Product) => {
    addToCart({
      ...product,
      quantity: product.quantity || 1
    });
  };

  return { handleAddToCart };
} 