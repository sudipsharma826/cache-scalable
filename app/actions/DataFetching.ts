"use server";

import connectDB from "@/lib/db";
import ProductModel from "@/lib/models/ProductModels";
import { client } from "@/lib/redis";
import { FetchingFormData, FetchResult, Product, CachedProduct } from "@/lib/types";

export async function fetchData(data: FetchingFormData): Promise<FetchResult> {
  const { mode, limit } = data;
  const startTime = Date.now();
  let responseTime = 0;
  let result: Product[] = [];
  let cacheHit = false;

  try {
    await client.connect();

    switch (mode) {
      case "db": {
        await connectDB();
        const dbData = await ProductModel.find({}).limit(limit).lean() as CachedProduct[];

        result = dbData.map(product => ({
          _id: product._id.toString(),
          id: product.id,
          name: product.name,
          price: product.price,
          description: product.description,
          company: product.company,
          avatar: product.avatar,
          material: product.material,
          createdAt: product.createdAt,
        }));

        // Update cache with latest DB data
        await client.del("products");
        await client.lpush("products", ...result.map(item => JSON.stringify(item)));
        await client.expire("products", 60 * 60 * 24); // 24h TTL

        break;
      }

      case "cache": {
        const cachedData = await client.lrange("products", 0, limit - 1);

        if (cachedData.length > 0) {
          cacheHit = true;
          result = cachedData.map(item => JSON.parse(item));
        } else {
          // Fallback to DB
          await connectDB();
          const dbData = await ProductModel.find({}).limit(limit).lean() as CachedProduct[];

          result = dbData.map(product => ({
            _id: product._id.toString(),
            id: product.id,
            name: product.name,
            price: product.price,
            description: product.description,
            company: product.company,
            avatar: product.avatar,
            material: product.material,
            createdAt: product.createdAt,
          }));

          // Save in cache
          await client.del("products");
          await client.lpush("products", ...result.map(item => JSON.stringify(item)));
          await client.expire("products", 60 * 60 * 24);
        }

        break;
      }

      case "hybrid": {
        const cachedData = await client.lrange("products", 0, limit - 1);
        const cachedCount = cachedData.length;

        const parsedCached = cachedData.map(item => JSON.parse(item) as Product);
        cacheHit = cachedCount > 0;

        if (cachedCount < limit) {
          const remaining = limit - cachedCount;
          await connectDB();
          const dbData = await ProductModel.find({}).limit(remaining).lean() as CachedProduct[];

          const parsedDb = dbData.map(product => ({
            _id: product._id.toString(),
            id: product.id,
            name: product.name,
            price: product.price,
            description: product.description,
            company: product.company,
            avatar: product.avatar,
            material: product.material,
            createdAt: product.createdAt,
          }));

          result = [...parsedCached, ...parsedDb];

          // Merge and update cache
          await client.del("products");
          await client.lpush("products", ...result.map(item => JSON.stringify(item)));
          await client.expire("products", 60 * 60 * 24);
        } else {
          result = parsedCached;
        }

        break;
      }

      default:
        throw new Error("Invalid mode specified");
    }

    responseTime = Date.now() - startTime;
    return {
      data: result,
      responseTime,
      mode,
      limit,
      cacheHit,
    };

  } catch (error) {
    console.error("Error in fetchData:", error);
    responseTime = Date.now() - startTime;

    const errorMessage =
      error instanceof Error ? error.message :
      typeof error === "string" ? error :
      "An unknown error occurred";

    return {
      data: [],
      responseTime,
      mode,
      limit,
      cacheHit: false,
      error: errorMessage,
    };
  } finally {
    await client.quit().catch(console.error);
  }
}
