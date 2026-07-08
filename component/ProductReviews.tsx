"use client";

import { useState } from "react";
import { createReview } from "@/server/reviews";
import StarRating from "./StarRating";
import StarRatingInput from "./StarRatingInput";
import { ReviewWithUser } from "@/server/reviews";

interface ProductReviewsProps {
  productId: number;
  initialReviews: ReviewWithUser[];
  initialAverageRating: number;
  initialTotalReviews: number;
}

export default function ProductReviews({
  productId,
  initialReviews,
  initialAverageRating,
  initialTotalReviews,
}: ProductReviewsProps) {
  const [reviews, setReviews] = useState(initialReviews);
  const [averageRating, setAverageRating] = useState(initialAverageRating);
  const [totalReviews, setTotalReviews] = useState(initialTotalReviews);

  const [name, setName] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setMessage({ type: "error", text: "الرجاء اختيار التقييم بالنجوم" });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    const result = await createReview(productId, name, rating, comment);

    if (result.success) {
      const newReview = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        name: name.trim() || "مستخدم",
        rating,
        comment: comment.trim() || null,
        createdAt: new Date(),
        user: null,
      };
      const updatedReviews = [newReview, ...reviews];
      setReviews(updatedReviews);
      setTotalReviews(updatedReviews.length);
      setAverageRating(
        Math.round(
          (updatedReviews.reduce((sum, r) => sum + r.rating, 0) /
            updatedReviews.length) *
            10
        ) / 10
      );
      setName("");
      setRating(0);
      setComment("");
      setMessage({ type: "success", text: "تم إضافة تقييمك بنجاح" });
    } else {
      setMessage({ type: "error", text: result.error });
    }

    setSubmitting(false);
  };

  return (
    <div className="mt-12 bg-white rounded-2xl shadow-sm p-6 md:p-8">
      <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 font-tajawal">
        تقييمات المنتج
      </h2>

      {/* Summary */}
      <div className="flex items-center gap-4 mb-8 p-4 bg-gray-50 rounded-xl">
        <div className="text-4xl font-bold text-pink-dark font-tajawal">
          {averageRating.toFixed(1)}
        </div>
        <div>
          <StarRating rating={averageRating} size={22} />
          <p className="text-sm text-gray-500 mt-1 font-tajawal">
            بناءً على {totalReviews} تقييم
          </p>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-6 mb-10">
        {reviews.length === 0 ? (
          <p className="text-gray-500 text-center py-8 font-tajawal">
            لا توجد تقييمات بعد. كن أول من يقيم هذا المنتج.
          </p>
        ) : (
          reviews.map((review) => (
            <div
              key={review.id}
              className="border-b border-gray-100 last:border-0 pb-6 last:pb-0"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-gray-700 font-tajawal">
                    {review.name}
                  </span>
                  <StarRating rating={review.rating} size={14} />
                </div>
                <span className="text-xs text-gray-400 font-tajawal">
                  {new Date(review.createdAt).toLocaleDateString("ar-SY")}
                </span>
              </div>
              {review.comment && (
                <p className="text-gray-600 text-sm leading-relaxed font-tajawal">
                  {review.comment}
                </p>
              )}
            </div>
          ))
        )}
      </div>

      {/* Review Form */}
      <form
        onSubmit={handleSubmit}
        className="p-5 border border-gray-100 rounded-xl bg-gray-light"
      >
        <h3 className="font-bold text-gray-700 mb-4 font-tajawal">
          أضف تقييمك
        </h3>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600 mb-2 font-tajawal">
            التقييم
          </label>
          <StarRatingInput value={rating} onChange={setRating} size={28} />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600 mb-2 font-tajawal">
            الاسم
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-pink focus:ring-1 focus:ring-pink outline-none font-tajawal"
            placeholder="اسمك"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600 mb-2 font-tajawal">
            تعليق (اختياري)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-pink focus:ring-1 focus:ring-pink outline-none font-tajawal resize-none"
            placeholder="شارك تجربتك مع المنتج..."
          />
        </div>

        {message && (
          <p
            className={`text-sm mb-4 font-tajawal ${
              message.type === "success" ? "text-green-600" : "text-red-500"
            }`}
          >
            {message.text}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-2.5 bg-pink text-white rounded-full font-medium font-tajawal hover:bg-pink-dark transition-colors disabled:opacity-50"
        >
          {submitting ? "جاري الإرسال..." : "إرسال التقييم"}
        </button>
      </form>
    </div>
  );
}
