import { sliceNum } from "./../common/numToAutoFixed";
import { lvgluiBlur, lvgluiShadow } from "./builderImpl/lvgluiEffects";
import {
  lvgluiBorder,
  lvgluiCornerRadius,
} from "./builderImpl/lvgluiBorder";
import { lvgluiBackground } from "./builderImpl/lvgluiColor";
import { lvgluiPadding } from "./builderImpl/lvgluiPadding";
import { lvgluiSize } from "./builderImpl/lvgluiSize";

import {
  lvgluiVisibility,
  lvgluiOpacity,
  lvgluiRotation,
  lvgluiBlendMode,
} from "./builderImpl/lvgluiBlend";
import {
  commonIsAbsolutePosition,
  getCommonPositionValue,
} from "../common/commonPosition";
import { Style, lvglUIElement } from "./builderImpl/lvgluiParser";

export class lvgluiDefaultBuilder {
  element: lvglUIElement;

  constructor(kind: string = "") {
    this.element = new lvglUIElement(kind);
  }

  pushStyle(...args: (Style | null)[]): void {
    args.forEach((style) => {
      if (style) {
        this.element.addStyle(style);
      }
    });
  }

  commonPositionStyles(node: SceneNode, optimizeLayout: boolean): this {
    this.position(node, optimizeLayout);
    if ("layoutAlign" in node && "opacity" in node) {
      this.blend(node);
    }
    return this;
  }

  blend(node: SceneNode & LayoutMixin & MinimalBlendMixin): this {
    this.pushStyle(
      lvgluiVisibility(node),
      lvgluiRotation(node),
      lvgluiOpacity(node),
      lvgluiBlendMode(node)
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
      const { centerX, centerY } = this.topLeftToCenterOffset(
        x,
        y,
        node,
        node.parent
      );

      this.pushStyle([
        `offset`,
        `x: ${sliceNum(centerX)}, y: ${sliceNum(centerY)}`,
      ]);
    }
    return this;
  }

  shapeBorder(node: SceneNode): this {
    const borders = lvgluiBorder(node);
    if (borders) {
      borders.forEach((border) => {
        this.element.addStyleMixed("overlay", border);
      });
    }
    return this;
  }

  shapeBackground(node: SceneNode): this {
    if ("fills" in node) {
      const background = lvgluiBackground(node, node.fills);
      if (background) {
        this.pushStyle([`background`, background]);
      }
    }
    return this;
  }

  shapeForeground(node: SceneNode): this {
    if (!("children" in node) || node.children.length === 0) {
      this.pushStyle([`foregroundColor`, ".clear"]);
    }
    return this;
  }

  cornerRadius(node: SceneNode): this {
    const corner = lvgluiCornerRadius(node);
    if (corner) {
      this.pushStyle([`cornerRadius`, corner]);
    }
    return this;
  }

  effects(node: SceneNode): this {
    if (node.type === "GROUP") {
      return this;
    }

    this.pushStyle(lvgluiBlur(node), lvgluiShadow(node));

    return this;
  }

  size(node: SceneNode, optimize: boolean): this {
    const { width, height } = lvgluiSize(node, optimize);
    const sizes = [width, height].filter((d) => d);
    if (sizes.length > 0) {
      this.pushStyle([`frame`, sizes.join(", ")]);
    }

    return this;
  }

  autoLayoutPadding(node: SceneNode, optimizeLayout: boolean): this {
    if ("paddingLeft" in node) {
      this.pushStyle(
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
}
