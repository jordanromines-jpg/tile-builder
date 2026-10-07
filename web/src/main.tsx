import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { applyTheme } from "./ground";
import { router } from "./router";
import { startPwa, warmPictures } from "./pwa";
import { OfflineNote, showOfflineNote } from "./OfflineNote";
import { SettingsSync } from "./SettingsSync";
import { ToastProvider } from "./ui/grownups/Toast";
import "./app.css";

applyTheme();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ToastProvider>
      <RouterProvider router={router} />
      <OfflineNote />
      <SettingsSync />
    </ToastProvider>
  </StrictMode>,
);

startPwa(showOfflineNote);
warmPictures();
