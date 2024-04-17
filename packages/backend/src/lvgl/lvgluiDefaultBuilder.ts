import { lvgluiSize } from "./builderImpl/lvgluiSize";
import {
  lvgluiVisibility
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
  protected readonly defPrefix = "lv_obj_"
  private modifiers: Modifier[] = []
  private subModifiers: Modifier[] = []

  constructor(parentNodeName: string = "lv_screen_active()") {
    this.parentNodeName = parentNodeName;
    nodeIndex++;
  }

  buildModifier(node: SceneNode, optimizeLayout: boolean) {
    this.removeDefalutStyle();
    this.addStyle(node);
    this.position(node, optimizeLayout);
    if ("layoutAlign" in node && "opacity" in node) {
      this.pushModifier(lvgluiVisibility(node));
    }
    this.size(node, optimizeLayout);
  }

  toString(): string {
    const getModifiersStr = (modifiers: Modifier[], prefix: string) => {
      return modifiers.map(([operation, parameter]) => {
        let result = `${prefix}${operation}(${this.currentNodeName}, ${parameter});`;
        if (/, \)/.test(result) || /\(, /.test(result))
          result = result.replace(/, /g, "");
        return result;
      });
    }

    const result: string[] = [];
    result.push(this.createNodeStr());
    result.push(...getModifiersStr(this.modifiers, this.defPrefix));
    result.push(...getModifiersStr(this.subModifiers, ""));
    return result.join("\n") + "\n\n";
  }

  private position(node: SceneNode, optimizeLayout: boolean) {
    if (commonIsAbsolutePosition(node, optimizeLayout)) {
      let { x, y } = getCommonPositionValue(node);
      x = Math.round(x);
      y = Math.round(y);

      this.pushModifier([
        `align`,
        `${this.parentNodeName}, ${x}, ${y}`,
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
    const styleIndex = getStyleIndex(this.constructStyle(node));
    if (styleIndex != -1)
      this.pushModifier(["add_style", `&style${styleIndex}, 0`])
  }

  private pushModifier(...args: (Modifier | [string | null, string | null] | null)[]) {
    pushModifier(this.modifiers, ...args);
  }
  
  protected constructStyle(node: SceneNode): LvglUIStyle {
    return LvglUIStyle.construct(node)
  }

  protected pushSubModifier(...args: (Modifier | [string | null, string | null] | null)[]) {
    pushModifier(this.subModifiers, ...args);
  }

  protected createNodeStr(): string {
    return `lv_obj_t *${this.currentNodeName} = lv_obj_create(${this.parentNodeName});`;
  }
}
