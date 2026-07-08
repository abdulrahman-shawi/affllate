"use client";

import SectionTitle from '@/component/SectionTitle';
import StarRating from '@/component/StarRating';

interface Testimonial {
  id: string;
  name: string;
  rating: number;
  comment: string | null;
}

interface TestimonialsProps {
  testimonials: Testimonial[];
}

const colorClasses = ['bg-pink', 'bg-pink-dark', 'bg-purple-400', 'bg-teal-500', 'bg-orange-400'];

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('');
}

export default function Testimonials({ testimonials }: TestimonialsProps) {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <SectionTitle title="آراء عملائنا" subtitle="شاهدي ما تقوله عملاؤنا عن منتجاتنا" />

        {testimonials.length === 0 ? (
          <p className="text-center text-gray-500 font-tajawal">لا توجد آراء حالياً.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.id}
                className="bg-gray-light rounded-2xl p-6 border border-gray-100 hover:shadow-lg hover:shadow-pink/10 transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 ${colorClasses[index % colorClasses.length]} rounded-full flex items-center justify-center text-white font-bold text-lg`}>
                    {getInitials(testimonial.name)}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-dark font-tajawal">{testimonial.name}</h4>
                    <StarRating rating={testimonial.rating} />
                  </div>
                </div>
                <p className="text-gray-600 leading-relaxed font-tajawal">
                  &ldquo;{testimonial.comment}&rdquo;
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
