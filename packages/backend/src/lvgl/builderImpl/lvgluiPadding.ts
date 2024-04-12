import { commonPadding } from "../../common/commonPadding";
import { Modifier } from "./style/styleUtils";

export const lvgluiPadding = (
  node: InferredAutoLayoutResult
): Modifier[] | null => {
  if (!("layoutMode" in node)) {
    return null;
  }

  const padding = commonPadding(node);
  if (!padding) {
    return null;
  }

  const result: Modifier[] = [];
  if ("all" in padding) {
    pushPadding(result, padding.all, "all")
    return result;
  }
  
  if ("horizontal" in padding) {
    pushPadding(result, padding.horizontal, "hor");
    pushPadding(result, padding.vertical, "ver");
    return result;
  }

  pushPadding(result, padding.top, "top");
  pushPadding(result, padding.left, "left");
  pushPadding(result, padding.bottom, "bottom");
  pushPadding(result, padding.right, "right");

  return result;
};

const pushPadding = (result: Modifier[], padding: number, operationName: string): void => {
  if (padding === 0) {
    result.push([`pad_${operationName}`, Math.round(padding)])
  }
}