"use server"

import { prisma } from "@/lib/prisma";
import { getWarehouseIdsByCountry, type CountryCode } from "@/lib/region";

export interface HomeProduct {
  id: number;
  name: string;
  description: string | null;
  image: string;
  price: number;
  originalPrice: number | null;
  badge: string | null;
  categoryName: string | null;
  seoSlug?: string | null;
  averageRating?: number;
  totalReviews?: number;
  stock: number;
}

export interface HomeCategory {
  id: number;
  name: string;
  slug: string | null;
  image: string;
}

export interface HomeDualOffer {
  id: string;
  image: string;
  alt: string;
  badge: string;
  title: string;
  subtitle: string;
  cta: string;
  href: string;
}

export interface HomeLimitedOffer {
  id: string;
  badge: string;
  title: string;
  description: string;
  image: string;
  cta: string;
  href: string;
  countdownEndsAt: string | null;
}

export interface OfferProductsPageData {
  id: string;
  title: string;
  description: string;
  image: string;
  badge: string;
  products: HomeProduct[];
}

function resolveOfferHref(rawHref: string | null | undefined, fallbackTerm: string) {
  const value = rawHref?.trim();

  if (!value) {
    return `/search?q=${encodeURIComponent(fallbackTerm)}`;
  }

  if (value.startsWith("/") || value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  return `/search?q=${encodeURIComponent(value)}`;
}

function mapProductsToHomeProducts(
  products: Array<{
    id: number;
    name: string;
    description: string | null;
    affiliatePrice: number;
    seoSlug: string | null;
    createdAt: Date;
    category: { name: string } | null;
    images: { url: string; type: string }[];
    stocks: { quantity: number; price: number; discount: number }[];
    orderItems: unknown[];
    reviews: { rating: number }[];
  }>
): HomeProduct[] {
  return products.map((p) => {
    const stock = p.stocks[0];
    const image =
      p.images.find((img) => img.type === "main")?.url ||
      p.images[0]?.url ||
      "/images/products/placeholder.jpg";

    const price = stock ? stock.discount : p.affiliatePrice;
    const originalPrice = stock?.price ?? null;
    const totalStock = p.stocks.reduce((sum, s) => sum + s.quantity, 0);
    const approvedReviews = p.reviews ?? [];
    const totalReviews = approvedReviews.length;
    const averageRating =
      totalReviews > 0
        ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        : 0;

    return {
      id: p.id,
      name: p.name,
      description: p.description,
      image,
      price: Math.round(price),
      originalPrice: originalPrice ? Math.round(originalPrice) : null,
      badge: getBadge(p),
      categoryName: p.category?.name ?? null,
      seoSlug: p.seoSlug,
      averageRating: totalReviews > 0 ? Math.round(averageRating * 10) / 10 : undefined,
      totalReviews: totalReviews > 0 ? totalReviews : undefined,
      stock: totalStock,
    };
  });
}

export async function getHomePageData(country?: string) {
  const activeCountry: CountryCode = country === "TR" ? "TR" : "SY";
  const warehouseIds = await getWarehouseIdsByCountry(activeCountry);

  // Fetch categories
  const categories = await prisma.category.findMany({
    where: { isVisible: true },
    take: 6,
    orderBy: { createdAt: "desc" },
  });

  // Fetch featured products available in warehouses matching the selected country
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      stocks: {
        some: {
          warehouseId: { in: warehouseIds },
        },
      },
    },
    take: 12,
    orderBy: { createdAt: "desc" },
    include: {
      category: true,
      images: true,
      stocks: {
        where: {
          warehouseId: { in: warehouseIds },
        },
        orderBy: { price: "asc" },
      },
      orderItems: true,
      reviews: { where: { isApproved: true } },
    },
  });

  // Map products to home product type
  const featuredProducts: HomeProduct[] = products.map((p) => {
    const stock = p.stocks[0];
    const image = p.images.find((img) => img.type === "main")?.url
      || p.images[0]?.url
      || "/images/products/placeholder.jpg";

    const price = stock ? stock.discount : p.affiliatePrice;
    const originalPrice = stock?.price ?? null;
    const totalStock = p.stocks.reduce((sum, s) => sum + s.quantity, 0);

    const approvedReviews = p.reviews ?? [];
    const totalReviews = approvedReviews.length;
    const averageRating =
      totalReviews > 0
        ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        : 0;

    return {
      id: p.id,
      name: p.name,
      description: p.description,
      image,
      price: Math.round(price),
      originalPrice: originalPrice ? Math.round(originalPrice) : null,
      badge: getBadge(p),
      categoryName: p.category?.name ?? null,
      seoSlug: p.seoSlug,
      averageRating: totalReviews > 0 ? Math.round(averageRating * 10) / 10 : undefined,
      totalReviews: totalReviews > 0 ? totalReviews : undefined,
      stock: totalStock,
    };
  });

  // Sort bestsellers by number of orders
  const bestSellers = [...featuredProducts]
    .sort((a, b) => {
      const aOrders = products.find((p) => p.id === a.id)?.orderItems.length ?? 0;
      const bOrders = products.find((p) => p.id === b.id)?.orderItems.length ?? 0;
      return bOrders - aOrders;
    })
    .slice(0, 8);

  // Map categories
  const homeCategories: HomeCategory[] = categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    image: c.image ?? "/images/categories/placeholder.jpg",
  }));

  return {
    featuredProducts,
    bestSellers,
    categories: homeCategories,
  };
}

