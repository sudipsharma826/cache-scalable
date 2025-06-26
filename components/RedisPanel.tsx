"use client";

import { useState, useEffect } from "react";
import { Database, RefreshCw, Trash2, Clock, HardDrive, Activity, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  getRedisInfo, 
  getProductsKeyInfo, 
  clearCache,
  loadData,
  type LoadDataResult,
  type RedisKeyInfo
} from "@/app/actions/RedisActions";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface CacheInfo {
  hit: boolean;
  ttl?: number;
  size?: number;
  responseTime?: number;
}

interface LoadedData extends Omit<LoadDataResult, 'cacheInfo'> {
  timestamp?: string;
  cacheInfo?: CacheInfo;
  data?: any[];
}

export function RedisPanel() {
  const [redisInfo, setRedisInfo] = useState<Record<string, string>>({});
  const [productsInfo, setProductsInfo] = useState<RedisKeyInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [loadResult, setLoadResult] = useState<LoadedData | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Format TTL to human readable format
  const formatTTL = (seconds: number) => {
    if (seconds === -1) return 'No expiry';
    if (seconds === -2) return 'Expired';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  };

  // Format bytes to human readable format
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Load Redis data
  const loadRedisData = async () => {
    setLoading(true);
    try {
      const [info, products] = await Promise.all([
        getRedisInfo(),
        getProductsKeyInfo()
      ]);
      setRedisInfo(info);
      setProductsInfo(products);
      setLoadResult(null);
    } catch (error) {
      console.error("Error loading Redis data:", error);
      toast.error("Failed to load Redis data");
    } finally {
      setLoading(false);
    }
  };

  // Handle refresh button click
  const handleRefresh = async () => {
    await loadRedisData();
    toast.success("Redis data refreshed");
  };

  // Handle clear cache button click
  const handleClearCache = async () => {
    setActionLoading(true);
    try {
      const result = await clearCache();
      if (result.success) {
        toast.success("Cache cleared successfully");
        setLoadResult(null);
        await loadRedisData();
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to clear cache");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle load data button click
  const handleLoadData = async () => {
    setIsLoadingData(true);
    try {
      const result = await loadData(5); // Load 5 items by default
      console.log('Load data result:', result); // Debug log
      
      const loadedData: LoadedData = {
        ...result,
        timestamp: new Date().toISOString(),
        cacheInfo: {
          hit: result.cacheHit || false,
          ttl: result.cacheInfo?.ttl,
          responseTime: result.responseTime,
          size: result.data ? JSON.stringify(result.data).length : 0
        },
        data: result.data || []
      };
      
      setLoadResult(loadedData);
      
      if (result.success) {
        const message = result.cacheHit 
          ? `Loaded ${result.count} items from cache`
          : `Loaded ${result.count} items from database`;
        toast.success(message);
      } else {
        throw new Error(result.error || 'Failed to load data');
      }
    } catch (error) {
      console.error('Error in handleLoadData:', error);
      toast.error(error instanceof Error ? error.message : "Failed to load data");
    } finally {
      setIsLoadingData(false);
      await loadRedisData();
    }
  };

  // Load initial data
  useEffect(() => {
    loadRedisData();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="space-y-4 p-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-9 w-24" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-4 w-20 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 transition-colors">
      {/* Header with refresh button */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Redis Cache</h2>
          <p className="text-sm text-muted-foreground">
            Monitor and manage your Redis cache
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={actionLoading || isLoadingData}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${actionLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* For stat/info boxes and cards inside the panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Redis Version Card */}
        <div className="bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-4 rounded-lg transition-colors">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Redis Version</h3>
            <Database className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">
            {redisInfo.redis_version || 'N/A'}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {redisInfo.os || 'N/A'}
          </p>
        </div>

        {/* Products Cache Card */}
        <div className="bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-4 rounded-lg transition-colors">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Products Cache</h3>
            <Badge variant={productsInfo?.length ? "default" : "outline"}>
              {productsInfo?.type || 'N/A'}
            </Badge>
          </div>
          <div className="text-2xl font-bold">
            {productsInfo?.length || productsInfo?.value?.length || '0'}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Items in cache
          </p>
        </div>

        {/* Cache Status Card */}
        <div className="bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-4 rounded-lg transition-colors">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Cache Status</h3>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">
            {productsInfo ? formatTTL(productsInfo.ttl) : 'N/A'}
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-muted-foreground">
              {productsInfo?.size ? formatBytes(productsInfo.size) : '0 B'}
            </span>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleLoadData}
                disabled={actionLoading || isLoadingData}
              >
                {isLoadingData ? (
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                ) : (
                  <HardDrive className="h-3 w-3 mr-1" />
                )}
                Load Data
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearCache}
                disabled={actionLoading || isLoadingData}
              >
                {actionLoading ? (
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                ) : (
                  <Trash2 className="h-3 w-3 mr-1" />
                )}
                Clear
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* For tables */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
          <tbody>
            {/* Results Section */}
            {loadResult && (
              <tr>
                <td colSpan={100}>
                  <Card className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
                    {/* ...existing CardHeader and CardContent... */}
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Query Results</CardTitle>
                        <Badge variant={loadResult.cacheHit ? "default" : "secondary"}>
                          {loadResult.cacheHit ? 'Cache Hit' : 'Cache Miss'}
                        </Badge>
                      </div>
                      <CardDescription>
                        {loadResult.cacheHit 
                          ? 'Data was served from cache' 
                          : 'Data was loaded from database and cached'
                        }
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-3">
                        {/* Cache Info */}
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium">Cache Information</h4>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Status:</span>
                              <span className="font-medium">
                                {loadResult.cacheHit ? 'Hit' : 'Miss'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">TTL:</span>
                              <span className="font-medium">
                                {loadResult.cacheInfo?.ttl ? formatTTL(loadResult.cacheInfo.ttl) : 'N/A'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Size:</span>
                              <span className="font-medium">
                                {loadResult.cacheInfo?.size ? formatBytes(loadResult.cacheInfo.size) : 'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Performance */}
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium">Performance</h4>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Total Time:</span>
                              <span className="font-mono">{loadResult.responseTime} ms</span>
                            </div>
                            {!loadResult.cacheHit && loadResult.dbQueryTime !== undefined && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">DB Query Time:</span>
                                <span className="font-mono">{loadResult.dbQueryTime} ms</span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Items Loaded:</span>
                              <span className="font-mono">{loadResult.count}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Source:</span>
                              <span className="font-medium flex items-center">
                                {loadResult.cacheHit ? (
                                  <>
                                    <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                                    Redis Cache
                                  </>
                                ) : (
                                  <>
                                    <Database className="h-3 w-3 mr-1 text-blue-500" />
                                    Database
                                  </>
                                )}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Sample Data */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <h4 className="text-sm font-medium">Sample Data</h4>
                            <span className="text-xs text-muted-foreground">
                              {loadResult.data?.length || 0} items
                            </span>
                          </div>
                          {loadResult.data && loadResult.data.length > 0 ? (
                            <div className="space-y-2">
                              {loadResult.data.slice(0, 3).map((item: any, index: number) => (
                                <div 
                                  key={index} 
                                  className="p-2 text-sm bg-muted/50 rounded-md overflow-hidden"
                                >
                                  <div className="font-medium truncate">
                                    {item.name || item.title || `Item ${index + 1}`}
                                  </div>
                                  {item.description && (
                                    <div className="text-xs text-muted-foreground truncate">
                                      {item.description}
                                    </div>
                                  )}
                                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                    <span>ID: {item._id || item.id || 'N/A'}</span>
                                    <span>{new Date(item.createdAt || item.date || Date.now()).toLocaleDateString()}</span>
                                  </div>
                                </div>
                              ))}
                              {loadResult.data.length > 3 && (
                                <div className="text-xs text-muted-foreground text-center">
                                  +{loadResult.data.length - 3} more items
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="p-3 text-center text-sm text-muted-foreground bg-muted/30 rounded-md">
                              <Database className="h-4 w-4 mx-auto mb-1 opacity-50" />
                              No data available
                            </div>
                          )}
                        </div>
                      </div>

                      {/* View Full Data Button */}
                      {loadResult.data && loadResult.data.length > 0 && (
                        <div className="pt-4 border-t">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => {
                              console.log('Full data:', loadResult.data);
                              toast.success('Check console for full data');
                            }}
                          >
                            View Full Data in Console
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RedisPanel;