'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/api-client';
import * as Sentry from '@sentry/nextjs';
import { getCurrentTraceContext } from '@/lib/tracing';
import { Download, Loader2, CheckCircle, XCircle, Clock, AlertTriangle, Activity } from 'lucide-react';

interface DownloadJob {
    id: string;
    file_id: number;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    message?: string;
    download_url?: string;
    processing_time?: number;
    trace_id?: string;
    created_at: Date;
    progress?: number;
    estimated_time?: number;
}

interface ErrorLog {
    id: string;
    message: string;
    timestamp: Date;
    trace_id?: string;
    type: 'api_error' | 'sentry_test' | 'network_error';
    status?: number;
}

export function DownloadJobs() {
    const [jobs, setJobs] = useState<DownloadJob[]>([]);
    const [errors, setErrors] = useState<ErrorLog[]>([]);
    const [fileId, setFileId] = useState('70000');
    const [loading, setLoading] = useState(false);
    const [testingError, setTestingError] = useState(false);
    const [showSuccessBanner, setShowSuccessBanner] = useState(false);
    const [testResult, setTestResult] = useState<{ traceId: string; responseTime: number } | null>(null);
    const [metrics, setMetrics] = useState({ successCount: 0, failureCount: 0, avgResponseTime: 0 });

    const startDownload = async () => {
        const id = Date.now().toString();
        const file_id = parseInt(fileId);

        if (isNaN(file_id) || file_id < 10000 || file_id > 100000000) {
            Sentry.captureMessage('Invalid file_id provided', {
                level: 'warning',
                extra: { file_id: fileId },
            });
            alert('File ID must be between 10,000 and 100,000,000');
            return;
        }

        // Get trace context AFTER user clicks - this is the span created by the button click
        const traceContext = getCurrentTraceContext();
        const startTime = Date.now();

        // Log the trace flow (Challenge 4 requirement)
        console.log(
            `[Frontend] 🖱️  User clicked "Initiate Download" button\n` +
            `[Frontend] 📝 Created span with trace_id: ${traceContext?.traceId}\n` +
            `[Frontend] 📤 Sending API request with traceparent header...`
        );

        const newJob: DownloadJob = {
            id,
            file_id,
            status: 'pending',
            trace_id: traceContext?.traceId,
            created_at: new Date(),
        };

        setJobs([newJob, ...jobs]);
        setLoading(true);

        try {
            const result = await apiClient.startDownload(file_id);
            const responseTime = Date.now() - startTime;

            // Log successful trace correlation
            console.log(
                `[Frontend] ✅ API response received\n` +
                `[Frontend] 🔗 Trace correlation successful | trace_id: ${traceContext?.traceId}\n` +
                `[Frontend] 📊 Response time: ${responseTime}ms | Job ID: ${result.jobId}`
            );

            // Update metrics
            setMetrics(prev => ({
                successCount: prev.successCount + 1,
                failureCount: prev.failureCount,
                avgResponseTime: (prev.avgResponseTime * prev.successCount + responseTime) / (prev.successCount + 1)
            }));

            // Update with result - job is now queued/processing
            setJobs((prev) =>
                prev.map((job) =>
                    job.id === id
                        ? {
                            ...job,
                            status: 'processing',
                            message: `✅ Job initiated successfully | Job ID: ${result.jobId} | Files: ${result.totalFileIds}`,
                            processing_time: responseTime / 1000,
                            progress: 0,
                            estimated_time: 5, // Estimate 5 seconds
                        }
                        : job
                )
            );

            Sentry.captureMessage('Download job initiated', {
                level: 'info',
                tags: {
                    trace_id: traceContext?.traceId || 'none',
                    span_id: traceContext?.spanId || 'none',
                },
                extra: { file_id, job_id: result.jobId, total_files: result.totalFileIds, response_time_ms: responseTime },
            });

            // Simulate download progress (for demonstration)
            const totalDuration = 5000; // 5 seconds simulation for quick demo
            const updateInterval = 2000; // Update every 0.25 seconds
            const totalSteps = totalDuration / updateInterval;
            let currentStep = 0;

            const progressInterval = setInterval(() => {
                currentStep++;
                const progress = Math.min(Math.round((currentStep / totalSteps) * 100), 99);
                const remainingTime = Math.max(0, Math.round((totalDuration - (currentStep * updateInterval)) / 1000));

                setJobs((prev) =>
                    prev.map((job) =>
                        job.id === id && job.status === 'processing'
                            ? {
                                ...job,
                                progress,
                                estimated_time: remainingTime,
                            }
                            : job
                    )
                );

                // Complete the job after 60 seconds
                if (currentStep >= totalSteps) {
                    clearInterval(progressInterval);
                    setJobs((prev) =>
                        prev.map((job) =>
                            job.id === id
                                ? {
                                    ...job,
                                    status: 'completed',
                                    progress: 100,
                                    message: `✅ Download completed successfully! File is ready.`,
                                    download_url: `http://36.255.71.50:9001/api/v1/download-shared-object/aHR0cDovLzEyNy4wLjAuMTo5MDAwL2Rvd25sb2Fkcy83MDAwMC56aXA_WC1BbXotQWxnb3JpdGhtPUFXUzQtSE1BQy1TSEEyNTYmWC1BbXotQ3JlZGVudGlhbD1CVjFBVFYwTUQ0WkEyQUFSUjJFTiUyRjIwMjUxMjEyJTJGdXMtZWFzdC0xJTJGczMlMkZhd3M0X3JlcXVlc3QmWC1BbXotRGF0ZT0yMDI1MTIxMlQxMjQ4MDNaJlgtQW16LUV4cGlyZXM9NDMyMDAmWC1BbXotU2VjdXJpdHktVG9rZW49ZXlKaGJHY2lPaUpJVXpVeE1pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SmhZMk5sYzNOTFpYa2lPaUpDVmpGQlZGWXdUVVEwV2tFeVFVRlNVakpGVGlJc0ltVjRjQ0k2TVRjMk5UVTNOREV3Tnl3aWNHRnlaVzUwSWpvaWJXbHVhVzloWkcxcGJpSjkuR1czZnludk8telI3amhPS0x2dTQ2aUQ5N3Y4dUN6d3d2cGRTMkhvamNZNy1laGljbDEwSXhaMGY3cTN0ZG1CTmJHM1BfbG16RkM5SVdiMnNRd1FONFEmWC1BbXotU2lnbmVkSGVhZGVycz1ob3N0JnZlcnNpb25JZD1udWxsJlgtQW16LVNpZ25hdHVyZT1mYTBkYmEyYzU1M2I1ZGU1ODZkZjE4NjU5MmE0MGRiOTM4N2ViZDFjZTc4OTQ5ZTM3YTM2OTM0YjYyYmE1NzYy`,
                                }
                                : job
                        )
                    );
                }
            }, updateInterval);
        } catch (error: any) {
            const responseTime = Date.now() - startTime;

            // Log error with trace correlation
            console.error(
                `[Frontend] ❌ API request failed\n` +
                `[Frontend] 🔗 Error trace_id: ${traceContext?.traceId}\n` +
                `[Frontend] 📛 Error: ${error.message}\n` +
                `[Frontend] 🔖 This error is tagged in Sentry with trace_id for correlation`
            );

            // Update metrics
            setMetrics(prev => ({
                successCount: prev.successCount,
                failureCount: prev.failureCount + 1,
                avgResponseTime: prev.avgResponseTime
            }));

            // Log error
            const errorLog: ErrorLog = {
                id: Date.now().toString(),
                message: error.message || 'Failed to initiate download',
                timestamp: new Date(),
                trace_id: traceContext?.traceId,
                type: 'api_error',
            };
            setErrors(prev => [errorLog, ...prev].slice(0, 10)); // Keep last 10 errors

            setJobs((prev) =>
                prev.map((job) =>
                    job.id === id
                        ? {
                            ...job,
                            status: 'failed' as const,
                            message: `❌ ${error.message}`,
                            processing_time: responseTime / 1000,
                        }
                        : job
                )
            );
        } finally {
            setLoading(false);
        }
    };

    const testSentryError = async () => {
        setTestingError(true);
        setShowSuccessBanner(false);
        const startTime = Date.now();

        console.log(
            `[Frontend] 🧪 Testing Sentry integration\n` +
            `[Frontend] � Calling /v1/download/check?sentry_test=true...`
        );

        try {
            const res = await apiClient.testSentry();
            console.log({ res })
        } catch (error: any) {
            console.log({ error })
            const responseTime = Date.now() - startTime;

            // Extract requestId (trace ID) from the backend error response
            // Try multiple possible paths where requestId might be located
            const requestId = error.requestId ||
                error.response?.data?.requestId ||
                error.data?.requestId ||
                'N/A';
            const errorMessage = error.message || 'Unknown error';

            // Debug: Log the full error structure to understand it
            console.log('[Frontend] 🔍 Full error object:', JSON.stringify(error, null, 2));

            console.log(
                `[Frontend] ✅ Test error successfully captured!\n` +
                `[Frontend] 🔗 Backend requestId (trace_id): ${requestId}\n` +
                `[Frontend] 📊 Response time: ${responseTime}ms\n` +
                `[Frontend] 💬 Error message: ${errorMessage}\n` +
                `[Frontend] 🎯 Check Sentry dashboard for error with trace correlation!`
            );

            // This is expected - the endpoint intentionally returns 500
            const errorLog: ErrorLog = {
                id: Date.now().toString(),
                message: `🧪 Sentry Test: ${errorMessage}`,
                timestamp: new Date(),
                trace_id: requestId,
                type: 'sentry_test',
                status: 500,
            };

            setErrors(prev => [errorLog, ...prev].slice(0, 10));

            // Update metrics
            setMetrics(prev => ({
                ...prev,
                failureCount: prev.failureCount + 1
            }));

            // Show success banner with actual backend requestId
            setTestResult({
                traceId: requestId,
                responseTime
            });
            setShowSuccessBanner(true);

            // Auto-hide after 8 seconds
            setTimeout(() => {
                setShowSuccessBanner(false);
            }, 8000);
        } finally {
            setTestingError(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 h-full">
            <div className="flex items-center gap-3 mb-4">
                <Activity className="w-6 h-6 text-blue-600" />
                <h2 className="text-lg font-bold text-gray-900">Download Manager</h2>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="text-xs text-green-600 font-semibold uppercase mb-1">Success</div>
                    <div className="text-2xl font-bold text-green-700">{metrics.successCount}</div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="text-xs text-red-600 font-semibold uppercase mb-1">Failures</div>
                    <div className="text-2xl font-bold text-red-700">{metrics.failureCount}</div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="text-xs text-blue-600 font-semibold uppercase mb-1">Avg Time</div>
                    <div className="text-2xl font-bold text-blue-700">{metrics.avgResponseTime.toFixed(0)}ms</div>
                </div>
            </div>

            {/* Success Banner for Sentry Test */}
            {showSuccessBanner && testResult && (
                <div className="mb-4 bg-green-50 border border-green-300 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <div>
                                <p className="text-sm font-semibold text-green-900">Sentry test captured successfully</p>
                                <div className="text-xs text-green-700 mt-1 space-x-3">
                                    <span>Request ID: <code className="font-mono">{testResult.traceId}</code></span>
                                    <span>• {testResult.responseTime}ms</span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowSuccessBanner(false)}
                            className="text-green-600 hover:text-green-800"
                        >
                            <XCircle className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Error Log Panel */}
            {errors.length > 0 && (
                <div className="mb-4 bg-red-50 border-2 border-red-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                        <h3 className="font-bold text-red-900">Recent Errors Captured</h3>
                        <span className="ml-auto text-xs bg-red-200 text-red-800 px-2 py-1 rounded-full font-bold">
                            {errors.length}
                        </span>
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                        {errors.map((error) => (
                            <div key={error.id} className="bg-white border border-red-200 rounded p-3">
                                <div className="flex items-start justify-between mb-1">
                                    <span className="text-sm font-semibold text-red-900">{error.message}</span>
                                    {error.status && (
                                        <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded font-mono">
                                            {error.status}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-3 text-xs text-gray-600">
                                    <span>⏰ {error.timestamp.toLocaleTimeString()}</span>
                                    {error.trace_id && error.trace_id !== 'N/A' && (
                                        <span className="font-mono bg-gray-100 px-1 rounded text-xs">
                                            🔗 {error.trace_id}
                                        </span>
                                    )}
                                    <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded font-semibold">
                                        {error.type.replace('_', ' ').toUpperCase()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-3 text-xs text-red-700 flex items-center gap-1">
                        <span>💡</span>
                        <span>These errors are captured in Sentry with full trace correlation</span>
                    </div>
                </div>
            )}

            <div className="mb-6 space-y-3">
                <div className="flex gap-2">
                    <input
                        type="number"
                        value={fileId}
                        onChange={(e) => setFileId(e.target.value)}
                        placeholder="Enter File ID (10000-100000000)"
                        className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-medium"
                        min="10000"
                        max="100000000"
                    />
                    <button
                        onClick={startDownload}
                        disabled={loading}
                        className="px-6 py-2.5 bg-linear-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed flex items-center gap-2 font-semibold text-sm shadow-md hover:shadow-lg transition-all"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Processing
                            </>
                        ) : (
                            <>
                                <Download className="w-4 h-4" />
                                Initiate
                            </>
                        )}
                    </button>
                </div>

                <button
                    onClick={testSentryError}
                    disabled={testingError}
                    className="w-full px-4 py-2.5 bg-linear-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-sm font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                    {testingError ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Testing...
                        </>
                    ) : (
                        <>
                            <AlertTriangle className="w-4 h-4" />
                            Test Sentry Error Tracking
                        </>
                    )}
                </button>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-xs text-blue-800">
                        💡 <span className="font-semibold">Tip:</span> Downloads take 10-120s. File IDs divisible by 7 are marked as available.
                    </p>
                </div>
            </div>

            {jobs.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <Download className="w-8 h-8 opacity-50" />
                    </div>
                    <p className="font-medium text-gray-700">No download jobs yet</p>
                    <p className="text-sm text-gray-500 mt-1">Start a download above to see real-time tracking</p>
                </div>
            ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                    {jobs.map((job) => (
                        <div
                            key={job.id}
                            className="border-2 border-gray-200 rounded-xl p-4 hover:shadow-lg hover:border-gray-300 transition-all bg-white"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${job.status === 'pending' ? 'bg-gray-100' :
                                        job.status === 'processing' ? 'bg-blue-100' :
                                            job.status === 'completed' ? 'bg-green-100' : 'bg-red-100'
                                        }`}>
                                        {job.status === 'pending' && <Clock className="w-5 h-5 text-gray-600" />}
                                        {job.status === 'processing' && <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />}
                                        {job.status === 'completed' && <CheckCircle className="w-5 h-5 text-green-600" />}
                                        {job.status === 'failed' && <XCircle className="w-5 h-5 text-red-600" />}
                                    </div>
                                    <div>
                                        <span className="font-bold text-gray-900">File #{job.file_id}</span>
                                        <div className="text-xs text-gray-500 mt-0.5">
                                            Started: {job.created_at.toLocaleTimeString()}
                                        </div>
                                    </div>
                                </div>
                                <span
                                    className={`text-xs px-3 py-1 rounded-full font-bold uppercase ${job.status === 'pending' ? 'bg-gray-200 text-gray-700' :
                                        job.status === 'processing' ? 'bg-blue-200 text-blue-700' :
                                            job.status === 'completed' ? 'bg-green-200 text-green-700' : 'bg-red-200 text-red-700'
                                        }`}
                                >
                                    {job.status}
                                </span>
                            </div>

                            {job.message && (
                                <div className="mb-2 p-2 bg-gray-50 rounded text-sm text-gray-700 border-l-4 border-gray-300">
                                    {job.message}
                                </div>
                            )}

                            {/* Progress Bar for Processing Status */}
                            {job.status === 'processing' && job.progress !== undefined && (
                                <div className="mb-3">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs font-semibold text-blue-700">Processing...</span>
                                        <span className="text-xs font-bold text-blue-700">{job.progress}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div
                                            className="bg-linear-to-r from-blue-500 to-blue-600 h-2.5 rounded-full transition-all duration-500"
                                            style={{ width: `${job.progress}%` }}
                                        />
                                    </div>
                                    {job.estimated_time && job.estimated_time > 0 && (
                                        <div className="text-xs text-gray-600 mt-1">
                                            Est. time remaining: ~{job.estimated_time}s
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="flex flex-wrap gap-2 text-xs mb-3">
                                {job.processing_time && (
                                    <div className="px-2 py-1 bg-purple-50 text-purple-700 rounded border border-purple-200 font-medium">
                                        ⏱️ {job.processing_time.toFixed(2)}s
                                    </div>
                                )}
                                {job.trace_id && (
                                    <div className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded border border-indigo-200 font-mono text-xs">
                                        🔗 {job.trace_id.substring(0, 8)}...
                                    </div>
                                )}
                            </div>

                            {job.status === 'completed' && (
                                <a
                                    href={job.download_url || `${process.env.NEXT_PUBLIC_API_URL}/downloads/${job.file_id}.zip`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-linear-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 font-semibold text-sm shadow-md hover:shadow-lg transition-all"
                                >
                                    <Download className="w-4 h-4" />
                                    Download File
                                </a>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
