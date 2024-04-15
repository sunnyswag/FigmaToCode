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
import { Modifier, pushModifier } from "./builderImpl/style/styleUtils";

export class LvgluiDefaultBuilder {
  private readonly prefix = "lv_obj_"
  protected currentNodeName: string;
  protected parentNodeName: string;
  private styleIndex: number;
  private modifiers: Modifier[] = []

  constructor(
    currentNodeName: string, styleIndex: number, 
    parentNodeName: string = "lv_screen_active()"
  ) {
    this.currentNodeName = currentNodeName;
    this.styleIndex = styleIndex;
    this.parentNodeName = parentNodeName;
  }

  buildModifier(node: SceneNode, optimizeLayout: boolean) {
    this.createNode();
    this.position(node, optimizeLayout);
    if ("layoutAlign" in node && "opacity" in node) {
      this.opacity(node);
    }
    this.size(node, optimizeLayout);
    this.removeDefalutStyle();
    this.addStyle();
  }

  toString(): string {
    return this.modifiers.map(([operation, parameter]) => {
      const param = parameter ? `, ${parameter}` : "";
      const prefix = operation.match("lv") == null ? this.prefix : "";
      `${prefix}${operation}(${this.currentNodeName}${param});`;
    }).join("\n") + "\n";
  }

  private opacity(node: SceneNode & LayoutMixin & MinimalBlendMixin): this {
    this.pushModifier(
      lvgluiVisibility(node),
      lvgluiRotation(node),
      lvgluiOpacity(node)
    );

    return this;
  }

  private position(node: SceneNode, optimizeLayout: boolean) {
    if (commonIsAbsolutePosition(node, optimizeLayout)) {
      const { x, y } = getCommonPositionValue(node);

      this.pushModifier([
        `align`,
        `${this.parentNodeName}, ${Math.round(x)}, ${Math.round(y)}`,
      ]);
    }
  }

  private size(node: SceneNode, optimize: boolean) {
    const { width, height } = lvgluiSize(node, optimize);
    this.pushModifier([`set_size`, `${width}, ${height}`]);
  }

  private removeDefalutStyle() {
    this.pushModifier(["remove_style_all", ""])
  }

  private addStyle() {
    this.pushModifier(["add_style", `&style${this.styleIndex}, 0`])
  }

  protected pushModifier(...args: (Modifier | [string | null, string | null] | null)[]) {
    pushModifier(this.modifiers, ...args);
  }

  protected createNode() {
    this.pushModifier([`lv_obj_t *${this.currentNodeName} = lv_obj_create`, `${this.parentNodeName}`])
  }
}
