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
  if (!data)
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="relative flex items-center justify-center w-24 h-24 mb-6">
          {/* Circular spinner */}
          <span className="absolute inline-flex w-full h-full rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin"></span>
          {/* Logo in the center */}
          <img
            src="/logo7.png"
            alt="Logo"
            className="w-12 h-12 rounded-full z-10"
            style={{ background: "white" }}
          />
        </div>
        <p className="text-gray-600 text-lg font-medium">Loading report...</p>
      </div>
    );

  const modes = ["db", "cache", "hybrid"] as const;
  const colors = {
    db: "rgba(59,130,246,1)",
    cache: "rgba(16,185,129,1)",
    hybrid: "rgba(251,191,36,1)",
  };
  const bgColors = {
    db: "rgba(59,130,246,0.08)",
    cache: "rgba(16,185,129,0.08)",
    hybrid: "rgba(251,191,36,0.08)",
  };

  // Show only the last 10 records for each mode
  const N = 10;
  const trimmedData: Record<string, TimingEntry[]> = {};
  modes.forEach(mode => {
    trimmedData[mode] = data[mode].slice(-N);
  });

  // Use 1, 2, 3, ... as X-axis labels
  const maxLen = Math.max(...modes.map(mode => trimmedData[mode].length));
  const labels = Array.from({ length: maxLen }, (_, i) => `Run ${i + 1}`);

  // Prepare chart data
  const chartData = {
    labels,
    datasets: modes.map(mode => ({
      label: mode.toUpperCase(),
      data: trimmedData[mode].map(e => e.total),
      borderColor: colors[mode],
      backgroundColor: bgColors[mode],
      tension: 0.4,
      fill: true,
      pointRadius: 5,
      pointHoverRadius: 7,
      pointBackgroundColor: colors[mode],
      pointBorderColor: "#fff",
      borderWidth: 2,
    })),
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: true, position: "top" },
      title: { display: true, text: "Fetch Time (ms) by Mode", font: { size: 20 } },
      tooltip: {
        mode: "index" as const,
        intersect: false,
        callbacks: {
          label: function(context: any) {
            return `${context.dataset.label}: ${context.parsed.y} ms`;
          }
        }
      }
    },
    interaction: {
      mode: "nearest" as const,
      axis: "x" as const,
      intersect: false,
    },
    scales: {
      x: {
        title: { display: true, text: "Test Run" },
        grid: { display: true, color: "#e5e7eb" },
        ticks: { font: { size: 14 } }
      },
      y: {
        title: { display: true, text: "Fetch Time (ms)" },
        grid: { display: true, color: "#e5e7eb" },
        beginAtZero: true,
        ticks: { font: { size: 14 } }
      },
    },
  };

  // Calculate stats for all modes
  const statsByMode = modes.map(mode => ({
    mode,
    ...calcStats(data[mode]),
    runs: data[mode].length,
  }));

  // Rank modes by avg (lower is better)
  const ranked = [...statsByMode].sort((a, b) => a.avg - b.avg);

  // Assign rank and color indicator
  const rankColors = ["bg-green-100 text-green-800", "bg-yellow-100 text-yellow-800", "bg-red-100 text-red-800"];
  const rankIcons = [
    <span key="fast" title="Fastest" className="inline-block mr-1 align-middle">🚀</span>,
    <span key="mid" title="Average" className="inline-block mr-1 align-middle">⚡</span>,
    <span key="slow" title="Slowest" className="inline-block mr-1 align-middle">🐢</span>,
  ];

  return (
    <div className="max-w-4xl mx-auto py-10">
      <Card className="bg-background dark:bg-gray-900 text-foreground dark:text-gray-100 transition-colors">
        <CardHeader>
          <CardTitle>Fetch Performance Report</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-8 bg-background dark:bg-gray-900 rounded-lg p-4 transition-colors">
            {/* @ts-expect-error Chart.js types can be incompatible, but this is safe */}
            <Line data={chartData} options={chartOptions} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ranked.map((stat, idx) => (
              <div
                key={stat.mode}
                className={`rounded-lg p-4 border ${rankColors[idx] || "bg-gray-50 text-gray-800"} bg-background dark:bg-gray-800 text-foreground dark:text-gray-100 transition-colors`}
                style={{ boxShadow: idx === 0 ? "0 0 0 2px #22c55e33" : undefined }}
              >
                <div className="flex items-center mb-2">
                  {rankIcons[idx]}
                  <span className="font-semibold text-base">{stat.mode.toUpperCase()}</span>
                  <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-white/70 border border-gray-200 text-gray-700">
                    Rank {idx + 1}
                  </span>
                </div>
                <div className="flex flex-col gap-1 mt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Average</span>
                    <span className="font-mono font-bold text-base">{stat.avg.toFixed(2)} ms</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Min</span>
                    <span className="font-mono text-sm">{stat.min} ms</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Max</span>
                    <span className="font-mono text-sm">{stat.max} ms</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-400">Total Runs</span>
                    <span className="text-xs text-gray-600">{stat.runs}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}