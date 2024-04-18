import { getRawPadding } from "../../common/commonPadding";
import { nodeSize } from "../../common/nodeWidthHeight";

export const lvgluiSize = (
  node: SceneNode,
  optimizeLayout: boolean
): { width: string; height: string } => {
  const size = nodeSize(node, optimizeLayout);
  const propWidth = processSize(node, size.width, true);
  const propHeight = processSize(node, size.height, false);

  return { width: propWidth, height: propHeight };
};

const processSize = (node: SceneNode, length: "fill" | number | null, hor: boolean): string => {
  if (typeof length === "number") {
    let result = adjustPadding(length, node, hor);
    return Math.round(result).toString();
  } else if (length === "fill") {
    return "LV_SIZE_CONTENT";
  } else {
    return "LV_SIZE_CONTENT";
  }
}

function adjustPadding(length: number, node: SceneNode, hor: boolean) {
  let result = length;
  if ("paddingLeft" in node) {
    const padding = getRawPadding(node);
    result += hor ? padding.left + padding.right : padding.top + padding.bottom;
  }
  return result;
}