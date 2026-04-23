// @ts-nocheck
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { LoadingSpinner } from "./components/ui/Loader";
import React from "react";

describe("LoadingSpinner", () => {
  it("renders correctly", () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByRole("status", { hidden: true }); // It doesn't have a role, but we can check if it exists
    expect(spinner).toBeDefined();
  });

  it("applies custom className", () => {
    const { container } = render(<LoadingSpinner className="custom-class" />);
    expect(container.firstChild).toHaveClass("custom-class");
  });
});
