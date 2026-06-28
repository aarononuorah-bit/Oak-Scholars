# Google Analytics 4 Integration Guide

**Oak Scholars Website Analytics Setup**

---

## Overview

This document describes the privacy-friendly Google Analytics 4 (GA4) integration for the Oak Scholars website. The implementation respects user privacy, complies with GDPR/CCPA, and provides valuable insights into user behaviour and conversion tracking.

---

## Setup Instructions

### 1. Create a Google Analytics 4 Property

1. Go to [Google Analytics](https://analytics.google.com)
2. Click **Create** → **Property**
3. Set up a new property for Oak Scholars
4. Choose **Web** as the platform
5. Enter website details:
   - **Website URL**: https://oakscholars.com
   - **Industry category**: Education
   - **Reporting timezone**: Europe/London
   - **Currency**: GBP

### 2. Get Your Measurement ID

1. In GA4, go to **Admin** → **Data Streams**
2. Select your web stream
3. Copy the **Measurement ID** (format: `G-XXXXXXXXXX`)

### 3. Configure Environment Variables

Add your Measurement ID to your `.env` file:

```env
REACT_APP_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

Or update the hardcoded value in `client/src/components/AnalyticsProvider.tsx`:

```typescript
const GA_MEASUREMENT_ID = "G-XXXXXXXXXX"; // Replace with your ID
```

### 4. Privacy Configuration

The integration is configured with privacy-first settings:

```typescript
gtag("config", GA_MEASUREMENT_ID, {
  anonymize_ip: true,                    // Anonymize user IP addresses
  allow_google_signals: false,           // Disable advertising features
  allow_ad_personalization_signals: false, // Disable remarketing
  restricted_data_processing: true,      // Respect user consent
  ads_data_redaction: true,             // Redact advertising data
});
```

---

## Features

### Automatic Tracking

The `AnalyticsProvider` component automatically tracks:

- **Page Views**: Every page navigation is tracked with path, title, and URL
- **Do Not Track**: Respects user's DNT browser setting
- **IP Anonymization**: All IP addresses are anonymized
- **Consent Management**: Integrates with cookie consent banner

### Custom Event Tracking

The following functions are available for tracking specific user actions:

#### 1. Track Custom Events
```typescript
import { trackAnalyticsEvent } from "@/components/AnalyticsProvider";

trackAnalyticsEvent("booking_started", {
  subject: "Mathematics",
  level: "GCSE",
  package: "8-session",
});
```

#### 2. Track Conversions
```typescript
import { trackAnalyticsConversion } from "@/components/AnalyticsProvider";

trackAnalyticsConversion("booking_completed", 150); // £150 value
```

#### 3. Track Form Submissions
```typescript
import { trackAnalyticsFormSubmission } from "@/components/AnalyticsProvider";

trackAnalyticsFormSubmission("contact_form", {
  inquiry_type: "general",
  student_level: "A-Level",
});
```

#### 4. Track User Engagement
```typescript
import { trackAnalyticsEngagement } from "@/components/AnalyticsProvider";

trackAnalyticsEngagement("button_click", "book_session_btn");
```

#### 5. Track Search
```typescript
import { trackAnalyticsSearch } from "@/components/AnalyticsProvider";

trackAnalyticsSearch("exam tips", 5); // 5 results found
```

#### 6. Track Media Engagement
```typescript
import { trackAnalyticsMediaEngagement } from "@/components/AnalyticsProvider";

trackAnalyticsMediaEngagement("video_play", "hero_video", 120);
```

#### 7. Track Scroll Depth
```typescript
import { trackAnalyticsScrollDepth } from "@/components/AnalyticsProvider";

trackAnalyticsScrollDepth(75); // User scrolled 75% down the page
```

#### 8. Track Time on Page
```typescript
import { trackAnalyticsTimeOnPage } from "@/components/AnalyticsProvider";

trackAnalyticsTimeOnPage(120); // User spent 2 minutes on page
```

#### 9. Track Errors
```typescript
import { trackAnalyticsError } from "@/components/AnalyticsProvider";

trackAnalyticsError("payment_failed", "Stripe declined card");
```

#### 10. Set User Properties
```typescript
import { setAnalyticsUserProperties } from "@/components/AnalyticsProvider";

setAnalyticsUserProperties({
  user_type: "student",
  education_level: "GCSE",
  subscription_status: "active",
});
```

---

## Implementation Examples

### Example 1: Track Booking Flow

In `client/src/pages/Booking.tsx`:

```typescript
import { trackAnalyticsEvent, trackAnalyticsConversion } from "@/components/AnalyticsProvider";

function Booking() {
  const handleStep1Complete = (subject: string) => {
    trackAnalyticsEvent("booking_step1_complete", { subject });
  };

  const handleCheckout = (packageType: string, price: number) => {
    trackAnalyticsEvent("checkout_started", { package: packageType });
  };

  const handlePaymentSuccess = (amount: number) => {
    trackAnalyticsConversion("booking_completed", amount);
  };

  // ... rest of component
}
```

### Example 2: Track Form Submission

In `client/src/pages/Contact.tsx`:

```typescript
import { trackAnalyticsFormSubmission } from "@/components/AnalyticsProvider";

function Contact() {
  const handleSubmit = (formData: ContactFormData) => {
    trackAnalyticsFormSubmission("contact_form", {
      inquiry_type: formData.inquiryType,
      student_level: formData.level,
    });
    // Submit form...
  };

  // ... rest of component
}
```

### Example 3: Track Blog Engagement

In `client/src/pages/Blog.tsx`:

```typescript
import { trackAnalyticsSearch, trackAnalyticsEvent } from "@/components/AnalyticsProvider";

function Blog() {
  const handleSearch = (searchTerm: string, results: number) => {
    trackAnalyticsSearch(searchTerm, results);
  };

  const handleCategoryFilter = (category: string) => {
    trackAnalyticsEvent("blog_category_filter", { category });
  };

  // ... rest of component
}
```

---

## Key Metrics to Track

### Conversion Funnel
1. **Booking Started**: User enters booking flow
2. **Subject Selected**: User selects a subject
3. **Level Selected**: User selects education level
4. **Package Selected**: User selects a package
5. **Checkout Started**: User proceeds to payment
6. **Payment Completed**: User completes payment

### Engagement Metrics
- **Page Views**: Which pages are most visited
- **Time on Page**: How long users spend on each page
- **Scroll Depth**: How far users scroll on each page
- **Button Clicks**: Which CTAs are most clicked
- **Form Submissions**: Contact form and tutor application submissions

### User Segments
- **Student vs. Parent**: Track different user types
- **Education Level**: GCSE, A-Level, IB, etc.
- **Subject Interest**: Which subjects are most popular
- **Geographic Location**: Where users are accessing from

---

## Privacy & Compliance

### GDPR Compliance
- ✅ IP addresses are anonymized
- ✅ No personal data is collected without consent
- ✅ Users can opt-out via Do Not Track
- ✅ Cookie consent is required before tracking

### CCPA Compliance
- ✅ Users can opt-out of analytics
- ✅ No data is sold to third parties
- ✅ Clear privacy policy explains data usage
- ✅ Users can request data deletion

### Best Practices
1. **Cookie Consent**: Only track after user accepts cookies
2. **Privacy Policy**: Update privacy policy to mention GA4
3. **Data Retention**: Set GA4 to delete data after 14 months
4. **No Sensitive Data**: Never track passwords, payment info, or SSNs

---

## GA4 Dashboard Setup

### Recommended Reports

1. **Acquisition Report**
   - Shows where users come from (organic, direct, referral)
   - Helps identify marketing channel effectiveness

2. **Engagement Report**
   - Shows which pages are most visited
   - Tracks average session duration and bounce rate

3. **Conversion Report**
   - Tracks booking completions
   - Shows conversion rate by traffic source

4. **User Report**
   - Shows user demographics and interests
   - Helps understand audience composition

### Custom Events to Monitor

In GA4 Admin, create custom events for:
- `booking_started`
- `booking_completed`
- `contact_form_submitted`
- `tutor_application_submitted`
- `blog_article_viewed`
- `search_performed`

---

## Troubleshooting

### Analytics Not Tracking

1. **Check Measurement ID**: Verify the ID is correct in `.env`
2. **Check DNT Setting**: Disable Do Not Track in browser settings
3. **Check Console**: Look for errors in browser console
4. **Check GA4**: Wait 24-48 hours for data to appear in GA4

### Data Not Appearing in GA4

1. Go to **Real-time** report in GA4
2. Trigger an event on your website
3. Check if it appears in real-time
4. If not, check browser console for errors

### Privacy Concerns

1. **Disable Analytics**: Comment out `<AnalyticsProvider>` in App.tsx
2. **Clear GA4 Data**: Go to GA4 Admin → Data Retention → Delete data
3. **Update Privacy Policy**: Clearly state what data is collected

---

## Maintenance

### Monthly Tasks
- [ ] Review conversion funnel in GA4
- [ ] Check for any tracking errors
- [ ] Analyze top-performing pages
- [ ] Review user acquisition sources

### Quarterly Tasks
- [ ] Update analytics strategy based on insights
- [ ] Add new custom events if needed
- [ ] Review privacy compliance
- [ ] Optimize underperforming pages

### Annual Tasks
- [ ] Conduct full analytics audit
- [ ] Update privacy policy if needed
- [ ] Review GA4 configuration
- [ ] Plan analytics improvements

---

## Additional Resources

- [Google Analytics 4 Documentation](https://support.google.com/analytics/answer/10089681)
- [GA4 Event Tracking Guide](https://support.google.com/analytics/answer/9234069)
- [Privacy & Data Protection](https://support.google.com/analytics/answer/9019185)
- [GA4 Conversion Tracking](https://support.google.com/analytics/answer/9267568)

---

## Support

For questions or issues with analytics setup:
1. Check this documentation
2. Review GA4 official documentation
3. Contact the development team
4. Email: team@oakscholars.com

---

**Last Updated**: June 28, 2026  
**Status**: ✅ Ready for Production
