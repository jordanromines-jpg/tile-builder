/* The design page's grown-ups rows (plan key 2q, 2r): buttons, fields, the stepper, dialogs, the gate. */
import { useState } from "react";
import { BackupCard } from "../../ui/grownups/BackupCard";
import { Button } from "../../ui/grownups/Button";
import { ConfirmDialog } from "../../ui/grownups/Dialog";
import { Field, Radios, Switch } from "../../ui/grownups/Field";
import { GateDialog } from "../../ui/grownups/GateDialog";
import { SettingsList } from "../../ui/grownups/SettingsList";
import { Stepper } from "../../ui/grownups/Stepper";
import { StorageStatus } from "../../ui/grownups/StorageStatus";
import { useToast } from "../../ui/grownups/Toast";
import { TileChip } from "../../ui/TileChip";
import { Row } from "./Row";

export function GrownupRows() {
  const [n, setN] = useState(14);
  const [voice, setVoice] = useState(false);
  const [theme, setTheme] = useState<"system" | "light" | "dark">("system");
  const [confirm, setConfirm] = useState(false);
  const [gate, setGate] = useState(0);
  const toast = useToast();
  return (
    <>
      <Row title="Grown-ups buttons">
        <Button kind="lit">Save</Button>
        <Button kind="line">Cancel</Button>
        <Button kind="quiet">Not now</Button>
        <Button kind="danger" onClick={() => setConfirm(true)}>
          Erase everything
        </Button>
        <Button kind="line" disabled>
          Off
        </Button>
        <Button kind="line" onClick={() => toast("Backup saved.")}>
          Show a toast
        </Button>
        <ConfirmDialog open={confirm} onOpenChange={setConfirm} title="Erase everything on this iPad?" description="Your tiles, settings and builds in progress go. A backup file is not touched." confirm="Erase" danger typeWord="ERASE" onConfirm={() => toast("Erased.")} />
      </Row>
      <Row title="Fields and settings">
        <div className="grid w-full max-w-xl gap-4">
          <Field label="A field" help="Help under it." defaultValue="Text" />
          <Field label="A field with a problem" error="Use a number from 0 to 999." defaultValue="lots" />
          <SettingsList title="Settings">
            <Switch label="Read aloud" help="Off unless you turn it on. A child can always tap Hear again." on={voice} onChange={setVoice} />
            <div className="flex flex-col gap-2">
              <span className="font-bold">Theme</span>
              <Radios label="Theme" value={theme} onChange={setTheme} options={[{ value: "system", label: "Like the iPad" }, { value: "light", label: "Light" }, { value: "dark", label: "Dark" }]} />
            </div>
            <StorageStatus persisted={false} lastBackup={null} />
            <StorageStatus persisted lastBackup={new Date(2026, 9, 2)} />
          </SettingsList>
        </div>
      </Row>
      <Row title="Stepper">
        <span className="flex items-center gap-3">
          <TileChip shape="square" size="md" />
          <Stepper label="squares" value={n} onChange={setN} />
        </span>
      </Row>
      <Row title="Backup card">
        <div className="w-full max-w-xl">
          <BackupCard lastBackup={null} onSave={() => toast("Backup saved.")} onRestore={() => toast("Restored.")} />
        </div>
      </Row>
      <Row title="The gate" note="Hold the lock for three seconds, then answer the sum.">
        <div className="w-full">
          <GateDialog key={gate} onOpen={() => toast("Open.")} onLeave={() => setGate((g) => g + 1)} rand={() => 0.25} />
        </div>
      </Row>
    </>
  );
}
