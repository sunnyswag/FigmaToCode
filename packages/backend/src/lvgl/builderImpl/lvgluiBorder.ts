import { commonStroke } from "../../common/commonStroke";
import { getCommonRadius } from "../../common/commonRadius";
import { sliceNum } from "../../common/numToAutoFixed";
import { lvglUISolidColor } from "./lvgluiColor";
import { Modifier, LvglUIStyle } from "./lvgluiStyle";

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

/**
 * Generate border or an overlay with stroke.
 * In Flutter and Tailwind, setting the border sets for both fill and stroke. Not in lvglUI.
 * This method, therefore, only serves for the stroke/border and not for roundness of the layer behind.
 * Also, it only works when there is a fill. When there isn't, [lvgluiShapeStroke] should be used.
 *
 * @param node with hopefully a fill object in [node.strokes].
 * @returns a string with overlay, when there node has a corner radius, or just border. If no color is found in node.strokes, return "".
 */
export const lvgluiBorder = (node: SceneNode): string[] | null => {
  if (!("strokes" in node) || !node.strokes || node.strokes.length === 0) {
    return null;
  }

  const width = lvglUIStroke(node);
  const inset = strokeInset(node, width);

  if (!width) {
    return null;
  }

  return node.strokes
    .map((stroke) => {
      const strokeColor = lvglUISolidColor(stroke);

      const strokeModifier: Modifier = [
        "stroke",
        `${strokeColor}, lineWidth: ${sliceNum(width)}`,
      ];

      if (strokeColor) {
        return new LvglUIStyle(getViewType(node))
          .pushModifier(inset)
          .pushModifier(strokeModifier)
          .toString();
      }

      return null;
    })
    .filter((d) => d !== null) as string[];
};

const getViewType = (node: SceneNode): string => {
  if (node.type === "ELLIPSE") {
    return "Ellipse()";
  }

  const corner = lvgluiCornerRadius(node);
  if (corner) {
    return `RoundedRectangle(cornerRadius: ${corner})`;
  } else {
    return "Rectangle()";
  }
};

const strokeInset = (
  node: MinimalStrokesMixin,
  width: number
): [string, string | null] => {
  switch (node.strokeAlign) {
    case "INSIDE":
      return ["inset", `by: ${sliceNum(width)}`];
    case "OUTSIDE":
      return ["inset", `by: -${sliceNum(width)}`];
    case "CENTER":
      return ["inset", null];
  }
};

/**
 * Produce a Rectangle with border radius.
 * The reason this was extracted into its own method is for reusability in [lvgluiBorder],
 * where a RoundedRectangle is needed again to be part of the overlay.
 *
 * @param node with cornerRadius and topLeftRadius properties.
 * @returns a string with RoundedRectangle, if node has a corner larger than zero; else "".
 */
export const lvgluiCornerRadius = (node: SceneNode): string => {
  const radius = getCommonRadius(node);
  if ("all" in radius) {
    if (radius.all > 0) {
      return sliceNum(radius.all);
    } else {
      return "";
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
    return sliceNum(maxBorder);
  }

  return "";
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
