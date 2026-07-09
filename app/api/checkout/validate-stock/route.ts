import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { country, items } = body;

    if (!country || !items?.length) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      );
    }

    const stockCountry = country === "TR" ? "تركيا" : "سوريا";

    const warehouses = await prisma.warehouse.findMany();
    const warehouse = warehouses.find((w) =>
      w.location.toLowerCase().includes(stockCountry.toLowerCase()) ||
      w.name.toLowerCase().includes(stockCountry.toLowerCase())
    ) ?? warehouses[0];

    if (!warehouse) {
      return NextResponse.json(
        { error: "No warehouse found" },
        { status: 500 }
      );
    }

    const outOfStock: { id: number; name: string; requested: number; available: number }[] = [];

    for (const item of items) {
      const stocks = await prisma.productStock.findMany({
        where: {
          productId: item.id,
          warehouseId: warehouse.id,
        },
      });

      const totalAvailable = stocks.reduce((sum, s) => sum + s.quantity, 0);

      if (totalAvailable < item.quantity) {
        outOfStock.push({
          id: item.id,
          name: item.name,
          requested: item.quantity,
          available: totalAvailable,
        });
      }
    }

    return NextResponse.json({
      success: true,
      warehouseName: warehouse.name,
      outOfStock,
      isValid: outOfStock.length === 0,
    });
  } catch (error: any) {
    console.error("Validate stock error:", error);
    return NextResponse.json(
      { error: "Server error", details: error?.message },
      { status: 500 }
    );
  }
}
