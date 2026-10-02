import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { castle } from "../projects/castle";
import { ProjectPicture } from "./ProjectPicture";
import { TileChip } from "./TileChip";
import { TileConfetti } from "./kid/TileConfetti";

describe("3D pictures", () => {
  it("keep the drawing where the browser cannot draw 3D (as here)", () => {
    const { container } = render(
      <>
        <TileChip shape="square" colour="red" count={4} />
        <ProjectPicture project={castle} label="The castle" />
      </>,
    );
    expect(screen.getByRole("img", { name: "4 red squares" })).toBeTruthy();
    expect(container.querySelectorAll("svg").length).toBeGreaterThanOrEqual(2);
    expect(container.querySelector("[data-snapshot]")).toBeNull();
  });
});

describe("the end's celebration", () => {
  it("is skipped by a tap", () => {
    const done = vi.fn();
    render(<TileConfetti onDone={done} />);
    screen.getByRole("button", { name: "Well done" }).click();
    expect(done).toHaveBeenCalledOnce();
  });
});
