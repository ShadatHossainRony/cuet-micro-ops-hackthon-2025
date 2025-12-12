# Challenge 4 - Quick Reference Card 🎯

## One-Page Cheat Sheet for Presentation

---

## 🚀 Quick Start Commands

```bash
# Start everything
docker compose -f docker/compose.dev.yml up -d

# Check status
docker compose -f docker/compose.dev.yml ps
```

---

## 🌐 URLs to Open

| Service | URL | Purpose |
|---------|-----|---------|
| **Dashboard** | http://localhost:3001 | Main demo |
| **Jaeger** | http://localhost:16686 | Traces |
| **Sentry** | https://micro-ops.sentry.io/issues/ | Errors |
| **API Health** | http://localhost:3000/health | Quick check |

---

## 🎤 30-Second Elevator Pitch

> "We built a production-ready observability dashboard using Next.js, Sentry, and OpenTelemetry. It provides end-to-end trace correlation - meaning every user action, API call, and error is tracked with a unique ID that flows through the entire system. You can see a single request in the dashboard, Sentry, and Jaeger, all correlated by trace ID. This is how modern microservices achieve complete visibility."

---

## 📊 Demo Script (3 Minutes)

### 1. Show Dashboard (30s)
- "This is our observability dashboard"
- Point to: Health, Metrics, Download Manager
- "Built with Next.js 15, integrates Sentry + OpenTelemetry"

### 2. Normal Download (60s)
- Enter file ID: **70000**
- Click "Initiate Download"
- Open Console (F12)
- **Copy trace ID** from console log
- Switch to Jaeger → **Paste trace ID** → Find
- "See the complete request flow"

### 3. Error Tracking (90s)
- Click "**Test Sentry Error Tracking**"
- Show success notification with **requestId**
- Point to error in error log panel
- Switch to **Sentry** → Find error
- Show **trace_id tag** in Sentry
- Switch to **Jaeger** → Search same trace ID
- "**Same transaction, three views** - that's correlation"

---

## 🎯 Key Messages

1. **"W3C Trace Context Standard"** - Industry standard, not custom
2. **"Automatic Propagation"** - No manual trace ID passing
3. **"Production Ready"** - Real tools, real integration
4. **"Complete Correlation"** - One ID, everywhere
5. **"Zero Code in Backend"** - Frontend-driven observability

---

## 💡 If Asked About...

**Scalability?**
> "OpenTelemetry supports sampling and batching. We're at 100% for demo, can configure 1-10% in production."

**Performance Overhead?**
> "Minimal - spans are batched, typically <1% overhead. Can be sampled down."

**Production Deployment?**
> "Dockerized, uses industry-standard tools, can export to any OTLP backend (Datadog, New Relic, etc.)"

**Why Next.js?**
> "SSR, better performance, excellent Sentry integration, production-ready framework."

**CORS Issues?**
> "Configured Jaeger CORS, using 127.0.0.1 to avoid ad blockers, ignoreUrls prevents circular tracing."

---

## ✅ Requirements Checklist

- [x] React Application (Next.js 15)
- [x] Sentry Integration (error boundary, auto-capture, performance)
- [x] OpenTelemetry (trace propagation, custom spans, correlation)
- [x] Dashboard (health, downloads, errors, metrics)
- [x] End-to-end correlation (trace_id everywhere)
- [x] Docker Compose (all services)
- [x] Documentation (complete guide)

---

## 🔢 Stats to Mention

- **5 Services** integrated
- **4 Dashboard** components
- **3 Observability** tools
- **2000+ lines** of TypeScript
- **100% trace** correlation

---

## 🆘 Emergency Fixes

**Dashboard not loading?**
```bash
docker compose -f docker/compose.dev.yml restart delineate-frontend
```

**No traces in Jaeger?**
- Wait 5-10 seconds (batched export)
- Check OTLP endpoint: http://localhost:4318

**Sentry not showing errors?**
- Can take 30-60 seconds
- Check network tab for Sentry requests
- Verify DSN configured

**Browser blocking?**
- Already using 127.0.0.1
- Or use incognito mode
- Or disable ad blocker

---

## 🎓 Technical Terms

**W3C Trace Context** - Standard for propagating trace IDs
**OTLP** - OpenTelemetry Protocol (exports to Jaeger)
**Span** - Single unit of work in a trace
**traceparent** - HTTP header with trace ID
**Correlation** - Linking events across systems via trace ID

---

## 📂 Key Files to Show (If Needed)

1. `frontend/src/lib/tracing.ts` - OpenTelemetry setup
2. `frontend/src/lib/api-client.ts` - Trace header injection
3. `frontend/src/components/DownloadJobs.tsx` - Main component
4. `docker/compose.dev.yml` - Infrastructure

---

## 🏆 Closing Statement

> "This solution demonstrates production-ready observability with complete end-to-end tracing. It's not just a demo - it's a foundation you could deploy today. Full documentation in CHALLENGE_4_SOLUTION.md. Questions?"

---

## 📸 Screenshot Opportunities

1. Dashboard with successful download
2. Sentry error with trace_id tag
3. Jaeger trace visualization
4. Browser console logs showing trace flow
5. Error log panel with recent captures

---

**Print this page and keep it handy! 📄**
