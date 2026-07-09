"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useCart } from "@/context/CartContext";
import { useRegion } from "@/context/RegionContext";
import { useSettings } from "@/context/SettingsContext";
import { useAuth } from "@/context/AuthContext";
import { formatPrice } from "@/lib/currency";
import { countries, citiesByCountry } from "@/lib/cities";
import { MapPin, User, ShoppingBag, ChevronLeft, CheckCircle } from "lucide-react";
import PhoneInput from "react-phone-number-input";

const MapPicker = dynamic(() => import("@/component/MapPicker"), { ssr: false });

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCart();
  const { country: regionCountry } = useRegion();
  const { siteCurrency, usdToTryRate } = useSettings();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    country: regionCountry === "TR" ? "TR" : "SY",
    city: "",
    address: "",
    notes: "",
  });

  const [position, setPosition] = useState<[number, number] | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [stockErrors, setStockErrors] = useState<string[]>([]);
  const [checkingStock, setCheckingStock] = useState(false);

  // Auto-detect user location on mount
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError("المتصفح لا يدعم تحديد الموقع الجغرافي");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (geo) => {
        const pos: [number, number] = [geo.coords.latitude, geo.coords.longitude];
        setPosition(pos);
        setLocationError(null);
      },
      (err) => {
        let msg = "تعذر تحديد الموقع";
        if (err.code === 1) msg = "تم رفض إذن الوصول للموقع. يرجى السماح بالوصول أو تحديد الموقع يدوياً.";
        else if (err.code === 2) msg = "معلومات الموقع غير متوفرة حالياً.";
        else if (err.code === 3) msg = "انتهى الوقت المحدد لتحديد الموقع.";
        setLocationError(msg);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  // Sync checkout country with the selected region
  useEffect(() => {
    setFormData((prev) => {
      const nextCountry = regionCountry === "TR" ? "TR" : "SY";
      if (prev.country === nextCountry) return prev;
      return { ...prev, country: nextCountry, city: "" };
    });
  }, [regionCountry]);

  const validateStock = useCallback(async (country: string) => {
    if (!country || items.length === 0) {
      setStockErrors([]);
      return;
    }
    setCheckingStock(true);
    try {
      const res = await fetch("/api/checkout/validate-stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ country, items }),
      });
      const data = await res.json();
      if (data.outOfStock?.length > 0) {
        setStockErrors(
          data.outOfStock.map(
            (item: any) =>
              `${item.name}: المخزون غير كافي (متوفر: ${item.available}, مطلوب: ${item.requested})`
          )
        );
      } else {
        setStockErrors([]);
      }
    } catch {
      setStockErrors([]);
    } finally {
      setCheckingStock(false);
    }
  }, [items]);

  // Validate stock when country or items change
  useEffect(() => {
    if (formData.country) {
      validateStock(formData.country);
    }
  }, [formData.country, items, validateStock]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => {
        const next = { ...prev, [name]: value };
        if (name === "country") {
          next.city = "";
          validateStock(value);
        }
        return next;
      });
    },
    [validateStock]
  );

  const availableCities = formData.country ? citiesByCountry[formData.country] || [] : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    setIsSubmitting(true);

    try {
      const affiliateCode = typeof window !== "undefined" ? localStorage.getItem("affiliate-code") : null;
      const authToken = typeof window !== "undefined" ? localStorage.getItem("ecommerce-auth-token") : null;
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify({
          ...formData,
          customerId: user?.id ?? null,
          lat: position?.[0] ?? null,
          lng: position?.[1] ?? null,
          items,
          totalPrice,
          affiliateCode,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
        clearCart();
        setTimeout(() => {
          router.push("/");
        }, 3000);
      } else {
        alert("حدث خطأ أثناء إرسال الطلب، يرجى المحاولة مرة أخرى.");
      }
    } catch {
      alert("حدث خطأ أثناء إرسال الطلب، يرجى المحاولة مرة أخرى.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-light flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <CheckCircle className="mx-auto text-pink mb-4" size={64} />
          <h2 className="text-2xl font-bold text-gray-dark font-tajawal mb-2">
            تم إرسال طلبك بنجاح!
          </h2>
          <p className="text-gray-500 font-tajawal mb-6">
            سنتواصل معك قريباً لتأكيد الطلب وترتيب التوصيل.
          </p>
          <button
            onClick={() => router.push("/")}
            className="w-full bg-pink text-white py-3 rounded-full font-bold hover:bg-pink-dark transition-colors font-tajawal"
          >
            العودة للرئيسية
          </button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-light flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <ShoppingBag className="mx-auto text-gray-300 mb-4" size={64} />
          <h2 className="text-2xl font-bold text-gray-dark font-tajawal mb-2">
            السلة فارغة
          </h2>
          <p className="text-gray-500 font-tajawal mb-6">
            لا يوجد منتجات في سلة المشتريات لإتمام الطلب.
          </p>
          <button
            onClick={() => router.push("/")}
            className="w-full bg-pink text-white py-3 rounded-full font-bold hover:bg-pink-dark transition-colors font-tajawal"
          >
            العودة للتسوق
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-light font-tajawal">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeft size={24} className="text-gray-dark" />
          </button>
          <h1 className="text-xl font-bold text-gray-dark font-tajawal">
            إتمام الطلب
          </h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-dark mb-6 flex items-center gap-2">
                <User size={20} className="text-pink" />
                معلومات التوصيل
              </h2>

              <form id="checkout-form" onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      الاسم الكامل <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User
                        size={18}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="أدخل اسمك الكامل"
                        className="w-full pr-10 pl-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink/50 focus:border-pink transition-all text-gray-dark"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      رقم الهاتف <span className="text-red-500">*</span>
                    </label>
                    <div className="phone-input-wrapper" dir="ltr">
                      <PhoneInput
                        defaultCountry="SY"
                        value={formData.phone}
                        onChange={(value) =>
                          setFormData((prev) => ({ ...prev, phone: value || "" }))
                        }
                        placeholder="Enter phone number"
                        className="w-full border border-gray-200 rounded-xl focus-within:border-pink focus-within:ring-2 focus-within:ring-pink/50 text-gray-dark overflow-hidden"
                      />
                    </div>
                  </div>

                  {/* Country */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      الدولة <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="country"
                      required
                      value={formData.country}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink/50 focus:border-pink transition-all text-gray-dark bg-white"
                    >
                      <option value="">اختر الدولة</option>
                      {countries.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      المدينة <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="city"
                      required
                      value={formData.city}
                      onChange={handleChange}
                      disabled={!formData.country}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink/50 focus:border-pink transition-all text-gray-dark bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">
                        {formData.country ? "اختر المدينة" : "اختر الدولة أولاً"}
                      </option>
                      {availableCities.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    العنوان التفصيلي <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin
                      size={18}
                      className="absolute right-3 top-3.5 text-gray-400"
                    />
                    <textarea
                      name="address"
                      required
                      value={formData.address}
                      onChange={handleChange}
                      rows={3}
                      placeholder="المنطقة، الحي، أقرب نقطة دالة..."
                      className="w-full pr-10 pl-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink/50 focus:border-pink transition-all text-gray-dark resize-none"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    ملاحظات إضافية
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={2}
                    placeholder="أي ملاحظات خاصة بالتوصيل..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink/50 focus:border-pink transition-all text-gray-dark resize-none"
                  />
                </div>

                {/* Map */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <MapPin size={18} className="text-pink" />
                    تحديد الموقع على الخريطة
                  </label>
                  <p className="text-xs text-gray-500 mb-3">
                    انقر على الخريطة لتحديد موقعك بدقة
                  </p>
                  <MapPicker position={position} onPositionChange={setPosition} />
                  {position && (
                    <p className="text-xs text-pink-dark mt-2 flex items-center gap-1">
                      <CheckCircle size={14} />
                      تم تحديد الموقع: {position[0].toFixed(5)}, {position[1].toFixed(5)}
                    </p>
                  )}
                  {locationError && (
                    <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                      <MapPin size={14} />
                      {locationError}
                    </p>
                  )}
                </div>

                {/* Stock Errors */}
                {checkingStock && (
                  <div className="text-sm text-gray-500 flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-pink border-t-transparent rounded-full animate-spin inline-block" />
                    جاري التحقق من المخزون...
                  </div>
                )}
                {stockErrors.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <p className="text-red-600 font-bold text-sm mb-2 font-tajawal">
                      المنتجات التالية غير متوفرة في المخزون:
                    </p>
                    <ul className="space-y-1">
                      {stockErrors.map((err, idx) => (
                        <li key={idx} className="text-red-500 text-sm font-tajawal">
                          • {err}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
              <h2 className="text-lg font-bold text-gray-dark mb-6 flex items-center gap-2">
                <ShoppingBag size={20} className="text-pink" />
                ملخص الطلب
              </h2>

              <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3 bg-gray-light rounded-xl p-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-dark truncate">
                        {item.name}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        الكمية: {item.quantity}
                      </p>
                      <p className="text-pink-dark font-bold text-sm mt-1">
                        {formatPrice(item.price * item.quantity, siteCurrency, usdToTryRate)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">عدد المنتجات</span>
                  <span className="font-medium text-gray-dark">
                    {items.reduce((sum, i) => sum + i.quantity, 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 font-tajawal">الإجمالي</span>
                  <span className="text-2xl font-bold text-pink-dark font-tajawal">
                    {formatPrice(totalPrice, siteCurrency, usdToTryRate)}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                form="checkout-form"
                disabled={isSubmitting || stockErrors.length > 0 || checkingStock}
                className="w-full mt-6 bg-pink text-white py-3.5 rounded-full font-bold hover:bg-pink-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-tajawal"
              >
                {isSubmitting
                  ? "جاري إرسال الطلب..."
                  : stockErrors.length > 0
                  ? "المنتجات غير متوفرة في المخزون"
                  : "تأكيد الطلب"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
