import Link from "next/link"
import Image from "next/image"
import { CategoryCardProps } from "@/interfaces/CategoryCard"



export function CategoryCard({ image, title, href }: CategoryCardProps) {
    const content = (
        <div className="relative group overflow-hidden rounded-lg">
            <div className="relative aspect-[4/3]">
                <Image
                    src={image}
                    alt={title}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                />
            </div>
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <h3 className="text-white text-xl font-bold">{title}</h3>
            </div>
        </div>
    )

    if (href) {
        return (
            <Link href={href} className="block">
                {content}
            </Link>
        )
    }

    return content
}

