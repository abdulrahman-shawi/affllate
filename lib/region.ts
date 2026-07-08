import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export type CountryCode = "TR" | "SY";

const REGION_COOKIE = "skynova-country";

export function getServerCountry(): CountryCode {
  const store = cookies();
  const value = store.get(REGION_COOKIE)?.value;
  return value === "TR" ? "TR" : "SY";
}

/**
 * Returns warehouse ids matching the given country based on warehouse
 * `location` or `name` containing "تركيا" for TR or "سوريا" for SY.
 * If no warehouses match, returns all warehouse ids as a fallback.
 */
export async function getWarehouseIdsByCountry(
  country: CountryCode
): Promise<number[]> {
  const warehouses = await prisma.warehouse.findMany();
  const stockCountry = country === "TR" ? "تركيا" : "سوريا";

  const matching = warehouses.filter(
    (w) =>
      w.location.toLowerCase().includes(stockCountry.toLowerCase()) ||
      w.name.toLowerCase().includes(stockCountry.toLowerCase())
  );

  const ids = matching.map((w) => w.id);
  return ids.length > 0 ? ids : warehouses.map((w) => w.id);
}
