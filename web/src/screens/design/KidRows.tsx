/* The design page's kid-side rows (plan key 2o): every component in every state, at the chosen age's sizes. */
import { useState } from "react";
import type { Theme } from "../../engine/themes";
import { Play } from "@phosphor-icons/react";
import { AgeProvider, AGES, type Age } from "../../ui/kid/AgeContext";
import { AgePicker } from "../../ui/kid/AgePicker";
import { BuildBadge } from "../../ui/kid/BuildBadge";
import { Celebration } from "../../ui/kid/Celebration";
import { EmptyState } from "../../ui/kid/EmptyState";
import { KidBar } from "../../ui/kid/KidBar";
import { KidButton } from "../../ui/kid/KidButton";
import { ProjectCard } from "../../ui/kid/ProjectCard";
import { Shelf } from "../../ui/kid/Shelf";
import { SpeakButton } from "../../ui/kid/SpeakButton";
import { StepDots } from "../../ui/kid/StepDots";
import { SwapNote } from "../../ui/kid/SwapNote";
import { ThemeFilter } from "../../ui/kid/ThemeFilter";
import { TurnControls } from "../../ui/kid/TurnControls";
import { TilePicture } from "../../ui/TileChip";
import { Row } from "./Row";

function Picture() {
  return (
    <span className="grid h-full w-full place-items-center" style={{ background: "var(--stage)" }}>
      <span className="flex items-end">
        <TilePicture shape="square" colour="blue" px={56} />
        <TilePicture shape="tri-equilateral" colour="red" px={56} />
        <TilePicture shape="square" colour="green" px={56} />
      </span>
    </span>
  );
}

export function KidRows() {
  const [age, setAge] = useState<Age>("a");
  const [theme, setTheme] = useState<Theme | null>(null);
  const [step, setStep] = useState(2);
  const [party, setParty] = useState(0);
  const noop = () => {};
  return (
    <AgeProvider age={age}>
      <Row title="Age" note="The kid sizes below follow this age: 88, 80 or 64 px targets; 104 px for the main action.">
        <div role="group" aria-label="Age for kid sizes" className="flex gap-2">
          {AGES.map((a) => (
            <button key={a} type="button" aria-pressed={age === a} onClick={() => setAge(a)} className="min-h-11 rounded-md border border-line px-4 aria-pressed:bg-accent aria-pressed:text-accent-ink">
              {a}
            </button>
          ))}
        </div>
      </Row>
      <Row title="Kid buttons">
        <KidButton label="Next" primary tone="accent" icon={<Play size={40} weight="fill" />} onPress={noop} />
        <KidButton label="Back" onPress={noop} />
        <KidButton label="Pressed" pressed onPress={noop} />
        <KidButton label="Soft" tone="soft" onPress={noop} />
        <KidButton label="Off" disabled onPress={noop} />
        <SpeakButton text="Put a red square next to the blue one." />
      </Row>
      <Row title="Kid bar">
        <div className="w-full rounded-lg border border-line p-3">
          <KidBar onBack={noop} hear={<SpeakButton text="Hello, builder." />} title={<span className="font-display text-[length:var(--fs-kid-label-b)] font-semibold">The castle</span>} />
        </div>
      </Row>
      <Row title="Age picker">
        <AgePicker value={age} onChange={setAge} />
      </Row>
      <Row title="Theme filter">
        <ThemeFilter value={theme} onChange={setTheme} />
      </Row>
      <Row title="Build badges">
        <BuildBadge state="can" />
        <BuildBadge state="swap" />
        <BuildBadge state="need" missing={[{ shape: "tri-isosceles-tall", count: 2 }, { shape: "square", count: 1 }]} />
      </Row>
      <Row title="Shelf and project cards">
        <div className="w-full">
          <Shelf title="Castles">
            <ProjectCard title="The castle" picture={<Picture />} stars={3} state="need" missing={[{ shape: "square", count: 8 }]} onPress={noop} />
            <ProjectCard title="A little house" picture={<Picture />} stars={1} state="can" onPress={noop} />
            <ProjectCard title="The tower" picture={<Picture />} stars={2} state="swap" resume={4} onPress={noop} />
            <ProjectCard title="A bridge" picture={<Picture />} stars={2} state="can" onPress={noop} />
          </Shelf>
        </div>
      </Row>
      <Row title="Step dots">
        <StepDots count={8} current={step} />
        <StepDots count={24} current={step} onJump={setStep} />
      </Row>
      <Row title="Turn controls">
        <TurnControls onTurn={noop} onReset={noop} />
      </Row>
      <Row title="Swap note">
        <SwapNote from="tri-isosceles-tall" to="tri-equilateral" text="Short on tall triangles? Four short triangles make a lower roof." />
      </Row>
      <Row title="Empty state">
        <EmptyState text="A grown-up can add your tiles behind the door." />
      </Row>
      <Row title="Celebration" note="Tap to play it again. Still under reduced motion.">
        <span key={party}>
          <Celebration size={200} />
        </span>
        <button type="button" className="min-h-11 rounded-md border border-line px-4" onClick={() => setParty((p) => p + 1)}>
          Play again
        </button>
      </Row>
    </AgeProvider>
  );
}
