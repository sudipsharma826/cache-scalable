"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Line } from "react-chartjs-2";
import "chart.js/auto";
import { fetchReportData } from "@/app/actions/ReportFetching"; // <-- use server action

interface TimingEntry {
  timestamp: number;
  total: number;
}

interface ReportData {
  db: TimingEntry[];
  cache: TimingEntry[];
  hybrid: TimingEntry[];
}

// Remove fetchReportData here, use server action import above

const formatDate = (ts: number) =>
  new Date(ts).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const calcStats = (arr: TimingEntry[]) => {
  if (!arr.length) return { avg: 0, min: 0, max: 0 };
  const total = arr.reduce((sum, e) => sum + e.total, 0);
  const avg = total / arr.length;
  const min = Math.min(...arr.map(e => e.total));
  const max = Math.max(...arr.map(e => e.total));
  return { avg, min, max };
};

export default function ReportPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    fetchReportData()
      .then(setData)
      .catch(e => setError(e.message));
  }, []);

  if (error) return <div className="p-8 text-red-500">{error}</div>;
  if (!data) return <div className="p-8">Loading...</div>;

  const modes = ["db", "cache", "hybrid"] as const;
  const colors = {
    db: "rgba(59,130,246,1)",
    cache: "rgba(16,185,129,1)",
    hybrid: "rgba(251,191,36,1)",
  };

  // Prepare chart data
  const chartData = {
    labels: Array.from(
      new Set(
        modes.flatMap(mode =>
          data[mode].map(e => formatDate(e.timestamp))
        )
      )
    ),
    datasets: modes.map(mode => ({
      label: mode.toUpperCase(),
      data: data[mode].map(e => e.total),
      borderColor: colors[mode],
      backgroundColor: colors[mode],
      tension: 0.3,
      fill: false,
    })),
  };

  return (
    <div className="max-w-4xl mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Fetch Performance Report</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-8">
            <Line data={chartData} options={{
              responsive: true,
              plugins: {
                legend: { display: true, position: "top" },
                title: { display: true, text: "Fetch Time (ms) by Mode" },
              },
              scales: {
                x: { title: { display: true, text: "Date/Time" } },
                y: { title: { display: true, text: "Fetch Time (ms)" } },
              },
            }} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {modes.map(mode => {
              const stats = calcStats(data[mode]);
              return (
                <div key={mode} className="bg-gray-50 rounded-lg p-4">
                  <div className="font-semibold mb-2">{mode.toUpperCase()}</div>
                  <div className="text-sm">Avg: <span className="font-mono">{stats.avg.toFixed(2)} ms</span></div>
                  <div className="text-sm">Min: <span className="font-mono">{stats.min} ms</span></div>
                  <div className="text-sm">Max: <span className="font-mono">{stats.max} ms</span></div>
                  <div className="text-xs text-gray-500 mt-2">Total: {data[mode].length} runs</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}