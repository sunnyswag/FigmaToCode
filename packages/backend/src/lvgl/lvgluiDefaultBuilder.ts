import { sliceNum } from "./../common/numToAutoFixed";
import { lvgluiPadding } from "./builderImpl/lvgluiPadding";
import { lvgluiSize } from "./builderImpl/lvgluiSize";

import {
  lvgluiVisibility,
  lvgluiOpacity,
  lvgluiRotation,
} from "./builderImpl/lvgluiBlend";
import {
  commonIsAbsolutePosition,
  getCommonPositionValue,
} from "../common/commonPosition";
import { Modifier, pushModifier } from "./builderImpl/lvgluiStyle";
import { LvglUIStyle } from "./builderImpl/lvgluiStyle";

export class LvgluiDefaultBuilder {
  private currentNodeName: string;
  private parentNodeName: string;
  private styleIndex: number;
  private modifiers: Modifier[] = []

  constructor(currentNodeName: string, parentNodeName: string, styleIndex: number) {
    this.parentNodeName = parentNodeName;
    this.currentNodeName = currentNodeName;
    this.styleIndex = styleIndex;
  }

  commonPositionModifiers(node: SceneNode, optimizeLayout: boolean): this {
    this.position(node, optimizeLayout);
    if ("layoutAlign" in node && "opacity" in node) {
      this.opacity(node);
    }
    return this;
  }

  opacity(node: SceneNode & LayoutMixin & MinimalBlendMixin): this {
    this.pushModifier(
      lvgluiVisibility(node),
      lvgluiRotation(node),
      lvgluiOpacity(node)
    );

    return this;
  }

  topLeftToCenterOffset(
    x: number,
    y: number,
    node: SceneNode,
    parent: (BaseNode & ChildrenMixin) | null
  ): { centerX: number; centerY: number } {
    if (!parent || !("width" in parent)) {
      return { centerX: 0, centerY: 0 };
    }
    // Find the child's center coordinates
    const centerX = x + node.width / 2;
    const centerY = y + node.height / 2;

    // Calculate the center-based offset
    const centerBasedX = centerX - parent.width / 2;
    const centerBasedY = centerY - parent.height / 2;

    return { centerX: centerBasedX, centerY: centerBasedY };
  }

  position(node: SceneNode, optimizeLayout: boolean): this {
    if (commonIsAbsolutePosition(node, optimizeLayout)) {
      const { x, y } = getCommonPositionValue(node);

      this.pushModifier([
        `lv_obj_align`,
        `${this.parentNodeName}, ${Math.round(x)}, ${Math.round(y)}`,
      ]);
    }
    return this;
  }

  size(node: SceneNode, optimize: boolean): this {
    const { width, height } = lvgluiSize(node, optimize);
    const sizes = [width, height].filter((d) => d);
    if (sizes.length > 0) {
      this.pushModifier([`frame`, sizes.join(", ")]);
    }

    return this;
  }

  autoLayoutPadding(node: SceneNode, optimizeLayout: boolean): this {
    if ("paddingLeft" in node) {
      this.pushModifier(
        lvgluiPadding(
          (optimizeLayout ? node.inferredAutoLayout : null) ?? node
        )
      );
    }
    return this;
  }

  build(indentLevel: number = 0): string {
    // this.element.element = kind;
    return this.element.toString(indentLevel);
  }

  private pushModifier(...args: (Modifier | [string | null, string | null] | null)[]): this {
     pushModifier(this.modifiers, ...args);
     return this;
  }
}
