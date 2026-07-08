"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface ProductGalleryProps {
  name: string;
  images: string[];
  badge?: string | null;
  discountLabel?: string | null;
}

export default function ProductGallery({
  name,
  images,
  badge,
  discountLabel,
}: ProductGalleryProps) {
  const galleryImages = images.length ? images : ["/images/products/placeholder.jpg"];
  const [selectedImage, setSelectedImage] = useState(galleryImages[0]);

  useEffect(() => {
    setSelectedImage(galleryImages[0]);
  }, [galleryImages]);

  return (
    <div className="min-w-0 bg-gray-50 p-4 md:p-6">
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-white">
        <Image
          src={selectedImage}
          alt={name}
          fill
          className="object-cover"
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        {badge && (
          <span className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg font-tajawal">
            {badge}
          </span>
        )}
        {discountLabel && (
          <span className="absolute top-16 right-4 bg-pink text-white text-xs font-bold px-3 py-1.5 rounded-lg font-tajawal">
            {discountLabel}
          </span>
        )}
      </div>

      {galleryImages.length > 1 && (
        <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
          {galleryImages.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setSelectedImage(image)}
              className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-colors ${
                selectedImage === image ? "border-pink" : "border-transparent"
              }`}
              aria-label={`عرض صورة ${index + 1} للمنتج`}
            >
              <Image src={image} alt={`${name} ${index + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}