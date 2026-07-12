"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  getAffiliateDashboard,
  getAffiliateLinks,
  getAffiliateCommissions,
} from "@/server/affiliate";
import type { AffiliateUser } from "@/server/affiliate";
import {
  MousePointerClick,
  ShoppingCart,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Copy,
  ExternalLink,
  LogOut,
  BarChart3,
  Link as LinkIcon,
} from "lucide-react";
import { useSettings } from "@/context/SettingsContext";
import { formatPrice } from "@/lib/currency";

interface DashboardData {
  totalClicks: number;
  totalConversions: number;
  successfulReferrals: number;
  totalCommissions: number;
  pendingCommissions: number;
  paidCommissions: number;
  potentialCommissions: number;
  confirmedCommissions: number;
  lostCommissions: number;
  linksCount: number;
  links: any[];
}

const AFFILIATE_BASE_URL = "https://www.skynova-tr.com";

export default function AffiliateDashboardPage() {
  const router = useRouter();
  const { siteCurrency, usdToTryRate } = useSettings();
  const [user, setUser] = useState<AffiliateUser | null>(null);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [commissions, setCommissions] = useState<any[]>([]);
  const [links, setLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("affiliate-user");
    if (!stored) {
      router.push("/affiliate/login");
      return;
    }
    setUser(JSON.parse(stored));
  }, [router]);

  useEffect(() => {
    if (!user) return;
    loadDashboard();
  }, [user]);

  const loadDashboard = async () => {
    if (!user) return;
    setLoading(true);
    const [dash, linksData, comms] = await Promise.all([
      getAffiliateDashboard(user.id),
      getAffiliateLinks(user.id),
      getAffiliateCommissions(user.id),
    ]);
    setDashboard(dash);
    setLinks(linksData);
    setCommissions(comms);
    setLoading(false);
  };

  const handleCopy = (code: string) => {
    const url = `${AFFILIATE_BASE_URL}/ref/${code}`;
    navigator.clipboard.writeText(url);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleLogout = () => {
    localStorage.removeItem("affiliate-user");
    localStorage.removeItem("affiliate-token");
    router.push("/affiliate/login");
  };

  if (loading) {
    return (
      <div dir="rtl" className="min-h-screen bg-gray-light flex items-center justify-center">
        <div className="text-pink font-tajawal">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-gray-light font-tajawal">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-pink rounded-xl flex items-center justify-center">
              <BarChart3 className="text-white" size={20} />
            </div>
            <div>
              <h1 className="font-bold text-gray-dark">لوحة التحكم</h1>
              <p className="text-xs text-gray-500">{user?.username}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-sm text-gray-600 hover:text-pink transition-colors flex items-center gap-1"
            >
              <ExternalLink size={16} />
              المتجر
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm text-red-500 hover:text-red-600 transition-colors flex items-center gap-1"
            >
              <LogOut size={16} />
              خروج
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        {dashboard && (
          <div className="grid grid-cols-2 gap-4 mb-8 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
            <StatCard
              icon={<MousePointerClick size={20} />}
              label="النقرات"
              value={dashboard.totalClicks}
              color="blue"
            />
            <StatCard
              icon={<ShoppingCart size={20} />}
              label="الإحالات المطلوبة"
              value={dashboard.totalConversions}
              color="green"
            />
            <StatCard
              icon={<CheckCircle size={20} />}
              label="الإحالات الناجحة"
              value={dashboard.successfulReferrals}
              color="teal"
            />
            <StatCard
              icon={<DollarSign size={20} />}
              label="إجمالي العمولات"
              value={formatPrice(dashboard.totalCommissions, siteCurrency, usdToTryRate)}
              color="pink"
            />
            <StatCard
              icon={<Clock size={20} />}
              label="العمولات المحتملة"
              value={formatPrice(dashboard.potentialCommissions, siteCurrency, usdToTryRate)}
              color="orange"
            />
            <StatCard
              icon={<CheckCircle size={20} />}
              label="العمولات المؤكدة"
              value={formatPrice(dashboard.confirmedCommissions, siteCurrency, usdToTryRate)}
              color="green"
            />
            <StatCard
              icon={<XCircle size={20} />}
              label="العمولات الضائعة"
              value={formatPrice(dashboard.lostCommissions, siteCurrency, usdToTryRate)}
              color="red"
            />
          </div>
        )}

        {/* Links Section */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-dark flex items-center gap-2">
              <LinkIcon size={20} className="text-pink" />
              روابطي
            </h2>
          </div>

          {links.length === 0 ? (
            <p className="text-gray-400 text-center py-8">لا توجد روابط بعد. أنشئ رابطك الأول!</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-500">
                    <th className="text-right py-3 px-2">المنتج</th>
                    <th className="text-right py-3 px-2">الكود</th>
                    <th className="text-right py-3 px-2">النقرات</th>
                    <th className="text-right py-3 px-2">التحويلات</th>
                    <th className="text-right py-3 px-2">النسبة</th>
                    <th className="text-right py-3 px-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {links.map((link) => (
                    <tr key={link.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 px-2">{link.product?.name ?? "—"}</td>
                      <td className="py-3 px-2 font-mono text-xs">{link.uniqueCode}</td>
                      <td className="py-3 px-2">{link.clicks}</td>
                      <td className="py-3 px-2">{link.conversions}</td>
                      <td className="py-3 px-2">{link.commissionRate}%</td>
                      <td className="py-3 px-2">
                        <button
                          onClick={() => handleCopy(link.uniqueCode)}
                          className="text-pink hover:bg-pink-50 p-2 rounded-lg transition-colors"
                          title="نسخ الرابط"
                        >
                          {copiedCode === link.uniqueCode ? (
                            <CheckCircle size={16} className="text-green-500" />
                          ) : (
                            <Copy size={16} />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Commissions Section */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-dark mb-6 flex items-center gap-2">
            <DollarSign size={20} className="text-pink" />
            العمولات
          </h2>

          {commissions.length === 0 ? (
            <p className="text-gray-400 text-center py-8">لا توجد عمولات بعد</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-500">
                    <th className="text-right py-3 px-2">الطلب</th>
                    <th className="text-right py-3 px-2">المنتج</th>
                    <th className="text-right py-3 px-2">المبلغ</th>
                    <th className="text-right py-3 px-2">الحالة</th>
                    <th className="text-right py-3 px-2">التاريخ</th>
                  </tr>
                </thead>
                <tbody>
                  {commissions.map((c) => (
                    <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 px-2">{c.order?.orderNumber ?? "—"}</td>
                      <td className="py-3 px-2">{c.affiliateLink?.product?.name ?? "—"}</td>
                      <td className="py-3 px-2 font-bold">{formatPrice(c.amount, siteCurrency, usdToTryRate)}</td>
                      <td className="py-3 px-2">
                        <StatusBadge orderStatus={c.order?.status} commissionStatus={c.status} />
                      </td>
                      <td className="py-3 px-2 text-gray-400 text-xs">
                        {new Date(c.createdAt).toLocaleDateString("ar-SA")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: "blue" | "green" | "pink" | "orange" | "red" | "teal";
}) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    pink: "bg-pink-50 text-pink",
    orange: "bg-orange-50 text-orange-600",
    red: "bg-red-50 text-red-600",
    teal: "bg-teal-50 text-teal-600",
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5">
      <div className={`w-10 h-10 rounded-xl ${colors[color]} flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-gray-dark">{value}</p>
      <p className="text-sm text-gray-400 mt-1">{label}</p>
    </div>
  );
}

function StatusBadge({
  orderStatus,
  commissionStatus,
}: {
  orderStatus?: string | null;
  commissionStatus: string;
}) {
  const normalizedOrderStatus = (orderStatus ?? "").trim().toLowerCase();

  if (["المتجر"].includes(normalizedOrderStatus)) {
    return (
      <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-yellow-50 text-yellow-600">
        محتملة
      </span>
    );
  }

  if (["مؤكد", "جاهزة للتسليم", "جاهز للتسليم", "تم استلام الطلب", "تم ارسال الطلب", "تم إرسال الطلب", "تم التسليم", "تم التوصيل", "تم تسليم الطلب", "confirmed", "shipped", "delivered"].includes(normalizedOrderStatus)) {
    return (
      <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-green-50 text-green-600">
        مؤكدة
      </span>
    );
  }

  if (["تم الغاء الطلب", "تم إلغاء الطلب", "ملغي", "ملغاة", "فشل التسليم", "مرتجع", "cancelled", "returned", "return", "failed_delivery", "failed delivery"].includes(normalizedOrderStatus)) {
    return (
      <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-red-50 text-red-600">
        ضائعة
      </span>
    );
  }

  const styles: Record<string, string> = {
    PENDING: "bg-yellow-50 text-yellow-600",
    PAID: "bg-green-50 text-green-600",
    CANCELLED: "bg-red-50 text-red-600",
  };

  const labels: Record<string, string> = {
    PENDING: "معلقة",
    PAID: "مدفوعة",
    CANCELLED: "ملغاة",
  };

  return (
    <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${styles[commissionStatus] ?? "bg-gray-50 text-gray-600"}`}>
      {labels[commissionStatus] ?? commissionStatus}
    </span>
  );
}
