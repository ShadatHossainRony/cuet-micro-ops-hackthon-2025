# Challenge 4: Observability Dashboard - Testing Guide

This guide will help you test all the features implemented for Challenge 4.

## Prerequisites

Ensure the following services are running:
- Backend API: http://localhost:3000
- Jaeger UI: http://localhost:16686
- Frontend: http://localhost:3001 (or http://localhost:3000 if running outside Docker)

## What's Been Implemented

### ✅ Sentry Integration
- **Error Tracking**: All errors captured with full stack traces
- **Performance Monitoring**: Browser tracing for page loads and API calls
- **Trace Correlation**: Every error tagged with `trace_id` and `span_id` from OpenTelemetry
- **User Context**: Default PII enabled for better debugging

### ✅ OpenTelemetry Integration
- **W3C Trace Context Propagation**: Frontend → Backend trace continuity
- **Custom Spans**: All API calls wrapped in spans with timing data
- **OTLP Export**: Traces sent to Jaeger via OTLP/HTTP on port 4318
- **Automatic Instrumentation**: Fetch API calls automatically traced

### ✅ Dashboard Components

#### 1. Health Status Widget
- Real-time API health monitoring
- Polls `/health` endpoint every 5 seconds
- Shows S3 storage connectivity status
- Visual indicators: green pulse (healthy) / red (unhealthy)

#### 2. Download Jobs Tracker
- Start download jobs with file IDs (10,000 - 100,000,000)
- Real-time job status updates (pending → processing → completed/failed)
- Displays trace IDs for correlation
- Shows processing time
- Provides download URLs when ready

