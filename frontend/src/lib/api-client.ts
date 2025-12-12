import * as Sentry from '@sentry/nextjs';
import { getTracingHeaders, withTracing, getCurrentTraceContext } from './tracing';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface HealthCheck {
    status: 'healthy' | 'unhealthy';
    checks: {
        storage: 'ok' | 'unavailable' | 'error';
    };
}

export interface DownloadCheckRequest {
    file_id: number;
}

export interface DownloadCheckResponse {
    file_id: number;
    available: boolean;
    message: string;
}

export interface DownloadStartRequest {
    file_ids: number[];
}

export interface DownloadStartResponse {
    jobId: string;
    status: 'queued' | 'processing';
    totalFileIds: number;
}

export interface DownloadError {
    error: string;
    message: string;
}

class ApiClient {
    private baseUrl: string;

    constructor(baseUrl: string = API_BASE_URL) {
        this.baseUrl = baseUrl;
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;

        // Get trace context for correlation
        const traceContext = getCurrentTraceContext();

        // Add tracing headers
        const headers = {
            'Content-Type': 'application/json',
            ...getTracingHeaders(),
            ...options.headers,
        };

        // Add trace ID to Sentry context
        if (traceContext) {
            Sentry.setTag('trace_id', traceContext.traceId);
            Sentry.setTag('span_id', traceContext.spanId);
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers,
            });

            // Get request ID from response for debugging
            const requestId = response.headers.get('x-request-id');
            if (requestId) {
                Sentry.setTag('request_id', requestId);
            }

            if (!response.ok) {
                const errorData = await response.json();

                // Capture error in Sentry
                Sentry.captureException(new Error(`API Error: ${errorData.message}`), {
                    tags: {
                        api_endpoint: endpoint,
                        http_status: response.status,
                        request_id: errorData.requestId || requestId || 'unknown',
                    },
                    extra: {
                        error_details: errorData,
                        trace_context: traceContext,
                    },
                });

                // Create error object that includes the full response data
                const error = new Error(errorData.message || 'API request failed') as any;
                error.requestId = errorData.requestId;
                error.status = response.status;
                error.data = errorData;
                
                throw error;
            }

            return await response.json();
        } catch (error: any) {
            // Capture network errors
            Sentry.captureException(error, {
                tags: {
                    api_endpoint: endpoint,
                    error_type: 'network_error',
                },
                extra: {
                    trace_context: traceContext,
                },
            });

            throw error;
        }
    }

    // Health check endpoint
    getHealth = withTracing(
        'api.getHealth',
        async (): Promise<HealthCheck> => {
            return this.request<HealthCheck>('/health');
        }
    );

    // Check file availability
    checkDownload = withTracing(
        'api.checkDownload',
        async (data: DownloadCheckRequest): Promise<DownloadCheckResponse> => {
            return this.request<DownloadCheckResponse>('/v1/download/check', {
                method: 'POST',
                body: JSON.stringify(data),
            });
        },
        { 'download.action': 'check' }
    );

    // Initiate download (returns immediately with job_id)
    startDownload = withTracing(
        'api.initiateDownload',
        async (fileId: number): Promise<DownloadStartResponse> => {
            return this.request<DownloadStartResponse>('/v1/download/initiate', {
                method: 'POST',
                body: JSON.stringify({ file_ids: [fileId] }),
            });
        },
        { 'download.action': 'initiate' }
    );

    // Test Sentry integration
    testSentry = withTracing(
        'api.testSentry',
        async (): Promise<any> => {
            return this.request('/v1/download/check?sentry_test=true', {
                method: 'POST',
                body: JSON.stringify({ file_id: 70000 }),
            });
        }
    );
}

export const apiClient = new ApiClient();
