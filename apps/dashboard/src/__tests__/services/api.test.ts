// @ts-nocheck
import { describe, it, expect, vi, beforeEach } from "vitest";
import api, { authService } from "../../services/index";

// Mock axios
vi.mock("axios", async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    default: {
      create: vi.fn().mockReturnThis(),
      interceptors: {
        request: { use: vi.fn(), eject: vi.fn() },
        response: { use: vi.fn(), eject: vi.fn() },
      },
      post: vi.fn(),
      get: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    },
  };
});

describe("API Service & AuthService", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("authService.login calls correct endpoint", async () => {
    const mockData = { email: "test@example.com", password: "password" };
    const spy = vi.spyOn(api, "post").mockResolvedValue({ data: {} });

    await authService.login(mockData);

    expect(spy).toHaveBeenCalledWith(expect.stringContaining("/login"), mockData);
  });

  it("authService.logout calls correct endpoint", async () => {
    const spy = vi.spyOn(api, "post").mockResolvedValue({ data: {} });

    await authService.logout();

    expect(spy).toHaveBeenCalledWith(expect.stringContaining("/logout"));
  });

  // Note: Testing interceptors directly on the exported instance can be tricky
  // because they are registered at module load.
  // A better way is to test the functionality that triggers them.
});
