import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import * as speech from "../../speech/say";
import { AgeProvider } from "./AgeContext";
import { AgePicker } from "./AgePicker";
import { BuildBadge, badgeText } from "./BuildBadge";
import { KidButton } from "./KidButton";
import { ProjectCard } from "./ProjectCard";
import { StepDots } from "./StepDots";
import { ThemeFilter } from "./ThemeFilter";
import { TurnControls } from "./TurnControls";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("kid components", () => {
  it("KidButton is as big as its age says, and speaks its label when asked", () => {
    const say = vi.spyOn(speech, "say").mockImplementation(() => {});
    const press = vi.fn();
    render(
      <AgeProvider age="b">
        <KidButton label="Next" speak onPress={press} />
        <KidButton label="Go" primary onPress={press} />
      </AgeProvider>,
    );
    const next = screen.getByRole("button", { name: "Next" });
    expect(next.style.minWidth).toBe("var(--target-kid-b)");
    expect(screen.getByRole("button", { name: "Go" }).style.minHeight).toBe("112px");
    fireEvent.click(next);
    expect(press).toHaveBeenCalledOnce();
    expect(say).toHaveBeenCalledWith("Next");
  });

  it("AgePicker marks the chosen age and says the one tapped", () => {
    const say = vi.spyOn(speech, "say").mockImplementation(() => {});
    const change = vi.fn();
    render(<AgePicker value="a" onChange={change} />);
    expect(screen.getByRole("button", { name: "3 to 5" }).getAttribute("aria-pressed")).toBe("true");
    fireEvent.click(screen.getByRole("button", { name: "9 to 10" }));
    expect(change).toHaveBeenCalledWith("c");
    expect(say).toHaveBeenCalledWith("9 to 10");
  });

  it("ThemeFilter has All and the nine themes, Monster trucks the ninth", () => {
    vi.spyOn(speech, "say").mockImplementation(() => {});
    const change = vi.fn();
    render(<ThemeFilter value={null} onChange={change} />);
    expect(screen.getAllByRole("button")).toHaveLength(10);
    expect(screen.getByRole("button", { name: "Monster trucks" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Castles" }));
    expect(change).toHaveBeenCalledWith("castles");
  });

  it("BuildBadge says what it shows", () => {
    expect(badgeText("can")).toBe("You can build it!");
    expect(badgeText("need", [{ shape: "square", count: 2 }, { shape: "tri-right", count: 1 }])).toBe("Need 3 more");
    render(<BuildBadge state="need" missing={[{ shape: "square", count: 2 }]} />);
    expect(screen.getByRole("img", { name: "2 squares" })).toBeTruthy();
  });

  it("ProjectCard is one button named with its title, stars and badge", () => {
    const press = vi.fn();
    render(<ProjectCard title="The castle" picture={null} stars={3} state="can" onPress={press} />);
    fireEvent.click(screen.getByRole("button", { name: "The castle, 3 stars, You can build it!" }));
    expect(press).toHaveBeenCalledOnce();
  });

  it("StepDots counts steps and jumps when allowed", () => {
    const jump = vi.fn();
    render(<StepDots count={5} current={1} onJump={jump} />);
    expect(screen.getByRole("list", { name: "Step 2 of 5" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Step 4 of 5" }));
    expect(jump).toHaveBeenCalledWith(3);
  });

  it("TurnControls turn both ways and reset", () => {
    const turn = vi.fn();
    const reset = vi.fn();
    render(<TurnControls onTurn={turn} onReset={reset} />);
    fireEvent.click(screen.getByRole("button", { name: "Turn left" }));
    fireEvent.click(screen.getByRole("button", { name: "Turn right" }));
    fireEvent.click(screen.getByRole("button", { name: "Back to my side" }));
    expect(turn.mock.calls).toEqual([[-1], [1]]);
    expect(reset).toHaveBeenCalledOnce();
  });
});
