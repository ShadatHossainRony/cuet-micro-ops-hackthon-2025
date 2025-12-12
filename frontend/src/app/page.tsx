'use client';

import { useEffect } from 'react';
import { HealthStatus } from '@/components/HealthStatus';
import { DownloadJobs } from '@/components/DownloadJobs';
import { TraceViewer } from '@/components/TraceViewer';
import { SentryDashboard } from '@/components/SentryDashboard';
import { initializeTracing } from '@/lib/tracing';
import { Activity } from 'lucide-react';

export default function HomePage() {
  useEffect(() => {
    // Initialize OpenTelemetry on mount
    initializeTracing();
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-gray-100 to-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-linear-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
              <Activity className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-linear-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Delineate Observability Platform
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Powered by Sentry & OpenTelemetry | Challenge 4
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top Row - Critical Widgets */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Health Status - Takes 1 column */}
          <div className="lg:col-span-1">
            <HealthStatus />
          </div>

          {/* Download Jobs - Takes 2 columns */}
          <div className="lg:col-span-2">
            <DownloadJobs />
          </div>
        </div>

        {/* Bottom Row - Observability Tools */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Trace Viewer */}
          <TraceViewer />

          {/* Sentry Dashboard */}
          <SentryDashboard />
        </div>

        {/* Challenge Completion Card */}
        <div className="bg-linear-to-br from-white to-gray-50 rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
              CHALLENGE 4
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              Observability Dashboard
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Column 1: Implemented Features */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm">✓</span>
                Implemented Features
              </h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">•</span>
                  <span>Sentry error tracking with trace correlation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">•</span>
                  <span>OpenTelemetry distributed tracing</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">•</span>
                  <span>Real-time API health monitoring</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">•</span>
                  <span>Download job tracking with status</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">•</span>
                  <span>Jaeger UI integration for traces</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">•</span>
                  <span>End-to-end request correlation</span>
                </li>
              </ul>
            </div>

            {/* Column 2: How to Test */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm">→</span>
                How to Test
              </h3>
              <ol className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 font-medium">1.</span>
                  <span>Start a download with file ID (70000)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 font-medium">2.</span>
                  <span>Watch real-time status updates</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 font-medium">3.</span>
                  <span>Click "Test Sentry" to trigger error</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 font-medium">4.</span>
                  <span>Check Sentry dashboard for errors</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 font-medium">5.</span>
                  <span>Open Jaeger to view traces</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 font-medium">6.</span>
                  <span>Note trace IDs linking frontend ↔ backend</span>
                </li>
              </ol>
            </div>

            {/* Column 3: Key Technologies */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm">⚡</span>
                Key Technologies
              </h3>
              <div className="space-y-2 text-sm">
                <div className="p-2 bg-gray-50 rounded border border-gray-200">
                  <div className="font-medium text-gray-900">Sentry</div>
                  <div className="text-xs text-gray-600">Error tracking & performance monitoring</div>
                </div>
                <div className="p-2 bg-gray-50 rounded border border-gray-200">
                  <div className="font-medium text-gray-900">OpenTelemetry</div>
                  <div className="text-xs text-gray-600">Distributed tracing & W3C propagation</div>
                </div>
                <div className="p-2 bg-gray-50 rounded border border-gray-200">
                  <div className="font-medium text-gray-900">Jaeger</div>
                  <div className="text-xs text-gray-600">Trace visualization & analysis</div>
                </div>
                <div className="p-2 bg-gray-50 rounded border border-gray-200">
                  <div className="font-medium text-gray-900">Next.js 16</div>
                  <div className="text-xs text-gray-600">React framework with App Router</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-500">
            Delineate Hackathon Challenge - CUET Fest 2025 | Built with ❤️ using Sentry & OpenTelemetry
          </p>
        </div>
      </footer>
    </div>
  );
}
