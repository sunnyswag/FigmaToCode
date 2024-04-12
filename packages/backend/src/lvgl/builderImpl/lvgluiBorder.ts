import { commonStroke } from "../../common/commonStroke";
import { getCommonRadius } from "../../common/commonRadius";
import { lvglUISolidColor } from "./lvgluiColor";
import { Modifier, LvglUIStyle } from "./lvgluiStyle";


export const lvgluiBorder = (node: SceneNode): Modifier[] | null => {
  if (!("strokes" in node) || !node.strokes || node.strokes.length === 0) {
    return null;
  }
  
  const width = lvglUIStroke(node);
  const inset = strokeInset(node, width);
  
  if (!width) {
    return null;
  }
  const color = lvglUISolidColor(node.strokes[0]);
  if (!color) {
    return null;
  }
  
  return inset.strokeType.flatMap((type) => {
    return [
      [`${type}_width`, inset.width],
      [`${type}_color`, color.color],
      [`${type}_opa`, color.opacity]
    ]
  })
};

const lvglUIStroke = (node: SceneNode): number => {
  if (!("strokes" in node) || !node.strokes || node.strokes.length === 0) {
    return 0;
  }

  const stroke = commonStroke(node, 2);

  if (!stroke) {
    return 0;
  }

  if ("all" in stroke) {
    return stroke.all;
  }

  return Math.max(stroke.left, stroke.top, stroke.right, stroke.bottom);
};

const strokeInset = (
  node: MinimalStrokesMixin,
  width: number
): {
  strokeType: string[],
  width: number
} => {
  switch (node.strokeAlign) {
    case "INSIDE":
      return {
        strokeType: ["border"],
        width: width
      };
    case "OUTSIDE":
      return {
        strokeType: ["outline"],
        width: width
      };
    case "CENTER":
      return {
        strokeType: ["border", "outline"],
        width: width / 2
      };
  }
};


export const lvgluiCornerRadius = (node: SceneNode): number | null => {
  const radius = getCommonRadius(node);
  if ("all" in radius) {
    if (radius.all > 0) {
      return Math.round(radius.all);
    } else {
      return null;
    }
  }

  // lvglUI doesn't support individual corner radius, so get the largest one
  const maxBorder = Math.max(
    radius.topLeft,
    radius.topRight,
    radius.bottomLeft,
    radius.bottomRight
  );

  if (maxBorder > 0) {
    return Math.round(maxBorder);
  }

  return null;
};

/**
 * Produce a Rectangle with border radius.
 * The reason this was extracted into its own method is for reusability in [lvgluiBorder],
 * where a RoundedRectangle is needed again to be part of the overlay.
 *
 * @param node with cornerRadius and topLeftRadius properties.
 * @returns a string with RoundedRectangle, if node has a corner larger than zero; else "".
 */
export const lvgluiRoundedRectangle = (node: SceneNode): string => {
  const corner = lvgluiCornerRadius(node);
  if (corner) {
    return `RoundedRectangle(cornerRadius: ${corner})`;
  }

  return "";
};
