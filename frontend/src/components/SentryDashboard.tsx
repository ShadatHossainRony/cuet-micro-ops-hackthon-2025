'use client';

import { ExternalLink, AlertCircle } from 'lucide-react';

export function SentryDashboard() {
    const sentryUrl = process.env.NEXT_PUBLIC_SENTRY_URL || 'https://sentry.io';

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Error Tracking</h2>
                <AlertCircle className="w-6 h-6 text-red-500" />
            </div>

            <div className="space-y-4">
                <p className="text-sm text-gray-600">
                    Real-time error monitoring and performance tracking powered by Sentry.
                </p>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h3 className="font-medium text-red-900 mb-2">Sentry Dashboard</h3>
                    <p className="text-sm text-red-700 mb-3">
                        View errors, performance issues, and user feedback
                    </p>
                    <a
                        href={sentryUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                    >
                        Open Sentry
                        <ExternalLink className="w-4 h-4" />
                    </a>
                </div>

                <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2">Integration Features</h3>
                    <ul className="text-sm text-gray-600 space-y-2">
                        <li className="flex items-start gap-2">
                            <span className="text-green-600">✓</span>
                            <span><strong>Error Capture:</strong> Automatic exception tracking for API failures</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-green-600">✓</span>
                            <span><strong>Trace Correlation:</strong> Link Sentry errors to OpenTelemetry traces</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-green-600">✓</span>
                            <span><strong>Performance:</strong> Monitor API response times and page loads</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-green-600">✓</span>
                            <span><strong>Context:</strong> Request IDs, trace IDs, and user actions tagged</span>
                        </li>
                    </ul>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h3 className="font-medium text-yellow-900 mb-2">Test Error Tracking</h3>
                    <p className="text-sm text-yellow-700 mb-3">
                        Click &quot;Test Sentry Integration&quot; in Download Jobs to trigger a test error.
                        Then check your Sentry dashboard to see it captured with full context.
                    </p>
                    <p className="text-xs text-yellow-600">
                        Errors include: trace_id, span_id, request_id, file_id, and full stack traces
                    </p>
                </div>
            </div>
        </div>
    );
}
