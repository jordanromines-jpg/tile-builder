/* The app's name as a toy (sprint 2, change 6): three tiles leaning together beside "Tile Steps". */
import { APP_NAME } from "../../strings";
import { TilePicture } from "../TileChip";

export function Wordmark() {
  return (
    <h1 className="ts-wordmark flex items-center gap-3 font-display text-[44px] font-bold leading-none text-ink-1">
      <span className="flex items-end" aria-hidden="true">
        <span className="-rotate-6">
          <TilePicture shape="square" colour="red" px={40} />
        </span>
        <span className="-ml-2 -translate-y-2 rotate-3">
          <TilePicture shape="tri-equilateral" colour="yellow" px={40} />
        </span>
        <span className="-ml-2 rotate-6">
          <TilePicture shape="square" colour="blue" px={40} />
        </span>
      </span>
      {APP_NAME}
    </h1>
  );
}
