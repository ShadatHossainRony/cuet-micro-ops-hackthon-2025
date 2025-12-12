'use client';

import { ExternalLink } from 'lucide-react';

export function TraceViewer() {
    const jaegerUrl = process.env.NEXT_PUBLIC_JAEGER_URL || 'http://localhost:16686';

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Distributed Tracing</h2>

            <div className="space-y-4">
                <p className="text-sm text-gray-600">
                    View end-to-end traces showing request flow from frontend through backend to S3.
                </p>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-medium text-blue-900 mb-2">Jaeger UI</h3>
                    <p className="text-sm text-blue-700 mb-3">
                        Explore detailed traces, spans, and performance metrics
                    </p>
                    <a
                        href={jaegerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                    >
                        Open Jaeger UI
                        <ExternalLink className="w-4 h-4" />
                    </a>
                </div>

                <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2">How Tracing Works</h3>
                    <div className="text-sm text-gray-600 space-y-2">
                        <p>
                            <strong>1. User Interaction:</strong> Click &quot;Start Download&quot; creates a span
                        </p>
                        <p>
                            <strong>2. API Request:</strong> Trace context propagated via traceparent header
                        </p>
                        <p>
                            <strong>3. Backend Processing:</strong> Backend creates child spans for S3 operations
                        </p>
                        <p>
                            <strong>4. Correlation:</strong> All spans linked by trace ID for end-to-end visibility
                        </p>
                    </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium mb-2 text-sm">Example Trace Structure</h3>
                    <pre className="text-xs text-gray-700 overflow-x-auto">
                        {`Trace ID: abc123def456
├─ [Frontend] api.startDownload (120.5s)
│  ├─ [Backend] POST /v1/download/start (120.4s)
│  │  ├─ S3: HeadObject (1.2s)
│  │  ├─ Processing delay (118s)
│  │  └─ S3: GetSignedUrl (0.8s)
│  └─ Response handling (0.1s)`}
                    </pre>
                </div>
            </div>
        </div>
    );
}
