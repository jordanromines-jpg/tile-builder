/* The grown-ups door (D21): a small lock at the top right. A tap says "This door is for grown-ups." and opens the
   gate (the grown-ups side asks for a hold and a sum before it opens). */
import { useNavigate } from "@tanstack/react-router";
import { say } from "../../speech/say";
import { S } from "../../strings";
import { Lock } from "../icons";

export function GrownUpsDoor() {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      aria-label={S.kid.doorLabel}
      onClick={() => {
        say(S.kid.door);
        void navigate({ to: "/grownups" });
      }}
      className="ts-door kid grid h-11 w-11 place-items-center rounded-full border border-line bg-surface-2 text-ink-2"
    >
      <Lock size={22} weight="bold" aria-hidden="true" />
    </button>
  );
}
