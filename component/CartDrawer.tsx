"use client";

import { X, Plus, Minus, ShoppingBag, Trash2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useSettings } from '@/context/SettingsContext';
import { formatPrice } from '@/lib/currency';
import Link from 'next/link';

export default function CartDrawer() {
  const { items, isOpen, setIsOpen, updateQuantity, removeFromCart, totalPrice } = useCart();
  const { siteCurrency, usdToTryRate } = useSettings();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />
      <div className="absolute left-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-left">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ShoppingBag className="text-pink" size={22} />
            <h2 className="text-xl font-bold text-gray-dark font-tajawal">سلة المشتريات</h2>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-5">
          {items.length === 0 ? (
            <div className="text-center py-20">
              <ShoppingBag size={64} className="mx-auto text-gray-200 mb-4" />
              <p className="text-gray-400 font-tajawal text-lg">السلة فارغة</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 bg-gray-light rounded-xl p-3"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-dark text-sm font-tajawal mb-1">
                      {item.name}
                    </h4>
                    <p className="text-pink-dark font-bold font-tajawal mb-2">
                      {formatPrice(item.price, siteCurrency, usdToTryRate)}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 bg-white rounded-full px-2 py-1">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 hover:text-pink transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="text-sm font-medium w-4 text-center font-tajawal">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 hover:text-pink transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-1.5 text-red-400 hover:bg-red-50 rounded-full transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 font-tajawal">الإجمالي:</span>
              <span className="text-2xl font-bold text-pink-dark font-tajawal">
                {formatPrice(totalPrice, siteCurrency, usdToTryRate)}
              </span>
            </div>
            <Link
              href="/checkout"
              onClick={() => setIsOpen(false)}
              className="block w-full bg-pink text-white py-3 rounded-full font-bold hover:bg-pink-dark transition-colors font-tajawal text-center"
            >
              إتمام الطلب
            </Link>
            <button
              onClick={() => setIsOpen(false)}
              className="w-full border border-gray-200 text-gray-600 py-3 rounded-full font-medium hover:bg-gray-50 transition-colors font-tajawal"
            >
              مواصلة التسوق
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
