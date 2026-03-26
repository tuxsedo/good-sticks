import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Home from "./Home";

const mockUseAuth = vi.fn();
const mockUseIsMobile = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock("@/hooks/use-mobile", () => ({
  useIsMobile: () => mockUseIsMobile(),
}));

describe("Home", () => {
  beforeEach(() => {
    localStorage.clear();
    mockUseAuth.mockReset();
    mockUseAuth.mockReturnValue({ user: null });
    mockUseIsMobile.mockReset();
    mockUseIsMobile.mockReturnValue(false);
  });

  it("shows guest copy when there is no auth session or palate", () => {
    render(<Home />);

    expect(screen.getByRole("heading", { name: "Explore cigars" })).toBeInTheDocument();
    expect(
      screen.getByText("Browse by strength, flavor, or ask Ember for a recommendation.")
    ).toBeInTheDocument();
  });

  it("shows local palate copy for signed-out users with a saved palate", () => {
    localStorage.setItem(
      "gs_palate",
      JSON.stringify({
        strength: "medium",
        loveFlavors: ["cedar", "coffee", "earth"],
        dislikeFlavors: [],
      })
    );

    render(<Home />);

    expect(screen.getByRole("heading", { name: "Your palate picks" })).toBeInTheDocument();
    expect(screen.getByText(/Based on your saved local palate/i)).toBeInTheDocument();
  });

  it("shows returning-user copy when authenticated", () => {
    mockUseAuth.mockReturnValue({
      user: { id: "user-1", email: "smoker@example.com" },
    });

    render(<Home />);

    expect(screen.getByRole("heading", { name: "Welcome back" })).toBeInTheDocument();
  });

  it("collapses the recommendation list on mobile until expanded", () => {
    mockUseIsMobile.mockReturnValue(true);

    render(<Home />);

    expect(screen.getByRole("button", { name: /see all 21 cigars/i })).toBeInTheDocument();
    expect(screen.getByText("Continue with Ember")).toBeInTheDocument();
  });
});
