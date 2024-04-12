import { Modifier } from "./lvgluiStyle";
import { lvgluiRGBAColor } from "./lvgluiColor";

export const lvgluiShadow = (node: SceneNode): Modifier[] | null => {
  if (!("effects" in node) || node.effects.length === 0) {
    return null;
  }

  const dropShadow: Array<DropShadowEffect> = node.effects.filter(
    (d): d is DropShadowEffect => d.type === "DROP_SHADOW" && d.visible
  );

  if (dropShadow.length === 0) {
    return null;
  }

  // retrieve first shadow.
  const shadow = dropShadow[0];
  const result: Modifier[] = [];

  const color = lvgluiRGBAColor(shadow.color);
  result.push(["shadow_color", color.color]);
  result.push(["shadow_opa", color.opacity]);
  result.push(["shadow_width", Math.round(shadow.radius)]);
  if (shadow.spread) {
    result.push(["shadow_spread", Math.round(shadow.spread)]);
  }

  if (shadow.offset.x) {
    result.push(["shadow_ofs_x", Math.round(shadow.offset.x)]);
  }

  if (shadow.offset.y) {
    result.push(["shadow_ofs_y", Math.round(shadow.offset.y)]);
  }

  return result;
};
