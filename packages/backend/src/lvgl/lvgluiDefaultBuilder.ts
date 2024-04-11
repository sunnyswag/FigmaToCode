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

export class LvgluiDefaultBuilder {
  private readonly prefix = "lv_obj_"
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

  position(node: SceneNode, optimizeLayout: boolean): this {
    if (commonIsAbsolutePosition(node, optimizeLayout)) {
      const { x, y } = getCommonPositionValue(node);

      this.pushModifier([
        `align`,
        `${this.parentNodeName}, ${Math.round(x)}, ${Math.round(y)}`,
      ]);
    }
    return this;
  }

  size(node: SceneNode, optimize: boolean): this {
    const { width, height } = lvgluiSize(node, optimize);
      this.pushModifier([`set_size`, `${width}, ${height}`]);

    return this;
  }

  build(indentLevel: number = 0): string {
    this.removeDefalutStyle();
    this.addStyle();

    return this.modifiers.map(([operation, parameter]) => {
      const param = parameter ? `, ${parameter}` : "";
      `${this.prefix}${operation}(${this.currentNodeName}${param});`;
    }).join("\n")
  }

  private removeDefalutStyle(): this {
    return this.pushModifier(["remove_style_all", ""])
  }

  private addStyle(): this {
    return this.pushModifier(["add_style", `&style${this.styleIndex}, 0`])
  }

  private pushModifier(...args: (Modifier | [string | null, string | null] | null)[]): this {
     pushModifier(this.modifiers, ...args);
     return this;
  }
}
