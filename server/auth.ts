"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/jwt";

export interface AuthUser {
  id: string;
  name: string;
  phone: string | null;
  token: string;
}

export async function loginUser(
  username: string,
  phone: string
): Promise<{ success: true; user: AuthUser } | { success: false; error: string }> {
  try {
    const customer = await prisma.customer.findFirst({
      where: {
        name: username,
        phone: { has: phone },
      },
    });

    if (!customer) {
      return { success: false, error: "الاسم أو رقم الهاتف غير صحيح" };
    }

    const token = signToken(customer.id, phone);

    return {
      success: true,
      user: {
        id: customer.id,
        name: customer.name,
        phone: customer.phone[0] ?? null,
        token,
      },
    };
  } catch {
    return { success: false, error: "حدث خطأ أثناء تسجيل الدخول" };
  }
}

export async function registerUser(
  name: string,
  phone: string
): Promise<{ success: true; user: AuthUser } | { success: false; error: string }> {
  try {
    const existingByPhone = await prisma.customer.findFirst({
      where: { phone: { has: phone } },
    });

    const existingByName = await prisma.customer.findUnique({
      where: { name },
    });

    if (existingByPhone && existingByName) {
      return { success: false, error: "الاسم ورقم الهاتف مسجلان مسبقاً" };
    }

    if (existingByPhone) {
      return { success: false, error: "رقم الهاتف مسجل مسبقاً" };
    }

    if (existingByName) {
      return { success: false, error: "اسم المستخدم مسجل مسبقاً" };
    }

    const customer = await prisma.customer.create({
      data: {
        name,
        phone: [phone],
        status:"المتجر",
      },
    });

    console.log("CREATED CUSTOMER:", JSON.stringify(customer, null, 2));

    const token = signToken(customer.id, phone);

    return {
      success: true,
      user: {
        id: customer.id,
        name: customer.name,
        phone: customer.phone[0] ?? null,
        token,
      },
    };
  } catch (err: any) {
    console.error("REGISTER ERROR:", err?.message || err);
    return { success: false, error: "حدث خطأ أثناء إنشاء الحساب" };
  }
}
