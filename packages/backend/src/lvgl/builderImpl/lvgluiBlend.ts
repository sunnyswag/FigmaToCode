import { getCommonCenterXY } from "../../common/commonPosition";
import { Modifier } from "./style/styleUtils";

export const formatOpacity = (opacity: number): string => {
  switch (numFormat(opacity)) {
    case 0:
      return "LV_OPA_TRANSP";
    case 25:
      return "LV_OPA_10";
    case 51:
      return "LV_OPA_20";
    case 76:
      return "LV_OPA_30";
    case 102:
      return "LV_OPA_40";
    case 127:
      return "LV_OPA_50";
    case 153:
      return "LV_OPA_60";
    case 178:
      return "LV_OPA_70";
    case 204:
      return "LV_OPA_80";
    case 229:
      return "LV_OPA_90";
    case 255:
      return "LV_OPA_COVER";
    default:
      return numFormat(opacity).toString();
  };
}

export const lvgluiVisibility = (node: SceneNodeMixin): Modifier | null => {
  // [when testing] node.visible can be undefined
  if (node.visible !== undefined && !node.visible) {
    return ["add_flag", "LV_OBJ_FLAG_HIDDEN"];
  }
  return null;
};

export const lvgluiRotation = (node: LayoutMixin & SceneNode): Modifier[] | null => {
  const rotation = Math.round(node.rotation);
  if (rotation == 0) return null;
  
  const {centerX, centerY} = getCommonCenterXY(node)
  return [
    ["transform_rotation", -Math.round(rotation * 10)],
    ["transform_pivot_x", Math.round(centerX)],
    ["transform_pivot_y", Math.round(centerY)]
  ];
};

export const blendModeEnum = (node: MinimalBlendMixin): string => {
  switch (node.blendMode) {
    case "DIFFERENCE":
    case "EXCLUSION":
      return "LV_BLEND_MODE_SUBTRACTIVE";
    case "MULTIPLY":
      return "LV_BLEND_MODE_MULTIPLY";
    default:
      // PASS_THROUGH, NORMAL, LINEAR_DODGE
      return "";
  }
};

export const numFormat = (source: number): number => {
  return Math.max(0, Math.min(255, Math.round(source * 255)));
}
