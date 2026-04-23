// @ts-nocheck
import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Toast from "../../components/ui/Toast";
import React from "react";

describe("Toast", () => {
  const mockOnClose = vi.fn();
  const defaultProps = {
    id: "1",
    message: "Test Message",
    onClose: mockOnClose,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  it("renders message correctly", () => {
    render(<Toast {...defaultProps} />);
    expect(screen.getByText("Test Message")).toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", () => {
    render(<Toast {...defaultProps} />);
    const closeButton = screen.getByRole("button");
    fireEvent.click(closeButton);
    expect(mockOnClose).toHaveBeenCalledWith("1");
  });

  it("calls onClose automatically after 5 seconds for non-loading types", () => {
    render(<Toast {...defaultProps} type="success" />);

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(mockOnClose).toHaveBeenCalledWith("1");
  });

  it("does not call onClose automatically for loading type", () => {
    render(<Toast {...defaultProps} type="loading" />);

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it("renders different icons based on type", () => {
    const { rerender, container } = render(<Toast {...defaultProps} type="success" />);
    // Check for specific icon class or SVG
    expect(container.querySelector(".text-emerald-400")).toBeInTheDocument();

    rerender(<Toast {...defaultProps} type="error" />);
    expect(container.querySelector(".text-rose-400")).toBeInTheDocument();
  });
});
