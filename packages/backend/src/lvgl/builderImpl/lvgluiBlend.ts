import { sliceNum } from "../../common/numToAutoFixed";
import { Modifier } from "./lvgluiStyle";

/**
 * https://developer.apple.com/documentation/lvglui/view/opacity(_:)
 */
export const lvgluiOpacity = (node: MinimalBlendMixin): Modifier | null => {
  if (node.opacity !== undefined && node.opacity !== 1) {
    let opacity = Math.max(0, Math.min(255, Math.round(node.opacity * 255)));
    return ["set_style_opa", opacity];
  }
  return null;
};

export const lvgluiVisibility = (node: SceneNodeMixin): Modifier | null => {
  // [when testing] node.visible can be undefined
  if (node.visible !== undefined && !node.visible) {
    return ["add_flag", "LV_OBJ_FLAG_HIDDEN"];
  }
  return null;
};

export const lvgluiRotation = (node: LayoutMixin): Modifier | null => {
  return null;
};

export const blendModeEnum = (node: MinimalBlendMixin): string => {
  switch (node.blendMode) {
    case "DIFFERENCE":
      return "LV_BLEND_MODE_SUBTRACTIVE";
    case "EXCLUSION":
      return "LV_BLEND_MODE_SUBTRACTIVE";
    case "MULTIPLY":
      return "LV_BLEND_MODE_MULTIPLY";
    default:
      // PASS_THROUGH, NORMAL, LINEAR_DODGE
      return "";
  }
};
