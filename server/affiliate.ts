"use server";

import { prisma } from "@/lib/prisma";
import { calculateAffiliateCommission } from "@/lib/affiliateCommission";
import bcrypt from "bcryptjs";
import { signToken, verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import type { Prisma } from "@/generated/prisma/client";

export interface AffiliateUser {
  id: string;
  username: string;
  email: string;
  phone: string | null;
  token: string;
}

type AffiliateLinkDashboardRow = Prisma.AffiliateLinkGetPayload<{
  include: {
    product: { select: { name: true } };
    _count: { select: { commissions: true } };
  };
}>;

type CommissionDashboardRow = Prisma.CommissionGetPayload<{
  include: {
    order: { select: { status: true } };
  };
}>;

type WalletTransferRecord = {
  id: string;
  userId: string;
  amount: number;
  status: "PENDING" | "RECEIVED";
  reference: string | null;
  notes: string | null;
  transferredAt: Date;
  receivedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

function isMissingWalletTransfersTableError(error: any): boolean {
  const message = String(error?.message ?? "");
  return error?.code === "P2021" || message.includes("affiliate_wallet_transfers");
}

async function getAffiliateWalletTransfersSafe(userId: string) {
  try {
    const walletTransferDelegate = (prisma as any).affiliateWalletTransfer;
    if (!walletTransferDelegate) {
      return [] as WalletTransferRecord[];
    }

    return await walletTransferDelegate.findMany({
      where: { userId },
      orderBy: { transferredAt: "desc" },
    }) as WalletTransferRecord[];
  } catch (error: any) {
    if (isMissingWalletTransfersTableError(error)) {
      return [];
    }

    throw error;
  }
}

function generateAffiliateCode(): string {
  return "AFF" + Math.random().toString(36).substring(2, 8).toUpperCase();
}

function generateUniqueCode(): string {
  return "LNK" + Math.random().toString(36).substring(2, 10).toUpperCase();
}

function normalizeOrderStatus(status: string | null | undefined): string {
  return (status ?? "").trim().toLowerCase();
}

function isPotentialOrderStatus(status: string | null | undefined): boolean {
  return ["المتجر"].includes(normalizeOrderStatus(status));
}

function isConfirmedOrderStatus(status: string | null | undefined): boolean {
  return [
    "تم التسليم",
    "تم التوصيل",
    "تم تسليم الطلب",
    "delivered",
  ].includes(normalizeOrderStatus(status));
}

function isSuccessfulOrderStatus(status: string | null | undefined): boolean {
  return [
    "تم التسليم",
    "تم التوصيل",
    "تم تسليم الطلب",
    "delivered",
  ].includes(normalizeOrderStatus(status));
}

function isLostOrderStatus(status: string | null | undefined): boolean {
  return [
    "تم الغاء الطلب",
    "تم إلغاء الطلب",
    "ملغي",
    "ملغاة",
    "فشل التسليم",
    "فشل التسليم مرتجع",
    "cancelled",
    "returned",
    "return",
    "failed_delivery",
    "failed delivery",
  ].includes(normalizeOrderStatus(status));
}

// ─── 1. Register Affiliate ───
export async function registerAffiliate(
  username: string,
  email: string,
  password: string,
  phone?: string
): Promise<{ success: true; message: string } | { success: false; error: string }> {
  try {
    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      return { success: false, error: "البريد الإلكتروني مسجل مسبقاً" };
    }

    const existingName = await prisma.user.findFirst({ where: { username } });
    if (existingName) {
      return { success: false, error: "اسم المستخدم مسجل مسبقاً" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    let affiliateCode = generateAffiliateCode();

    // Ensure unique affiliateCode
    while (await prisma.user.findUnique({ where: { affiliateCode } })) {
      affiliateCode = generateAffiliateCode();
    }

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        phone: phone || null,
        isAffiliate: false,
        affiliateCode,
        accountType: "AFFILIATE",
      },
    });

    return {
      success: true,
      message: "تم استلام طلب التسجيل، وسيتم تفعيل حسابك بعد المراجعة والموافقة.",
    };
  } catch (err: any) {
    console.error("AFFILIATE REGISTER ERROR:", err?.message || err);
    return { success: false, error: "حدث خطأ أثناء التسجيل" };
  }
}

