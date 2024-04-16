import { retrieveTopFill } from "../../common/retrieveFill";
import { gradientAngle } from "../../common/color";
import { nearestValue } from "../../tailwind/conversionTables";
import { formatOpacity, numFormat } from "./lvgluiBlend";
import { Modifier } from "./style/styleUtils";

export type LvglColor = {
  opacity: number | null,
  color: string
}

export const lvglUISolidColor = (fill: Paint): LvglColor | null => {
  if (fill && fill.type === "SOLID") {
    return lvgluiColor(fill.color, fill.opacity);
  } else if (
    fill &&
    (fill.type === "GRADIENT_LINEAR" ||
      fill.type === "GRADIENT_ANGULAR" ||
      fill.type === "GRADIENT_RADIAL")
  ) {
    if (fill.gradientStops.length > 0) {
      return lvgluiColor(fill.gradientStops[0].color, fill.opacity);
    }
  }

  return null;
};

export const lvgluiTextColor = (
  fills: ReadonlyArray<Paint> | PluginAPI["mixed"]
): Modifier[] | null => {
  return lvglCommonColorLogic("", fills);
};

export const lvgluiBackground = (
  fills: ReadonlyArray<Paint> | PluginAPI["mixed"]
): Modifier[] | null => {
  return lvglCommonColorLogic("bg_", fills);
};

const lvglCommonColorLogic = (
  prefix: string, 
  fills: ReadonlyArray<Paint> | PluginAPI["mixed"]
): Modifier[] | null => {
  const fill = retrieveTopFill(fills);

  if (fill && fill.type === "SOLID") {
    const item = lvgluiColor(fill.color, fill.opacity);
    if (item.opacity) {
      return [
        [`${prefix}color`, item.color],
        [`${prefix}opa`, item.opacity]
      ];
    } else {
      return [
        [`${prefix}color`, item.color]
      ];
    }
  } else if (fill?.type === "GRADIENT_LINEAR") {
    return lvgluiGradient(prefix, fill);
  } else if (fill?.type === "IMAGE") {
    return [
      [`${prefix}image_src`, "image_name"]
    ];
  }

  return null;
}

const lvgluiGradient = (prefix: string, fill: GradientPaint): Modifier[] => {
  const result: Modifier[] = [];

  const direction = gradientDirection(gradientAngle(fill));
  result.push([`${prefix}grad_dir`, direction]);

  const lastGradientStop = fill.gradientStops[fill.gradientStops.length - 1];
  const gradientColor = lvgluiRGBAColor(lastGradientStop.color);
  result.push([`${prefix}grad_color`, gradientColor.color]);
  if (gradientColor.opacity)
    result.push([`${prefix}grad_opa`, gradientColor.opacity]);

  return result;
};

const gradientDirection = (angle: number): string => {
  switch (nearestValue(angle, [-180, -90, 0, 90, 180])) {
    case 90:
      return "LV_GRAD_DIR_VER";
    case -90:
      return "LV_GRAD_DIR_VER";
    default:
      // 0, 180 and -180
      return "LV_GRAD_DIR_HOR";
  }
};

export const lvgluiRGBAColor = (color: RGBA) => lvgluiColor(color, color.a);

export const lvgluiColor = (color: RGB, opacity: number | undefined): LvglColor => {
  return {
    opacity: formatOpacity(opacity ?? 1.0),
    color: `lv_color_make(${numFormat(color.r)}, ${numFormat(color.g)}, ${numFormat(color.b)})`
  };
};