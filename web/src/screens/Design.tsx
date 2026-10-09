/* #/design: every token-driven picture and component in every state, in light and dark (plan keys 2t, 2j, 2k, 2l).
   Made-up content only. Rows grow as each pull request adds components. */
import { useEffect, useState } from "react";
import { COLOURS, SHAPE_IDS, SHAPES } from "../engine/catalog";
import { THEMES, THEME_LABELS } from "../engine/themes";
import { applyTheme, currentTheme, type Theme as Ground } from "../ground";
import { ShapeIcon } from "../ui/ShapeIcon";
import { ThemeIcon } from "../ui/ThemeIcon";
import { TileChip } from "../ui/TileChip";
import { GrownupRows } from "./design/GrownupRows";
import { KidRows } from "./design/KidRows";
import { Row } from "./design/Row";
import { TileTurntable } from "./design/TileTurntable";
import { ViewerRow } from "./design/ViewerRow";
import { FriendSheet } from "../friend/sheet";

export function Design() {
  const [ground, setGround] = useState<Ground>(currentTheme());
  const [paint, setPaint] = useState(0);
  useEffect(() => {
    applyTheme(ground);
    setPaint((p) => p + 1);
    return () => {
      applyTheme();
    };
  }, [ground]);
  return (
    <main className="safe mx-auto max-w-6xl">
      <header className="flex flex-wrap items-center justify-between gap-4 pb-4">
        <h1 className="font-display text-[length:var(--fs-parent-title)] font-semibold">The design page</h1>
        <div role="group" aria-label="Theme" className="flex gap-2">
          {(["light", "dark"] as const).map((g) => (
            <button
              key={g}
              type="button"
              aria-pressed={ground === g}
              onClick={() => setGround(g)}
              className="min-h-11 rounded-md border border-line px-4 aria-pressed:bg-accent aria-pressed:text-accent-ink"
            >
              {g === "light" ? "Light" : "Dark"}
            </button>
          ))}
        </div>
      </header>

      <Row title="Tile chips" note="Every shape in every colour, plus 'any colour'. Colour is never alone: each has a pattern, a rim and a spoken name.">
        <div className="grid w-full gap-3" style={{ gridTemplateColumns: `repeat(${COLOURS.length + 1}, minmax(0, 1fr))` }}>
          {SHAPE_IDS.flatMap((s) => [...COLOURS, undefined].map((c) => <TileChip key={`${s}-${c}`} shape={s} colour={c} size="sm" />))}
        </div>
      </Row>

      <Row title="Chip sizes and counts">
        <TileChip shape="square" colour="red" size="sm" count={1} />
        <TileChip shape="square" colour="blue" size="md" count={4} />
        <TileChip shape="tri-isosceles-tall" colour="purple" size="lg" count={2} speak />
        <TileChip shape="tri-equilateral" colour="green" size="lg" count={4} instead />
      </Row>

      <Row title="Shape icons" note="24 and 64 px, in the ink colour.">
        {SHAPE_IDS.map((s) => (
          <span key={s} className="flex items-end gap-2 text-ink-1">
            <ShapeIcon shape={s} size={24} label={SHAPES[s].label} />
            <ShapeIcon shape={s} size={64} />
          </span>
        ))}
      </Row>

      <Row title="Theme icons">
        {THEMES.map((t) => (
          <span key={t} className="flex flex-col items-center gap-1 text-ink-1">
            <ThemeIcon theme={t} size={48} />
            <span className="text-[length:var(--fs-parent-small)] text-ink-2">{THEME_LABELS[t]}</span>
          </span>
        ))}
      </Row>

      <Row title="3D tiles" note="One tile of each shape, turning slowly; still under reduced motion.">
        <TileTurntable paint={paint} />
      </Row>

      <ViewerRow paint={paint} />

      <Row title="Tile friend" note="Character sheet (gate G1; more poses in 3.9): eleven poses."><FriendSheet /></Row>

      <KidRows />

      <GrownupRows />
    </main>
  );
}
