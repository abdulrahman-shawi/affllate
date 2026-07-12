"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Phone, MessageCircle, Mail } from "lucide-react";
import Image from "next/image";

interface FooterPage {
  id: string;
  slug: string;
  title: string;
}

interface GeneralSettings {
  siteName: string;
  companyEmail: string;
  companyPhone: string;
  siteCurrency: string;
  usdToTryRate: number;
  facebookUrl: string;
  instagramUrl: string;
  logo: string;
  primaryColor: string;
  secondaryColor: string;
  topBannerText: string;
}

const quickLinks = [
  { label: "الرئيسية", href: "/" },
  { label: "منتجاتنا", href: "/#products" },
  { label: "العروض", href: "/#offers" },
  { label: "من نحن", href: "/من-نحن" },
];

const defaultSettings: GeneralSettings = {
  siteName: "سفراء skynova",
  companyEmail: "",
  companyPhone: "",
  siteCurrency: "USD",
  usdToTryRate: 0,
  facebookUrl: "",
  instagramUrl: "",
  logo: "",
  primaryColor: "#10b981",
  secondaryColor: "#0f766e",
  topBannerText: "",
};

export default function Footer() {
  const [pages, setPages] = useState<FooterPage[]>([]);
  const [settings, setSettings] = useState<GeneralSettings>(defaultSettings);

  useEffect(() => {
    fetch("/api/pages")
      .then((res) => res.json())
      .then((data: FooterPage[]) => setPages(data))
      .catch(() => setPages([]));

    fetch("/api/settings")
      .then((res) => res.json())
      .then((data: GeneralSettings) => setSettings({ ...defaultSettings, ...data }))
      .catch(() => {});
  }, []);

  const whatsappLink = settings.companyPhone
    ? `https://wa.me/${settings.companyPhone.replace(/\D/g, "")}`
    : "#";
  const telLink = settings.companyPhone
    ? `tel:${settings.companyPhone}`
    : "#";

  // إخفاء "من نحن" من خدمة العملاء لأنها تظهر بالفعل في الروابط السريعة
  const customerServicePages = pages.filter(
    (page) => page.title.trim() !== "من نحن"
  );

  return (
    <footer id="footer" className="bg-gray-dark text-white pt-16 pb-6">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* About */}
          <div>
            {settings.logo ? (
              <Image src={settings.logo} alt={settings.siteName} width={160} height={56} className="h-14 w-auto object-contain mb-4" />
            ) : (
              <h3 className="text-3xl font-bold text-pink mb-4 font-tajawal">
                {settings.siteName}
              </h3>
            )}
            <p className="text-gray-400 leading-relaxed text-sm font-tajawal">
              وجهتك الأولى لمنتجات العناية بالبشرة والشعر. نقدم لكِ أفضل المنتجات
              الأصلية بأسعار مميزة مع توصيل سريع لجميع أنحاء المملكة.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-lg mb-4 font-tajawal">روابط سريعة</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-pink transition-colors text-sm font-tajawal"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service / Static Pages */}
          <div>
            <h4 className="font-bold text-lg mb-4 font-tajawal">خدمة العملاء</h4>
            <ul className="space-y-3">
              {customerServicePages.map((page) => (
                <li key={page.id}>
                  <Link
                    href={`/${encodeURIComponent(page.slug)}`}
                    className="text-gray-400 hover:text-pink transition-colors text-sm font-tajawal"
                  >
                    {page.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-lg mb-4 font-tajawal">تواصل معنا</h4>
            <div className="space-y-3">
              {settings.companyPhone && (
                <>
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-gray-400 hover:text-pink transition-colors text-sm font-tajawal"
                  >
                    <MessageCircle size={18} />
                    واتساب
                  </a>
                  <a
                    href={telLink}
                    className="flex items-center gap-2 text-gray-400 hover:text-pink transition-colors text-sm font-tajawal"
                  >
                    <Phone size={18} />
                    {settings.companyPhone}
                  </a>
                </>
              )}
              {settings.companyEmail && (
                <a
                  href={`mailto:${settings.companyEmail}`}
                  className="flex items-center gap-2 text-gray-400 hover:text-pink transition-colors text-sm font-tajawal"
                >
                  <Mail size={18} />
                  {settings.companyEmail}
                </a>
              )}
              {settings.instagramUrl && (
                <a
                  href={settings.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-gray-400 hover:text-pink transition-colors text-sm font-tajawal"
                >
                  <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                  إنستغرام
                </a>
              )}
              {settings.facebookUrl && (
                <a
                  href={settings.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-gray-400 hover:text-pink transition-colors text-sm font-tajawal"
                >
                  <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  فيسبوك
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-700 pt-6 text-center">
          <p className="text-gray-500 text-sm font-tajawal">
            © 2026 {settings.siteName}. جميع الحقوق محفوظة.
          </p>
        </div>
      </div>
    </footer>
  );
}
