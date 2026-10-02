/* A toast (plan key 2q): one line, polite, gone after five seconds. `useToast()` shows one from anywhere inside. */
import * as T from "@radix-ui/react-toast";
import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

const Ctx = createContext<(text: string) => void>(() => {});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<{ id: number; text: string }[]>([]);
  const show = useCallback((text: string) => setItems((xs) => [...xs, { id: Date.now() + Math.random(), text }]), []);
  return (
    <Ctx.Provider value={show}>
      <T.Provider duration={5000}>
        {children}
        {items.map((t) => (
          <T.Root
            key={t.id}
            onOpenChange={(o) => {
              if (!o) setItems((xs) => xs.filter((x) => x.id !== t.id));
            }}
            className="rounded-md bg-ink-1 px-4 py-3 text-surface shadow-lg"
          >
            <T.Description>{t.text}</T.Description>
          </T.Root>
        ))}
        <T.Viewport className="fixed bottom-6 left-1/2 z-50 flex w-[min(420px,calc(100vw-32px))] -translate-x-1/2 flex-col gap-2" />
      </T.Provider>
    </Ctx.Provider>
  );
}

export function useToast(): (text: string) => void {
  return useContext(Ctx);
}
