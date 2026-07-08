"use server";

import { prisma } from "@/lib/prisma";
import { getWarehouseIdsByCountry, type CountryCode } from "@/lib/region";
import { HomeProduct } from "./home";

export async function searchProducts(
  query: string,
  country?: string
): Promise<HomeProduct[]> {
  const trimmed = query.trim();
  const activeCountry: CountryCode = country === "TR" ? "TR" : "SY";
  const warehouseIds = await getWarehouseIdsByCountry(activeCountry);

  if (!trimmed) {
    return [];
  }

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      stocks: {
        some: {
          warehouseId: { in: warehouseIds },
        },
      },
      OR: [
        { name: { contains: trimmed, mode: "insensitive" } },
        { description: { contains: trimmed, mode: "insensitive" } },
        { seoSlug: { contains: trimmed, mode: "insensitive" } },
        {
          category: {
            name: { contains: trimmed, mode: "insensitive" },
          },
        },
      ],
    },
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

  return products.map((p) => {
    const stock = p.stocks[0];
    const image =
      p.images.find((img) => img.type === "main")?.url ||
      p.images[0]?.url ||
      "/images/products/placeholder.jpg";

    const price = stock ? stock.discount : p.affiliatePrice;
    const originalPrice = stock?.price ?? null;
    const totalStock = p.stocks.reduce((sum, s) => sum + s.quantity, 0);
    const { averageRating, totalReviews } = getRatingInfo(p.reviews);

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
      averageRating,
      totalReviews,
      stock: totalStock,
    };
  });
}

export async function getProductsByCategory(
  slug: string,
  country?: string
): Promise<{ categoryName: string; products: HomeProduct[] } | null> {
  const activeCountry: CountryCode = country === "TR" ? "TR" : "SY";

  const category = await prisma.category.findUnique({
    where: { slug },
  });

  if (!category) {
    // جرب البحث بالـ id إذا لم يكن slug موجوداً
    const catById = await prisma.category.findUnique({
      where: { id: parseInt(slug) || 0 },
    });
    if (!catById) return null;
    return fetchCategoryProducts(catById, activeCountry);
  }

  return fetchCategoryProducts(category, activeCountry);
}

async function fetchCategoryProducts(
  category: { id: number; name: string },
  activeCountry: CountryCode = "SY"
) {
  const warehouseIds = await getWarehouseIdsByCountry(activeCountry);

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      categoryId: category.id,
      stocks: {
        some: {
          warehouseId: { in: warehouseIds },
        },
      },
    },
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

  const mapped: HomeProduct[] = products.map((p) => {
    const stock = p.stocks[0];
    const image =
      p.images.find((img) => img.type === "main")?.url ||
      p.images[0]?.url ||
      "/images/products/placeholder.jpg";

    const price = stock ? stock.discount : p.affiliatePrice;
    const originalPrice = stock?.price ?? null;
    const totalStock = p.stocks.reduce((sum, s) => sum + s.quantity, 0);
    const { averageRating, totalReviews } = getRatingInfo(p.reviews);

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
      averageRating,
      totalReviews,
      stock: totalStock,
    };
  });

  return { categoryName: category.name, products: mapped };
}

export async function getProductBySlug(
  identifier: string,
  country?: string
): Promise<
  (
    HomeProduct & {
      images: string[];
      seoSlug: string | null;
      categoryId: number | null;
      categorySlug: string | null;
      metaTitle: string | null;
      metaDescription: string | null;
      metaKeywords: string | null;
    }
  ) | null
