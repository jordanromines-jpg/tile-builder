/* The tile friend (plan 2026-10-08-design-polish, PR 3.5, gate G1): a small character made of the tiles a child builds
   with. A square body (the face), two triangle ears, a triangle tail, square feet and arms, a tiny card, a star.
   Each tile is drawn as TileChip draws one: a pale backing, the colour at about 60%, a rim and a glint, so it reads
   the same on light and dark grounds. Decoration only: the screens already say everything in words.
   A rig, not a set of drawings (Jordan: "this is stop motion not animation"): every part is always there, and a new
   pose moves the arms, the pupils and the body there (app.css `friend-move`, a spring), fades the eyes and the mouth
   across, and pops its extras in; a clap claps, a wave waves and a cheer pumps (`friend-alive`). At rest each pose
   draws as it always has. */
import type { CSSProperties, ReactNode } from "react";

export type FriendPose = "idle" | "read" | "point" | "think" | "cheer" | "hold" | "clap" | "wave" | "comfort" | "look" | "sleep";
export const FRIEND_POSES: FriendPose[] = ["idle", "read", "point", "think", "cheer", "hold", "clap", "wave", "comfort", "look", "sleep"];

type Hue = "red" | "orange" | "yellow" | "green" | "blue" | "purple";
const FALLBACK: Record<Hue, string> = { red: "#e5322e", orange: "#f5841f", yellow: "#f4c51b", green: "#39ad4a", blue: "#2a78dd", purple: "#8a4cc8" };
const fillOf = (h: Hue) => `var(--tile-${h}, ${FALLBACK[h]})`;
const rimOf = (h: Hue) => `var(--tile-${h}-rim, ${FALLBACK[h]})`;
const INK = "#2a2118";

/** One tile: a pale backing, the translucent colour, a rim, and a glint just inside the rim. */
function Tile({ pts, hue, glint = true }: { pts: string; hue: Hue; glint?: boolean }) {
  return (
    <g strokeLinejoin="round">
      <polygon points={pts} fill="#fff7ec" fillOpacity={0.9} />
      <polygon points={pts} fill={fillOf(hue)} fillOpacity={0.62} />
      {glint && <polygon points={pts} fill="none" stroke="#fff" strokeOpacity={0.45} strokeWidth={2.5} strokeDasharray="14 400" strokeLinecap="round" transform="translate(3 3)" />}
      <polygon points={pts} fill="none" stroke={rimOf(hue)} strokeWidth={4} />
    </g>
  );
}
const rect = (x: number, y: number, w: number, h: number) => `${x},${y} ${x + w},${y} ${x + w},${y + h} ${x},${y + h}`;
const star = (cx: number, cy: number, r: number) =>
  Array.from({ length: 10 }, (_, i) => {
    const a = (Math.PI * i) / 5 - Math.PI / 2;
    const rr = i % 2 ? r * 0.46 : r;
    return `${(cx + rr * Math.cos(a)).toFixed(1)},${(cy + rr * Math.sin(a)).toFixed(1)}`;
  }).join(" ");

function HappyEye({ x, y }: { x: number; y: number }) {
  return <path d={`M${x - 8} ${y + 4} Q${x} ${y - 9} ${x + 8} ${y + 4}`} fill="none" stroke={INK} strokeWidth={5} strokeLinecap="round" />;
}
const smile = (d: string) => <path d={d} fill="none" stroke={INK} strokeWidth={4.5} strokeLinecap="round" />;

const BX = 60;
const BY = 72;
const BS = 80;

function ClosedEye({ x, y }: { x: number; y: number }) {
  return <path d={`M${x - 8} ${y} Q${x} ${y + 7} ${x + 8} ${y}`} fill="none" stroke={INK} strokeWidth={5} strokeLinecap="round" />;
}

/** Each pose's arms: degrees about the shoulder, left and right (clap hides them: the hands clap in front). */
const ARMS: Record<FriendPose, [number, number]> = {
  idle: [0, 0], read: [-22, 22], point: [0, -24], think: [0, -62], cheer: [58, -58], hold: [78, -78],
  clap: [0, 0], wave: [0, -72], comfort: [0, 34], look: [0, 0], sleep: [0, 0],
};
/** where the pupils look, in each pose with open eyes */
const PUPILS: Partial<Record<FriendPose, [number, number]>> = {
  read: [1, 4], point: [3.5, -1], think: [3, -4], hold: [0, -3.5], wave: [1.5, 0], comfort: [0, 2],
};
const HAPPY: FriendPose[] = ["cheer", "clap"];

