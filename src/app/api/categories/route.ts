import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { CategoryModel } from "@/models";
import { CATEGORIES } from "@/components/dummy-data";

export async function GET(_req: NextRequest) {
  try {
    await connectToDatabase();
    const categories = await CategoryModel.find({}).lean();
    if (categories.length > 0) {
      return NextResponse.json({ categories });
    }
  } catch {
    // Fall through to mock data
  }

  return NextResponse.json({ categories: CATEGORIES });
}
