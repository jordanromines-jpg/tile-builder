/* The first-run cards (plan key 5b, D10), each shown once, for grown-ups:
   in a Safari tab on an iPad, "Add this to your Home Screen first, so it keeps your tiles", with the two taps drawn;
   in the app, "Stand the iPad up beside the tiles and build together." */
import { LookPicker } from "../ui/LookPicker";
import { useState } from "react";
import type { Settings } from "../engine/types";
import { saveSettings } from "../store/db";
import { firstRunCard } from "../store/storage";
import { S } from "../strings";
import { Button } from "../ui/grownups/Button";
import { Dialog } from "../ui/grownups/Dialog";
import { Plus, UploadSimple } from "../ui/icons";

export function FirstRunCard({ settings }: { settings: Settings }) {
  const [which] = useState(() => firstRunCard(settings));
  const [open, setOpen] = useState(which !== null);
  if (!which) return null;
  const close = () => {
    setOpen(false);
    void saveSettings(which === "home" ? { homeScreenCardSeen: true } : { firstRunSeen: true });
  };
  return (
    <Dialog open={open} onOpenChange={(o) => !o && close()} title={which === "home" ? S.firstRun.homeTitle : S.firstRun.buildTitle} wide={which !== "home"}>
      {which === "home" ? (
        <ol className="mb-4 flex flex-col gap-3">
          <li className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-md bg-surface-3">
              <UploadSimple size={24} weight="bold" aria-hidden="true" />
            </span>
            {S.firstRun.share}
          </li>
          <li className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-md bg-surface-3">
              <Plus size={24} weight="bold" aria-hidden="true" />
            </span>
            {S.firstRun.add}
          </li>
        </ol>
      ) : (
        <>
          <p className="mb-4 text-ink-2">{S.firstRun.buildBody}</p>
          <p className="mb-2 font-bold text-ink-1">{S.firstRun.pickLook}</p>
          <div className="mb-4">
            <LookPicker size="small" />
          </div>
        </>
      )}
      <div className="flex justify-end">
        <Button kind="lit" onClick={close}>
          {S.firstRun.ok}
        </Button>
      </div>
    </Dialog>
  );
}
