import { client } from "@/lib/redis";

export function GET() {
   //Remove the data from the cache
  client.del("products");
}