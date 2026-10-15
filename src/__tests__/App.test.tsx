import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import App from "../App";

describe("ACBJ Survey Navigator foundation", () => {
  it("shows welcome actions and starts the survey shell", async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(
      screen.getByRole("heading", { name: /your business story/i }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /start survey/i }));

    expect(
      screen.getByRole("heading", { name: /first, your company/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("Progress saved")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Complete a few questions to begin building your estimate.",
      ),
    ).toBeInTheDocument();
  });

  it("navigates between sections with previous and continue", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: /start survey/i }));

    expect(screen.getByRole("button", { name: /previous/i })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: /continue/i }));
    expect(
      screen.getByRole("heading", { name: /a little about your business/i }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /previous/i }));
    expect(
      screen.getByRole("heading", { name: /first, your company/i }),
    ).toBeInTheDocument();
  });

  it("provides a working resume action from the welcome screen", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /resume survey/i }));
    expect(
      screen.getByRole("heading", { name: /first, your company/i }),
    ).toBeInTheDocument();
  });
});
