"use client";

import { Star } from "lucide-react";
import { useState } from "react";

interface StarRatingInputProps {
  value: number;
  onChange: (value: number) => void;
  size?: number;
}

export default function StarRatingInput({
  value,
  onChange,
  size = 32,
}: StarRatingInputProps) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex items-center gap-1" dir="ltr">
      {Array.from({ length: 5 }, (_, i) => {
        const starValue = i + 1;
        const isActive = starValue <= (hover || value);
        return (
          <button
            key={i}
            type="button"
            onClick={() => onChange(starValue)}
            onMouseEnter={() => setHover(starValue)}
            onMouseLeave={() => setHover(0)}
            className="transition-transform hover:scale-110 focus:outline-none"
          >
            <Star
              size={size}
              className={
                isActive
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
