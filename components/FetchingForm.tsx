"use client";

import React, { useState, useRef, useEffect } from "react";
import { fetchData } from "@/app/actions/DataFetching";
import { FetchingFormData } from "@/lib/types";
import { Loader2, Database, HardDrive, Layers, BarChart2 } from "lucide-react";

interface Product {
  _id: string;
  id: string;
  name: string;
  avatar: string;
  material: string;
  company: string;
  description: string;
  price: number;
  createdAt: string;
  __v: number;
}

interface FetchResult {
  success: boolean;
  source: "db" | "cache" | "hybrid";
  data: Product[];
  count: number;
  timing?: {
    total: number;
    dbQuery: number;
    cacheRead: number;
    cacheWrite: number;
  };
  cacheInfo: {
    hit: boolean;
    ttl?: number;
  };
  fetchTimeMs: number;
  cacheStatus: "hit" | "miss" | "none";
  dataSource: "db" | "cache" | "hybrid";
  timestamp: number;
  error?: string;
  message?: string;
}

export default function FetchingForm() {
  const [result, setResult] = useState<FetchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [limit, setLimit] = useState(10);
  const resultsRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string>("");
  const [mode, setMode] = useState<"cache" | "db" | "hybrid">("cache");

  const createEmptyResult = (): FetchResult => ({
    success: false,
    source: "db",
    data: [],
    count: 0,
    timing: {
      total: 0,
      dbQuery: 0,
      cacheRead: 0,
      cacheWrite: 0,
    },
    cacheInfo: {
      hit: false,
    },
    fetchTimeMs: 0,
    cacheStatus: "none",
    dataSource: "db",
    timestamp: Date.now(),
  });

  useEffect(() => {
    if (result && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [result]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    // Create a new result with default values
    const newResult = createEmptyResult();
    newResult.source = mode;
    newResult.dataSource = mode;
    setResult(newResult);

    try {
      const start = Date.now();
      
      // Call the fetchData function with the current mode and limit
      const response = await fetchData({ 
        mode: mode as 'cache' | 'db' | 'hybrid', 
        limit 
      });
      
      const fetchTimeMs = Date.now() - start;

      if (!response.success) {
        throw new Error(response.error || "Failed to fetch data");
      }

      // Create the updated result with proper typing
      const updatedResult: FetchResult = {
        success: true,
        data: response.data || [],
        count: response.count || 0,
        timing: {
          total: response.timing?.total ?? 0,
          dbQuery: response.timing?.dbQuery ?? 0,
          cacheRead: response.timing?.cacheRead ?? 0,
          cacheWrite: response.timing?.cacheWrite ?? 0,
        },
        cacheInfo: response.cacheInfo || { hit: false },
        fetchTimeMs,
        source: mode,
        dataSource: mode,
        cacheStatus: (() => {
          if (mode === "cache") {
            // Show "miss" if cacheInfo.hit is false or if returned data is less than requested limit
            if (!response.cacheInfo?.hit || (response.data?.length ?? 0) < limit) return "miss";
            return "hit";
          }
          if (mode === "hybrid") return response.cacheInfo?.hit ? "hit" : "miss";
          return "none";
        })(),
        timestamp: Date.now(),
      };

      setResult(updatedResult);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError((error as Error).message || "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`;
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case "db":
        return <Database className="w-5 h-5 mr-2" />;
      case "cache":
        return <HardDrive className="w-5 h-5 mr-2" />;
      case "hybrid":
        return <Layers className="w-5 h-5 mr-2" />;
      default:
        return null;
    }
  };

  const getModeLabel = (mode: string) => {
    switch (mode) {
      case "db":
        return "Database";
      case "cache":
        return "Cache";
      case "hybrid":
        return "Hybrid";
      default:
        return mode;
    }
  };




  return (
    <div className="w-full">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">Performance Analyzer</h2>
          <p className="text-sm text-gray-500 mt-1">Test different data fetching strategies</p>
        </div>
        
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="fetch-mode" className="block text-sm font-medium text-gray-700">
                  Fetch Strategy
                </label>
                <div className="relative">
                  <select
                    id="fetch-mode"
                    value={mode}
                    onChange={(e) => setMode(e.target.value as 'cache' | 'db' | 'hybrid')}
                    className="block w-full pl-3 pr-10 py-2.5 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white"
                    disabled={loading}
                  >
                    <option value="cache">🔄 Cache Only (Fastest)</option>
                    <option value="db">💾 Database Only (Always Fresh)</option>
                    <option value="hybrid">⚡ Hybrid (Cache First, then DB)</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="product-count" className="block text-sm font-medium text-gray-700">
                  Number of Products
                </label>
                <div className="relative rounded-md shadow-sm">
                  <input
                    type="number"
                    id="product-count"
                    min="1"
                    max="100"
                    value={limit}
                    onChange={(e) => setLimit(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-3 pr-12 py-2.5 sm:text-sm border border-gray-300 rounded-md"
                    placeholder="Enter number of products"
                    disabled={loading}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center">
                    <span className="text-gray-500 sm:text-sm mr-3">items</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Error message display */}
            {error && (
              <div className="text-red-600 text-sm font-medium">{error}</div>
            )}
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <BarChart2 className="-ml-1 mr-3 h-5 w-5" />
                    Analyze Performance
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
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
          <p className="text-gray-600 text-lg font-medium">Fetching products...</p>
          {/* Optional: skeleton for table */}
          <div className="mt-8 space-y-4 w-full max-w-2xl">
            <div className="h-6 bg-gray-200 rounded w-1/3 mx-auto animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto animate-pulse" />
            <div className="h-32 bg-gray-100 rounded w-full animate-pulse" />
          </div>
        </div>
      ) : result && (
        <div ref={resultsRef} className="space-y-8">
          {/* Stats Card */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Fetch Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Data Source</p>
                <div className="flex items-center mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    result.source === 'cache' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {result.source === 'cache' ? 'Cache' : 'Database'}
                  </span>
                  {result.cacheInfo?.hit ? (
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Hit
                    </span>
                  ) : (
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Miss
                    </span>
                  )}
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Response Time</p>
                <p className="text-xl font-semibold text-gray-900">{result.timing?.total || 0}ms</p>
                <p className="text-xs text-gray-500 mt-1">
                  {result.cacheInfo?.ttl ? `Cache expires in ${Math.floor((result.cacheInfo.ttl || 0) / 60)}m ${(result.cacheInfo.ttl || 0) % 60}s` : ''}
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Items Fetched</p>
                <p className="text-xl font-semibold text-gray-900">{result.count}</p>
              </div>
            </div>
            
            {/* Products Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Image
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Company
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Material
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Added
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {result.data?.map((product) => (
                    <tr key={product._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img 
                            className="h-10 w-10 rounded-full object-cover" 
                            src={product.avatar || 'https://via.placeholder.com/40?text=No+Image'} 
                            alt={product.name}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'https://via.placeholder.com/40?text=No+Image';
                            }}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        <div className="text-xs text-gray-500 line-clamp-2 mt-1">{product.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{product.company}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 capitalize">
                          {product.material.toLowerCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatPrice(product.price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(product.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Performance Metrics */}
            <div className="mt-6 bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Performance Metrics</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                <div className="bg-white p-3 rounded border border-gray-200">
                  <div className="text-xs text-gray-500 mb-1">Total Time</div>
                  <div className="font-medium">{result.timing?.total || 0} ms</div>
                </div>
                <div className="bg-white p-3 rounded border border-gray-200">
                  <div className="text-xs text-gray-500 mb-1">DB Query</div>
                  <div className="font-medium">{result.timing?.dbQuery || 0} ms</div>
                </div>
                <div className="bg-white p-3 rounded border border-gray-200">
                  <div className="text-xs text-gray-500 mb-1">Cache Read</div>
                  <div className="font-medium">{result.timing?.cacheRead || 0} ms</div>
                </div>
                <div className="bg-white p-3 rounded border border-gray-200">
                  <div className="text-xs text-gray-500 mb-1">Cache Write</div>
                  <div className="font-medium">{result.timing?.cacheWrite || 0} ms</div>
                </div>
              </div>
              {result.cacheInfo?.ttl && (
                <div className="mt-3 text-xs text-gray-500">
                  Cache expires in {Math.floor((result.cacheInfo.ttl || 0) / 60)}m {(result.cacheInfo.ttl || 0) % 60}s
                </div>
              )}
            </div>
          </div>  
        </div>
      )}
    </div>
  );
}
