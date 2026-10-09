import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { COLOURS, SHAPE_IDS } from "../engine/catalog";
import * as speech from "../speech/say";
import { TileChip } from "./TileChip";

afterEach(cleanup);

describe("TileChip", () => {
  it("draws every shape in every colour, named for a screen reader", () => {
    for (const shape of SHAPE_IDS) {
      for (const colour of [...COLOURS, undefined]) {
        render(<TileChip shape={shape} colour={colour} />);
      }
    }
    expect(screen.getAllByRole("img")).toHaveLength(SHAPE_IDS.length * (COLOURS.length + 1));
    expect(screen.getAllByRole("img", { name: "red square" })).toHaveLength(1);
    expect(screen.getAllByRole("img", { name: "tall triangle" })).toHaveLength(1);
  });

  it("shows a count and says it in the name", () => {
    render(<TileChip shape="square" colour="red" count={4} />);
    expect(screen.getByRole("img", { name: "4 red squares" }).textContent).toBe("4");
  });

  it("says its name on tap when it speaks and the voice is on", () => {
    const spy = vi.spyOn(speech, "say").mockImplementation(() => {});
    act(() => speech.configureSpeech({ enabled: true }));
    render(<TileChip shape="tri-equilateral" colour="blue" count={2} speak />);
    fireEvent.click(screen.getByRole("button", { name: "2 blue triangles" }));
    expect(spy).toHaveBeenCalledWith("2 blue triangles");
    act(() => speech.configureSpeech({ enabled: false }));
  });

  it("is a picture, not a button, while the voice is off", () => {
    render(<TileChip shape="tri-equilateral" colour="blue" count={2} speak />);
    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.getByRole("img", { name: "2 blue triangles" })).toBeTruthy();
  });
});
