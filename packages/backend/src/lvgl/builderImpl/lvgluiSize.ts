import { nodeSize } from "../../common/nodeWidthHeight";

export const lvgluiSize = (
  node: SceneNode,
  optimizeLayout: boolean
): { width: string; height: string } => {
  const size = nodeSize(node, optimizeLayout);
  const propWidth = processSize(size.width);
  const propHeight = processSize(size.height);

  return { width: propWidth, height: propHeight };
};

const processSize = (length: "fill" | number | null): string => {
  if (typeof length === "number") {
    return Math.round(length).toString();
  } else if (length === "fill") {
    return "LV_SIZE_CONTENT";
  } else {
    return "LV_SIZE_CONTENT";
  }
}