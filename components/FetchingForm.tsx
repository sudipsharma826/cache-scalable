"use client";

import { fetchData } from "@/app/actions/DataFetching";
import { FetchingFormData, Product, FetchResult } from "@/lib/types";
import { useState, useRef } from "react";
import { Loader2, Clock, Database, HardDrive, Layers } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

export default function FetchingForm() {
  const [mode, setMode] = useState<FetchingFormData['mode']>("db");
  const [limit, setLimit] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<FetchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    const formData: FetchingFormData = { mode, limit };
    
    try {
      const response = await fetchData(formData);
      if (response.error) {
        throw new Error(response.error);
      }
      setResult(response);
      // Scroll to results after a small delay to ensure the DOM has updated
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'db': return <Database className="w-5 h-5 mr-2" />;
      case 'cache': return <HardDrive className="w-5 h-5 mr-2" />;
      case 'hybrid': return <Layers className="w-5 h-5 mr-2" />;
      default: return null;
    }
  };

  const getModeLabel = (mode: string) => {
    switch (mode) {
      case 'db': return 'Database';
      case 'cache': return 'Cache';
      case 'hybrid': return 'Hybrid';
      default: return mode;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl">📊 Performance Analytics</CardTitle>
          <CardDescription>
            Compare the performance of different data fetching strategies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="mode" className="block text-sm font-medium text-gray-700">
                  Fetching Strategy
                </label>
                <select
                  id="mode"
                  value={mode}
                  onChange={(e) => setMode(e.target.value as FetchingFormData['mode'])}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  disabled={isLoading}
                >
                  <option value="db">Database Only</option>
                  <option value="cache">Cache Only</option>
                  <option value="hybrid">Hybrid (Cache with DB fallback)</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="limit" className="block text-sm font-medium text-gray-700">
                  Number of Items
                </label>
                <input
                  type="number"
                  id="limit"
                  min={1}
                  max={100}
                  value={limit}
                  onChange={(e) => setLimit(Number(e.target.value))}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full md:w-auto flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                    Fetching Data...
                  </>
                ) : (
                  'Fetch Data'
                )}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Results Section */}
      <div ref={resultsRef} className="mt-12">
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
            <p className="text-gray-600">Fetching data from {getModeLabel(mode)}...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {result && (
          <Card className="overflow-hidden">
            <CardHeader className="bg-gray-50 border-b">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-xl">Results</CardTitle>
                  <CardDescription className="mt-1">
                    {result.data.length} items fetched from {getModeLabel(result.mode)}
                    {result.cacheHit && ' (Cache Hit)'}
                  </CardDescription>
                </div>
                <div className="mt-2 sm:mt-0 flex items-center text-sm text-gray-500">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>Response time: {result.responseTime}ms</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Avatar
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Company
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {result?.data?.map((product: Product) => (
                      <tr key={product._id} className="hover:bg-gray-50">
                        <td>
                          <Image
                            src={product.avatar}
                            alt={product.name}
                            width={50}
                            height={50}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          
                          <div className="text-sm font-medium text-gray-900">
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {product.description}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant="outline">
                            {product.company || 'N/A'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${product.price?.toFixed(2)}
                        </td>
                       
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Performance Summary */}
              <div className="bg-gray-50 px-6 py-4 border-t">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <div className="flex items-center">
                      {getModeIcon(mode)}
                      <span>Mode: <span className="font-medium">{getModeLabel(mode)}</span></span>
                    </div>
                    {result?.cacheHit !== undefined && (
                      <span className="ml-4 flex items-center">
                        <HardDrive className={`w-4 h-4 mr-1 ${result?.cacheHit ? 'text-green-500' : 'text-gray-400'}`} />
                        <span className={result?.cacheHit ? 'text-green-600' : 'text-gray-500'}>
                          {result?.cacheHit ? 'Served from cache' : 'Served from database'}
                        </span>
                      </span>
                    )}
                  </div>
                  <div className="flex items-center text-sm">
                    <Clock className="w-4 h-4 mr-1 text-gray-500" />
                    <span className="font-medium">{result?.responseTime || 0}ms</span>
                    <span className="ml-1 text-gray-500">response time</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
