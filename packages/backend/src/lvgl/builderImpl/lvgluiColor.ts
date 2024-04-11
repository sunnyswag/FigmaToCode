import { retrieveTopFill } from "../../common/retrieveFill";
import { gradientAngle } from "../../common/color";
import { nearestValue } from "../../tailwind/conversionTables";
import { formatOpacity } from "./lvgluiBlend";


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
): LvglColor => {
  const fill = retrieveTopFill(fills);

  if (fill && fill.type === "SOLID") {
    // opacity should only be null on set, not on get. But better be prevented.
    const opacity = fill.opacity ?? 1.0;
    return lvgluiColor(fill.color, opacity);
  } else if (fill?.type === "GRADIENT_LINEAR") {
    return lvgluiGradient(fill);
  } else if (fill?.type === "IMAGE") {
    return `AsyncImage(url: URL(string: "https://via.placeholder.com/${node.width.toFixed(
      0
    )}x${node.height.toFixed(0)}"))`;
  }

  return "";
};

export const lvgluiGradient = (fill: GradientPaint): string => {
  const direction = gradientDirection(gradientAngle(fill));

  const colors = fill.gradientStops
    .map((d) => {
      return lvgluiColor(d.color, d.color.a);
    })
    .join(", ");

  return `LinearGradient(gradient: Gradient(colors: [${colors}]), ${direction})`;
};

const gradientDirection = (angle: number): string => {
  switch (nearestValue(angle, [-180, -135, -90, -45, 0, 45, 90, 135, 180])) {
    case 0:
      return "startPoint: .leading, endPoint: .trailing";
    case 45:
      return "startPoint: .topLeading, endPoint: .bottomTrailing";
    case 90:
      return "startPoint: .top, endPoint: .bottom";
    case 135:
      return "startPoint: .topTrailing, endPoint: .bottomLeading";
    case -45:
      return "startPoint: .bottomLeading, endPoint: .topTrailing";
    case -90:
      return "startPoint: .bottom, endPoint: .top";
    case -135:
      return "startPoint: .bottomTrailing, endPoint: .topLeading";
    default:
      // 180 and -180
      return "startPoint: .trailing, endPoint: .leading";
  }
};

export const lvgluiRGBAColor = (color: RGBA) => lvgluiColor(color, color.a);

export const lvgluiColor = (color: RGB, opacity: number | undefined): LvglColor => {
  return {
    opacity: formatOpacity(opacity ?? 1.0),
    color: `lv_color_make(${color.r}, ${color.g}, ${color.b})`
  };
};