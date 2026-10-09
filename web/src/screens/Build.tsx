/* Build mode (plan keys 3b, 7a to 7f; sprint 2, change 7): one step at a time. The model fills the screen; a step strip
   along the bottom holds this step's tiles, its line (read aloud on Hear again), Back and a big Next. The project's own age sets the sizes, the view and the voice (PRODUCT.md, "The age bands").
   The step is saved on every move (D20); opening a half-built project carries on from there. */
import { Navigate, useNavigate, useParams } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { layerOf, worldPolygon } from "../engine/geometry";
import { matchProject, type Match } from "../engine/match";
import type { Project } from "../engine/types";
import { infoById, useProject } from "../projects/load";
import { CantLoad } from "./build/CantLoad";
import { say, speechEnabled, stop } from "../speech/say";
import { getStep, saveStep } from "../store/db";
import { useInventory } from "../store/hooks";
import { effectiveLeg } from "../store/inventory";
import { S } from "../strings";
import { Viewer } from "../three/Viewer";
import { ArrowLeft, GridFour, Play } from "../ui/icons";
import { AgeProvider, older } from "../ui/kid/AgeContext";
import { fell, FellDown, layerStart, type FallState } from "../ui/kid/FellDown";
import { KidBar } from "../ui/kid/KidBar";
import { Pip, useStepPose } from "../friend/Pip";
import { Decor } from "../looks/decor";
import { KidButton } from "../ui/kid/KidButton";
import { SpeakButton } from "../ui/kid/SpeakButton";
import { StepDots } from "../ui/kid/StepDots";
import { SwapNote } from "../ui/kid/SwapNote";
import { TurnControls } from "../ui/kid/TurnControls";
import { TileChip } from "../ui/TileChip";
import { StepTray } from "./build/StepTray";
import { TileList } from "./build/TileList";
import { shownAfter, stepTiles, swapsByStep } from "./build/stepTiles";
import { TilePicture } from "../ui/TileChip";

export const REST_MS = 90_000;

export function Build() {
  const { pid } = useParams({ strict: false }) as { pid: string };
  const project = useProject(pid);
  if (project === null) return <Navigate to="/" />;
  if (project === "unreachable") return <CantLoad title={infoById(pid)?.title ?? pid} />;
  // the tiles are loading (a moment, from the iPad's own copy): the empty stage
  if (!project) return <main className="h-dvh bg-stage" aria-busy="true" />;
  return <BuildProject key={pid} pid={pid} project={project} />;
}

