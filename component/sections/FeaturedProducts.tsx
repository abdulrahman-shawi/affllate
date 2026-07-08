"use client";

import { useState } from 'react';
import SectionTitle from '@/component/SectionTitle';
import ProductCard from '@/component/ProductCard';
import type { Product } from '@/component/ProductCard';

const tabs = [
  { key: 'all', label: 'الكل' },
  { key: 'bestseller', label: 'الأكثر مبيعاً' },
  { key: 'offer', label: 'العروض' },
  { key: 'new', label: 'جديد' },
];

interface FeaturedProductsProps {
  products: Product[];
}

export default function FeaturedProducts({ products }: FeaturedProductsProps) {
  const [activeTab, setActiveTab] = useState('all');

  const filteredProducts = products.filter((p) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'bestseller') return p.badge === 'الأكثر مبيعاً';
    if (activeTab === 'offer') return p.originalPrice != null;
    if (activeTab === 'new') return p.badge === 'جديد';
    return true;
  });

  return (
    <section id="products" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <SectionTitle title="منتجاتنا المميزة" />

        {/* Tabs */}
        <div className="flex justify-center gap-2 mb-10 flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-6 py-2.5 rounded-full font-medium transition-all font-tajawal ${
                activeTab === tab.key
                  ? 'bg-pink text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-pink-50 hover:text-pink'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