// ─── 2. Login Affiliate ───
export async function loginAffiliate(
  email: string,
  password: string
): Promise<{ success: true; user: AffiliateUser } | { success: false; error: string }> {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.isAffiliate) {
      return { success: false, error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" };
    }

    if (!user.affiliateApproved) {
      return { success: false, error: "حساب سفير skynova غير معتمد بعد" };
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return { success: false, error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" };
    }

    const token = signToken(user.id, user.email);

    return {
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        token,
      },
    };
  } catch {
    return { success: false, error: "حدث خطأ أثناء تسجيل الدخول" };
  }
}

// ─── 3. Create Affiliate Link ───
export async function createAffiliateLink(
  userId: string,
  productId: number,
  commissionRate?: number
): Promise<{ success: true; link: { id: string; uniqueCode: string; productName: string } } | { success: false; error: string }> {
  try {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return { success: false, error: "المنتج غير موجود" };
    }

    let uniqueCode = generateUniqueCode();
    while (await prisma.affiliateLink.findUnique({ where: { uniqueCode } })) {
      uniqueCode = generateUniqueCode();
    }

    const link = await prisma.affiliateLink.create({
      data: {
        userId,
        productId,
        uniqueCode,
        commissionRate: commissionRate ?? 10,
      },
    });

    return {
      success: true,
      link: {
        id: link.id,
        uniqueCode: link.uniqueCode,
        productName: product.name,
      },
    };
  } catch (err: any) {
    console.error("CREATE LINK ERROR:", err?.message || err);
    return { success: false, error: "حدث خطأ أثناء إنشاء الرابط" };
  }
}

