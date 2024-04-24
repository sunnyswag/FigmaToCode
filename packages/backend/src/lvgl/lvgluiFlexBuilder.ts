import { LVglUIFlexStyle, getAutoNode } from "./builderImpl/style/lvgluiFlexStyle";
import { LvgluiDefaultBuilder } from "./lvgluiDefaultBuilder";

export class LvgluiFlexBuilder extends LvgluiDefaultBuilder {

  buildModifier(node: SceneNode, optimizeLayout: boolean): void {
      super.buildModifier(node, optimizeLayout);
      const autoNode = getAutoNode(node);
      if (autoNode) {
        this.setFlow(autoNode);
        this.setFlexAlign(autoNode);
      }
  }

  protected constructStyle(node: SceneNode): LVglUIFlexStyle {
    return LVglUIFlexStyle.construct(node);
  }

  private setFlow(node: InferredAutoLayoutResult) {
    const direction = node.layoutMode === "HORIZONTAL" ? 
        "LV_FLEX_FLOW_ROW" : "LV_FLEX_FLOW_COLUMN";
    this.pushModifier(["set_flex_flow", direction])
  }

  private setFlexAlign(node: InferredAutoLayoutResult) {
    this.pushModifier([
      "set_flex_align", `${this.getMainPlace(node)}, ${this.getCrossPlace(node)}, LV_FLEX_ALIGN_CENTER`
    ])
  }

  private getMainPlace = (node: InferredAutoLayoutResult): string => {
    switch (node.primaryAxisAlignItems) {
      case "MIN":
        return "LV_FLEX_ALIGN_START";
      case "CENTER":
        return "LV_FLEX_ALIGN_CENTER";
      case "MAX":
        return "LV_FLEX_ALIGN_END";
      case "SPACE_BETWEEN":
        return "LV_FLEX_ALIGN_SPACE_BETWEEN";
      default:
        return "LV_FLEX_ALIGN_CENTER";
    }
  };
  
  private getCrossPlace = (node: InferredAutoLayoutResult): string => {
    switch (node.counterAxisAlignItems) {
      case "MIN":
        return "LV_FLEX_ALIGN_START";
      case "CENTER":
        return "LV_FLEX_ALIGN_CENTER";
      case "MAX":
        return "LV_FLEX_ALIGN_END";
      case "BASELINE":
        return "LV_FLEX_ALIGN_START";
      default:
        return "LV_FLEX_ALIGN_CENTER";
    }
  };
}
