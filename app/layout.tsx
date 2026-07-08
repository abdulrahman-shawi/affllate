import type { Metadata, Viewport } from "next";
import { Tajawal } from "next/font/google";
import "./globals.css";
import ClientProviders from "@/component/ClientProviders";
import AffiliateTracker from "@/component/AffiliateTracker";
import { getGeneralSettings } from "@/server/settings";

const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["400", "500", "700", "800", "900"],
  variable: "--font-tajawal",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getGeneralSettings();
  const siteName = settings.siteName || "SKYNOVA";
  const title = `${siteName} | متجر العناية بالبشرة والشعر`;
  const description = "وجهتك الأولى لمنتجات العناية بالبشرة والشعر. نقدم لكِ أفضل المنتجات الأصلية بأسعار مميزة مع توصيل سريع.";

  return {
    title: {
      default: title,
      template: `%s | ${siteName}`,
    },
    manifest: "/manifest.webmanifest",
    description,
    keywords: [
      "عناية بالبشرة",
      "عناية بالشعر",
      "منتجات تجميل",
      "مكياج",
      "عناية شخصية",
      siteName,
    ],
    authors: [{ name: siteName }],
    creator: siteName,
    publisher: siteName,
    metadataBase: new URL("https://skynova.store"),
    alternates: {
      canonical: "/",
    },
    openGraph: {
      title,
      description,
      url: "https://skynova.store",
      siteName,
      locale: "ar_AR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: siteName,
    },
    applicationName: siteName,
    themeColor: "#7f305d",
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    verification: {
      google: "YOUR_GOOGLE_VERIFICATION_CODE", // استبدلي هذا بكود التحقق من Google Search Console
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${tajawal.variable} font-tajawal antialiased`}>
        <ClientProviders>
          <AffiliateTracker />
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
