export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Header from "@/component/sections/Header";
import Footer from "@/component/sections/Footer";
import TopBanner from "@/component/sections/TopBanner";
import CartDrawer from "@/component/CartDrawer";
import ProductGallery from "@/component/ProductGallery";
import { getProductBySlug } from "@/server/products";
import { getServerCountry } from "@/lib/region";
import { getProductReviews } from "@/server/reviews";
import { getGeneralSettings } from "@/server/settings";
import { formatPrice, getCurrencySymbol } from "@/lib/currency";
import { Heart, ArrowLeft } from "lucide-react";
import BuyNowButton from "@/component/BuyNowButton";
import StarRating from "@/component/StarRating";
import ProductReviews from "@/component/ProductReviews";

interface ProductPageProps {
  params: { identifier: string };
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const [product, settings] = await Promise.all([
    getProductBySlug(params.identifier, getServerCountry()),
    getGeneralSettings(),
  ]);
  const siteName = settings.siteName || "سفراء skynova";

  if (!product) {
    return {
      title: `المنتج غير موجود | ${siteName}`,
      description: "عذراً، المنتج الذي تبحثين عنه غير متوفر حالياً.",
    };
  }

  const title = product.metaTitle?.trim() || product.name;
  const description =
    product.metaDescription?.trim() ||
    product.description ||
    `اشترِ ${product.name} بأفضل سعر. منتج عالي الجودة للعناية بالبشرة والشعر من ${siteName}.`;
  const url = `https://skynova.store/product/${product.seoSlug ?? product.id}`;
  const keywords = product.metaKeywords
    ?.split(",")
    .map((keyword) => keyword.trim())
    .filter(Boolean);

  return {
    title,
    description,
    ...(keywords?.length ? { keywords } : {}),
    openGraph: {
      title,
      description,
      url,
      images: [
        {
          url: product.image,
          width: 800,
          height: 800,
          alt: product.name,
        },
      ],
      type: "website",
      locale: "ar_AR",
      siteName,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [product.image],
    },
    alternates: {
      canonical: url,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const country = getServerCountry();
  const [product, settings] = await Promise.all([
    getProductBySlug(params.identifier, country),
    getGeneralSettings(),
  ]);

  if (!product) {
    notFound();
  }

  const { reviews, averageRating, totalReviews } = await getProductReviews(
    product.id
  );

  const currencySymbol = getCurrencySymbol(settings.siteCurrency);

  const discountAmount = product.originalPrice
    ? Math.round(product.originalPrice - product.price)
    : 0;
  const hasDiscount = discountAmount > 0;

  const productUrl = `https://skynova.store/product/${
    product.seoSlug ?? product.id
  }`;
  const categoryHref = product.categorySlug
    ? `/category/${product.categorySlug}`
    : product.categoryId
      ? `/category/${product.categoryId}`
      : null;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.metaTitle ?? product.name,
    image: product.image,
    description: product.metaDescription ?? product.description ?? undefined,
    url: productUrl,
    brand: {
      "@type": "Brand",
      name: settings.siteName || "سفراء skynova",
    },
    offers: {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: settings.siteCurrency,
      price: product.price.toString(),
      availability: "https://schema.org/InStock",
      ...(product.originalPrice && {
        priceValidUntil: new Date(
          Date.now() + 365 * 24 * 60 * 60 * 1000
        ).toISOString(),
      }),
    },
    ...(product.originalPrice && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.8",
        reviewCount: "120",
        bestRating: "5",
        worstRating: "1",
      },
    }),
  };

  return (
    <div dir="rtl" className="font-tajawal min-h-screen bg-gray-light overflow-x-hidden">
      <TopBanner />
      <Header />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <nav className="flex items-center gap-2 text-sm font-tajawal">
            <Link href="/" className="text-gray-500 hover:text-pink transition-colors">
              الرئيسية
            </Link>
            <span className="text-gray-300">/</span>
            {product.categoryName && categoryHref && (
              <>
                <Link
                  href={categoryHref}
                  className="text-gray-500 hover:text-pink transition-colors"
                >
                  {product.categoryName}
                </Link>
                <span className="text-gray-300">/</span>
              </>
            )}
            <span className="text-gray-800 font-medium truncate">
              {product.name}
            </span>
          </nav>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Image Section */}
            <ProductGallery
              name={product.name}
              images={product.images}
              badge={product.badge}
              discountLabel={
                hasDiscount
                  ? `-${formatPrice(product.price, settings.siteCurrency, settings.usdToTryRate)}`
                  : null
              }
            />

            {/* Details Section */}
            <div className="min-w-0 p-6 md:p-10 flex flex-col text-right">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 font-tajawal leading-relaxed">
                {product.name}
              </h1>

              {/* Rating */}
              {totalReviews > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  <StarRating rating={averageRating} size={18} />
                  <span className="text-sm text-gray-500 font-tajawal">
                    {averageRating.toFixed(1)} ({totalReviews} تقييم)
                  </span>
                </div>
              )}

              {/* Price */}
              <div className="mb-6 flex flex-wrap items-center gap-4">
                <span className="text-3xl font-bold text-pink-dark font-tajawal">
                  {formatPrice(discountAmount, settings.siteCurrency, settings.usdToTryRate)}
                </span>
                {product.originalPrice && (
                  <span className="text-xl text-gray-400 line-through font-tajawal">
                    {formatPrice(product.originalPrice, settings.siteCurrency, settings.usdToTryRate)}
                  </span>
                )}
                {hasDiscount && (
                  <span className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-md font-tajawal">
                    وفّر {formatPrice(product.price, settings.siteCurrency, settings.usdToTryRate)}
                  </span>
                )}
              </div>

              {/* Description */}
              <div
                className="text-gray-600 text-base mb-8 leading-relaxed font-tajawal product-description"
                dangerouslySetInnerHTML={{
                  __html:
                    product.description ??
                    "منتج عالي الجودة يوفر لكِ أفضل النتائج. تم اختياره بعناية لتلبية احتياجاتك اليومية في العناية بالبشرة والشعر.",
                }}
              />

              {/* Meta Info */}
              <div className="space-y-3 mb-8 text-sm text-gray-500 font-tajawal">
                {product.categoryName && categoryHref && (
                  <div className="flex items-center gap-2">
                    <span>القسم:</span>
                    <Link
                      href={categoryHref}
                      className="text-pink hover:underline"
                    >
                      {product.categoryName}
                    </Link>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span>التوصيل:</span>
                  <span className="text-green-600">متوفر لجميع المناطق</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>الدفع:</span>
                  <span>عند الاستلام أو إلكتروني</span>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-auto flex flex-wrap gap-4">
                <BuyNowButton product={{
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  originalPrice: product.originalPrice,
                  image: product.image,
                }} />
                <button className="w-14 h-14 rounded-full border-2 border-gray-200 flex items-center justify-center transition-all duration-300 hover:border-red-300 hover:text-red-500 text-gray-400">
                  <Heart size={22} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <ProductReviews
          productId={product.id}
          initialReviews={reviews}
          initialAverageRating={averageRating}
          initialTotalReviews={totalReviews}
        />

        {/* Back Link */}
        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-pink transition-colors font-tajawal"
          >
            <ArrowLeft size={20} />
            العودة للرئيسية
          </Link>
        </div>
      </main>

      <Footer />
      <CartDrawer />

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </div>
  );
}
