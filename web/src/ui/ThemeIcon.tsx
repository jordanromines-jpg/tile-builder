import type { IconProps } from "@phosphor-icons/react";
import type { ComponentType } from "react";
import type { Theme } from "../engine/themes";
import { Bridge, Car, CastleTurret, Flower, FlowerTulip, House, Jeep, PawPrint, Rocket, Sparkle } from "./icons";

const ICON: Record<Theme, ComponentType<IconProps>> = {
  castles: CastleTurret,
  homes: House,
  vehicles: Car,
  space: Rocket,
  animals: PawPrint,
  gardens: Flower,
  bridges: Bridge,
  patterns: Sparkle,
  trucks: Jeep,
  flowers: FlowerTulip,
};

export function ThemeIcon({ theme, size = 40 }: { theme: Theme; size?: number }) {
  const Icon = ICON[theme];
  return <Icon size={size} weight="duotone" aria-hidden="true" />;
}