function mouthOf(pose: FriendPose): ReactNode {
  switch (pose) {
    case "read": return smile("M92 119 Q100 124 108 119");
    case "point": return smile("M88 116 Q100 130 112 116");
    case "think": return smile("M93 122 Q99 118 108 121");
    case "cheer": return <path d="M86 113 H114 Q112 133 100 133 Q88 133 86 113 Z" fill={INK} stroke={INK} strokeWidth={3} strokeLinejoin="round" />;
    case "hold": return <path d="M89 114 H111 Q109 128 100 128 Q91 128 89 114 Z" fill={INK} stroke={INK} strokeWidth={3} strokeLinejoin="round" />;
    case "clap": return smile("M90 113 Q100 124 110 113");
    case "wave": return smile("M88 115 Q100 129 112 115");
    case "comfort": return smile("M93 118 Q100 124 107 118");
    case "look": return smile("M91 116 Q100 125 109 116");
    case "sleep": return <circle cx={100} cy={121} r={4.5} fill="none" stroke={INK} strokeWidth={3.5} />;
    default: return smile("M90 116 Q100 127 110 116");
  }
}

/** A part that moves to its place for the pose (a spring) about `origin`, in the drawing's own units. */
const moved = (transform: string, origin: string, on = true): CSSProperties => ({ transform, transformOrigin: origin, opacity: on ? 1 : 0 });
/** An extra that pops in with its pose and fades away after it. */
function Pop({ on, children }: { on: boolean; children: ReactNode }) {
  return <g className="friend-pop" style={{ opacity: on ? 1 : 0, transform: on ? "scale(1)" : "scale(0.6)" }}>{children}</g>;
}
const fade = (on: boolean): CSSProperties => ({ opacity: on ? 1 : 0 });

/** `gaze` turns the eyes left (−1) or right (1) in the look pose. The parts are named (friend-body, friend-ear,
    friend-eyes, friend-tail) so Pip's idle life (app.css) can move them. */
