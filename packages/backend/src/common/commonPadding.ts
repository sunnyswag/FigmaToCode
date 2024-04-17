type PaddingType =
  | { all: number }
  | {
      horizontal: number;
      vertical: number;
    }
  | {
      left: number;
      right: number;
      top: number;
      bottom: number;
    };

export const getRawPadding = (node: InferredAutoLayoutResult): {
  left: number;
  right: number;
  top: number;
  bottom: number;
} | null => {
  if ("layoutMode" in node && node.layoutMode !== "NONE") {
    return {
      left: parseFloat((node.paddingLeft ?? 0).toFixed(2)),
      right: parseFloat((node.paddingRight ?? 0).toFixed(2)),
      top: parseFloat((node.paddingTop ?? 0).toFixed(2)),
      bottom: parseFloat((node.paddingBottom ?? 0).toFixed(2))
    }
  } else {
    return null;
  }
}

export const commonPadding = (
  node: InferredAutoLayoutResult
): PaddingType | null => {
  const padRaw = getRawPadding(node);
  if (padRaw) {
    if (
      padRaw.left === padRaw.right &&
      padRaw.left === padRaw.bottom &&
      padRaw.top === padRaw.bottom
    ) {
      return { all: padRaw.left };
    } else if (padRaw.left === padRaw.right && padRaw.top === padRaw.bottom) {
      return {
        horizontal: padRaw.left,
        vertical: padRaw.top,
      };
    } else {
      return {
        left: padRaw.left,
        right: padRaw.right,
        top: padRaw.top,
        bottom: padRaw.bottom,
      };
    }
  } else {
    return null;
  }
};
