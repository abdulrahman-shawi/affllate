"use client";

import { useState } from "react";
import { X, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Tab = "login" | "register";

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { login, register } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Login fields
  const [loginName, setLoginName] = useState("");
  const [loginPhone, setLoginPhone] = useState("");

  // Register fields
  const [regName, setRegName] = useState("");
  const [regPhone, setRegPhone] = useState("");

  if (!isOpen) return null;

  const resetFields = () => {
    setError("");
    setLoginName("");
    setLoginPhone("");
    setRegName("");
    setRegPhone("");
  };

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    resetFields();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!loginName || !loginPhone) {
      setError("الرجاء ملء جميع الحقول");
      return;
    }
    setLoading(true);
    const result = await login(loginName, loginPhone);
    setLoading(false);
    if (result.success) {
      resetFields();
      onClose();
      router.push("/account");
    } else {
      setError(result.error || "الاسم أو رقم الهاتف غير صحيح");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!regName || !regPhone) {
      setError("الرجاء ملء جميع الحقول");
      return;
    }
    setLoading(true);
    const result = await register(regName, regPhone);
    setLoading(false);
    if (result.success) {
      resetFields();
      onClose();
      router.push("/account");
    } else {
      setError(result.error || "حدث خطأ أثناء التسجيل");
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" />

      {/* Modal */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 z-10 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
        >
          <X size={18} className="text-gray-600" />
        </button>

        {/* Header / Tabs */}
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => handleTabChange("login")}
            className={`flex-1 py-4 text-center font-tajawal font-bold text-sm transition-colors relative ${
              activeTab === "login"
                ? "text-pink"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            تسجيل الدخول
            {activeTab === "login" && (
              <span className="absolute bottom-0 right-0 w-full h-0.5 bg-pink" />
            )}
          </button>
          <button
            onClick={() => handleTabChange("register")}
            className={`flex-1 py-4 text-center font-tajawal font-bold text-sm transition-colors relative ${
              activeTab === "register"
                ? "text-pink"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            حساب جديد
            {activeTab === "register" && (
              <span className="absolute bottom-0 right-0 w-full h-0.5 bg-pink" />
            )}
          </button>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg font-tajawal text-center">
              {error}
            </div>
          )}

          {activeTab === "login" ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 font-tajawal">
                  اسم المستخدم
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={loginName}
                    onChange={(e) => setLoginName(e.target.value)}
                    className="w-full h-11 pr-10 pl-4 border border-gray-200 rounded-xl focus:outline-none focus:border-pink focus:ring-1 focus:ring-pink text-sm font-tajawal"
                    placeholder="محمد أحمد"
                  />
                  <User size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 font-tajawal">
                  رقم الهاتف
                </label>
                <div className="phone-input-wrapper" dir="ltr">
                  <PhoneInput
                    defaultCountry="SY"
                    value={loginPhone}
                    onChange={(value) => setLoginPhone(value || "")}
                    placeholder="Enter phone number"
                    className="w-full h-11 border border-gray-200 rounded-xl focus-within:border-pink focus-within:ring-1 focus-within:ring-pink text-sm font-tajawal overflow-hidden"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-pink text-white rounded-full font-medium text-sm hover:bg-pink-dark transition-colors font-tajawal disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "جاري التسجيل..." : "تسجيل الدخول"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 font-tajawal">
                  الاسم الكامل
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full h-11 pr-10 pl-4 border border-gray-200 rounded-xl focus:outline-none focus:border-pink focus:ring-1 focus:ring-pink text-sm font-tajawal"
                    placeholder="محمد أحمد"
                  />
                  <User size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 font-tajawal">
                  رقم الهاتف
                </label>
                <div className="phone-input-wrapper" dir="ltr">
                  <PhoneInput
                    defaultCountry="SY"
                    value={regPhone}
                    onChange={(value) => setRegPhone(value || "")}
                    placeholder="Enter phone number"
                    className="w-full h-11 border border-gray-200 rounded-xl focus-within:border-pink focus-within:ring-1 focus-within:ring-pink text-sm font-tajawal overflow-hidden"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-pink text-white rounded-full font-medium text-sm hover:bg-pink-dark transition-colors font-tajawal disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "جاري إنشاء الحساب..." : "إنشاء حساب"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
