// @ts-nocheck
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Card } from "../../components/ui/Card";
import React from "react";

describe("Card", () => {
  it("renders children correctly", () => {
    render(<Card>Card Content</Card>);
    expect(screen.getByText("Card Content")).toBeInTheDocument();
  });

  it("renders header, title and body", () => {
    render(
      <Card>
        <Card.Header>
          <Card.HeaderTitle>Header Title</Card.HeaderTitle>
        </Card.Header>
        <Card.Body>Body Content</Card.Body>
      </Card>,
    );
    expect(screen.getByText("Header Title")).toBeInTheDocument();
    expect(screen.getByText("Body Content")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(<Card className="custom-card" />);
    expect(container.firstChild).toHaveClass("custom-card");
  });
});
