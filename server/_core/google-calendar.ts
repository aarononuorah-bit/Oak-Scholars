import axios from "axios";
import { ENV } from "./env";

export interface CalendarEvent {
  summary: string;
  description: string;
  start: {
    dateTime: string;
    timeZone?: string;
  };
  end: {
    dateTime: string;
    timeZone?: string;
  };
}

async function getAccessToken() {
  if (!ENV.googleClientId || !ENV.googleClientSecret || !ENV.googleRefreshToken) {
    console.warn("Google Calendar credentials not configured");
    return null;
  }

  try {
    const response = await axios.post("https://oauth2.googleapis.com/token", {
      client_id: ENV.googleClientId,
      client_secret: ENV.googleClientSecret,
      refresh_token: ENV.googleRefreshToken,
      grant_type: "refresh_token",
    });
    return response.data.access_token;
  } catch (error) {
    console.error("Failed to refresh Google access token:", error);
    return null;
  }
}

export async function createCalendarEvent(event: CalendarEvent) {
  const token = await getAccessToken();
  if (!token) return null;

  try {
    const response = await axios.post(
      "https://www.googleapis.com/calendar/v3/calendars/primary/events",
      event,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Failed to create Google Calendar event:", error);
    return null;
  }
}
