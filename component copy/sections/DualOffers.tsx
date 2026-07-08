import Link from "next/link";

interface DualOfferItem {
  id: string;
  image: string;
  alt: string;
  badge: string;
  title: string;
  subtitle: string;
  cta: string;
  href: string;
}

interface DualOffersProps {
  offers?: DualOfferItem[];
}

const fallbackOffers: DualOfferItem[] = [
  {
    id: "fallback-1",
    image: "/images/hero/hero1.jpg",
    alt: "مجموعة العناية بالبشرة",
    badge: "عرض خاص",
    title: "مجموعة العناية بالبشرة",
    subtitle: "خصم 25%",
    cta: "اكتشفي المزيد",
    href: "/search",
  },
  {
    id: "fallback-2",
    image: "/images/hero/hero3.jpg",
    alt: "أدوات التجميل الاحترافية",
    badge: "تشكيلة جديدة",
    title: "أدوات التجميل الاحترافية",
    subtitle: "ابدئي رحلتك",
    cta: "اكتشفي المزيد",
    href: "/search",
  },
];

export default function DualOffers({ offers = [] }: DualOffersProps) {
  const resolvedOffers = offers.length > 0 ? offers : fallbackOffers;

  return (
    <section id="offers" className="py-10 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {resolvedOffers.slice(0, 2).map((offer) => (
            <div
              key={offer.id}
              className="relative overflow-hidden rounded-3xl h-[280px] md:h-[320px] group"
            >
              <img
                src={offer.image}
                alt={offer.alt}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-l from-black/60 to-transparent" />
              <div className="absolute right-6 top-1/2 -translate-y-1/2 text-right text-white max-w-[70%]">
                <span className="text-pink-light text-sm font-medium mb-2 block font-tajawal">
                  {offer.badge}
                </span>
                <h3 className="text-2xl md:text-3xl font-bold mb-3 font-tajawal leading-tight">
                  {offer.title}
                </h3>
                <p className="text-pink-light text-lg font-bold mb-4 font-tajawal">
                  {offer.subtitle}
                </p>
                <Link
                  href={offer.href}
                  className="inline-block bg-pink text-white px-6 py-2.5 rounded-full font-medium hover:bg-pink-dark transition-colors font-tajawal"
                >
                  {offer.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
