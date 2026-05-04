import { desc } from "drizzle-orm";
import { mockProductGenerations, productionGeneratedDesigns } from "../../../../drizzle/schema";
import { db } from "@/lib/drizzle";

export interface ProductionGeneratedDesignRow {
  id: string;
  generatedImageUrl: string;
  createdAt: string;
  updatedAt: string;
}

export async function listProductGenerations(): Promise<
  ProductionGeneratedDesignRow[]
> {
  try {
    const rows = await db
      .select({
        id: mockProductGenerations.id,
        generatedImageUrl: mockProductGenerations.generatedImageDataUrl,
        createdAt: mockProductGenerations.createdAt,
        updatedAt: mockProductGenerations.updatedAt,
      })
      .from(mockProductGenerations)
      .orderBy(desc(mockProductGenerations.createdAt))
      .limit(100);

    const productionRows = await db
      .select({
        id: productionGeneratedDesigns.id,
        generatedImageUrl: productionGeneratedDesigns.generatedImageDataUrl,
        createdAt: productionGeneratedDesigns.createdAt,
        updatedAt: productionGeneratedDesigns.updatedAt,
      })
      .from(productionGeneratedDesigns)
      .orderBy(desc(productionGeneratedDesigns.createdAt))
      .limit(100);

    return [...rows, ...productionRows].map((r) => ({
      id: r.id,
      generatedImageUrl: r.generatedImageUrl ?? "",
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));
  } catch (e) {
    console.error("listMockProductGenerations", e);
    return [];
  }
}
