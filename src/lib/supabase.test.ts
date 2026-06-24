import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@capacitor/core", () => ({
  Capacitor: {
    isNativePlatform: () => false,
  },
}));

describe("sendMagicLink", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it("does not call the placeholder Supabase project when auth env vars are missing", async () => {
    vi.resetModules();
    vi.stubEnv("VITE_SUPABASE_URL", "");
    vi.stubEnv("VITE_SUPABASE_ANON_KEY", "");
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    const { sendMagicLink } = await import("./supabase");
    const result = await sendMagicLink("smoker@example.com");

    expect(result.error?.message).toBe("Account sync is not configured for this build.");
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
