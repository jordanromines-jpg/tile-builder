/* Build mode (plan keys 3b, 7a to 7f): one step at a time. The model, this step's tiles as pictures, the line read
   aloud, Next and Back. The project's own age sets the sizes, the view and the voice (PRODUCT.md, "The age bands").
   The step is saved on every move (D20); opening a half-built project carries on from there. */
import { Navigate, useNavigate, useParams } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { layerOf, worldPolygon } from "../engine/geometry";
import { matchProject, type Match } from "../engine/match";
import { projectById } from "../projects";
import { say, stop } from "../speech/say";
import { click } from "../speech/sound";
import { getStep, saveStep } from "../store/db";
import { useInventory, useSettings } from "../store/hooks";
import { effectiveLeg } from "../store/inventory";
import { S } from "../strings";
import { Viewer } from "../three/Viewer";
import { ArrowLeft, Play } from "../ui/icons";
import { AgeProvider } from "../ui/kid/AgeContext";
import { fell, FellDown, layerStart, type FallState } from "../ui/kid/FellDown";
import { KidBar } from "../ui/kid/KidBar";
import { KidButton } from "../ui/kid/KidButton";
import { SpeakButton } from "../ui/kid/SpeakButton";
import { StepDots } from "../ui/kid/StepDots";
import { SwapNote } from "../ui/kid/SwapNote";
import { TurnControls } from "../ui/kid/TurnControls";
import { TileChip } from "../ui/TileChip";
import { NeedNote } from "./build/NeedNote";
import { shownAfter, stepTiles, swapsByStep } from "./build/stepTiles";

export const REST_MS = 90_000;

export function Build() {
  const { pid } = useParams({ strict: false }) as { pid: string };
  const project = projectById(pid);
  if (!project) return <Navigate to="/" />;
  return <BuildProject key={pid} pid={pid} />;
}

function BuildProject({ pid }: { pid: string }) {
  const project = projectById(pid)!;
  const navigate = useNavigate();
  const inv = useInventory();
  const settings = useSettings();
  const [step, setStep] = useState<number | null>(null);
  const [settled, setSettled] = useState(0);
  const [gate, setGate] = useState<"need" | null>(null);
  const [turns, setTurns] = useState(0);
  const [hush, setHush] = useState(0);
  const [fall, setFall] = useState<FallState>({ step: -1, falls: 0 });
  const [fallOpen, setFallOpen] = useState(false);
  const [resting, setResting] = useState(false);
  const idle = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      say(lineOf(s), age === "a" ? { force: true } : {});
      setHush((h) => h + 1);
    },
    [lineOf, age],
  );

  // first open: carry on from the saved step; a project short of tiles shows its note first
  useEffect(() => {
    if (step !== null || inv === undefined) return;
    void getStep(pid).then((saved) => {
      const s = Math.min(saved, last);
      setStep(s);
      setSettled(shownAfter(project, s) - project.steps[s].tiles.length);
      if (s === 0 && match?.state === "need") setGate("need");
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

  const stepLayers = useMemo(
    () => project.steps.map((s) => Math.min(...s.tiles.map((t) => layerOf(worldPolygon(project.placed[t], leg))))),
    [project, leg],
  );

  if (step === null) return <main className="min-h-dvh" />;

  const go = (n: number) => {
    const s = Math.max(0, Math.min(last, n));
    setStep(s);
    setTurns(0);
    void saveStep(pid, s);
    if (settings?.soundEffects) click();
    speak(s);
  };
  const next = () => {
    if (step >= last) {
      void navigate({ to: "/done/$pid", params: { pid } });
      return;
    }
    go(step + 1);
  };

  const tiles = stepTiles(project, step, instead);
  const showWords = age !== "a";
  const chip = age === "a" ? "lg" : "md";

  return (
    <AgeProvider age={age}>
      <main className="kid flex h-dvh flex-col gap-3 overflow-hidden px-4 pt-4" style={{ paddingBottom: "var(--edge-safe-kid)" }} onPointerDown={wake}>
        <KidBar
          onBack={() => void navigate({ to: "/" })}
          hear={<SpeakButton text={lineOf(step)} />}
          title={<h1 className="truncate font-display text-[length:var(--fs-kid-label-b)] font-semibold">{project.title}</h1>}
        />
        <div className="flex min-h-0 flex-1 flex-col gap-4 landscape:flex-row">
          <section className="relative flex min-h-0 flex-1 flex-col gap-3">
            <div className="relative min-h-0 flex-1 overflow-hidden rounded-lg">
              <Viewer
                project={project}
                shown={gate ? 0 : shownAfter(project, step)}
                leg={leg}
                instead={instead}
                current={project.steps[step].tiles}
                settled={settled}
                turns={turns}
                stepKey={step}
                hush={hush}
                label={S.build.model(project.title)}
              />
              {gate === "need" && match && (
                <NeedNote
                  missing={match.missing}
                  onStart={() => {
                    setGate(null);
                    speak(step);
                  }}
                  onPick={() => void navigate({ to: "/" })}
                />
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <TurnControls onTurn={(d) => setTurns((t) => t + d)} onReset={() => setTurns(0)} />
              {age !== "c" && !project.flat && (
                <KidButton label={S.build.fellButton} onPress={() => {
                  setFall((f) => fell(f, step));
                  setFallOpen(true);
                }} tone="soft" speak />
              )}
            </div>
          </section>
          <aside className="flex min-h-0 flex-col gap-4 overflow-y-auto rounded-lg bg-surface-2 p-4 landscape:w-[400px] portrait:max-h-[45%]" aria-label={S.kid.step(step + 1, last + 1)}>
            <StepDots count={last + 1} current={step} onJump={age === "c" ? go : undefined} />
            <ul className="flex flex-wrap items-center gap-3" aria-label={S.build.stepTiles}>
              {tiles.map((t) => (
                <li key={`${t.shape}-${t.colour}-${t.instead}`}>
                  <TileChip shape={t.shape} colour={t.colour} count={t.count} size={chip} leg={leg} instead={t.instead} speak />
                </li>
              ))}
            </ul>
            <p className={showWords ? "font-kid text-[length:var(--fs-kid-label-c)] font-bold leading-snug text-ink-1" : "sr-only"}>{lineOf(step)}</p>
            {(swapAt.get(step) ?? []).map((sw) => (
              <SwapNote key={sw.from} from={sw.from} to={sw.to} text={sw.say} />
            ))}
            {match?.note === "best-with-one-brand" && step === 0 && <p className="text-ink-2">{S.build.bestWithOneBrand}</p>}
            <div className="mt-auto flex items-end justify-between gap-4">
              <KidButton label={S.kid.stepBack} icon={<ArrowLeft size={36} weight="bold" />} onPress={() => go(step - 1)} disabled={step === 0} />
              <KidButton label={S.kid.next} primary tone="accent" icon={<Play size={40} weight="fill" />} onPress={next} />
            </div>
          </aside>
        </div>
        {resting && (
          <button type="button" onClick={wake} className="fixed inset-0 z-30 flex flex-col items-center justify-center gap-6 bg-surface/95" aria-label={S.build.keepBuilding}>
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
