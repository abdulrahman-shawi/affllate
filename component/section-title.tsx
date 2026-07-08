import React from "react";

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  centered?: boolean;
}

export default function SectionTitle({ title, subtitle, centered = true }: SectionTitleProps) {
  return (
    <div className={`mb-10 space-y-2 ${centered ? "text-center" : "text-right"}`}>
      <h2 className="text-3xl font-serif font-medium tracking-wide text-[#222]">{title}</h2>
      {subtitle && <p className="text-gray-500 text-sm">{subtitle}</p>}
      <div className={`w-16 h-0.5 bg-[#c96] mt-3 ${centered ? "mx-auto" : ""}`}></div>
    </div>
  );
}
