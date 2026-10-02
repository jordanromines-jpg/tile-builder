/* The Library (plan keys 3a, 6f): the age picker and the grown-ups door along the top, the theme filter, then shelves.
   With an age chosen: what you can build now, then what needs a few more tiles, then the other ages. With no age
   yet: one shelf an age, smallest first. One tap on a card goes straight into build mode (D18). */
import { useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { matchProject, inventoryTotal, type Match } from "../engine/match";
import type { Theme } from "../engine/themes";
import type { Age, Project } from "../engine/types";
import { PROJECTS } from "../projects";
import { saveSettings } from "../store/db";
import { useInventory, useProgress, useSettings } from "../store/hooks";
import { S } from "../strings";
import { AgeProvider, AGES } from "../ui/kid/AgeContext";
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
  project: Project;
  match: Match | null;
}

/** Buildable first, then with a swap, then short; fewer stars first within each. */
export function sortItems(items: Item[]): Item[] {
  return [...items].sort((a, b) => (a.match && b.match ? RANK[a.match.state] - RANK[b.match.state] : 0) || a.project.stars - b.project.stars || a.project.title.localeCompare(b.project.title));
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
    () => PROJECTS.filter((p) => !theme || p.theme === theme).map((project) => ({ project, match: hasTiles && inv ? matchProject(project, inv) : null })),
    [theme, hasTiles, inv],
  );
  const themes = useMemo(() => [...new Set(PROJECTS.map((p) => p.theme))], []);

  const card = ({ project, match }: Item) => (
    <ProjectCard
      key={project.id}
      title={project.title}
      picture={<ProjectPicture project={project} />}
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
    for (const a of AGES.filter((x) => x !== age)) shelves.push({ title: S.library.forAge(S.kid.ages[a]), items: byAge(a) });
  } else {
    for (const a of AGES) shelves.push({ title: S.library.forAge(S.kid.ages[a]), items: byAge(a) });
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
            <Shelf key={s.title} title={s.title}>
              {s.items.map(card)}
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
