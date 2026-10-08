/* Keeps the voice and its language in step with the stored settings, and on the first run asks the browser to keep the
   store (plan key 5b). The theme is not synced here: ground.ts keeps it per device and applies it before the first paint,
   and Settings, Restore and Erase set it directly. */
import { useEffect } from "react";
import { setSoundOn } from "./sound/sound";
import { configureSpeech } from "./speech/say";
import { saveSettings } from "./store/db";
import { useSettings } from "./store/hooks";
import { requestPersist } from "./store/storage";

export function SettingsSync() {
  const s = useSettings();
  useEffect(() => {
    if (!s) return;
    configureSpeech({ enabled: s.voice, lang: s.lang });
  }, [s?.voice, s?.lang]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (s) setSoundOn(s.soundEffects);
  }, [s?.soundEffects]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (s && s.persisted === null) void requestPersist().then((p) => saveSettings({ persisted: p ?? false }));
  }, [s?.persisted]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}
