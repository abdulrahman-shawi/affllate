"use server";

import { put, del } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
const DEFAULT_SITE_NAME = "سفراء skynova";

export interface GeneralSettings {
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

const defaults: GeneralSettings = {
  siteName: DEFAULT_SITE_NAME,
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

let hasLoggedSettingsFallback = false;

function resolveSiteName(siteName: string | null | undefined) {
  const normalized = siteName?.trim();

  if (!normalized || normalized.toUpperCase() === "SKYNOVA") {
    return DEFAULT_SITE_NAME;
  }

  return normalized;
}

export async function getGeneralSettings(): Promise<GeneralSettings> {
  try {
    const settings = await prisma.generalSetting.findFirst({
      orderBy: { createdAt: "desc" },
    });

    if (!settings) return defaults;

    return {
      siteName: resolveSiteName(settings.siteName),
      companyEmail: settings.companyEmail || defaults.companyEmail,
      companyPhone: settings.companyPhone || defaults.companyPhone,
      siteCurrency: settings.siteCurrency || defaults.siteCurrency,
      usdToTryRate: settings.usdToTryRate ?? defaults.usdToTryRate,
      facebookUrl: settings.facebookUrl || defaults.facebookUrl,
      instagramUrl: settings.instagramUrl || defaults.instagramUrl,
      logo: settings.logo || defaults.logo,
      primaryColor: settings.primaryColor || defaults.primaryColor,
      secondaryColor: settings.secondaryColor || defaults.secondaryColor,
      topBannerText: settings.topBannerText || defaults.topBannerText,
    };
  } catch (error) {
    if (!hasLoggedSettingsFallback) {
      hasLoggedSettingsFallback = true;
      const code =
        typeof error === "object" && error && "code" in error
          ? String((error as { code?: string }).code)
          : "unknown";
      console.warn(
        `Falling back to default general settings because Prisma is unavailable (${code}).`
      );
    }
    return defaults;
  }
}

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-z0-9.]/gi, "_").toLowerCase();
}

async function uploadLogo(file: File): Promise<string> {
  if (!BLOB_TOKEN) {
    throw new Error("BLOB_READ_WRITE_TOKEN غير مُعد");
  }
  const fileName = `settings/${Date.now()}-${sanitizeFileName(file.name)}`;
  const blob = await put(fileName, file, { access: "public", token: BLOB_TOKEN });
  return blob.url;
}

export async function updateGeneralSettings(formData: FormData) {
  try {
    const siteName = resolveSiteName(formData.get("siteName") as string | null);
    const companyEmail = (formData.get("companyEmail") as string) || null;
    const companyPhone = (formData.get("companyPhone") as string) || null;
    const siteCurrency = (formData.get("siteCurrency") as string) || defaults.siteCurrency;
    const usdToTryRate = parseFloat((formData.get("usdToTryRate") as string) || "0");
    const facebookUrl = (formData.get("facebookUrl") as string) || null;
    const instagramUrl = (formData.get("instagramUrl") as string) || null;
    const primaryColor = (formData.get("primaryColor") as string) || defaults.primaryColor;
    const secondaryColor = (formData.get("secondaryColor") as string) || defaults.secondaryColor;
    const topBannerText = (formData.get("topBannerText") as string) || null;

    const existing = await prisma.generalSetting.findFirst({
      orderBy: { createdAt: "desc" },
    });

    let logo = existing?.logo ?? null;
    const logoFile = formData.get("logo") as File | null;
    if (logoFile && logoFile.size > 0) {
      if (logo) {
        try {
          await del(logo);
        } catch (err) {
          console.error("Could not delete old logo:", err);
        }
      }
      logo = await uploadLogo(logoFile);
    }

    const data = {
      siteName,
      companyEmail,
      companyPhone,
      siteCurrency,
      usdToTryRate,
      facebookUrl,
      instagramUrl,
      primaryColor,
      secondaryColor,
      topBannerText,
      logo,
    };

    if (existing) {
      await prisma.generalSetting.update({ where: { id: existing.id }, data });
    } else {
      await prisma.generalSetting.create({ data });
    }

    revalidatePath("/");
    revalidatePath("/admin/settings");

    return { success: true };
  } catch (error: any) {
    console.error("Error updating general settings:", error);
    return { success: false, error: error.message || "حدث خطأ أثناء حفظ الإعدادات" };
  }
}
