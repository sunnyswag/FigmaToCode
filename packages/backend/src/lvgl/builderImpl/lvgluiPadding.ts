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
    pushPadding(result, "all", padding.all)
    return result;
  }
  
  if ("horizontal" in padding) {
    pushPadding(result, "hor", padding.horizontal);
    pushPadding(result, "ver", padding.vertical);
    return result;
  }

  pushPadding(result, "top", padding.top);
  pushPadding(result, "left", padding.left);
  pushPadding(result, "bottom", padding.bottom);
  pushPadding(result, "right", padding.right);

  return result;
};

const pushPadding = (result: Modifier[], operationName: string, padding: number): void => {
  if (Math.round(padding) != 0) {
    result.push([`pad_${operationName}`, Math.round(padding)])
  }
}