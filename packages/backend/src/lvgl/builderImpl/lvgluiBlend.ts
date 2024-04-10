import { sliceNum } from "../../common/numToAutoFixed";
import { Modifier } from "./lvgluiStyle";

/**
 * https://developer.apple.com/documentation/lvglui/view/opacity(_:)
 */
export const lvgluiOpacity = (node: MinimalBlendMixin): Modifier | null => {
  if (node.opacity !== undefined && node.opacity !== 1) {
    let opacity = Math.max(0, Math.min(255, Math.round(node.opacity * 255)));
    return ["lv_obj_set_style_opa", opacity];
  }
  return null;
};

export const lvgluiVisibility = (node: SceneNodeMixin): Modifier | null => {
  // [when testing] node.visible can be undefined
  if (node.visible !== undefined && !node.visible) {
    return ["lv_obj_add_flag", "LV_OBJ_FLAG_HIDDEN"];
  }
  return null;
};

export const lvgluiRotation = (node: LayoutMixin): Modifier | null => {
  return null;
};

export const blendModeEnum = (node: MinimalBlendMixin): string => {
  switch (node.blendMode) {
    case "COLOR":
      return ".color";
    case "COLOR_BURN":
      return ".colorBurn";
    case "COLOR_DODGE":
      return ".colorDodge";
    case "DIFFERENCE":
      return ".difference";
    case "EXCLUSION":
      return ".exclusion";
    case "HARD_LIGHT":
      return ".hardLight";
    case "HUE":
      return ".hue";
    case "LIGHTEN":
      return ".lighten";
    case "LUMINOSITY":
      return ".luminosity";
    case "MULTIPLY":
      return ".multiply";
    case "OVERLAY":
      return ".overlay";
    case "SATURATION":
      return ".saturation";
    case "SCREEN":
      return ".screen";
    case "SOFT_LIGHT":
      return ".softLight";
    default:
      // PASS_THROUGH, NORMAL, LINEAR_DODGE
      return "";
  }
};