export function Friend({ pose = "idle", size = 200, gaze = 0, className }: { pose?: FriendPose; size?: number; gaze?: -1 | 0 | 1; className?: string }) {
  const [l, r] = ARMS[pose];
  const happy = HAPPY.includes(pose);
  const asleep = pose === "sleep";
  const [px, py] = pose === "look" ? [4 * gaze, 0] : (PUPILS[pose] ?? [0, 0]);
  const low = pose === "comfort" ? 1 : 0;
  const cheeks = pose !== "think" && pose !== "sleep";
  return (
    <svg viewBox="0 0 200 200" width={size} height={size} aria-hidden="true" focusable="false" className={className} style={{ display: "block", overflow: "visible" }} data-pose={pose}>
      <ellipse cx={100} cy={178} rx={42} ry={6} fill={INK} fillOpacity={0.14} />
      <g className="friend-move" style={{ transform: `translateY(${pose === "cheer" ? -8 : 0}px)` }}>
        <g className="friend-tail"><Tile hue="purple" pts="136,146 168,146 168,114" /></g>
        <Tile hue="purple" pts={rect(66, 148, 26, 20)} />
        <Tile hue="purple" pts={rect(108, 148, 26, 20)} />
        <g className="friend-move" style={moved(`rotate(${pose === "comfort" ? -6 : 0}deg)`, "100px 150px")}>
        <g className="friend-body">
        <g className="friend-ear"><Tile hue="yellow" pts={`${BX},${BY} ${BX + 26},${BY} ${BX},${BY - 36}`} /></g>
        <g className="friend-ear friend-ear-r"><Tile hue="yellow" pts={`${BX + BS},${BY} ${BX + BS - 26},${BY} ${BX + BS},${BY - 36}`} /></g>
        <Tile hue="orange" pts={rect(BX, BY, BS, BS)} />
        <g className="friend-fade" style={fade(cheeks)}>
          <circle cx={74} cy={116} r={6} fill={fillOf("red")} fillOpacity={0.45} />
          <circle cx={126} cy={116} r={6} fill={fillOf("red")} fillOpacity={0.45} />
        </g>
        <g className="friend-eyes">
          <g className="friend-move" style={moved(`translateY(${low}px)`, "100px 100px", !happy && !asleep)}>
            {[86, 114].map((x) => (
              <g key={x}>
                <circle cx={x} cy={100} r={9.5} fill="#fff" fillOpacity={0.95} />
                <g className="friend-move" style={{ transform: `translate(${px}px, ${py}px)` }}>
                  <circle cx={x} cy={100} r={6.5} fill={INK} />
                  <circle cx={x + 2} cy={100 - 2.2} r={2} fill="#fff" />
                </g>
              </g>
            ))}
          </g>
          <g className="friend-fade" style={fade(happy)}><HappyEye x={86} y={100} /><HappyEye x={114} y={100} /></g>
          <g className="friend-fade" style={fade(asleep)}><ClosedEye x={86} y={101} /><ClosedEye x={114} y={101} /></g>
        </g>
        {FRIEND_POSES.map((p) => (
          <g key={p} className="friend-fade" style={fade(p === pose)}>{mouthOf(p)}</g>
        ))}
        </g>
        </g>

        {/* the arms: each turns about its shoulder to the pose's place; inside, the clap's, wave's and cheer's beat */}
        <g className="friend-move" style={moved(`rotate(${l}deg)`, "62px 98px", pose !== "clap")}>
          <g className="friend-arm-l" data-beat={pose === "cheer" ? "pump" : undefined}><Tile hue="green" pts={rect(40, 90, 22, 17)} /></g>
        </g>
        <g className="friend-move" style={moved(`rotate(${r}deg) translateX(${pose === "think" ? -8 : 0}px)`, "138px 98px", pose !== "clap")}>
          <g className="friend-arm-r" data-beat={pose === "cheer" ? "pump" : pose === "wave" ? "wave" : undefined}>
            <g className="friend-fade" style={fade(pose !== "point")}><Tile hue="green" pts={rect(138, 90, 22, 17)} /></g>
            <g className="friend-fade" style={fade(pose === "point")}><Tile hue="green" pts="138,83 188,98 138,113" /></g>
          </g>
        </g>

        <Pop on={asleep}>
          <g fill="none" stroke={rimOf("blue")} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round">
            <path d="M150 52 h12 l-12 12 h12" />
            <path d="M168 30 h9 l-9 9 h9" strokeWidth={3} />
          </g>
        </Pop>
        <g className="friend-fade" style={fade(pose === "clap")}>
          <g data-beat={pose === "clap" ? "clap" : undefined} className="friend-hand-l"><g transform="rotate(14 92 133)"><Tile hue="green" pts={rect(82, 126, 18, 15)} /></g></g>
          <g data-beat={pose === "clap" ? "clap" : undefined} className="friend-hand-r"><g transform="rotate(-14 108 133)"><Tile hue="green" pts={rect(100, 126, 18, 15)} /></g></g>
          <g data-beat={pose === "clap" ? "clap" : undefined} className="friend-marks" stroke={rimOf("orange")} strokeWidth={3.5} strokeLinecap="round"><path d="M76 132 L66 128 M124 132 L134 128 M100 148 V156" /></g>
        </g>
        <Pop on={pose === "wave"}>
          <g fill="none" stroke={rimOf("orange")} strokeWidth={3.5} strokeLinecap="round"><path d="M164 44 Q176 56 170 70" /><path d="M176 36 Q192 54 184 74" /></g>
        </Pop>
        <Pop on={pose === "comfort"}>
          <path d="M166 58 c-6 -8 -16 -2 -10 6 l10 10 l10 -10 c6 -8 -4 -14 -10 -6 z" fill={fillOf("red")} fillOpacity={0.7} stroke={rimOf("red")} strokeWidth={2.5} strokeLinejoin="round" />
        </Pop>
        <Pop on={pose === "read"}>
          <g transform="rotate(-4 100 143)">
            <Tile hue="blue" pts={rect(80, 128, 40, 30)} />
            <path d="M88 138 H112 M88 146 H104" stroke="#fff" strokeOpacity={0.9} strokeWidth={3.5} strokeLinecap="round" />
          </g>
        </Pop>
        <Pop on={pose === "think"}>
          <rect x={150} y={52} width={7} height={7} fill={fillOf("blue")} fillOpacity={0.7} stroke={rimOf("blue")} strokeWidth={2} />
          <rect x={154} y={40} width={10} height={10} transform="rotate(8 159 45)" fill={fillOf("blue")} fillOpacity={0.7} stroke={rimOf("blue")} strokeWidth={2} />
          <g transform="translate(112 -10)">
            <Tile hue="blue" pts={rect(40, 6, 34, 34)} />
            <Tile hue="yellow" glint={false} pts="44,6 70,6 57,-12" />
            <rect x={51} y={22} width={10} height={14} fill={INK} fillOpacity={0.55} />
          </g>
        </Pop>
        <Pop on={pose === "cheer"}>
          <g data-beat={pose === "cheer" ? "twinkle" : undefined} className="friend-star"><g transform="translate(0 -4)"><Tile hue="yellow" glint={false} pts={star(100, 20, 26)} /></g></g>
          <g stroke={rimOf("orange")} strokeWidth={3.5} strokeLinecap="round"><path d="M36 40 L46 48 M164 40 L154 48 M26 66 H38 M162 66 H174" /></g>
        </Pop>
      </g>
    </svg>
  );
}
