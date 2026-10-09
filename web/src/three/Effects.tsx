/* The look's effects for this tier (3.0): ambient occlusion where tiles meet, a soft glow, a vignette. Nothing is drawn
   (and no extra pass is made) when the look asks for none, which `low` always does. */
import { Bloom, EffectComposer, N8AO, Vignette } from "@react-three/postprocessing";
import type { StageEffects } from "../looks/stage";

export function Effects({ fx }: { fx: StageEffects }) {
  if (!fx.ao && !fx.bloom && !fx.vignette) return null;
  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <>{fx.ao && <N8AO aoRadius={fx.ao.radius} intensity={fx.ao.intensity} color={fx.ao.color ?? "black"} halfRes quality="performance" />}</>
      <>{fx.bloom && <Bloom intensity={fx.bloom.intensity} luminanceThreshold={fx.bloom.threshold} mipmapBlur />}</>
      <>{fx.vignette && <Vignette darkness={fx.vignette.darkness} offset={fx.vignette.offset} />}</>
    </EffectComposer>
  );
}
