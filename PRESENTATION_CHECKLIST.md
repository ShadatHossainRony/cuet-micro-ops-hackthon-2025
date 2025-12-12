# Challenge 4 - Presentation Checklist 🎤

## Pre-Presentation Setup (5 minutes before)

### 1. Start All Services
```bash
cd /path/to/micro-ops
docker compose -f docker/compose.dev.yml up -d

# Verify all services are running
docker compose -f docker/compose.dev.yml ps
```

### 2. Open Browser Tabs
- [ ] Tab 1: Dashboard → http://localhost:3001
- [ ] Tab 2: Jaeger UI → http://localhost:16686
- [ ] Tab 3: Sentry Dashboard → https://micro-ops.sentry.io/issues/
- [ ] Tab 4: API Docs → http://localhost:3000/docs (optional)

### 3. Open Code Editor
- [ ] `frontend/src/components/DownloadJobs.tsx` (main component)
- [ ] `frontend/src/lib/tracing.ts` (OpenTelemetry config)
- [ ] `frontend/src/lib/api-client.ts` (API integration)
- [ ] `docker/compose.dev.yml` (infrastructure)

### 4. Clear Previous Data
```bash
# Optional: Clear browser console for clean demo
# In dashboard: Refresh page to reset metrics
```

---

## Presentation Flow (10-15 minutes)

### Opening (1 minute)
- [ ] "Today I'm presenting our Challenge 4 solution - a production-ready observability dashboard"
- [ ] Show dashboard overview
- [ ] Mention tech stack: Next.js, Sentry, OpenTelemetry, Jaeger

---

### Part 1: Architecture (2 minutes)

#### Show Architecture Diagram
- [ ] Open `CHALLENGE_4_SOLUTION.md` → Architecture section
- [ ] Explain flow: Browser → Frontend → Backend → Observability

#### Key Points to Mention:
- [ ] "We use W3C Trace Context standard"
- [ ] "Every request gets unique trace ID"
- [ ] "Trace ID flows through entire system"
- [ ] "Errors automatically correlated"

**Visual Aid:**
```
User Action → trace_id created → API call (with header) → Backend receives
                                                              ↓
                                    Sentry ←── trace_id ──→ Jaeger
```

---

### Part 2: Live Demo - Normal Operation (3 minutes)

#### A. Health Monitoring
- [ ] Point to "System Health" section
- [ ] Show green "Healthy" status
- [ ] Mention: "Auto-refreshes every 30 seconds"

#### B. Initiate Download
```bash
# Dashboard action:
1. Enter file ID: 70000
2. Click "Initiate Download"
```

- [ ] Show job appearing in list
- [ ] Point out trace ID in job details
- [ ] Open browser console (F12)
- [ ] Show console logs:
  ```
  [Frontend] 🖱️ User clicked "Initiate Download" button
  [Frontend] 📝 Created span with trace_id: abc123...
  ```

#### C. Jaeger Trace
- [ ] Copy trace ID from console/dashboard
- [ ] Switch to Jaeger tab
- [ ] Service: `micro-ops-frontend`
- [ ] Paste trace ID → "Find Traces"
- [ ] Show trace visualization:
  - [ ] Frontend span
  - [ ] API call timing
  - [ ] Request/response details

**Key Message:** *"This is distributed tracing - we can see the complete request flow"*

---

### Part 3: Live Demo - Error Tracking (4 minutes)

#### A. Trigger Test Error
```bash
# Dashboard action:
Click "Test Sentry Error Tracking" button
```

- [ ] Show success notification with requestId
- [ ] Point to "Recent Errors Captured" panel
- [ ] Highlight the new error entry with trace ID

#### B. Verify in Browser Console
- [ ] Open console
- [ ] Show logs:
  ```
  [Frontend] ✅ Test error successfully captured!
  [Frontend] 🔗 Backend requestId (trace_id): abc123...
  ```

