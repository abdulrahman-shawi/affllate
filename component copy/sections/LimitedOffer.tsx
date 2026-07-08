"use client";

import Link from "next/link";
import CountdownTimer from '@/component/CountdownTimer';

interface LimitedOfferData {
  id: string;
  badge: string;
  title: string;
  description: string;
  image: string;
  cta: string;
  href: string;
  countdownEndsAt: string | null;
}

interface LimitedOfferProps {
  offer?: LimitedOfferData | null;
}

const fallbackOffer: LimitedOfferData = {
  id: "limited-fallback",
  badge: "عرض محدود",
  title: "خصم يصل إلى 50% على المجموعات",
  description: "لا تفوتي الفرصة! احصلي على منتجاتك المفضلة بأسعار خيالية",
  image: "/images/products/gift-set.jpg",
  cta: "تسوقي الآن",
  href: "/search",
  countdownEndsAt: null,
};

export default function LimitedOffer({ offer }: LimitedOfferProps) {
  const activeOffer = offer ?? fallbackOffer;

  return (
    <section className="py-20 bg-gradient-to-br from-pink to-pink-dark relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full" />
      <div className="absolute bottom-10 left-10 w-48 h-48 bg-white/10 rounded-full" />
      <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-white/5 rounded-full" />

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          {/* Text */}
          <div className="text-center md:text-right text-white">
            <span className="bg-white/20 px-4 py-1.5 rounded-full text-sm font-medium mb-4 inline-block font-tajawal">
              {activeOffer.badge}
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold mb-4 font-tajawal leading-tight">
              {activeOffer.title}
            </h2>
            <p className="text-white/80 text-lg mb-8 font-tajawal">
              {activeOffer.description}
            </p>
            <CountdownTimer targetDate={activeOffer.countdownEndsAt} />
            <Link
              href={activeOffer.href}
              className="inline-block mt-8 bg-white text-pink-dark px-8 py-3.5 rounded-full font-bold hover:bg-gray-100 transition-colors font-tajawal shadow-lg"
            >
              {activeOffer.cta}
            </Link>
          </div>

          {/* Image */}
          <div className="flex justify-center order-first md:order-none">
            <img
              src={activeOffer.image}
              alt={activeOffer.badge}
              className="w-full max-w-[280px] sm:max-w-sm md:max-w-md rounded-3xl shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
