import { sliceNum } from "../../common/numToAutoFixed";
import { Style } from "./lvgluiParser";

/**
 * https://developer.apple.com/documentation/lvglui/view/opacity(_:)
 */
export const lvgluiOpacity = (node: MinimalBlendMixin): Style | null => {
  if (node.opacity !== undefined && node.opacity !== 1) {
    return ["opacity", sliceNum(node.opacity)];
  }
  return null;
};

/**
 * https://developer.apple.com/documentation/lvglui/view/hidden()
 */
export const lvgluiVisibility = (node: SceneNodeMixin): Style | null => {
  // [when testing] node.visible can be undefined
  if (node.visible !== undefined && !node.visible) {
    return ["hidden", ""];
  }
  return null;
};

/**
 * https://developer.apple.com/documentation/lvglui/modifiedcontent/rotationeffect(_:anchor:)
 */
export const lvgluiRotation = (node: LayoutMixin): Style | null => {
  if (node.rotation !== undefined && Math.round(node.rotation) !== 0) {
    return ["rotationEffect", `.degrees(${sliceNum(node.rotation)})`];
  }
  return null;
};

/**
 * https://developer.apple.com/documentation/lvglui/blendmode
 */
export const lvgluiBlendMode = (node: MinimalBlendMixin): Style | null => {
  const fromBlendEnum = blendModeEnum(node);
  if (fromBlendEnum) {
    return ["blendMode", fromBlendEnum];
  }

  return null;
};

const blendModeEnum = (node: MinimalBlendMixin): string => {
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