> {
  const activeCountry: CountryCode = country === "TR" ? "TR" : "SY";
  const warehouseIds = await getWarehouseIdsByCountry(activeCountry);

  // Ensure the identifier is URL-decoded so Arabic slugs match the database value.
  let decodedIdentifier = identifier;
  try {
    decodedIdentifier = decodeURIComponent(identifier);
  } catch {
    // If decoding fails, use the raw identifier.
  }

  const numericId = Number(decodedIdentifier);
  const isNumeric = !isNaN(numericId) && decodedIdentifier.trim() !== "";

  let product = null;

  if (isNumeric) {
    product = await prisma.product.findFirst({
      where: {
        id: numericId,
        isActive: true,
        stocks: {
          some: {
            warehouseId: { in: warehouseIds },
          },
        },
      },
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
  } else {
    product = await prisma.product.findFirst({
      where: {
        seoSlug: decodedIdentifier,
        isActive: true,
        stocks: {
          some: {
            warehouseId: { in: warehouseIds },
          },
        },
      },
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

    // Fallback: search by product name if no seoSlug match.
    if (!product) {
      product = await prisma.product.findFirst({
        where: {
          name: { equals: decodedIdentifier, mode: "insensitive" },
          isActive: true,
          stocks: {
            some: {
              warehouseId: { in: warehouseIds },
            },
          },
        },
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
    }
  }

  if (!product) return null;

  const stock = product.stocks[0];
  const images = product.images
    .slice()
    .sort((a, b) => (a.type === "main" ? -1 : b.type === "main" ? 1 : 0))
    .map((img) => img.url);
  const image = images[0] || "/images/products/placeholder.jpg";

  const price = stock ? stock.discount : product.affiliatePrice;
  const originalPrice = stock?.price ?? null;
  const totalStock = product.stocks.reduce((sum, s) => sum + s.quantity, 0);
  const { averageRating, totalReviews } = getRatingInfo(product.reviews);

  return {
    id: product.id,
    name: product.name,
    description: product.description,
    image,
    images,
    price: Math.round(price),
    originalPrice: originalPrice ? Math.round(originalPrice) : null,
    badge: getBadge(product),
    categoryName: product.category?.name ?? null,
    seoSlug: product.seoSlug,
    categoryId: product.category?.id ?? null,
    categorySlug: product.category?.slug ?? null,
    metaTitle: product.metaTitle,
    metaDescription: product.metaDescription,
    metaKeywords: product.metaKeywords,
    averageRating,
    totalReviews,
    stock: totalStock,
  };
}

export interface LandingFeature {
  title: string;
  description: string;
}

export interface LandingProduct {
  id: number;
  name: string;
  description: string | null;
  image: string;
  images: string[];
  price: number;
  originalPrice: number | null;
  averageRating?: number;
  totalReviews?: number;
  stock: number;
  categoryName: string | null;
  seoSlug: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
  showInAds: boolean;
  landingPage: {
    heroTitle: string | null;
    heroSubtitle: string | null;
    heroDescription: string | null;
    badgeText: string | null;
    discountPercent: number | null;
    quantityDiscountTiers: { minQty: number; discountPercent: number }[];
    features: LandingFeature[];
    showReviews: boolean;
    showGuarantee: boolean;
    guaranteeTitle: string | null;
    guaranteeText: string | null;
    ctaText: string | null;
    isActive: boolean;
  } | null;
}

export async function getLandingProduct(
  identifier: string,
  country?: string
): Promise<LandingProduct | null> {
  const activeCountry: CountryCode = country === "TR" ? "TR" : "SY";
  const warehouseIds = await getWarehouseIdsByCountry(activeCountry);

  let decodedIdentifier = identifier;
  try {
    decodedIdentifier = decodeURIComponent(identifier);
  } catch {
    // ignore
  }

  const numericId = Number(decodedIdentifier);
  const isNumeric = !isNaN(numericId) && decodedIdentifier.trim() !== "";

  const include = {
    category: true,
    images: true,
    stocks: {
      where: { warehouseId: { in: warehouseIds } },
      orderBy: { price: "asc" as const },
    },
    reviews: { where: { isApproved: true } },
    landingPage: true,
  };

  let product = await prisma.product.findFirst({
    where: isNumeric
      ? {
          id: numericId,
          isActive: true,
          showInAds: true,
          stocks: { some: { warehouseId: { in: warehouseIds } } },
        }
      : {
          seoSlug: decodedIdentifier,
          isActive: true,
          showInAds: true,
          stocks: { some: { warehouseId: { in: warehouseIds } } },
        },
    include,
  });

  if (!product && !isNumeric) {
    product = await prisma.product.findFirst({
      where: {
        name: { equals: decodedIdentifier, mode: "insensitive" },
        isActive: true,
        showInAds: true,
        stocks: { some: { warehouseId: { in: warehouseIds } } },
      },
      include,
    });
  }

  if (!product) return null;

  const stock = product.stocks[0];
  const images = product.images
    .slice()
    .sort((a: any, b: any) => (a.type === "main" ? -1 : b.type === "main" ? 1 : 0))
    .map((img: any) => img.url);

  const mainImage = images[0] || "/images/products/placeholder.jpg";
  const price = stock ? stock.discount : product.affiliatePrice;
  const originalPrice = stock?.price ?? null;
  const totalStock = product.stocks.reduce((sum: number, s: any) => sum + s.quantity, 0);
  const { averageRating, totalReviews } = getRatingInfo(product.reviews);

  const lp = product.landingPage;
  const rawFeatures = (lp?.features as any) ?? [];
  const rawQuantityDiscountTiers = (lp?.quantityDiscountTiers as any) ?? [];
  const features: LandingFeature[] = Array.isArray(rawFeatures)
    ? rawFeatures.map((f: any) => ({ title: String(f.title ?? ""), description: String(f.description ?? "") }))
    : [];
  const quantityDiscountTiers = Array.isArray(rawQuantityDiscountTiers)
    ? rawQuantityDiscountTiers
        .map((tier: any) => {
          const minQty = Number(tier?.minQty ?? tier?.quantity ?? tier?.fromQuantity ?? tier?.minQuantity ?? 0);
          const discountPercent = Number(tier?.discountPercent ?? tier?.discount ?? tier?.percent ?? 0);

          if (!Number.isFinite(minQty) || minQty < 1 || !Number.isFinite(discountPercent) || discountPercent <= 0) {
            return null;
          }

          return {
            minQty: Math.floor(minQty),
            discountPercent,
          };
        })
        .filter((tier): tier is { minQty: number; discountPercent: number } => tier !== null)
        .sort((a, b) => a.minQty - b.minQty)
    : [];

  return {
    id: product.id,
    name: product.name,
    description: product.description,
    image: mainImage,
    images,
    price: Math.round(price),
    originalPrice: originalPrice ? Math.round(originalPrice) : null,
    averageRating,
    totalReviews,
    stock: totalStock,
    categoryName: product.category?.name ?? null,
    seoSlug: product.seoSlug,
    metaTitle: product.metaTitle,
    metaDescription: product.metaDescription,
    metaKeywords: product.metaKeywords,
    showInAds: product.showInAds,
    landingPage: lp
      ? {
          heroTitle: lp.heroTitle,
          heroSubtitle: lp.heroSubtitle,
          heroDescription: lp.heroDescription,
          badgeText: lp.badgeText,
          discountPercent: lp.discountPercent,
          quantityDiscountTiers,
          features,
          showReviews: lp.showReviews,
          showGuarantee: lp.showGuarantee,
          guaranteeTitle: lp.guaranteeTitle,
          guaranteeText: lp.guaranteeText,
          ctaText: lp.ctaText,
          isActive: lp.isActive,
        }
      : null,
  };
}

function getRatingInfo(reviews: { rating: number }[]): {
  averageRating?: number;
  totalReviews?: number;
} {
  const totalReviews = reviews.length;
  if (totalReviews === 0) return {};
  const averageRating =
    reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;
  return {
    averageRating: Math.round(averageRating * 10) / 10,
    totalReviews,
  };
}

function getBadge(product: {
  orderItems: unknown[];
  createdAt: Date;
  stocks: { discount: number }[];
}): string | null {
  if (product.orderItems.length > 5) return "الأكثر مبيعاً";
  const now = new Date();
  const daysSinceCreated =
    (now.getTime() - product.createdAt.getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceCreated <= 30) return "جديد";
  if (product.stocks[0]?.discount > 0) return "عرض";
  return null;
}
