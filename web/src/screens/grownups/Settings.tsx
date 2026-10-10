/* Settings (plan keys 5c, 5f): the voice, sound effects, the voice's language, the theme, where things are kept, and
   erasing everything. Each change saves at once. */
import { useEffect, useState } from "react";
import { setTheme, type Theme } from "../../ground";
import { eraseEverything, saveSettings } from "../../store/db";
import { DEFAULT_SETTINGS, useSettings } from "../../store/hooks";
import { requestPersist } from "../../store/storage";
import { Button } from "../../ui/grownups/Button";
import { ConfirmDialog } from "../../ui/grownups/Dialog";
import { Radios, Switch } from "../../ui/grownups/Field";
import { SettingsList } from "../../ui/grownups/SettingsList";
import { StorageStatus } from "../../ui/grownups/StorageStatus";
import { useToast } from "../../ui/grownups/Toast";
import { Frame } from "./Frame";

/** The languages the iPad has voices for, as BCP 47 tags; English first. */
function useVoiceLangs(): string[] {
  const [langs, setLangs] = useState<string[]>([]);
  useEffect(() => {
    if (!("speechSynthesis" in window)) return;
    const read = () => {
      const all = [...new Set(speechSynthesis.getVoices().map((v) => v.lang.replace("_", "-")))];
      all.sort((a, b) => Number(b.startsWith("en")) - Number(a.startsWith("en")) || a.localeCompare(b));
      setLangs(all);
    };
    read();
    speechSynthesis.addEventListener?.("voiceschanged", read);
    return () => speechSynthesis.removeEventListener?.("voiceschanged", read);
  }, []);
  return langs;
}

function langName(tag: string): string {
  try {
    return new Intl.DisplayNames(undefined, { type: "language" }).of(tag) ?? tag;
  } catch {
    return tag;
  }
}

export function Settings() {
  const s = useSettings() ?? DEFAULT_SETTINGS;
  const langs = useVoiceLangs();
  const toast = useToast();
  const [erase, setErase] = useState(false);
  const options = langs.includes(s.lang) || !langs.length ? langs : [s.lang, ...langs];
  return (
    <Frame title="Settings">
      <SettingsList title="Voice and sound">
        <Switch label="Read steps aloud" help="Off unless you turn it on. A child can always tap Hear again." on={s.voice} onChange={(v) => void saveSettings({ voice: v })} />
        <Switch label="Sound effects" help="A click as each tile lands, and a chime when a build is finished. Silent when the iPad is on mute." on={s.soundEffects} onChange={(v) => void saveSettings({ soundEffects: v })} />
        <label className="flex flex-col gap-2">
          <span className="font-bold">The voice's language</span>
          <select
            value={s.lang}
            onChange={(e) => void saveSettings({ lang: e.target.value })}
            className="min-h-11 rounded-md border-2 border-line bg-surface px-3 text-ink-1"
          >
            {(options.length ? options : [s.lang]).map((l) => (
              <option key={l} value={l}>
                {langName(l)} ({l})
              </option>
            ))}
          </select>
        </label>
      </SettingsList>

      <SettingsList title="Look">
        <div className="flex flex-col gap-2">
          <span className="font-bold">Light or dark</span>
          <Radios<Theme>
            label="Light or dark"
            value={s.theme}
            onChange={(t) => {
              setTheme(t);
              void saveSettings({ theme: t });
            }}
            options={[
              { value: "system", label: "Like the iPad" },
              { value: "light", label: "Light" },
              { value: "dark", label: "Dark" },
            ]}
          />
        </div>
      </SettingsList>

      <SettingsList title="Where things are kept">
        <StorageStatus persisted={s.persisted} lastBackup={s.lastBackup ? new Date(s.lastBackup) : null} />
        {!s.persisted && (
          <div className="flex flex-col gap-2">
            <p className="text-ink-2">Everything stays on this iPad: no account, nothing sent anywhere. Opened from the Home Screen, the iPad keeps it.</p>
            <Button
              className="self-start"
              onClick={async () => {
                const p = await requestPersist();
                await saveSettings({ persisted: p });
                toast(p ? "The iPad will keep your tiles." : "The iPad didn't promise. Keep a backup.");
              }}
            >
              Ask the iPad to keep it
            </Button>
          </div>
        )}
        <div className="flex flex-col gap-2">
          <span className="font-bold">Start again</span>
          <Button kind="danger" className="self-start" onClick={() => setErase(true)}>
            Erase everything on this iPad
          </Button>
        </div>
      </SettingsList>
      <ConfirmDialog
        open={erase}
        onOpenChange={setErase}
        title="Erase everything on this iPad?"
        description="Your tiles, settings and builds in progress go. A backup file you saved is not touched."
        confirm="Erase"
        danger
        typeWord="ERASE"
        onConfirm={async () => {
          await eraseEverything();
          setTheme("system");
          toast("Erased.");
        }}
      />
    </Frame>
  );
}
