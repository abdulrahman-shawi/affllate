export const dynamic = "force-dynamic";

import ProductPage from "@/app/product/[identifier]/page";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import AffiliateVisitTracker from "./AffiliateVisitTracker";

interface AffiliateRefPageProps {
  params: { code: string } | Promise<{ code: string }>;
}

export default async function AffiliateRefPage({ params }: AffiliateRefPageProps) {
  const { code } = await params;

  const link = await prisma.affiliateLink.findUnique({
    where: { uniqueCode: code },
    include: {
      product: {
        select: { id: true, seoSlug: true, isActive: true },
      },
    },
  });

  if (!link || !link.product?.isActive) {
    redirect("/");
  }

  const identifier = link.product.seoSlug ?? String(link.product.id);

  return (
    <>
      <AffiliateVisitTracker code={code} />
      <ProductPage params={{ identifier }} />
    </>
  );
}