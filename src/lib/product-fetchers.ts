// lib/product-fetchers.ts
import dbConnect from "@/lib/db";
import ProductModel from "@/models/products.model";
import { Product } from "@/types/product";

export async function fetchProduct(slug: string): Promise<Product | null> {
  await dbConnect();
  try {
    const product = await ProductModel.findById(slug);
    return product ? (product.toObject() as Product) : null;
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}

export async function fetchSimilarProducts(group: string, excludeId: string): Promise<Product[]> {
  await dbConnect();
  try {
    const products = await ProductModel.find({
      group,
      _id: { $ne: excludeId },
    }).limit(3);
    return products.map((p) => p.toObject() as Product);
  } catch (error) {
    console.error("Error fetching similar products:", error);
    return [];
  }
}