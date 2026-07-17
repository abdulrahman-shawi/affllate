import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SKYNOVA",
    short_name: "SKYNOVA",
    description:
      "متجر SKYNOVA للعناية بالبشرة والشعر مع تجربة قابلة للتثبيت كتطبيق على الجوال واللابتوب.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#7f305d",
    lang: "ar",
    dir: "rtl",
    categories: ["shopping", "beauty", "lifestyle"],
    icons: [
      {
        src: "/icons/icon-192.svg",
        sizes: "192x192",
        type: "image/svg+xml",
      },
      {
        src: "/icons/icon-512.svg",
        sizes: "512x512",
        type: "image/svg+xml",
      },
      {
        src: "/icons/maskable-icon.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}