/* Keeps the parts outside React in step with the stored settings: the voice and its language, and the theme. On the
   first run it also asks the browser to keep the store (plan key 5b). */
import { useEffect } from "react";
import { setTheme } from "./ground";
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
    if (s) setTheme(s.theme);
  }, [s?.theme]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (s && s.persisted === null) void requestPersist().then((p) => saveSettings({ persisted: p ?? false }));
  }, [s?.persisted]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}
