"use client";

import Link from "next/link";
import SectionTitle from '@/component/SectionTitle';

interface HomeCategory {
  id: number;
  name: string;
  slug: string | null;
  image: string;
}

interface CategoriesProps {
  categories: HomeCategory[];
}

export default function Categories({ categories }: CategoriesProps) {
  return (
    <section id="categories" className="py-20 bg-gray-light">
      <div className="max-w-7xl mx-auto px-4">
        <SectionTitle title="تسوقي حسب الفئة" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={cat.slug ? `/category/${cat.slug}` : `/category/${cat.id}`}
              className="group mx-auto block w-full max-w-[240px] cursor-pointer"
            >
              <div className="relative mb-3 aspect-[4/5] overflow-hidden rounded-2xl">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <h3 className="text-center font-bold text-gray-dark font-tajawal group-hover:text-pink transition-colors">
                {cat.name}
              </h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
