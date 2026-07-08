"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export interface ReviewWithUser {
  id: string;
  name: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  user: { username: string } | null;
}

export interface RecentReview {
  id: string;
  name: string;
  rating: number;
  comment: string | null;
}

export async function getRecentReviews(limit: number = 6): Promise<RecentReview[]> {
  const reviews = await prisma.review.findMany({
    where: { isApproved: true, comment: { not: null } },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      name: true,
      rating: true,
      comment: true,
    },
  });

  return reviews;
}

export async function getProductReviews(productId: number): Promise<{
  reviews: ReviewWithUser[];
  averageRating: number;
  totalReviews: number;
}> {
  const reviews = await prisma.review.findMany({
    where: { productId, isApproved: true },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { username: true } },
    },
  });

  const totalReviews = reviews.length;
  const averageRating =
    totalReviews > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0;

  return {
    reviews,
    averageRating: Math.round(averageRating * 10) / 10,
    totalReviews,
  };
}

export async function createReview(
  productId: number,
  name: string,
  rating: number,
  comment?: string,
  userId?: string
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    if (!name.trim()) {
      return { success: false, error: "الرجاء إدخال الاسم" };
    }
    if (rating < 1 || rating > 5) {
      return { success: false, error: "التقييم يجب أن يكون بين 1 و 5" };
    }

    await prisma.review.create({
      data: {
        productId,
        name: name.trim(),
        rating,
        comment: comment?.trim() || null,
        userId,
      },
    });

    revalidatePath(`/product/${productId}`);

    return { success: true };
  } catch (err: any) {
    console.error("CREATE REVIEW ERROR:", err?.message || err);
    return { success: false, error: "حدث خطأ أثناء إضافة التقييم" };
  }
}
