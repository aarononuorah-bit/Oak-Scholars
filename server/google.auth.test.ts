import { describe, it, expect } from "vitest";

describe("Google OAuth secrets", () => {
  it("GOOGLE_CLIENT_ID is set and has correct format", () => {
    const id = process.env.GOOGLE_CLIENT_ID;
    expect(id).toBeTruthy();
    expect(id).toMatch(/\.apps\.googleusercontent\.com$/);
  });

  it("GOOGLE_CLIENT_SECRET is set and has correct format", () => {
    const secret = process.env.GOOGLE_CLIENT_SECRET;
    expect(secret).toBeTruthy();
    expect(secret!.length).toBeGreaterThan(10);
  });

  it("Google OAuth redirect URL can be constructed", () => {
    const id = process.env.GOOGLE_CLIENT_ID;
    const secret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = "https://oakscholars.com/api/auth/google/callback";
    // Just verify we can construct the auth URL without errors
    const params = new URLSearchParams({
      client_id: id!,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "openid email profile",
    });
    const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    expect(url).toContain("accounts.google.com");
    expect(url).toContain(encodeURIComponent(redirectUri));
    expect(secret).toBeTruthy();
  });
});
