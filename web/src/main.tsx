import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { applyTheme } from "./ground";
import { router } from "./router";
import { startPwa } from "./pwa";
import { OfflineNote, showOfflineNote } from "./OfflineNote";
import "./app.css";

applyTheme();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
    <OfflineNote />
  </StrictMode>,
);

startPwa(showOfflineNote);
