import { ProductImageDisplayProps } from "@/interfaces/ProductImageProps";
import { API_URL } from "@/utils/api";
import Image from "next/image";



export function ProductImageDisplay({ images }: ProductImageDisplayProps) {
  const primaryImage = images.find(img => img.is_primary);
  const secondaryImages = images.filter(img => !img.is_primary);

  console.log("Primary Image:", primaryImage);
  console.log("Secondary Images:", secondaryImages);

  return (
    <div className="space-y-4">
      {primaryImage && (
        <div>
          <p className="text-sm font-medium mb-2">Imagen Principal Actual:</p>
          <div className="relative h-40 w-40 rounded-lg overflow-hidden">
            <Image
              src={primaryImage.image_url}
              alt="Imagen principal"
              fill
              className="object-cover"
            />
          </div>
        </div>
      )}
      
      {secondaryImages.length > 0 && (
        <div>
          <p className="text-sm font-medium mb-2">Imágenes Secundarias Actuales:</p>
          <div className="grid grid-cols-4 gap-2">
            {secondaryImages.map((image) => (
              <div key={image.id} className="relative h-24 w-24 rounded-lg overflow-hidden">
                <Image
                  src={image.image_url}
                  alt="Imagen secundaria"
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}