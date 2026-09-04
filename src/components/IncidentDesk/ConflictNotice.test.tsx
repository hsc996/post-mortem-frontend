import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ConflictNotice } from "./ConflictNotice";

describe("ConflictNotice", () => {
  it("shows the real backend's version numbers, not placeholders", () => {
    render(<ConflictNotice expected={3} current={5} onReload={() => {}} reloading={false} />);
    expect(
      screen.getByText(/Expected version 3, but current version is 5/),
    ).toBeInTheDocument();
  });

  it("calls onReload when RELOAD LATEST is clicked", async () => {
    const onReload = vi.fn();
    const user = userEvent.setup();
    render(<ConflictNotice expected={1} current={2} onReload={onReload} reloading={false} />);

    await user.click(screen.getByRole("button", { name: /reload latest/i }));

    expect(onReload).toHaveBeenCalledTimes(1);
  });

  it("disables the reload button and relabels it while a reload is in flight", () => {
    render(<ConflictNotice expected={1} current={2} onReload={() => {}} reloading={true} />);
    const button = screen.getByRole("button", { name: /reloading/i });
    expect(button).toBeDisabled();
  });
});
