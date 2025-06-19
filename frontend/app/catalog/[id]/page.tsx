"use client"

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import productService from "@/services/productService";
import { ProductInterface, ProductImage } from "@/interfaces/Product";
import ReactDOM from "react-dom";

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<ProductInterface | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [zoom, setZoom] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const imageContainerRef = useRef<HTMLDivElement>(null);

  // Configuración de la lupa
  const LENS_SIZE = 200;
  const ZOOM_LEVEL = 2;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await productService.getProductById(id);
        setProduct(data);
        // Selecciona la imagen principal o la primera secundaria
        if (data.ProductImages && data.ProductImages.length > 0) {
          const primary = data.ProductImages.find((img) => img.is_primary);
          setMainImage(primary ? primary.image_url : data.ProductImages[0].image_url);
        } else {
          setMainImage(data.image || "/placeholder.svg");
        }
      } catch (err) {
        setError("Error al cargar el producto");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id]);

  const handleAdd = () => setQuantity((q) => q + 1);
  const handleSubtract = () => setQuantity((q) => (q > 1 ? q - 1 : 1));

  // Renderiza la lupa fuera del contenedor de la imagen usando un portal
  const renderLens = () => {
    if (!zoom || !imageContainerRef.current) return null;
    const rect = imageContainerRef.current.getBoundingClientRect();
    const left = rect.left + window.scrollX + (zoomPosition.x - LENS_SIZE / 2);
    const top = rect.top + window.scrollY + (zoomPosition.y - LENS_SIZE / 2);
    return ReactDOM.createPortal(
      <div
        className="pointer-events-none fixed"
        style={{
          left,
          top,
          width: LENS_SIZE,
          height: LENS_SIZE,
          border: '2px solid #3b82f6',
          borderRadius: 12,
          boxShadow: '0 2px 16px rgba(0,0,0,0.18)',
          background: `url(${mainImage || "/placeholder.svg"})`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: `${350 * ZOOM_LEVEL}px ${350 * ZOOM_LEVEL}px`,
          backgroundPosition: `-${Math.max(0, (zoomPosition.x * ZOOM_LEVEL) - LENS_SIZE / 2)}px -${Math.max(0, (zoomPosition.y * ZOOM_LEVEL) - LENS_SIZE / 2)}px`,
          zIndex: 9999,
          cursor: 'none',
        }}
      />,
      document.body
    );
  };

  if (loading) return <div className="p-8 text-center">Cargando producto...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!product) return <div className="p-8 text-center">Producto no encontrado</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md mt-8 ">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-shrink-0">
          <div
            ref={imageContainerRef}
            className="relative w-[350px] h-[350px] mb-4 rounded-lg overflow-visible group"
            onMouseEnter={() => setZoom(true)}
            onMouseLeave={() => setZoom(false)}
            onMouseMove={e => {
              if (!imageContainerRef.current) return;
              const rect = imageContainerRef.current.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const y = e.clientY - rect.top;
              setZoomPosition({ x, y });
            }}
          >
            <Image
              src={mainImage || "/placeholder.svg"}
              alt={product.title}
              width={350}
              height={350}
              className="rounded-lg object-cover w-full h-full"
              style={{ display: 'block' }}
            />
          </div>
          {renderLens()}
          {/* Miniaturas de imágenes secundarias */}
          {product.ProductImages && product.ProductImages.length > 1 && (
            <div className="flex gap-2 mt-2">
              {product.ProductImages.map((img: ProductImage) => (
                <button
                  key={img.id}
                  onClick={() => setMainImage(img.image_url)}
                  className={`border rounded p-1 transition-all ${mainImage === img.image_url ? 'border-blue-500' : 'border-gray-200'}`}
                  style={{ outline: 'none' }}
                >
                  <Image
                    src={img.image_url}
                    alt={product.title}
                    width={60}
                    height={60}
                    className="object-cover rounded"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">{product.title}</h2>
            <p className="text-gray-600 mb-4">{product.description}</p>
            <div className="mb-4">
              <span className="text-2xl font-bold text-blue-600">
                ${product.personalization_price > 0 ? product.personalization_price : product.base_price}
              </span>
              {product.personalization_price > 0 && (
                <span className="ml-2 text-sm text-gray-500 line-through">${product.base_price}</span>
              )}
              {product.discount_percentage > 0 && (
                <span className="ml-2 text-xs text-green-600 font-semibold">
                  {product.discount_percentage}% de descuento
                </span>
              )}
            </div>
            {product.badge && (
              <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold mb-2">
                {product.badge}
              </span>
            )}
            {product.inventory && (
              <div className="mb-2 text-sm text-gray-500">
                Stock disponible: {product.inventory.stock_quantity}
              </div>
            )}
          </div>
          <div className="flex items-center gap-4 mt-6">
            <Button onClick={handleSubtract} variant="outline" size="icon">-</Button>
            <span className="text-lg font-semibold w-8 text-center">{quantity}</span>
            <Button onClick={handleAdd} variant="outline" size="icon">+</Button>
            <Button className="ml-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">Agregar al carrito</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

