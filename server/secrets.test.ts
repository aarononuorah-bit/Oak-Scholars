import { describe, it, expect } from "vitest";

describe("Email & VAPID secrets", () => {
  it("SMTP_HOST is set", () => {
    expect(process.env.SMTP_HOST).toBeTruthy();
  });

  it("SMTP_PORT is a valid port number", () => {
    const port = Number(process.env.SMTP_PORT);
    expect(port).toBeGreaterThan(0);
    expect(port).toBeLessThan(65536);
  });

  it("SMTP_USER is a valid email", () => {
    expect(process.env.SMTP_USER).toMatch(/@/);
  });

  it("SMTP_PASS is set", () => {
    expect(process.env.SMTP_PASS).toBeTruthy();
  });

  it("ADMIN_EMAIL is a valid email", () => {
    expect(process.env.ADMIN_EMAIL).toMatch(/@/);
  });

  it("VAPID_PUBLIC_KEY is set and looks like a base64url string", () => {
    const key = process.env.VAPID_PUBLIC_KEY ?? "";
    expect(key.length).toBeGreaterThan(20);
    // base64url characters only
    expect(key).toMatch(/^[A-Za-z0-9_\-]+$/);
  });

  it("VAPID_PRIVATE_KEY is set and looks like a base64url string", () => {
    const key = process.env.VAPID_PRIVATE_KEY ?? "";
    expect(key.length).toBeGreaterThan(20);
    expect(key).toMatch(/^[A-Za-z0-9_\-]+$/);
  });

  it("VAPID_SUBJECT is a valid mailto: or https: URI", () => {
    const subject = process.env.VAPID_SUBJECT ?? "";
    expect(subject).toMatch(/^(mailto:|https:\/\/)/);
  });
});
