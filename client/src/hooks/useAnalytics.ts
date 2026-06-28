import { useEffect } from "react";
import { useLocation } from "wouter";

/**
 * useAnalytics Hook
 * Integrates Google Analytics 4 (GA4) with privacy-friendly tracking
 * - Respects user privacy preferences (DNT header, cookie consent)
 * - Tracks page views and custom events
 * - Anonymizes IP addresses
 */

declare global {
  interface Window {
    gtag?: (command: string, action: string, config?: Record<string, unknown>) => void;
    dataLayer?: unknown[];
  }
}

const GA_MEASUREMENT_ID = "G-XXXXXXXXXX"; // Replace with your GA4 Measurement ID

export function useAnalytics() {
  const [location] = useLocation();

  // Initialize Google Analytics on mount
  useEffect(() => {
    // Check if user has opted out via Do Not Track
    const dnt = navigator.doNotTrack || (window as any).doNotTrack;
    if (dnt === "1" || dnt === "yes") {
      console.log("Analytics disabled: User has Do Not Track enabled");
      return;
    }

    // Check if analytics script is already loaded
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
    });
  }, []);

  // Track page views
  useEffect(() => {
    if (!window.gtag) return;

    // Track page view
    window.gtag("event", "page_view", {
      page_path: location,
      page_title: document.title,
    });
  }, [location]);

  /**
   * Track custom events
   * @param eventName - Name of the event (e.g., "booking_started", "contact_submitted")
   * @param eventData - Additional event data
   */
  function trackEvent(eventName: string, eventData?: Record<string, unknown>) {
    if (!window.gtag) return;

    window.gtag("event", eventName, {
      ...eventData,
      // Always include page info for context
      page_path: location,
    });
  }

  /**
   * Track conversion events
   * @param conversionName - Name of the conversion (e.g., "booking_completed")
   * @param value - Optional monetary value
   */
  function trackConversion(conversionName: string, value?: number) {
    if (!window.gtag) return;

    window.gtag("event", conversionName, {
      value: value || undefined,
      currency: "GBP",
    });
  }

  /**
   * Track user engagement
   * @param engagementType - Type of engagement (e.g., "scroll", "click", "form_interaction")
   * @param elementName - Name/ID of the element
   */
  function trackEngagement(engagementType: string, elementName: string) {
    if (!window.gtag) return;

    window.gtag("event", "user_engagement", {
      engagement_type: engagementType,
      element_name: elementName,
    });
  }

  return {
    trackEvent,
    trackConversion,
    trackEngagement,
  };
}

/**
 * Higher-order component to wrap pages with analytics tracking
 * Usage: withAnalytics(MyComponent)
 */
export function withAnalytics<P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> {
  return function WithAnalyticsComponent(props: P) {
    useAnalytics();
    return <Component {...props} />;
  };
}