export async function getDualOffers(country?: string): Promise<HomeDualOffer[]> {
  const now = new Date();
  const activeCountry: CountryCode = country === "TR" ? "TR" : "SY";
  const warehouseIds = await getWarehouseIdsByCountry(activeCountry);

  try {
    let offers = await prisma.offer.findMany({
      where: {
        isActive: true,
        AND: [
          {
            OR: [{ startsAt: null }, { startsAt: { lte: now } }],
          },
          {
            OR: [{ endsAt: null }, { endsAt: { gte: now } }],
          },
        ],
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      take: 2,
      include: {
        discounts: {
          where: {
            isActive: true,
            AND: [
              {
                OR: [{ startsAt: null }, { startsAt: { lte: now } }],
              },
              {
                OR: [{ endsAt: null }, { endsAt: { gte: now } }],
              },
            ],
          },
          orderBy: { createdAt: "desc" },
          include: {
            product: {
              select: {
                id: true,
                seoSlug: true,
                showInAds: true,
                stocks: {
                  where: {
                    warehouseId: { in: warehouseIds },
                    quantity: { gt: 0 },
                  },
                  select: { id: true },
                },
              },
            },
            category: {
              select: {
                id: true,
                slug: true,
                name: true,
              },
            },
          },
        },
      },
    });

    // If no offers match the date window, fallback to active offers.
    if (offers.length === 0) {
      offers = await prisma.offer.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
        take: 2,
        include: {
          discounts: {
            where: { isActive: true },
            orderBy: { createdAt: "desc" },
            include: {
              product: {
                select: {
                  id: true,
                  seoSlug: true,
                  showInAds: true,
                  stocks: {
                    where: {
                      warehouseId: { in: warehouseIds },
                      quantity: { gt: 0 },
                    },
                    select: { id: true },
                  },
                },
              },
              category: {
                select: {
                  id: true,
                  slug: true,
                  name: true,
                },
              },
            },
          },
        },
      });
    }

    return offers.map((offer) => {
      const discount = offer.discounts[0];
      let subtitle = offer.subtitle || "اكتشفي الآن";
      if (discount?.discountValue) {
        subtitle =
          discount.discountType === "PERCENTAGE"
            ? `خصم ${Math.round(discount.discountValue)}%`
            : `خصم ${Math.round(discount.discountValue)}`;
      }

      return {
        id: offer.id,
        image: offer.image || "/images/hero/hero1.jpg",
        alt: offer.title || "عرض مميز",
        badge: offer.badgeText || "عرض خاص",
        title: offer.title || "عرض مميز",
        subtitle,
        cta: offer.ctaText || "اكتشفي المزيد",
        href: `/offers/${offer.id}`,
      };
    });
  } catch (error) {
    console.error("getDualOffers failed:", error);
    return [];
  }
}

