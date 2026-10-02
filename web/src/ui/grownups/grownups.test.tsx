import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ConfirmDialog } from "./Dialog";
import { Switch } from "./Field";
import { GateDialog } from "./GateDialog";
import { makeSum, numberWords, HOLD_MS } from "./gate";
import { REPEAT_AFTER, REPEAT_EVERY, Stepper } from "./Stepper";
import { storageWords } from "./StorageStatus";

afterEach(cleanup);

describe("the gate's words", () => {
  it("writes numbers the way a grown-up reads them", () => {
    expect(numberWords(42)).toBe("forty-two");
    expect(numberWords(7)).toBe("seven");
    expect(numberWords(30)).toBe("thirty");
    expect(numberWords(115)).toBe("one hundred and fifteen");
  });

  it("makes a two-digit plus a one-digit sum", () => {
    const s = makeSum(() => 0.3);
    expect(s.a).toBeGreaterThanOrEqual(21);
    expect(s.b).toBeLessThanOrEqual(9);
    expect(s.answer).toBe(s.a + s.b);
    expect(s.words).toBe(`${numberWords(s.a)} plus ${numberWords(s.b)}?`);
  });
});

describe("GateDialog", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  const hold = (ms: number) => {
    const lock = screen.getByRole("button", { name: "Hold to open" });
    fireEvent.pointerDown(lock);
    act(() => {
      vi.advanceTimersByTime(ms);
    });
    return lock;
  };

  const type = (n: number) => {
    for (const d of String(n)) fireEvent.click(screen.getByRole("button", { name: d }));
    fireEvent.click(screen.getByRole("button", { name: "OK" }));
  };

  it("starts again when let go early, and asks the sum after three seconds", () => {
    render(<GateDialog onOpen={() => {}} onLeave={() => {}} rand={() => 0.5} />);
    const lock = hold(HOLD_MS - 500);
    fireEvent.pointerUp(lock);
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.queryByText(/plus/)).toBeNull();
    hold(HOLD_MS + 10);
    expect(screen.getByText(/plus/)).toBeTruthy();
  });

  it("opens with the right answer", () => {
    const open = vi.fn();
    render(<GateDialog onOpen={open} onLeave={() => {}} rand={() => 0.5} />);
    hold(HOLD_MS + 10);
    type(makeSum(() => 0.5).answer);
    expect(open).toHaveBeenCalledOnce();
  });

  it("closes after three wrong answers", () => {
    const open = vi.fn();
    const leave = vi.fn();
    render(<GateDialog onOpen={open} onLeave={leave} rand={() => 0.5} />);
    hold(HOLD_MS + 10);
    type(1);
    expect(screen.getByRole("alert").textContent).toContain("2 tries left");
    type(1);
    type(1);
    expect(leave).toHaveBeenCalledOnce();
    expect(open).not.toHaveBeenCalled();
  });
});

describe("Stepper", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("steps once on a tap and repeats on a long press", () => {
    let v = 5;
    const { rerender } = render(<Stepper label="squares" value={v} onChange={(n) => (v = n)} />);
    const plus = screen.getByRole("button", { name: "More squares" });
    fireEvent.pointerDown(plus);
    fireEvent.pointerUp(plus);
    expect(v).toBe(6);
    rerender(<Stepper label="squares" value={v} onChange={(n) => (v = n)} />);
    fireEvent.pointerDown(plus);
    act(() => {
      vi.advanceTimersByTime(REPEAT_AFTER + REPEAT_EVERY * 3 + 5);
    });
    fireEvent.pointerUp(plus);
    expect(v).toBe(10);
    expect(screen.getByRole("spinbutton", { name: "squares" }).getAttribute("aria-valuenow")).toBe("6");
  });

  it("never goes under its minimum", () => {
    const change = vi.fn();
    render(<Stepper label="squares" value={0} onChange={change} />);
    expect((screen.getByRole("button", { name: "Fewer squares" }) as HTMLButtonElement).disabled).toBe(true);
  });
});

describe("the rest", () => {
  it("a switch says its state in words", () => {
    const change = vi.fn();
    render(<Switch label="Voice" on onChange={change} />);
    fireEvent.click(screen.getByRole("switch", { name: "Voice" }));
    expect(change).toHaveBeenCalledWith(false);
    expect(screen.getByText("On")).toBeTruthy();
  });

  it("ConfirmDialog waits for the typed word", () => {
    const yes = vi.fn();
    render(<ConfirmDialog open onOpenChange={() => {}} title="Erase everything?" description="Your tiles go." confirm="Erase" onConfirm={yes} danger typeWord="ERASE" />);
    const go = screen.getByRole("button", { name: "Erase" }) as HTMLButtonElement;
    expect(go.disabled).toBe(true);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "erase" } });
    fireEvent.click(go);
    expect(yes).toHaveBeenCalledOnce();
  });

  it("storage words are plain", () => {
    expect(storageWords(true)).toBe("Kept on this iPad: yes.");
    expect(storageWords(false)).toContain("backup is safer");
  });
});