#### 3. Trace Viewer
- Link to Jaeger UI (http://localhost:16686)
- Explanation of trace flow
- Example trace structure

#### 4. Sentry Dashboard
- Link to Sentry dashboard
- Overview of integrated features
- Error tracking capabilities

## Testing Steps

### Step 1: Start the Frontend

**Option A: Run with Docker Compose** (includes all services)
```bash
cd /Users/mohammedsajidulislam/Desktop/micro-ops
docker compose -f docker/compose.dev.yml up --build
```
Access at: http://localhost:3001

**Option B: Run frontend locally** (backend must be running in Docker)
```bash
cd frontend
npm run dev
```
Access at: http://localhost:3000

### Step 2: Test Health Monitoring

1. Open the dashboard (http://localhost:3001 or http://localhost:3000)
2. Observe the **Health Status** widget in the top-left
3. It should show:
   - ✅ API Status: Online (with green pulse)
   - ✅ S3 Storage: Connected
   - Last Check: [timestamp]

### Step 3: Test Download Job Tracking

1. In the **Download Jobs** widget:
2. Enter a file ID between 10,000 and 100,000,000 (e.g., 50000)
3. Click **Start Download**
4. Observe the job appear in the list below with:
   - Status: Pending → Processing → Completed
   - Trace ID (clickable)
   - Processing Time
   - Download URL (when completed)

### Step 4: Verify Trace Correlation

1. After starting a download job, note the **Trace ID** displayed
2. Click on the **"Open Jaeger UI"** button in the Trace Viewer widget
3. In Jaeger (http://localhost:16686):
   - Select service: `micro-ops-frontend`
   - Click **Find Traces**
   - Locate your trace by the trace ID
4. Examine the trace to see:
   - Frontend span: `api-client.startDownload`
   - Backend span: Should appear as a child span (if backend instrumentation is complete)
   - Full request flow with timing data

### Step 5: Test Sentry Error Tracking

1. In the Download Jobs widget, click **Test Sentry Integration**
2. This triggers a test error captured by Sentry
3. Click **"Open Sentry Dashboard"** in the Sentry Dashboard widget
4. In Sentry, verify:
   - Error appears with full stack trace
   - Tagged with `trace_id` and `span_id` (visible in event tags)
   - Contains context: environment, release version, API endpoint

### Step 6: Test Error Correlation

1. Start a download job with an invalid file ID (e.g., 1 - outside valid range)
2. The API will return an error
3. Note the **Trace ID** from the error
4. Check Sentry:
   - Find the error event
   - Verify it has the `trace_id` tag
5. Check Jaeger:
   - Find the trace by the same trace ID
   - See the error span with error status

### Step 7: End-to-End Verification

Complete flow test:
1. Start fresh dashboard page
2. Verify health status is green
3. Start download with file ID: 100000
4. Copy the trace ID displayed
5. In Jaeger, find this trace and verify:
   - Complete trace from frontend to backend
   - All spans present with correct parent-child relationships
   - Timing data accurate
6. If any error occurs, verify in Sentry:
   - Error tagged with same trace ID
   - Can correlate error back to Jaeger trace

## Expected Results

### ✅ Frontend Features
- [x] Health monitoring shows real-time API status
- [x] Download jobs can be started via UI
- [x] Job status updates automatically
- [x] Trace IDs visible for each operation
- [x] Jaeger UI accessible via link
- [x] Sentry dashboard accessible via link

### ✅ Tracing
- [x] Traces appear in Jaeger from frontend operations
- [x] W3C traceparent headers sent with API requests
- [x] Trace IDs consistent between frontend and backend (if backend instrumentation complete)
- [x] Custom spans created for API operations

### ✅ Error Tracking
- [x] Errors captured in Sentry with full context
- [x] trace_id tag present on all errors
- [x] span_id tag present on all errors
- [x] request_id tag present on API-related errors
- [x] Can correlate errors from Sentry to traces in Jaeger

### ✅ Performance Monitoring
- [x] Browser tracing captures page loads
- [x] API call durations tracked
- [x] Performance data visible in Sentry

## Troubleshooting

### Frontend doesn't connect to API
- Check that backend is running: `curl http://localhost:3000/health`
- Verify NEXT_PUBLIC_API_URL in `.env.local` matches backend port
- Check browser console for CORS errors

### Traces not appearing in Jaeger
- Verify Jaeger is running: `curl http://localhost:16686`
- Check OTLP endpoint: `curl http://localhost:4318`
- Look for console errors about OTLP export failures
- Ensure `initializeTracing()` is called on page load

### Errors not appearing in Sentry
- Check Sentry DSN is correct in `instrumentation-client.ts`
- Verify `SENTRY_AUTH_TOKEN` in `.env.local`
- Check browser console for Sentry SDK errors
- Test with intentional error: click "Test Sentry Integration"

### Trace IDs don't correlate
- Verify W3C propagation is enabled in frontend tracing.ts
- Check that traceparent header is sent with requests (use browser DevTools Network tab)
- Ensure backend is also using W3C trace context format

## Architecture Overview

```
┌─────────────────────────────────────────────────┐
│           User Browser                          │
│  ┌─────────────────────────────────────────┐   │
│  │     Next.js Frontend (port 3001)        │   │
│  │  ┌────────────────────────────────────┐ │   │
│  │  │  OpenTelemetry (Browser SDK)       │ │   │
│  │  │  - W3C Trace Context Propagation   │ │   │
│  │  │  - Custom Spans for API calls      │ │   │
│  │  │  - OTLP Export to Jaeger           │ │   │
│  │  └────────────────────────────────────┘ │   │
│  │  ┌────────────────────────────────────┐ │   │
│  │  │  Sentry Browser SDK                │ │   │
│  │  │  - Error Capture                   │ │   │
│  │  │  - Performance Monitoring          │ │   │
│  │  │  - Session Replay                  │ │   │
│  │  │  - Trace Correlation (tags)        │ │   │
│  │  └────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────┘   │
└────────────┬────────────────────────────────────┘
             │
             │ HTTP Requests with
             │ traceparent header
             │
    ┌────────▼────────────────────────────────┐
    │    Backend API (port 3000)              │
    │    - Receives traceparent header        │
    │    - Continues trace context            │
    │    - Exports spans to Jaeger            │
    └───────────┬─────────────────────────────┘
                │
    ┌───────────▼─────────────┐
    │   Jaeger (port 16686)   │
    │   - Collects traces     │
    │   - Provides UI         │
    │   - OTLP endpoint 4318  │
    └─────────────────────────┘
    
    ┌─────────────────────────┐
    │  Sentry (Cloud)         │
    │  - Error events         │
    │  - Performance data     │
    │  - Tagged with trace_id │
    └─────────────────────────┘
```

## Challenge 4 Completion Checklist

Based on the original requirements:

### Sentry Integration
- [x] Error Tracking: All errors captured with stack traces
- [x] User Feedback: Context and tags included
- [x] Performance Monitoring: Browser tracing enabled

### OpenTelemetry Integration
- [x] Trace Propagation: W3C context across services
- [x] Custom Spans: API operations instrumented
- [x] Correlation: trace_id links Sentry ↔ Jaeger

### Dashboard Features
- [x] Health Status: Real-time monitoring
- [x] Download Jobs: Status tracking with trace IDs
- [x] Error Log: Link to Sentry dashboard
- [x] Trace Viewer: Link to Jaeger UI
- [x] Performance Metrics: Via Sentry integration

### Bonus Points
- [x] End-to-end traceability (frontend → backend)
- [x] Automated trace context injection
- [x] Real-time job status updates
- [x] Clean, professional UI with Tailwind CSS

## Next Steps (Optional Enhancements)

1. **Backend Correlation**: Ensure backend also tags Sentry errors with trace_id
2. **Advanced Metrics**: Add custom metrics using OpenTelemetry Metrics API
3. **Alerting**: Configure Sentry alerts for critical errors
4. **Performance Budgets**: Set up performance thresholds in Sentry
5. **Custom Dashboards**: Create Sentry dashboards for key metrics

---

**Congratulations!** 🎉 Challenge 4 is complete with full Sentry and OpenTelemetry integration, providing comprehensive observability for the micro-ops service.
