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
import { Modifier, getStyleIndex, pushModifier } from "./builderImpl/style/styleUtils";
import { LvglUIStyle } from "./builderImpl/style/lvgluiStyle";

let nodeIndex: number = 0
export const resetNodeIndex = () => { nodeIndex = 0 };

export class LvgluiDefaultBuilder {
  currentNodeName = `obj${nodeIndex}`;
  protected parentNodeName: string;
  private readonly prefix = "lv_obj_"
  private modifiers: Modifier[] = []

  constructor(parentNodeName: string = "lv_screen_active()") {
    this.parentNodeName = parentNodeName;
    nodeIndex++;
  }

  buildModifier(node: SceneNode, optimizeLayout: boolean) {
    this.createNode();
    this.position(node, optimizeLayout);
    if ("layoutAlign" in node && "opacity" in node) {
      this.opacity(node);
    }
    this.size(node, optimizeLayout);
    this.removeDefalutStyle();
    this.addStyle(node);
  }

  toString(): string {
    return this.modifiers.map(([operation, parameter]) => {
      // TODO fix ", "
      const param = parameter ? `, ${parameter}` : "";
      const prefix = operation.match("lv") == null ? this.prefix : "";
      const currentNodeName = operation.match("create") == null ? this.currentNodeName : "";
      return `${prefix}${operation}(${currentNodeName}${param});`;
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

  private addStyle(node: SceneNode) {
    const styleIndex = getStyleIndex(LvglUIStyle.construct(node));
    this.pushModifier(["add_style", `&style${styleIndex}, 0`])
  }

  protected pushModifier(...args: (Modifier | [string | null, string | null] | null)[]) {
    pushModifier(this.modifiers, ...args);
  }

  protected createNode() {
    this.pushModifier([`lv_obj_t *${this.currentNodeName} = lv_obj_create`, `${this.parentNodeName}`])
  }
}
