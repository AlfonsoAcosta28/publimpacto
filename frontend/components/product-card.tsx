import Link from 'next/link';
import Image from 'next/image';

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ProductCardProps {
  image: string
  title: string
  price: number | string
  badge?: string
  id?: string
}

export function ProductCard({ image, title, price, badge, id }: ProductCardProps) {
  return (
    <Link href={`/productos/${id}`} className="group">
      <div className="relative bg-white rounded-lg overflow-hidden border transition-shadow hover:shadow-md">
        <div className="relative w-full aspect-square bg-gray-100">
          <Image
            src={image || "/placeholder.svg"}
            alt={title}
            layout="fill"
            objectFit="cover"
          />
          {badge && (
            <Badge className="absolute top-2 right-2 bg-pink-600 text-white text-xs px-2 py-1 rounded-md shadow">
              {badge}
            </Badge>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-base text-gray-800 truncate mb-1">{title}</h3>
          <p className="text-lg font-bold text-pink-600">
            ${Number(price).toFixed(2)}
          </p>
        </CardContent>
      </div>
    </Link>
  )
}
