import { retrieveTopFill } from "../../common/retrieveFill";
import { gradientAngle } from "../../common/color";
import { nearestValue } from "../../tailwind/conversionTables";
import { formatOpacity } from "./lvgluiBlend";
import { Modifier } from "./style/styleUtils";

export type LvglColor = {
  opacity: number,
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

export const lvgluiSolidColor = (
  fills: ReadonlyArray<Paint> | PluginAPI["mixed"]
): LvglColor => {
  const fill = retrieveTopFill(fills);

  if (fill && fill.type === "SOLID") {
    // opacity should only be null on set, not on get. But better be prevented.
    const opacity = fill.opacity ?? 1.0;
    return lvgluiColor(fill.color, opacity);
  } else if (fill?.type === "GRADIENT_LINEAR") {
    return lvgluiRGBAColor(fill.gradientStops[0].color);
  } else if (fill?.type === "IMAGE") {
    return lvgluiColor(
      {
        r: 0.5,
        g: 0.23,
        b: 0.27,
      },
      0.5
    );
  }

  return "";
};

export const lvgluiBackground = (
  node: SceneNode,
  fills: ReadonlyArray<Paint> | PluginAPI["mixed"]
): Modifier[] | null => {
  const fill = retrieveTopFill(fills);

  if (fill && fill.type === "SOLID") {
    const item = lvgluiColor(fill.color, fill.opacity);
    return [
      ["bg_color", item.color],
      ["bg_opa", item.opacity]
    ];
  } else if (fill?.type === "GRADIENT_LINEAR") {
    return lvgluiGradient(fill);
  } else if (fill?.type === "IMAGE") {
    return [
      ["bg_image_src", "image_name"]
    ];
  }

  return null;
};

export const lvgluiGradient = (fill: GradientPaint): Modifier[] => {
  const result: Modifier[] = [];

  const direction = gradientDirection(gradientAngle(fill));
  result.push(["bg_grad_dir", direction]);

  const lastGradientStop = fill.gradientStops[fill.gradientStops.length - 1];
  const gradientColor = lvgluiRGBAColor(lastGradientStop.color);
  result.push(["bg_grad_color", gradientColor.color]);
  result.push(["bg_grad_opa", gradientColor.opacity]);

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
    color: `lv_color_make(${color.r}, ${color.g}, ${color.b})`
  };
};