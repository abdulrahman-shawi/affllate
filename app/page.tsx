"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginAffiliate } from "@/server/affiliate";

export default function AffiliateLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await loginAffiliate(form.email, form.password);
    setLoading(false);

    if (result.success) {
      localStorage.setItem("affiliate-user", JSON.stringify(result.user));
      localStorage.setItem("affiliate-token", result.user.token);
      router.push("/affiliate/dashboard");
    } else {
      setError(result.error);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-gray-light flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-8">
        <h1 className="text-2xl font-bold text-gray-dark text-center mb-2 font-tajawal">
          تسجيل دخول الأفلييت
        </h1>
        <p className="text-gray-500 text-center mb-8 font-tajawal text-sm">
          أهلاً بعودتك! سجل دخولك لإدارة روابطك وعمولاتك
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 font-tajawal text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-pink text-white py-3 rounded-xl font-bold hover:bg-pink-dark transition-colors font-tajawal disabled:opacity-50"
          >
            {loading ? "جاري الدخول..." : "تسجيل الدخول"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6 font-tajawal">
          ليس لديك حساب؟{" "}
          <Link href="/affiliate/register" className="text-pink hover:underline font-medium">
            سجل الآن
          </Link>
        </p>
      </div>
    </div>
  );
}