// ─── 4. Get Affiliate Links ───
export async function getAffiliateLinks(userId: string) {
  const links = await prisma.affiliateLink.findMany({
    where: { userId },
    include: {
      product: { select: { id: true, name: true, affiliatePrice: true } },
      _count: { select: { commissions: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return links.map(({ _count, ...link }) => ({
    ...link,
    conversions: _count.commissions,
    conversionRate: link.clicks > 0 ? (_count.commissions / link.clicks) * 100 : 0,
  }));
}

// ─── 5. Get Dashboard Stats ───
export async function getAffiliateDashboard(userId: string) {
  const [links, commissions, walletTransfers]: [
    AffiliateLinkDashboardRow[],
    CommissionDashboardRow[],
    WalletTransferRecord[],
  ] = await Promise.all([
    prisma.affiliateLink.findMany({
      where: { userId },
      include: {
        product: { select: { name: true } },
        _count: { select: { commissions: true } },
      },
    }),
    prisma.commission.findMany({
      where: {
        affiliateLink: { userId },
      },
      include: {
        order: {
          select: {
            status: true,
          },
        },
      },
    }),
    getAffiliateWalletTransfersSafe(userId),
  ]);

  const totalClicks = links.reduce((sum: number, link: AffiliateLinkDashboardRow) => sum + link.clicks, 0);
  const orderedReferralIds = new Set(commissions.map((commission: CommissionDashboardRow) => commission.orderId));
  const totalConversions = orderedReferralIds.size;
  const aggregateConversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
  const successfulReferrals = commissions.filter((commission: CommissionDashboardRow) =>
    isSuccessfulOrderStatus(commission.order?.status)
  ).length;
  const totalCommissions = commissions.reduce((sum: number, commission: CommissionDashboardRow) => sum + commission.amount, 0);
  const pendingCommissions = commissions
    .filter((commission: CommissionDashboardRow) => commission.status === "PENDING")
    .reduce((sum: number, commission: CommissionDashboardRow) => sum + commission.amount, 0);
  const paidCommissions = commissions
    .filter((commission: CommissionDashboardRow) => commission.status === "PAID")
    .reduce((sum: number, commission: CommissionDashboardRow) => sum + commission.amount, 0);
  const potentialCommissions = commissions
    .filter((commission: CommissionDashboardRow) => isPotentialOrderStatus(commission.order?.status))
    .reduce((sum: number, commission: CommissionDashboardRow) => sum + commission.amount, 0);
  const confirmedCommissions = commissions
    .filter((commission: CommissionDashboardRow) => isConfirmedOrderStatus(commission.order?.status))
    .reduce((sum: number, commission: CommissionDashboardRow) => sum + commission.amount, 0);
  const lostCommissions = commissions
    .filter((commission: CommissionDashboardRow) => isLostOrderStatus(commission.order?.status))
    .reduce((sum: number, commission: CommissionDashboardRow) => sum + commission.amount, 0);
  const pendingWalletTransfers = walletTransfers
    .filter((transfer: WalletTransferRecord) => transfer.status === "PENDING")
    .reduce((sum: number, transfer: WalletTransferRecord) => sum + transfer.amount, 0);
  const receivedWalletTransfers = walletTransfers
    .filter((transfer: WalletTransferRecord) => transfer.status === "RECEIVED")
    .reduce((sum: number, transfer: WalletTransferRecord) => sum + transfer.amount, 0);
  const totalWalletTransfers = pendingWalletTransfers + receivedWalletTransfers;
  const walletBalance = Math.max(confirmedCommissions - totalWalletTransfers, 0);

  return {
    totalClicks,
    totalConversions,
    aggregateConversionRate,
    successfulReferrals,
    totalCommissions,
    pendingCommissions,
    paidCommissions,
    potentialCommissions,
    confirmedCommissions,
    lostCommissions,
    linksCount: links.length,
    wallet: {
      balance: walletBalance,
      pendingTransfers: pendingWalletTransfers,
      receivedTransfers: receivedWalletTransfers,
      totalTransferred: totalWalletTransfers,
      transferCount: walletTransfers.length,
    },
    links,
  };
}

// ─── 6. Get Commissions ───
export async function getAffiliateCommissions(userId: string) {
  return prisma.commission.findMany({
    where: {
      affiliateLink: { userId },
    },
    include: {
      affiliateLink: {
        include: {
          product: { select: { name: true } },
        },
      },
      order: { select: { orderNumber: true, createdAt: true, status: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAffiliateWalletTransfers(userId: string) {
  return getAffiliateWalletTransfersSafe(userId);
}

export async function recordAffiliateWalletTransfer(input: {
  userId: string;
  amount: number;
  reference?: string;
  notes?: string;
  status?: "PENDING" | "RECEIVED";
  transferredAt?: Date;
  receivedAt?: Date | null;
}) {
  const walletTransferDelegate = (prisma as any).affiliateWalletTransfer;
  if (!walletTransferDelegate) {
    throw new Error("Affiliate wallet transfer delegate is unavailable");
  }

  return walletTransferDelegate.create({
    data: {
      userId: input.userId,
      amount: input.amount,
      reference: input.reference,
      notes: input.notes,
      status: input.status ?? "PENDING",
      transferredAt: input.transferredAt ?? new Date(),
      receivedAt:
        input.status === "RECEIVED"
          ? input.receivedAt ?? new Date()
          : input.receivedAt ?? null,
    },
  });
}

// ─── 7. Get Current Affiliate from Cookie ───
export async function getCurrentAffiliate(): Promise<AffiliateUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("affiliate-token")?.value;
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  const user = await prisma.user.findFirst({
    where: {
      id: payload.userId,
      isAffiliate: true,
      affiliateApproved: true,
    },
    select: { id: true, username: true, email: true, phone: true },
  });

  if (!user) return null;

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    phone: user.phone,
    token,
  };
}

// ─── 8. Track Click ───
export async function trackAffiliateClick(uniqueCode: string): Promise<{ productId: number; productSlug: string | null } | null> {
  try {
    const link = await prisma.affiliateLink.findUnique({
      where: { uniqueCode },
      include: { product: { select: { id: true, seoSlug: true } } },
    });

    if (!link) return null;

    await prisma.affiliateLink.update({
      where: { id: link.id },
      data: { clicks: { increment: 1 } },
    });

    return {
      productId: link.productId,
      productSlug: link.product.seoSlug,
    };
  } catch {
    return null;
  }
}

// ─── 9. Process Commission on Order ───
export async function processAffiliateCommission(
  orderId: number,
  affiliateCode: string
): Promise<void> {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
            affiliateLink: true,
          },
        },
      },
    });

    if (!order) return;

    for (const item of order.items) {
      if (!item.affiliateLinkId) continue;

      const link = await prisma.affiliateLink.findUnique({
        where: { id: item.affiliateLinkId },
      });

      if (!link) continue;

      const commissionAmount = calculateAffiliateCommission({
        affiliatePrice: item.product.affiliatePrice,
        affiliateCommissionRate: item.product.affiliateCommissionRate,
        fallbackCommissionRate: link.commissionRate,
        itemPrice: item.price,
        quantity: item.quantity,
      });

      await prisma.commission.create({
        data: {
          affiliateLinkId: link.id,
          orderId: order.id,
          amount: commissionAmount,
          status: "PENDING",
        },
      });

      await prisma.affiliateLink.update({
        where: { id: link.id },
        data: { conversions: { increment: 1 } },
      });
    }
  } catch (err: any) {
    console.error("PROCESS COMMISSION ERROR:", err?.message || err);
  }
}