#### C. Sentry Dashboard
- [ ] Switch to Sentry tab
- [ ] Should see error appear in real-time (or refresh)
- [ ] Click on error
- [ ] Show:
  - [ ] Error message
  - [ ] Stack trace
  - [ ] Tags section → **trace_id**
  - [ ] Full context

**Key Message:** *"Notice the trace_id tag - this links to Jaeger"*

#### D. Correlate in Jaeger
- [ ] Copy trace ID from Sentry
- [ ] Switch to Jaeger tab
- [ ] Search for same trace ID
- [ ] Show same request in Jaeger
- [ ] Point out: "Same transaction, three views"

**Key Message:** *"This is the power of correlation - one trace ID, complete visibility"*

---

### Part 4: Technical Highlights (3 minutes)

#### Show Code Snippets

##### A. OpenTelemetry Configuration
```typescript
// File: frontend/src/lib/tracing.ts
- Show initializeTracing() function
- Point out: WebTracerProvider setup
- Point out: OTLPTraceExporter to Jaeger
- Point out: FetchInstrumentation for automatic tracing
```

**Explain:**
- [ ] "Automatic span creation for all API calls"
- [ ] "W3C traceparent header added automatically"
- [ ] "Batched export for efficiency"

##### B. Error Boundary
```typescript
// File: frontend/src/app/layout.tsx or similar
<Sentry.ErrorBoundary fallback={ErrorFallback}>
  <App />
</Sentry.ErrorBoundary>
```

**Explain:**
- [ ] "Catches all uncaught React errors"
- [ ] "Automatic reporting to Sentry"
- [ ] "User-friendly error display"

##### C. Trace Propagation
```typescript
// File: frontend/src/lib/api-client.ts
const headers = {
  'Content-Type': 'application/json',
  ...getTracingHeaders(), // Adds traceparent
};
```

**Explain:**
- [ ] "Every API call includes trace context"
- [ ] "Backend receives and logs trace_id"
- [ ] "End-to-end correlation"

---

### Part 5: Achievement Summary (2 minutes)

#### Requirements Checklist
- [ ] ✅ React Application (Next.js 15)
- [ ] ✅ Sentry Integration
  - Error boundary ✓
  - Automatic error capture ✓
  - Performance monitoring ✓
- [ ] ✅ OpenTelemetry Integration
  - Trace propagation ✓
  - Custom spans ✓
  - Frontend/backend correlation ✓
- [ ] ✅ Dashboard Features
  - Health status ✓
  - Download jobs ✓
  - Error log ✓
  - Performance metrics ✓
- [ ] ✅ End-to-End Correlation
  - Same trace ID across Sentry, Jaeger, logs ✓

#### Unique Features
- [ ] "Ad blocker resilience (127.0.0.1 vs localhost)"
- [ ] "One-click error testing"
- [ ] "Real-time metrics calculation"
- [ ] "Professional, minimalistic UI"
- [ ] "Complete Docker orchestration"

#### By the Numbers
- [ ] **5 Services**: Frontend, Backend, Jaeger, MinIO, Init
- [ ] **4 Dashboard Components**: Health, Downloads, Errors, Metrics
- [ ] **3 Observability Tools**: Sentry, Jaeger, OpenTelemetry
- [ ] **2000+ lines** of TypeScript
- [ ] **100% trace correlation** achieved

---

### Closing (1 minute)

**Strong Finish:**
> "In summary, we've built a production-ready observability platform that provides complete visibility from user click to backend processing. Every error is trackable, every request is traceable, and everything is correlated. This isn't just a demo - it's a foundation for real production monitoring."

**Call to Action:**
- [ ] "Full documentation in CHALLENGE_4_SOLUTION.md"
- [ ] "Complete architecture diagrams"
- [ ] "Step-by-step testing guide"
- [ ] "Ready for production deployment"

---

## Q&A Preparation

### Common Questions & Answers

