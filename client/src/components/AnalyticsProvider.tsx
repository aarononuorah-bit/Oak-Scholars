import { useEffect } from "react";
import { useLocation } from "wouter";

/**
 * AnalyticsProvider Component
 * Initializes and manages Google Analytics 4 tracking
 * Respects user privacy preferences and cookie consent
 */

declare global {
  interface Window {
    gtag?: (command: string, action: string, config?: Record<string, unknown>) => void;
    dataLayer?: unknown[];
  }
}

const GA_MEASUREMENT_ID = process.env.REACT_APP_GA_MEASUREMENT_ID || "G-XXXXXXXXXX";

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  useEffect(() => {
    // Initialize analytics on component mount
    initializeAnalytics();
  }, []);

  useEffect(() => {
    // Track page views when location changes
    trackPageView();
  }, [location]);

  return <>{children}</>;
}

function initializeAnalytics() {
  // Check if user has opted out via Do Not Track
  const dnt = navigator.doNotTrack || (window as any).doNotTrack;
  if (dnt === "1" || dnt === "yes") {
    console.log("Analytics disabled: User has Do Not Track enabled");
    return;
  }

  // Check if analytics is already initialized
  if (window.gtag) {
    return;
  }

  // Load Google Analytics script
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  // Initialize gtag
  window.dataLayer = window.dataLayer || [];

  function gtag(...args: unknown[]) {
    (window.dataLayer as unknown[]).push(arguments);
  }

  window.gtag = gtag;
  gtag("js", new Date());

  // Configure GA4 with privacy-friendly settings
  gtag("config", GA_MEASUREMENT_ID, {
    // Anonymize IP addresses
    anonymize_ip: true,
    // Disable advertising features
    allow_google_signals: false,
    // Disable remarketing
    allow_ad_personalization_signals: false,
    // Cookie settings
    cookie_flags: "SameSite=None;Secure",
    // Respect user consent
    restricted_data_processing: true,
    // Disable all advertising cookies
    ads_data_redaction: true,
  });
}

function trackPageView() {
  if (!window.gtag) return;

  // Track page view with current location
  window.gtag("event", "page_view", {
    page_path: window.location.pathname,
    page_title: document.title,
    page_location: window.location.href,
  });
}

/**
 * Track custom events
 * Usage: trackAnalyticsEvent("booking_started", { subject: "Mathematics" })
 */
export function trackAnalyticsEvent(
  eventName: string,
  eventData?: Record<string, unknown>
) {
  if (!window.gtag) return;

  window.gtag("event", eventName, {
    ...eventData,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track conversion events
 * Usage: trackAnalyticsConversion("booking_completed", 150)
 */
export function trackAnalyticsConversion(conversionName: string, value?: number) {
  if (!window.gtag) return;

  window.gtag("event", conversionName, {
    value: value || undefined,
    currency: "GBP",
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track user engagement
 * Usage: trackAnalyticsEngagement("button_click", "book_session_btn")
 */
export function trackAnalyticsEngagement(engagementType: string, elementName: string) {
  if (!window.gtag) return;

  window.gtag("event", "user_engagement", {
    engagement_type: engagementType,
    element_name: elementName,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track form submission
 * Usage: trackAnalyticsFormSubmission("contact_form", { subject: "General Inquiry" })
 */
export function trackAnalyticsFormSubmission(
  formName: string,
  formData?: Record<string, unknown>
) {
  if (!window.gtag) return;

  window.gtag("event", "form_submission", {
    form_name: formName,
    ...formData,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track search
 * Usage: trackAnalyticsSearch("blog articles", 5)
 */
export function trackAnalyticsSearch(searchTerm: string, resultsCount?: number) {
  if (!window.gtag) return;

  window.gtag("event", "search", {
    search_term: searchTerm,
    results_count: resultsCount || undefined,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track video/media engagement
 * Usage: trackAnalyticsMediaEngagement("video_play", "hero_video")
 */
export function trackAnalyticsMediaEngagement(
  mediaAction: string,
  mediaName: string,
  duration?: number
) {
  if (!window.gtag) return;

  window.gtag("event", "media_engagement", {
    media_action: mediaAction,
    media_name: mediaName,
    duration: duration || undefined,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track scroll depth
 * Usage: trackAnalyticsScrollDepth(75)
 */
export function trackAnalyticsScrollDepth(percentage: number) {
  if (!window.gtag) return;

  window.gtag("event", "scroll_depth", {
    scroll_depth_percentage: percentage,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track time on page
 * Usage: trackAnalyticsTimeOnPage(120) for 2 minutes
 */
export function trackAnalyticsTimeOnPage(seconds: number) {
  if (!window.gtag) return;

  window.gtag("event", "time_on_page", {
    time_seconds: seconds,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track error events
 * Usage: trackAnalyticsError("booking_error", "Payment failed")
 */
export function trackAnalyticsError(errorType: string, errorMessage?: string) {
  if (!window.gtag) return;

  window.gtag("event", "error", {
    error_type: errorType,
    error_message: errorMessage || undefined,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Set user properties
 * Usage: setAnalyticsUserProperties({ user_type: "student", level: "GCSE" })
 */
export function setAnalyticsUserProperties(properties: Record<string, unknown>) {
  if (!window.gtag) return;

  window.gtag("set", "user_properties", properties);
}
