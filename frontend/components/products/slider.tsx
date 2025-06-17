"use client"

import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductInterface } from "@/interfaces/Product"
import { ProductCard } from "@/components/product-card"

interface SlidingProductsCarouselProps {
  products: ProductInterface[];
  title?: string;
}

export default function SlidingProductsCarousel({ products, title = "Productos que te podrían interesar" }: SlidingProductsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const carouselRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Duplicamos los productos para crear el efecto infinito
  const duplicatedProducts = [...products, ...products];
  const cardWidth = 280; // ancho de cada tarjeta + margen

  useEffect(() => {
    if (!isHovered && products.length > 0) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex(prevIndex => prevIndex + 1);
      }, 3000); // Cambia cada 3 segundos
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isHovered, products.length]);

  useEffect(() => {
    if (carouselRef.current) {
      carouselRef.current.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
      
      // Cuando llegamos al final de los productos originales, reiniciamos sin transición
      if (currentIndex >= products.length) {
        setTimeout(() => {
          setIsTransitioning(false);
          setCurrentIndex(0);
          if (carouselRef.current) {
            carouselRef.current.style.transform = `translateX(0px)`;
          }
          // Reactiva la transición después de un frame
          setTimeout(() => {
            setIsTransitioning(true);
          }, 50);
        }, 500); // Espera a que termine la transición actual
      }
    }
  }, [currentIndex, products.length]);

  const handlePrevious = () => {
    if (currentIndex === 0) {
      // Si estamos en el primer elemento, vamos al último sin transición
      setIsTransitioning(false);
      setCurrentIndex(products.length);
      if (carouselRef.current) {
        carouselRef.current.style.transform = `translateX(-${products.length * cardWidth}px)`;
      }
      setTimeout(() => {
        setIsTransitioning(true);
        setCurrentIndex(products.length - 1);
      }, 50);
    } else {
      setCurrentIndex(prevIndex => prevIndex - 1);
    }
  };

  const handleNext = () => {
    setCurrentIndex(prevIndex => prevIndex + 1);
  };

  const handleDotClick = (index: number) => {
    setCurrentIndex(index);
  };

  if (products.length === 0) return null;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {title}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={handlePrevious}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNext}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div 
        className="relative overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div 
          ref={carouselRef}
          className={`flex ${isTransitioning ? 'transition-transform duration-500 ease-in-out' : ''}`}
          style={{ width: `${duplicatedProducts.length * cardWidth}px` }}
        >
          {duplicatedProducts.map((product, index) => (
            <div
              key={`${product.id}-${index}`}
              className="flex-shrink-0 w-64 mx-2"
            >
              <ProductCard
                id={product.id}
                image={product.image || "/placeholder.svg"}
                title={product.title}
                price={product.price}
                badge={product.badge}
              />
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex justify-center mt-6 gap-2">
        {products.map((_, index) => (
          <button
            key={index}
            onClick={() => handleDotClick(index)}
            className={`w-2 h-2 rounded-full transition-colors duration-200 ${
              (currentIndex % products.length) === index
                ? 'bg-blue-600'
                : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
}