export async function getLimitedOffer(country?: string): Promise<HomeLimitedOffer | null> {
  const now = new Date();
  const activeCountry: CountryCode = country === "TR" ? "TR" : "SY";
  const warehouseIds = await getWarehouseIdsByCountry(activeCountry);

  try {
    let offer = await prisma.offer.findFirst({
      where: {
        isActive: true,
        AND: [
          {
            OR: [{ startsAt: null }, { startsAt: { lte: now } }],
          },
          {
            OR: [{ endsAt: null }, { endsAt: { gte: now } }],
          },
        ],
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      include: {
        discounts: {
          where: {
            isActive: true,
            AND: [
              {
                OR: [{ startsAt: null }, { startsAt: { lte: now } }],
              },
              {
                OR: [{ endsAt: null }, { endsAt: { gte: now } }],
              },
            ],
          },
          orderBy: { createdAt: "desc" },
          include: {
            product: {
              select: {
                id: true,
                seoSlug: true,
                showInAds: true,
                stocks: {
                  where: {
                    warehouseId: { in: warehouseIds },
                    quantity: { gt: 0 },
                  },
                  select: { id: true },
                },
              },
            },
            category: {
              select: {
                id: true,
                slug: true,
                name: true,
              },
            },
          },
        },
      },
    });

    // Fallback when no date-window match is found.
    if (!offer) {
      offer = await prisma.offer.findFirst({
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
        include: {
          discounts: {
            where: { isActive: true },
            orderBy: { createdAt: "desc" },
            include: {
              product: {
                select: {
                  id: true,
                  seoSlug: true,
                  showInAds: true,
                  stocks: {
                    where: {
                      warehouseId: { in: warehouseIds },
                      quantity: { gt: 0 },
                    },
                    select: { id: true },
                  },
                },
              },
              category: {
                select: {
                  id: true,
                  slug: true,
                  name: true,
                },
              },
            },
          },
        },
      });
    }

    if (!offer) return null;

    const discount = offer.discounts[0];
    const discountText =
      discount?.discountValue != null
        ? discount.discountType === "PERCENTAGE"
          ? `خصم يصل إلى ${Math.round(discount.discountValue)}%`
          : `خصم يصل إلى ${Math.round(discount.discountValue)}`
        : null;

    return {
      id: offer.id,
      badge: offer.badgeText || "عرض محدود",
      title: offer.title || discountText || "خصم مميز لفترة محدودة",
      description:
        offer.description ||
        offer.subtitle ||
        "لا تفوتي الفرصة! احصلي على منتجاتك المفضلة بأسعار خيالية",
      image: offer.image || "/images/products/gift-set.jpg",
      cta: offer.ctaText || "تسوقي الآن",
      href: `/offers/${offer.id}`,
      countdownEndsAt: offer.countdownEndsAt ? offer.countdownEndsAt.toISOString() : null,
    };
  } catch (error) {
    console.error("getLimitedOffer failed:", error);
    return null;
  }
}

export async function getOfferProducts(
  offerId: string,
  country?: string,
): Promise<OfferProductsPageData | null> {
  const activeCountry: CountryCode = country === "TR" ? "TR" : "SY";
  const warehouseIds = await getWarehouseIdsByCountry(activeCountry);

  const offer = await prisma.offer.findUnique({
    where: { id: offerId },
    include: {
      discounts: {
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
        include: {
          product: {
            include: {
              category: true,
              images: true,
              stocks: {
                where: {
                  warehouseId: { in: warehouseIds },
                  quantity: { gt: 0 },
                },
                orderBy: { price: "asc" },
              },
              orderItems: true,
              reviews: { where: { isApproved: true } },
            },
          },
        },
      },
    },
  });

  if (!offer) return null;

  const products = offer.discounts
    .map((discount) => discount.product)
    .filter(
      (product): product is NonNullable<typeof product> =>
        product != null && product.isActive && product.stocks.length > 0
    );

  return {
    id: offer.id,
    title: offer.title || "منتجات العرض",
    description:
      offer.description || offer.subtitle || "تصفحي كل المنتجات المرتبطة بهذا العرض.",
    image: offer.image || "/images/hero/hero1.jpg",
    badge: offer.badgeText || "عرض خاص",
    products: mapProductsToHomeProducts(products),
  };
}

function getBadge(product: {
  orderItems: unknown[];
  createdAt: Date;
  stocks: { discount: number }[];
}): string | null {
  if (product.orderItems.length > 5) return "الأكثر مبيعاً";
  const now = new Date();
  const daysSinceCreated = (now.getTime() - product.createdAt.getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceCreated <= 30) return "جديد";
  if (product.stocks[0]?.discount > 0) return "عرض";
  return null;
}
