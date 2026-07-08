"use client";

import { useRouter } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useSettings } from "@/context/SettingsContext";
import { convertPrice } from "@/lib/currency";

interface BuyNowButtonProps {
  product: {
    id: number;
    name: string;
    price: number;
    originalPrice?: number | null;
    image: string;
  };
}

export default function BuyNowButton({ product }: BuyNowButtonProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { siteCurrency, usdToTryRate } = useSettings();

  const handleBuyNow = () => {
    const finalPrice = product.originalPrice
      ? product.originalPrice - product.price
      : product.price;
    addToCart({
      id: product.id,
      name: product.name,
      price: convertPrice(finalPrice, siteCurrency, usdToTryRate),
      image: product.image,
    });
    router.push("/checkout");
  };

  return (
    <button
      onClick={handleBuyNow}
      className="flex-1 py-4 rounded-full font-bold text-base transition-all duration-300 flex items-center justify-center gap-2 font-tajawal bg-pink text-white hover:bg-pink-dark"
    >
      <ShoppingCart size={20} />
      اشتري الآن
    </button>
  );
}
