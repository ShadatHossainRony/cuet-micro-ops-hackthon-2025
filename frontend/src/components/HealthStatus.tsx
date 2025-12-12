'use client';

import { useEffect, useState } from 'react';
import { apiClient, type HealthCheck } from '@/lib/api-client';
import * as Sentry from '@sentry/nextjs';

export function HealthStatus() {
    const [health, setHealth] = useState<HealthCheck | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const checkHealth = async () => {
            try {
                setLoading(true);
                const data = await apiClient.getHealth();
                setHealth(data);
                setError(null);
            } catch (err: any) {
                setError(err.message);
                setHealth(null);
            } finally {
                setLoading(false);
            }
        };

        // Check immediately
        checkHealth();

        // Poll every 5 seconds
        const interval = setInterval(checkHealth, 5000);

        return () => clearInterval(interval);
    }, []);

    if (loading && !health) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">System Health</h2>
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
            </div>
        );
    }

    const isHealthy = health?.status === 'healthy';
    const storageOk = health?.checks?.storage === 'ok';

    return (
        <div className="bg-linear-to-br from-white to-gray-50 rounded-xl shadow-md border border-gray-200 p-6 h-full">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">System Health</h2>
                <div className="flex items-center gap-2">
                    <div
                        className={`w-3 h-3 rounded-full ${isHealthy ? 'bg-green-500 animate-pulse shadow-lg shadow-green-500/50' : 'bg-red-500 animate-pulse shadow-lg shadow-red-500/50'
                            }`}
                    ></div>
                    <span className={`text-sm font-semibold ${isHealthy ? 'text-green-600' : 'text-red-600'}`}>
                        {isHealthy ? 'Healthy' : 'Unhealthy'}
                    </span>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                    <p className="text-sm font-medium">⚠️ {error}</p>
                </div>
            )}

            {health && (
                <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200">
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${isHealthy ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <span className="text-sm font-medium text-gray-700">API Service</span>
                        </div>
                        <span className={`text-sm font-bold ${isHealthy ? 'text-green-600' : 'text-red-600'}`}>
                            {isHealthy ? '✓ Online' : '✗ Offline'}
                        </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200">
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${storageOk ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                            <span className="text-sm font-medium text-gray-700">S3 Storage</span>
                        </div>
                        <span className={`text-sm font-bold ${storageOk ? 'text-green-600' : 'text-yellow-600'}`}>
                            {storageOk ? '✓ Connected' : '⚠ Error'}
                        </span>
                    </div>
                </div>
            )}

            <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                    🔄 Auto-refresh: 5s | Last: {new Date().toLocaleTimeString()}
                </p>
            </div>
        </div>
    );
}
