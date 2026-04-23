// @ts-nocheck
import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthProvider, useAuth } from "../../config/AuthContext";

// Mock authService
vi.mock("../../services", () => ({
  authService: {
    logout: vi.fn().mockResolvedValue({}),
  },
}));

// Test component to consume the hook
const TestComponent = () => {
  const { user, login, logout, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return (
    <div>
      <div data-testid="user-email">{user?.email}</div>
      <button
        onClick={() =>
          login({
            accessToken: "token",
            refreshToken: "refresh",
            userId: 1,
            email: "test@example.com",
          })
        }
      >
        Login
      </button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe("AuthContext", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("provides initial state from localStorage", () => {
    localStorage.setItem("accessToken", "valid-token");
    // We would need to mock decodeToken too if we want to test initial load fully
    // For now, let's just check if it renders
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );
    expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
  });

  it("handles login", async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    act(() => {
      screen.getByText("Login").click();
    });

    expect(screen.getByTestId("user-email")).toHaveTextContent("test@example.com");
    expect(localStorage.getItem("accessToken")).toBe("token");
  });

  it("handles logout", async () => {
    localStorage.setItem("accessToken", "token");
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    await act(async () => {
      screen.getByText("Logout").click();
    });

    expect(screen.getByTestId("user-email")).toHaveTextContent("");
    expect(localStorage.getItem("accessToken")).toBeNull();
  });

  it("throws error when used outside AuthProvider", () => {
    // Suppress console error for this test
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => render(<TestComponent />)).toThrow("useAuth must be used within an AuthProvider");

    consoleSpy.mockRestore();
  });
});
