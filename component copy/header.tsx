"use client";

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useWishlist } from "@/context/WishlistContext";

export default function Header() {
  const { wishlistCount } = useWishlist();
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="w-full bg-white border-b border-gray-200 font-sans text-[#333] sticky top-0 z-50" dir="rtl">
      
      {/* 1. الشريط العلوي (Top Bar) */}
      <div className="border-b border-gray-100 text-xs text-gray-500 py-2.5 px-4 md:px-8 flex justify-between items-center bg-[#fafafa]">
        <div className="flex items-center gap-4">
          <p className="cursor-pointer flex items-center gap-1 hover:text-[#c96] text-xs font-semibold transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            تواصل معنا 
          </p>
          <span className="text-gray-300">|</span>
          <p className="text-xs">توصيل سريع لجميع الدول</p>
        </div>
        <div className="hidden md:flex items-center gap-6">
          <a href="#" className="cursor-pointer flex items-center gap-1 hover:text-[#c96] text-xs font-semibold transition-colors">
            تسجيل الدخول 
          </a>
          <span className="text-gray-300">|</span>
          <a href="#" className="cursor-pointer flex items-center gap-1 hover:text-[#c96] text-xs font-semibold transition-colors">
            إنشاء حساب
          </a>
        </div>
      </div>

      {/* 2. شريط الوسط الأساسي (Main Header) */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-5 flex items-center justify-between gap-4">
        
        {/* زر القائمة المتنقلة */}
        <button 
          className="md:hidden p-2 text-gray-600 hover:text-[#c96] transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* اللوجو */}
        <div className="text-2xl md:text-3xl font-bold text-[#222] font-serif tracking-tight shrink-0">
          Glam<span className="text-[#c96]">Tools</span>
        </div>

        {/* حقل البحث المركزي الممتد (Search Bar) */}
        <div className="hidden md:flex flex-1 max-w-xl mx-8">
          <form className="w-full flex items-center border-2 border-[#e1e1e1] rounded-full overflow-hidden bg-white focus-within:border-[#c96] transition-colors">
            <input 
              type="text" 
              placeholder="ابحثي عن فرشاة، سشوار، مقص..." 
              className="w-full px-5 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none text-right"
            />
            <button type="submit" className="px-5 text-gray-400 hover:text-[#c96] transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>
        </div>

        {/* أزرار التحكم والمؤشرات */}
        <div className="flex items-center gap-5 md:gap-6 text-gray-700 text-xs font-medium">
          
          {/* الحساب */}
          <a href="#" className="hidden md:flex flex-col items-center gap-1 hover:text-[#c96] transition-colors group">
            <svg className="w-6 h-6 stroke-1 group-hover:stroke-2 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>حسابي</span>
          </a>

          {/* المفضلة */}
          <Link href="/wishlist" className="flex flex-col items-center gap-1 hover:text-[#c96] transition-colors relative group">
            <svg className="w-6 h-6 stroke-1 group-hover:stroke-2 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            {wishlistCount > 0 && (
              <span className="absolute -top-1 right-2 bg-[#c96] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-sans">{wishlistCount}</span>
            )}
            <span className="hidden md:inline">المفضلة</span>
          </Link>

          {/* السلة */}
          <a href="#" className="flex flex-col items-center gap-1 hover:text-[#c96] transition-colors relative group">
            <svg className="w-6 h-6 stroke-1 group-hover:stroke-2 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <span className="absolute -top-1 right-1 bg-[#a6c76c] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-sans">2</span>
            <span className="hidden md:inline">السلة</span>
          </a>

        </div>
      </div>

      {/* 3. شريط التنقل السفلي (Navigation Bar) */}
      <div className="border-t border-gray-100 hidden md:block bg-white">
        <div className="max-w-7xl mx-auto px-8 flex items-center justify-between relative">
          
          {/* زر تصفح الأقسام الجانبي (Browse Categories) */}
          <div className="relative z-20">
            <button 
              onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
              className="bg-white text-[#333] font-semibold text-sm py-4 px-5 flex items-center gap-3 hover:text-[#c96] transition-colors border-l border-r border-gray-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <span>تصفح الأقسام</span>
            </button>

            {/* القائمة المنسدلة للتصنيفات */}
            {isCategoriesOpen && (
              <div className="absolute right-0 top-full w-64 bg-white border border-gray-200 shadow-xl py-2 flex flex-col text-sm text-gray-700 animate-fadeIn">
                <a href="#" className="px-4 py-2.5 hover:bg-[#fafafa] hover:text-[#c96] flex items-center gap-2 transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#c96]"></span> أدوات تصفيف الشعر
                </a>
                <a href="#" className="px-4 py-2.5 hover:bg-[#fafafa] hover:text-[#c96] flex items-center gap-2 transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#a6c76c]"></span> فرش المكياج والأساس
                </a>
                <a href="#" className="px-4 py-2.5 hover:bg-[#fafafa] hover:text-[#c96] flex items-center gap-2 transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ef837b]"></span> أدوات العناية بالبشرة
                </a>
                <a href="#" className="px-4 py-2.5 hover:bg-[#fafafa] hover:text-[#c96] flex items-center gap-2 transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1cc0a0]"></span> مرايات التجميل الاحترافية
                </a>
                <a href="#" className="px-4 py-2.5 hover:bg-[#fafafa] hover:text-[#c96] flex items-center gap-2 transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#c96]"></span> منظمات وأدوات تخزين
                </a>
                <a href="#" className="px-4 py-2.5 hover:bg-[#fafafa] hover:text-[#c96] flex items-center gap-2 transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#a6c76c]"></span> أدوات العناية بالأظافر
                </a>
              </div>
            )}
          </div>

          {/* القائمة الرئيسية (Menu Links) */}
          <nav className="flex items-center gap-7 text-sm font-semibold text-[#333]">
            <a href="#" className="text-[#c96] py-4 flex items-center gap-1 transition-colors">الرئيسية</a>
            <a href="#" className="hover:text-[#c96] py-4 flex items-center gap-1 transition-colors">المتجر <span className="text-[10px] text-gray-400">▼</span></a>
            <a href="#" className="hover:text-[#c96] py-4 flex items-center gap-1 transition-colors">المنتجات <span className="text-[10px] text-gray-400">▼</span></a>
            <a href="#" className="hover:text-[#c96] py-4 flex items-center gap-1 transition-colors">العروض <span className="text-[10px] text-gray-400">▼</span></a>
            <a href="#" className="hover:text-[#c96] py-4 flex items-center gap-1 transition-colors">المدونة <span className="text-[10px] text-gray-400">▼</span></a>
            <a href="#" className="hover:text-[#c96] py-4 transition-colors">من نحن</a>
          </nav>

          {/* العرض الترويجي الجانبي */}
          <div className="flex items-center gap-2 text-xs font-semibold text-[#c96]">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>تخفيضات تصل إلى 30%</span>
          </div>

        </div>
      </div>

      {/* القائمة المتنقلة (Mobile Menu) */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-2">
          <a href="#" className="block py-2 text-[#c96] font-semibold text-sm">الرئيسية</a>
          <a href="#" className="block py-2 text-[#333] font-semibold text-sm hover:text-[#c96] transition-colors">المتجر</a>
          <a href="#" className="block py-2 text-[#333] font-semibold text-sm hover:text-[#c96] transition-colors">المنتجات</a>
          <a href="#" className="block py-2 text-[#333] font-semibold text-sm hover:text-[#c96] transition-colors">العروض</a>
          <a href="#" className="block py-2 text-[#333] font-semibold text-sm hover:text-[#c96] transition-colors">المدونة</a>
          <a href="#" className="block py-2 text-[#333] font-semibold text-sm hover:text-[#c96] transition-colors">من نحن</a>
          <hr className="border-gray-100 my-2" />
          <a href="#" className="block py-2 text-[#333] text-sm hover:text-[#c96] transition-colors">تسجيل الدخول</a>
          <a href="#" className="block py-2 text-[#333] text-sm hover:text-[#c96] transition-colors">إنشاء حساب</a>
        </div>
      )}

    </header>
  );
}
