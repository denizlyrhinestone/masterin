# Analytics Configuration

This document explains how to configure and use analytics in the Masterin application.

## Environment Variable

Analytics are controlled via the `NEXT_PUBLIC_ENABLE_ANALYTICS` environment variable:

- When set to `true`, analytics tracking is enabled
- When set to `false` or not set, analytics tracking is disabled

## Setting Up Analytics

### Local Development

Add the following to your `.env.local` file:

\`\`\`
NEXT_PUBLIC_ENABLE_ANALYTICS=true
\`\`\`

### Production Environment

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add `NEXT_PUBLIC_ENABLE_ANALYTICS` with value `true`
4. Deploy your application

## Google Analytics Configuration

The application uses Google Analytics 4 (GA4) for tracking. To configure your GA4 account:

1. Create a Google Analytics 4 property in the Google Analytics console
2. Get your Measurement ID (starts with "G-")
3. Update the `GA_MEASUREMENT_ID` constant in `lib/analytics.ts`

## Tracking Events

### Automatic Tracking

The following events are tracked automatically:

- Page views (when navigating between pages)
- Initial app load

### Custom Event Tracking

You can track custom events using the `trackEvent` function:

\`\`\`typescript
import { trackEvent } from '@/lib/analytics';

// Track a simple event
trackEvent('button_click');

// Track an event with parameters
trackEvent('form_submit', {
  form_name: 'contact',
  form_length: 5
});
\`\`\`

### Using the AnalyticsEvent Component

For React components, you can use the `AnalyticsEvent` component:

\`\`\`tsx
import { AnalyticsEvent } from '@/components/analytics-event';

// Track on click
<AnalyticsEvent eventName="signup_button_click">
  <button>Sign Up</button>
</AnalyticsEvent>

// Track on mount
<AnalyticsEvent 
  eventName="page_view" 
  eventParams={{ page_name: 'dashboard' }}
  fireOnMount={true}
/>
\`\`\`

## Verifying Analytics

To verify that analytics are working correctly:

1. Visit the `/admin/analytics` page in your application
2. Check the status indicators
3. Use the "Test Analytics Event" button
4. Verify events in your Google Analytics dashboard

## Disabling Analytics

To disable analytics:

1. Set `NEXT_PUBLIC_ENABLE_ANALYTICS` to `false`
2. Or remove the environment variable entirely

## Privacy Considerations

When using analytics, ensure your application:

1. Has a privacy policy explaining data collection
2. Complies with relevant privacy regulations (GDPR, CCPA, etc.)
3. Provides users with information about data collection
