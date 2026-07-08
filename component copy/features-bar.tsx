import React from "react";

const FEATURES = [
  {
    icon: (
      <svg className="w-8 h-8 text-[#c96]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
      </svg>
    ),
    title: "شحن مجاني وسريع",
    desc: "للطلبات الأكثر من 50 دولار",
  },
  {
    icon: (
      <svg className="w-8 h-8 text-[#c96]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: "منتجات أصلية 100%",
    desc: "مضمونة من أفضل الماركات",
  },
  {
    icon: (
      <svg className="w-8 h-8 text-[#c96]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    title: "دعم فني متواصل",
    desc: "متواجدون لخدمتكِ 24/7",
  },
  {
    icon: (
      <svg className="w-8 h-8 text-[#c96]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
    title: "دفع آمن وموثوق",
    desc: "تشفير كامل لبياناتكِ",
  },
];

export default function FeaturesBar() {
  return (
    <section className="bg-white border-t border-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        {FEATURES.map((f, i) => (
          <div key={i} className="flex items-center gap-4 text-right">
            <div className="shrink-0">{f.icon}</div>
            <div>
              <h4 className="font-bold text-sm text-[#333]">{f.title}</h4>
              <p className="text-xs text-gray-500 mt-0.5">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