**Q: How does trace correlation work technically?**
> A: We use W3C Trace Context standard. Frontend creates a trace ID, includes it in a `traceparent` HTTP header, backend extracts and logs it, and both Sentry and Jaeger tag events with this ID.

**Q: What happens if Jaeger or Sentry is down?**
> A: Application continues working normally. Observability is non-blocking. Spans are queued and retried, errors are logged locally as fallback.

**Q: Can this scale to production?**
> A: Yes! OpenTelemetry supports sampling (currently 100% for demo), batch processing, and can export to any OTLP-compatible backend. Sentry has robust production offerings.

**Q: How much overhead does tracing add?**
> A: Minimal. Spans are batched (10 per batch, every 5s), and the overhead is typically <1% of request time. We can configure sampling rates in production.

**Q: Why Next.js instead of plain React?**
> A: Next.js provides SSR, better performance, built-in routing, and excellent Sentry integration. It's production-ready out of the box.

**Q: How do you handle CORS issues?**
> A: We configured Jaeger to allow CORS, and use `ignoreUrls` to prevent circular instrumentation of the OTLP exporter itself.

**Q: Can users see traces in the dashboard?**
> A: Currently we link to Jaeger UI. Could embed Jaeger traces or build custom trace visualization component for production.

---

## Technical Backup (If Needed)

### Environment Variables
```env
# Frontend
NEXT_PUBLIC_API_URL=http://127.0.0.1:3000
NEXT_PUBLIC_OTEL_EXPORTER_OTLP_ENDPOINT=http://127.0.0.1:4318/v1/traces
NEXT_PUBLIC_JAEGER_URL=http://127.0.0.1:16686

# Backend
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project
OTEL_EXPORTER_OTLP_ENDPOINT=http://delineate-jaeger:4318
```

### Services & Ports
| Service | Port | Purpose |
|---------|------|---------|
| Frontend | 3001 | Next.js app |
| Backend | 3000 | Hono API |
| Jaeger UI | 16686 | Trace viewer |
| Jaeger OTLP | 4318 | Trace collection |
| MinIO | 9000 | S3 storage |

### Quick Commands
```bash
# Restart services
docker compose -f docker/compose.dev.yml restart

# View logs
docker compose -f docker/compose.dev.yml logs -f delineate-frontend

# Stop all
docker compose -f docker/compose.dev.yml down

# Check health
curl http://localhost:3000/health
```

---

## Post-Presentation

### What Went Well
- [ ] Demo worked smoothly
- [ ] Trace correlation demonstrated
- [ ] Architecture explained clearly
- [ ] Questions answered confidently

### What to Improve
- [ ] (Note areas for improvement)

### Follow-Up Actions
- [ ] Share documentation link
- [ ] Provide GitHub repository
- [ ] Answer any pending questions

---

## Emergency Troubleshooting

### Dashboard not loading?
```bash
docker compose -f docker/compose.dev.yml restart delineate-frontend
# Wait 10 seconds, refresh browser
```

### Traces not in Jaeger?
```bash
# Check Jaeger is running
curl http://localhost:16686
# Check OTLP endpoint
curl http://localhost:4318
```

### Errors not in Sentry?
```bash
# Verify DSN in .env and .env.local
# Check browser network tab for Sentry requests
# May take 30-60 seconds to appear in dashboard
```

### Browser blocking requests?
```bash
# Use 127.0.0.1 (already configured)
# Or open incognito mode
# Or disable ad blocker temporarily
```

---

## Success Criteria

✅ **Minimum to Show:**
- Health status working
- One successful download with trace ID
- One error captured in all three places (dashboard, Sentry, Jaeger)
- Code walkthrough of key components

✅ **Ideal Demo:**
- All of above +
- Real-time metrics updating
- Smooth transitions between tools
- Clear technical explanations
- Professional presentation style

---

**Good luck! 🚀**

Remember: This is a production-quality implementation. Be confident in your work!
