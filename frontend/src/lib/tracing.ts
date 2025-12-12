import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-web';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { trace, context, propagation, SpanStatusCode } from '@opentelemetry/api';
import { W3CTraceContextPropagator } from '@opentelemetry/core';

let isInitialized = false;

export function initializeTracing() {
    if (isInitialized || typeof window === 'undefined') {
        return;
    }

    // Set up W3C trace context propagator
    propagation.setGlobalPropagator(new W3CTraceContextPropagator());

    // Configure OTLP exporter without credentials to fix CORS wildcard issue
    const exporter = new OTLPTraceExporter({
        url: process.env.NEXT_PUBLIC_OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1/traces',
        headers: {},
        concurrencyLimit: 10,
        // Fix CORS issue: Don't send credentials so wildcard CORS works
        httpAgentOptions: {
            keepAlive: false
        },
    });

    const provider = new WebTracerProvider({
        spanProcessors: [new BatchSpanProcessor(exporter)],
    });
    provider.register();

    // Auto-instrument fetch calls
    registerInstrumentations({
        instrumentations: [
            new FetchInstrumentation({
                propagateTraceHeaderCorsUrls: [
                    /localhost:3000/,  // Only propagate to our API, not to Jaeger
                ],
                clearTimingResources: true,
                // Don't instrument requests to Jaeger to avoid CORS issues
                ignoreUrls: [/localhost:4318/],
            }),
        ],
    });

    isInitialized = true;
    console.log('[Tracing] OpenTelemetry initialized');
}

// Get the global tracer
export function getTracer(name = 'delineate-frontend') {
    return trace.getTracer(name);
}

// Create a traced function wrapper
export function withTracing<T extends (...args: any[]) => any>(
    name: string,
    fn: T,
    attributes?: Record<string, string | number>
): T {
    return ((...args: any[]) => {
        const tracer = getTracer();
        const span = tracer.startSpan(name, {
            attributes: attributes || {},
        });

        return context.with(trace.setSpan(context.active(), span), () => {
            try {
                const result = fn(...args);

                // Handle promises
                if (result instanceof Promise) {
                    return result
                        .then((value) => {
                            span.setStatus({ code: SpanStatusCode.OK });
                            span.end();
                            return value;
                        })
                        .catch((error) => {
                            span.setStatus({
                                code: SpanStatusCode.ERROR,
                                message: error.message,
                            });
                            span.recordException(error);
                            span.end();
                            throw error;
                        });
                }

                span.setStatus({ code: SpanStatusCode.OK });
                span.end();
                return result;
            } catch (error: any) {
                span.setStatus({
                    code: SpanStatusCode.ERROR,
                    message: error.message,
                });
                span.recordException(error);
                span.end();
                throw error;
            }
        });
    }) as T;
}

// Get current trace context for correlation
export function getCurrentTraceContext() {
    const span = trace.getActiveSpan();
    if (!span) return null;

    const spanContext = span.spanContext();
    return {
        traceId: spanContext.traceId,
        spanId: spanContext.spanId,
        traceFlags: spanContext.traceFlags,
    };
}

// Create headers with trace propagation
export function getTracingHeaders(): HeadersInit {
    const headers: HeadersInit = {};

    // Let the propagator inject the traceparent header
    propagation.inject(context.active(), headers);

    return headers;
}
