"use client";

import React from "react";

interface HeroBannerProps {
  label: string;
  title: string;
  highlight: string;
  description: string;
  buttonText: string;
  image: string;
  align?: "right" | "left";
}

export default function HeroBanner({
  label,
  title,
  highlight,
  description,
  buttonText,
  image,
  align = "right",
}: HeroBannerProps) {
  return (
    <section className="relative bg-[#f4eade] h-[500px] md:h-[560px] flex items-center px-6 md:px-20 overflow-hidden" dir="rtl">
      <div className={`max-w-xl z-10 space-y-4 ${align === "left" ? "md:mr-auto md:ml-0" : ""}`}>
        <span className="text-sm uppercase tracking-widest text-[#c96] font-medium">{label}</span>
        <h1 className="text-4xl md:text-5xl font-serif text-[#222] leading-tight font-light">
          {title} <br />
          <span className="font-bold">{highlight}</span>
        </h1>
        <p className="text-gray-600 text-sm md:text-base leading-relaxed max-w-md">{description}</p>
        <button className="mt-4 px-8 py-3 bg-[#333] text-white text-sm uppercase tracking-wider font-semibold hover:bg-[#c96] transition-colors duration-300">
          {buttonText}
        </button>
      </div>
      {/* الصورة الخلفية الجانبية */}
      <div className={`absolute ${align === "right" ? "left-0" : "right-0"} bottom-0 top-0 w-1/2 hidden md:block`}>
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover object-center mix-blend-multiply opacity-90"
        />
      </div>
    </section>
  );
}
