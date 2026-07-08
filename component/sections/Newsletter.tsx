"use client";

import { useState } from 'react';
import { Mail, Send } from 'lucide-react';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setEmail('');
      }, 3000);
    }
  };

  return (
    <section className="py-20 bg-gray-light">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-lg shadow-pink/10">
          <div className="bg-pink-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="text-pink" size={28} />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-dark mb-3 font-tajawal">
            اشتركي في نشرتنا البريدية
          </h2>
          <p className="text-gray-500 mb-8 font-tajawal">
            احصلي على أحدث العروض والخصومات مباشرة إلى بريدك الإلكتروني
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              placeholder="أدخلي بريدك الإلكتروني"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 h-12 px-5 border border-gray-200 rounded-full focus:outline-none focus:border-pink focus:ring-1 focus:ring-pink text-sm font-tajawal"
              required
            />
            <button
              type="submit"
              className={`h-12 px-6 rounded-full font-bold flex items-center justify-center gap-2 transition-all font-tajawal ${
                submitted
                  ? 'bg-green-500 text-white'
                  : 'bg-pink text-white hover:bg-pink-dark'
              }`}
            >
              <Send size={16} />
              {submitted ? 'تم الاشتراك!' : 'اشتراك'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
