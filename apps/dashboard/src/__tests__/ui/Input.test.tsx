// @ts-nocheck
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Input } from "../../components/ui/Input";
import React from "react";

describe("Input", () => {
  it("renders correctly with label", () => {
    render(<Input label="Email" placeholder="Enter email" />);
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter email")).toBeInTheDocument();
  });

  it("handles value change", () => {
    const handleChange = vi.fn();
    render(<Input label="Name" onChange={handleChange} />);
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "John Doe" } });
    expect(handleChange).toHaveBeenCalled();
  });

  it("shows error message when error prop is provided", () => {
    render(<Input label="Password" error="Password is required" />);
    expect(screen.getByText("Password is required")).toBeInTheDocument();
  });

  it("applies error styles when error prop is provided", () => {
    render(<Input label="Email" error="Invalid email" />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveClass("border-red-500");
  });

  it("renders with an icon", () => {
    const icon = <span data-testid="search-icon">🔍</span>;
    render(<Input icon={icon} />);
    expect(screen.getByTestId("search-icon")).toBeInTheDocument();
  });
});
