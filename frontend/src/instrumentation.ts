import * as Sentry from '@sentry/nextjs';

export async function register() {
  // Initialize server-side Sentry
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    Sentry.init({
      dsn: "https://ccc3735928c5eea51f26a1aab7ee8158@o4510520056217600.ingest.de.sentry.io/4510520230281296",
      tracesSampleRate: 1,
      enableLogs: true,
      environment: process.env.NODE_ENV || 'development',
      release: process.env.NEXT_PUBLIC_APP_VERSION || 'dev',
    });
  }

  // Initialize edge runtime Sentry
  if (process.env.NEXT_RUNTIME === 'edge') {
    Sentry.init({
      dsn: "https://ccc3735928c5eea51f26a1aab7ee8158@o4510520056217600.ingest.de.sentry.io/4510520230281296",
      tracesSampleRate: 1,
      enableLogs: true,
      environment: process.env.NODE_ENV || 'development',
      release: process.env.NEXT_PUBLIC_APP_VERSION || 'dev',
    });
  }
}

export const onRequestError = Sentry.captureRequestError;
