/* The Library (plan keys 3a, 6f): the age picker and the grown-ups door along the top, the theme filter, then shelves.
   With an age chosen: what you can build now, then what needs a few more tiles, then the other ages. With no age
   yet: one shelf an age, smallest first. One tap on a card goes straight into build mode (D18). */
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { matchProject, inventoryTotal, type Match } from "../engine/match";
import type { Theme } from "../engine/themes";
import type { Age } from "../engine/types";
import { PROJECT_INFO, SKELETONS } from "../projects/load";
import type { ProjectInfo } from "../projects/serialize";
import { saveSettings } from "../store/db";
import { useInventory, useProgress, useSettings } from "../store/hooks";
import { S } from "../strings";
import { AgeProvider, SHELF_ORDER } from "../ui/kid/AgeContext";
import { AgePicker } from "../ui/kid/AgePicker";
import { EmptyState } from "../ui/kid/EmptyState";
import { GrownUpsDoor } from "../ui/kid/GrownUpsDoor";
import { ProjectCard } from "../ui/kid/ProjectCard";
import { Shelf } from "../ui/kid/Shelf";
import { ThemeFilter } from "../ui/kid/ThemeFilter";
import { Wordmark } from "../ui/kid/Wordmark";
import { ProjectPicture } from "../ui/ProjectPicture";
import { FirstRunCard } from "./FirstRunCard";

const RANK = { can: 0, swap: 1, need: 2 } as const;

interface Item {
  project: ProjectInfo;
  match: Match | null;
}

/** Buildable first, then with a swap, then short; fewer stars first within each. */
export function sortItems(items: Item[]): Item[] {
  return [...items].sort((a, b) => (a.match && b.match ? RANK[a.match.state] - RANK[b.match.state] : 0) || a.project.stars - b.project.stars || a.project.title.localeCompare(b.project.title));
}

/** Cards a shelf draws at first, and how many more each time its end comes near (2.4: a shelf of 165 cards is drawn as
    it is scrolled, not all at once). */
export const PAGE = 12;

/** A shelf's cards, drawn a page at a time: a marker after the last drawn card brings the next page when the shelf is
    scrolled (or ▶ is tapped) to within a screen of it. */
function LazyCards<T>({ items, card }: { items: T[]; card: (item: T) => ReactNode }) {
  const [n, setN] = useState(PAGE);
  const end = useRef<HTMLSpanElement>(null);
  const more = n < items.length;
  useEffect(() => {
    const el = end.current;
    if (!more || !el) return;
    if (typeof IntersectionObserver === "undefined") return setN(items.length);
    const io = new IntersectionObserver((seen) => seen.some((e) => e.isIntersecting) && setN((k) => k + PAGE), { root: el.parentElement, rootMargin: "0px 100% 0px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [more, n, items.length]);
  return (
    <>
      {items.slice(0, n).map(card)}
      {more && <span ref={end} aria-hidden="true" className="w-px shrink-0" />}
    </>
  );
}

export function Library() {
  const navigate = useNavigate();
  const settings = useSettings();
  const inv = useInventory();
  const progress = useProgress() ?? {};
  const [theme, setTheme] = useState<Theme | null>(null);
  const age = settings?.age ?? null;
  const hasTiles = !!inv && inventoryTotal(inv) > 0;

  const items = useMemo(
    () => PROJECT_INFO.flatMap((project, i) => (!theme || project.theme === theme ? [{ project, match: hasTiles && inv ? matchProject(SKELETONS[i], inv) : null }] : [])),
    [theme, hasTiles, inv],
  );
  const themes = useMemo(() => [...new Set(PROJECT_INFO.map((p) => p.theme))], []);

  const card = ({ project, match }: Item) => (
    <ProjectCard
      key={project.id}
      title={project.title}
      picture={<ProjectPicture id={project.id} />}
      stars={project.stars}
      state={match?.state}
      missing={match?.missing}
      resume={progress[project.id] ? progress[project.id] + 1 : undefined}
      onPress={() => void navigate({ to: "/build/$pid", params: { pid: project.id } })}
    />
  );

  const byAge = (a: Age) => sortItems(items.filter((i) => i.project.age === a));
  const shelves: { title: string; items: Item[] }[] = [];
  if (age) {
    const mine = byAge(age);
    if (hasTiles) {
      shelves.push({ title: S.library.ready, items: mine.filter((i) => i.match?.state !== "need") });
      shelves.push({ title: S.library.more, items: mine.filter((i) => i.match?.state === "need") });
    } else shelves.push({ title: S.library.forAge(S.kid.ages[age]), items: mine });
    for (const a of SHELF_ORDER.filter((x) => x !== age)) shelves.push({ title: S.library.forAge(S.kid.ages[a]), items: byAge(a) });
  } else {
    for (const a of SHELF_ORDER) shelves.push({ title: S.library.forAge(S.kid.ages[a]), items: byAge(a) });
  }
  const shown = shelves.filter((s) => s.items.length);

  return (
    <AgeProvider age={age ?? "a"}>
      <main className="kid safe mx-auto flex min-h-dvh max-w-[1400px] flex-col gap-6">
        <header className="flex flex-wrap items-center gap-x-6 gap-y-4">
          <Wordmark />
          <AgePicker value={age} onChange={(a) => void saveSettings({ age: a })} />
          <span className="flex-1" />
          <GrownUpsDoor />
        </header>
        <ThemeFilter value={theme} onChange={setTheme} themes={themes} />
        {!hasTiles && inv && <EmptyState text={S.kid.emptyTiles} banner />}
        {shown.length ? (
          shown.map((s) => (
            <Shelf key={`${s.title} ${theme ?? ""}`} title={s.title}>
              <LazyCards items={s.items} card={card} />
            </Shelf>
          ))
        ) : (
          <EmptyState text={S.kid.emptyShelf} />
        )}
      </main>
      {settings && <FirstRunCard settings={settings} />}
    </AgeProvider>
  );
}
