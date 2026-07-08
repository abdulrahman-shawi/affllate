import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "Missing code" }, { status: 400 });
  }

  try {
    const link = await prisma.affiliateLink.findUnique({
      where: { uniqueCode: code },
      include: {
        product: {
          select: { id: true, seoSlug: true, isActive: true },
        },
      },
    });

    if (!link || !link.product?.isActive) {
      return NextResponse.json({ error: "Invalid link" }, { status: 404 });
    }

    // Increment clicks
    await prisma.affiliateLink.update({
      where: { id: link.id },
      data: { clicks: { increment: 1 } },
    });

    // Set cookie for 30 days
    const response = NextResponse.json({
      success: true,
      productId: link.productId,
      productSlug: link.product.seoSlug,
    });

    response.cookies.set("affiliate-code", code, {
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
      httpOnly: false,
      sameSite: "lax",
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
