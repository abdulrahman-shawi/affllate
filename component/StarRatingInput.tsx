"use client";

import { Star } from "lucide-react";

interface StarRatingInputProps {
  value: number;
  onChange: (value: number) => void;
  max?: number;
  size?: number;
}

export default function StarRatingInput({
  value,
  onChange,
  max = 5,
  size = 24,
}: StarRatingInputProps) {
  return (
    <div className="flex items-center gap-1" dir="ltr">
      {Array.from({ length: max }, (_, index) => {
        const ratingValue = index + 1;
        const active = ratingValue <= value;

        return (
          <button
            key={ratingValue}
            type="button"
            onClick={() => onChange(ratingValue)}
            className="transition-transform hover:scale-110"
            aria-label={`Rate ${ratingValue} stars`}
          >
            <Star
              size={size}
              className={
                active
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-gray-300"
              }
              strokeWidth={1.5}
            />
          </button>
        );
      })}
    </div>
  );
}