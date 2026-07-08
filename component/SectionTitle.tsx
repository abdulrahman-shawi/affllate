"use client";

interface SectionTitleProps {
  title: string;
  subtitle?: string;
}

export default function SectionTitle({ title, subtitle }: SectionTitleProps) {
  return (
    <div className="text-center mb-12">
      <h2 className="text-3xl md:text-4xl font-bold text-gray-dark mb-3 font-tajawal">{title}</h2>
      {subtitle && (
        <p className="text-gray-500 text-lg font-tajawal">{subtitle}</p>
      )}
      <div className="flex justify-center mt-4">
        <div className="w-16 h-1 bg-pink rounded-full"></div>
      </div>
    </div>
  );
}
