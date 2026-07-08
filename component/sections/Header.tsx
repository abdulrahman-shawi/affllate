"use client";

import { useState, useEffect } from 'react';
import { Search, User, Heart, ShoppingCart, Menu, X, ChevronDown, Globe } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import { useRegion } from '@/context/RegionContext';
import { useSettings } from '@/context/SettingsContext';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import AuthModal from '@/component/AuthModal';

const navItems = [
  { label: 'الرئيسية', href: '/' },
  { label: 'منتجاتنا', href: '/#products' },
  { label: 'الفئات', href: '/#categories' },
  { label: 'العروض', href: '/#offers' },
  { label: 'من نحن', href: '/من-نحن' },
];

export default function Header() {
  const { totalItems, setIsOpen } = useCart();
  const { wishlistCount } = useWishlist();
  const { isLoggedIn } = useAuth();
  const { country, setCountry } = useRegion();
  const { siteName, logo } = useSettings();
  const router = useRouter();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [regionOpen, setRegionOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!regionOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-region-selector]')) {
        setRegionOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [regionOpen]);

  const handleNavClick = (href: string) => {
    if (href.startsWith('/#')) {
      const id = href.replace('/#', '');
      if (pathname === '/') {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      } else {
        router.push(`/?section=${id}`);
      }
    } else {
      router.push(href);
    }
    setMobileMenuOpen(false);
  };

  const handleSearch = () => {
    const trimmed = searchQuery.trim();
    if (trimmed) {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
      setSearchQuery('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 backdrop-blur-md shadow-sm'
          : 'bg-white'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between gap-4">
        {/* Mobile Menu Button */}
        <button
          className="lg:hidden p-2 hover:bg-gray-100 rounded-full"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Logo */}
        <div className="flex items-center shrink-0 cursor-pointer" onClick={() => handleNavClick('/')}>
          {logo ? (
            <Image src={logo} alt={siteName || 'SKYNOVA'} width={140} height={48} className="h-12 w-auto object-contain" />
          ) : (
            <h1 className="text-3xl font-bold text-pink font-tajawal tracking-tight">
              {siteName || 'SKYNOVA'}
            </h1>
          )}
        </div>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={(e) => {
                if (item.href.startsWith('/#')) {
                  e.preventDefault();
                  handleNavClick(item.href);
                }
              }}
              className="text-gray-dark hover:text-pink font-medium transition-colors relative group font-tajawal"
            >
              {item.label}
              <span className="absolute -bottom-1 right-0 w-0 h-0.5 bg-pink transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </nav>

        {/* Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="ابحثي عن منتج..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full h-10 pr-4 pl-12 border border-gray-200 rounded-full focus:outline-none focus:border-pink focus:ring-1 focus:ring-pink text-sm font-tajawal"
            />
            <button
              onClick={handleSearch}
              className="absolute left-1.5 top-1/2 -translate-y-1/2 bg-pink text-white p-2 rounded-full hover:bg-pink-dark transition-colors"
            >
              <Search size={16} />
            </button>
          </div>
        </div>

        {/* Icons */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Country selector */}
          <div className="relative" data-region-selector>
            <button
              onClick={() => setRegionOpen(!regionOpen)}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-700"
              aria-label="اختيار الدولة"
            >
              <Globe size={18} className="hidden sm:inline text-pink" />
              <span className="text-sm font-tajawal font-medium">
                {country === 'TR' ? 'تركيا' : 'سوريا'}
              </span>
              <ChevronDown size={14} className={`transition-transform ${regionOpen ? 'rotate-180' : ''}`} />
            </button>

            {regionOpen && (
              <div className="absolute left-0 top-full mt-2 w-40 bg-white border border-gray-100 shadow-lg rounded-xl py-1.5 z-50 animate-in fade-in slide-in-from-top-1">
                <button
                  onClick={() => {
                    setCountry('TR');
                    setRegionOpen(false);
                  }}
                  className={`w-full text-right px-4 py-2 text-sm font-tajawal hover:bg-pink-50 transition-colors flex items-center justify-between ${
                    country === 'TR' ? 'text-pink font-bold bg-pink-50' : 'text-gray-700'
                  }`}
                >
                  <span>تركيا</span>
                  {country === 'TR' && <span className="text-pink">✓</span>}
                </button>
                <button
                  onClick={() => {
                    setCountry('SY');
                    setRegionOpen(false);
                  }}
                  className={`w-full text-right px-4 py-2 text-sm font-tajawal hover:bg-pink-50 transition-colors flex items-center justify-between ${
                    country === 'SY' ? 'text-pink font-bold bg-pink-50' : 'text-gray-700'
                  }`}
                >
                  <span>سوريا</span>
                  {country === 'SY' && <span className="text-pink">✓</span>}
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              if (isLoggedIn) {
                router.push('/account');
              } else {
                setAuthModalOpen(true);
              }
            }}
            className="p-2 hover:text-pink hover:scale-110 transition-all"
          >
            <User size={22} />
          </button>
          <button
            onClick={() => router.push('/wishlist')}
            className="p-2 hover:text-pink hover:scale-110 transition-all hidden sm:block relative"
          >
            <Heart size={22} />
            {wishlistCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-pink-dark text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setIsOpen(true)}
            className="p-2 hover:text-pink hover:scale-110 transition-all relative"
          >
            <ShoppingCart size={22} />
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-pink-dark text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 animate-in slide-in-from-top">
          <nav className="flex flex-col p-4">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={(e) => {
                  if (item.href.startsWith('/#')) {
                    e.preventDefault();
                    handleNavClick(item.href);
                  }
                }}
                className="py-3 px-4 text-right hover:bg-pink-50 hover:text-pink rounded-xl transition-colors font-tajawal font-medium"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          {/* Mobile Search */}
          <div className="px-4 pb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="ابحثي عن منتج..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full h-10 pr-4 pl-12 border border-gray-200 rounded-full focus:outline-none focus:border-pink text-sm font-tajawal"
              />
              <button
                onClick={handleSearch}
                className="absolute left-1.5 top-1/2 -translate-y-1/2 bg-pink text-white p-2 rounded-full"
              >
                <Search size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
