"use server";

import { client } from "@/lib/redis";

interface TimingEntry {
  timestamp: number;
  total: number;
}

interface ReportData {
  db: TimingEntry[];
  cache: TimingEntry[];
  hybrid: TimingEntry[];
}

export async function saveFetchTiming(
  mode: string,
  entry: TimingEntry
): Promise<void> {
  let key = "";
  if (mode === "db") key = "fetch_times:db";
  else if (mode === "cache") key = "fetch_times:cache";
  else if (mode === "hybrid") key = "fetch_times:hybrid";
  else return;
  await client.lpush(key, JSON.stringify(entry));
  await client.ltrim(key, 0, 99); // keep last 100 entries
}

export async function fetchReportData(): Promise<ReportData> {
  const modes = ["db", "cache", "hybrid"];
  const result: any = {};
  for (const mode of modes) {
    const entries = await client.lrange(`fetch_times:${mode}`, 0, -1);
    result[mode] = entries.map((e: string) => {
      try {
        return JSON.parse(e);
      } catch {
        return null;
      }
    }).filter(Boolean);
  }
  return result as ReportData;
}