function BuildProject({ pid, project }: { pid: string; project: Project }) {
  const navigate = useNavigate();
  const inv = useInventory();
  const [step, setStep] = useState<number | null>(null);
  const [settled, setSettled] = useState(0);
  // the tiles list (3.7): before step 1 of a fresh build ("start"), or opened from Tiles you need ("look")
  const [gate, setGate] = useState<"start" | "look" | null>(null);
  // All steps (3.8): open, and the step it shows while the child scrubs
  const [tray, setTray] = useState(false);
  const [preview, setPreview] = useState<number | null>(null);
  const [turns, setTurns] = useState(0);
  const [hush, setHush] = useState(0);
  const [fall, setFall] = useState<FallState>({ step: -1, falls: 0 });
  const [fallOpen, setFallOpen] = useState(false);
  const [resting, setResting] = useState(false);
  const idle = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stripRef = useRef<HTMLElement>(null);
  const [strip, setStrip] = useState(220);

  const match: Match | null = useMemo(() => (inv && Object.keys(inv.counts).length ? matchProject(project, inv) : null), [inv, project]);
  const instead = match?.instead ?? {};
  const leg = effectiveLeg(inv);
  const swapAt = useMemo(() => swapsByStep(project, match?.swaps ?? []), [project, match]);
  const last = project.steps.length - 1;
  const age = project.age;

  const lineOf = useCallback(
    (s: number) => [project.steps[s].say, ...(swapAt.get(s) ?? []).map((sw) => sw.say)].join(" "),
    [project, swapAt],
  );
  const speak = useCallback(
    (s: number) => {
      say(lineOf(s));
      // a line was spoken: the 9–10 model stops turning by itself so the child can listen and look
      if (speechEnabled()) setHush((h) => h + 1);
    },
    [lineOf, age],
  );

  // first open: carry on from the saved step; a fresh build (step 1) shows its tiles first
  useEffect(() => {
    if (step !== null || inv === undefined) return;
    void getStep(pid).then((saved) => {
      const s = Math.min(saved, last);
      setStep(s);
      setSettled(shownAfter(project, s) - project.steps[s].tiles.length);
      if (s === 0) setGate("start");
      else speak(s);
    });
  }, [inv, step, pid, last, project, match, speak]);

  useEffect(() => () => stop(), []);

  const wake = useCallback(() => {
    setResting(false);
    if (idle.current) clearTimeout(idle.current);
    idle.current = setTimeout(() => setResting(true), REST_MS);
  }, []);
  useEffect(() => {
    wake();
    return () => {
      if (idle.current) clearTimeout(idle.current);
    };
  }, [step, wake]);

  // the step strip's height (it grows with long lines), so the model stays framed above it
  useEffect(() => {
    const el = stripRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => setStrip(el.offsetHeight + 24));
    ro.observe(el);
    return () => ro.disconnect();
  }, [step]);

  const stepLayers = useMemo(
    () => project.steps.map((s) => Math.min(...s.tiles.map((t) => layerOf(worldPolygon(project.placed[t], leg))))),
    [project, leg],
  );

  const pipPose = useStepPose(step ?? 0);
  if (step === null) return <main className="min-h-dvh" />;

  const go = (n: number) => {
    const s = Math.max(0, Math.min(last, n));
    setGate(null);
    setStep(s);
    setTurns(0);
    void saveStep(pid, s);
    speak(s);
  };
  const next = () => {
    if (step >= last) {
      void navigate({ to: "/done/$pid", params: { pid } });
      return;
    }
    go(step + 1);
  };

  const view = tray ? (preview ?? step) : step;
  const commit = (i: number) => {
    if (i !== step) go(i);
  };
  const closeTray = () => {
    if (preview !== null) commit(preview);
    setTray(false);
    setPreview(null);
  };
  const tiles = stepTiles(project, step, instead);
  const showWords = age !== "a";
  const chip = age === "a" ? "lg" : "md";

  return (
    <AgeProvider age={age}>
      <main className="ts-build kid relative h-dvh overflow-hidden bg-stage" onPointerDown={wake}>
        {/* the stage fills the screen; the panels float over it and the model is framed in what they leave clear */}
        <div className="absolute inset-0">
          <Viewer
            project={project}
            shown={gate === "start" ? 0 : shownAfter(project, view)}
            leg={leg}
            instead={instead}
            current={project.steps[view].tiles}
            settled={settled}
            turns={turns}
            stepKey={view}
            browse={tray}
            hush={hush}
            inset={{ top: 112, bottom: strip }}
            spin={!resting}
            label={S.build.model(project.title)}
          />
          {gate && (
            <TileList
              project={project}
              instead={instead}
              leg={leg}
              missing={match?.missing ?? []}
              mode={gate}
              inset={{ top: 112, bottom: strip }}
              onStart={() => {
                setGate(null);
                speak(step);
              }}
              onPick={() => void navigate({ to: "/" })}
              onClose={() => setGate(null)}
            />
          )}
        </div>
        <div className="safe-top pointer-events-none absolute inset-x-0 top-0 px-4">
          <div className="pointer-events-auto">
            <KidBar
              onBack={() => void navigate({ to: "/" })}
              hear={<SpeakButton text={lineOf(step)} />}
              extra={
                <KidButton
                  label={S.build.tilesButton}
                  showLabel={false}
                  icon={
                    <span className="flex items-end gap-0.5" aria-hidden="true">
                      <TilePicture shape="square" colour="blue" px={22} />
                      <TilePicture shape="tri-equilateral" colour="yellow" px={22} />
                    </span>
                  }
                  tone="plain"
                  className="ts-tiles-button"
                  onPress={() => setGate(gate === "look" ? null : "look")}
                  pressed={gate === "look"}
                  speak
                />
              }
              more={
                <KidButton
                  label={S.build.allSteps}
                  showLabel={false}
                  icon={<GridFour size={36} weight="bold" />}
                  tone="plain"
                  className="ts-steps-button"
                  onPress={() => {
                    if (tray) closeTray();
                    else {
                      setGate(null);
                      setPreview(step);
                      setTray(true);
                    }
                  }}
                  pressed={tray}
                  speak
                />
              }
              title={
                <h1 className="ts-title soft inline-block max-w-full truncate rounded-full bg-surface-2 px-6 py-2 font-display text-[length:var(--fs-kid-label-b)] font-bold text-ink-1">
                  {project.title}
                </h1>
              }
            />
          </div>
        </div>
        <div className="absolute right-4 flex flex-col items-end gap-6" style={{ top: 120 }}>
          <TurnControls vertical onTurn={(d) => setTurns((t) => t + d)} onReset={() => setTurns(0)} />
          {!older(age) && !project.flat && (
            <KidButton label={S.build.fellButton} onPress={() => {
              setFall((f) => fell(f, step));
              setFallOpen(true);
            }} tone="soft" speak />
          )}
        </div>
        <aside
          ref={stripRef}
          className="ts-panel soft absolute inset-x-4 flex flex-col gap-3 rounded-[32px] bg-surface-2 p-4"
          style={{ bottom: "max(env(safe-area-inset-bottom), 16px)" }}
          aria-label={S.kid.step(step + 1, last + 1)}
        >
          <Decor at="panel" />
          {/* Pip sits on the panel's top edge, above Next, and points left at this step's tiles */}
          <Pip pose={pipPose} size={88} flip className="absolute -top-[76px] right-10" />
          {tray ? (
            <StepTray project={project} leg={leg} instead={instead} step={step} preview={view} onPreview={setPreview} onCommit={commit} onClose={closeTray} />
          ) : (
            <>
            <StepDots count={last + 1} current={step} onJump={go} />
            {/* narrow (Split View, 3.6): this step's tiles and words take the whole first row; Back and Next the second */}
            <div className="flex items-center gap-5 max-[760px]:flex-wrap max-[760px]:gap-3">
              <KidButton label={S.kid.stepBack} showLabel={false} icon={<ArrowLeft size={36} weight="bold" />} onPress={() => go(step - 1)} disabled={step === 0} />
              <div className="flex min-w-0 flex-1 flex-col gap-2 max-[760px]:order-first max-[760px]:basis-full">
                <div className="flex min-w-0 items-center gap-5 max-[760px]:gap-3">
                  <ul className="ts-step-tiles flex shrink-0 flex-wrap items-center gap-3" aria-label={S.build.stepTiles}>
                    {tiles.map((t) => (
                      <li key={`${t.shape}-${t.colour}-${t.instead}`}>
                        <TileChip shape={t.shape} colour={t.colour} count={t.count} size={chip} leg={leg} instead={t.instead} speak />
                      </li>
                    ))}
                  </ul>
                  <p className={showWords ? "min-w-0 font-kid text-[length:var(--fs-kid-label-c)] font-bold leading-snug text-ink-1" : "sr-only"}>{lineOf(step)}</p>
                </div>
                {(swapAt.get(step) ?? []).map((sw) => (
                  <SwapNote key={sw.from} from={sw.from} to={sw.to} text={sw.say} />
                ))}
                {match?.note === "best-with-one-brand" && step === 0 && <p className="text-ink-2">{S.build.bestWithOneBrand}</p>}
                {age === "t" && step === 0 && <p className="text-ink-2">{S.build.forBaby}</p>}
              </div>
              <KidButton label={S.kid.next} primary tone="accent" icon={<Play size={44} weight="fill" />} onPress={next} sound="step" className="ts-next min-w-[148px] max-[760px]:ml-auto" />
            </div>
            </>
          )}
        </aside>
        {resting && (
          <button type="button" onClick={wake} className="ts-rest fixed inset-0 z-30 flex flex-col items-center justify-center gap-6 bg-surface/95" aria-label={S.build.keepBuilding}>
            <span className="font-display text-[length:var(--fs-kid-display-c)] font-semibold text-ink-2">{S.build.keepBuilding}</span>
            <span className="flex flex-wrap justify-center gap-6">
              {tiles.map((t) => (
                <TileChip key={`r-${t.shape}-${t.colour}`} shape={t.shape} colour={t.colour} count={t.count} size="lg" leg={leg} />
              ))}
            </span>
          </button>
        )}
        <FellDown
          open={fallOpen}
          onOpenChange={setFallOpen}
          state={fall}
          canBack={step > 0}
          onBack={() => {
            setFallOpen(false);
            go(step - 1);
          }}
          onLayer={() => {
            setFallOpen(false);
            go(layerStart(stepLayers, step));
          }}
        />
      </main>
    </AgeProvider>
  );
}
