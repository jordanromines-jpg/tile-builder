import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { castle } from "../projects/castle";
import { ProjectPicture } from "./ProjectPicture";
import { TileChip } from "./TileChip";
import { TileConfetti } from "./kid/TileConfetti";

afterEach(cleanup);

describe("pictures", () => {
  it("show the saved 3D picture, and the drawing if it fails to load", () => {
    const { container } = render(<TileChip shape="square" colour="red" count={4} />);
    const img = container.querySelector("img")!;
    expect(img.getAttribute("src")).toBe("/tile-builder/pictures/tiles/square-red.webp");
    expect(screen.getByRole("img", { name: "4 red squares" })).toBeTruthy();
    fireEvent.error(img);
    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector("svg")).not.toBeNull();
  });

  it("draw 'any colour' tiles and part-built projects flat", () => {
    const { container } = render(
      <>
        <TileChip shape="square" />
        <ProjectPicture project={castle} shown={3} />
      </>,
    );
    expect(container.querySelector("img")).toBeNull();
  });

  it("show a finished project's picture", () => {
    render(<ProjectPicture project={castle} label="The castle" />);
    expect(screen.getByRole("img", { name: "The castle" }).getAttribute("src")).toBe("/tile-builder/pictures/projects/castle.webp");
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
