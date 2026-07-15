"use client";

import { useState } from "react";
import Link from "next/link";
import { registerAffiliate } from "@/server/affiliate";

export default function AffiliateRegisterPage() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (form.password !== form.confirmPassword) {
      setError("كلمتا المرور غير متطابقتين");
      return;
    }

    if (form.password.length < 6) {
      setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }

    setLoading(true);
    const result = await registerAffiliate(
      form.username,
      form.email,
      form.password,
      form.phone || undefined
    );
    setLoading(false);

    if (result.success) {
      setForm({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: "",
      });
      setSuccessMessage(result.message);
    } else {
      setError(result.error);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-gray-light flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-8">
        <h1 className="text-2xl font-bold text-gray-dark text-center mb-2 font-tajawal">
          انضم لبرنامج سفراء skynova
        </h1>
        <p className="text-gray-500 text-center mb-8 font-tajawal text-sm">
          ابدأ بتحقيق دخل إضافي من خلال التسويق لمنتجاتنا
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 font-tajawal text-center">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm mb-4 font-tajawal text-center">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 font-tajawal">
              اسم المستخدم
            </label>
            <input
              type="text"
              required
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink focus:border-transparent font-tajawal"
              placeholder="أدخل اسمك"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 font-tajawal">
              البريد الإلكتروني
            </label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink focus:border-transparent font-tajawal"
              placeholder="example@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 font-tajawal">
              رقم الهاتف
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink focus:border-transparent font-tajawal"
              placeholder="اختياري"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 font-tajawal">
              كلمة المرور
            </label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink focus:border-transparent font-tajawal"
              placeholder="******"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 font-tajawal">
              تأكيد كلمة المرور
            </label>
            <input
              type="password"
              required
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink focus:border-transparent font-tajawal"
              placeholder="******"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-pink text-white py-3 rounded-xl font-bold hover:bg-pink-dark transition-colors font-tajawal disabled:opacity-50"
          >
            {loading ? "جاري التسجيل..." : "تسجيل"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6 font-tajawal">
          لديك حساب بالفعل؟{" "}
          <Link href="/affiliate/login" className="text-pink hover:underline font-medium">
            تسجيل الدخول
          </Link>
        </p>
      </div>
    </div>
  );
}
