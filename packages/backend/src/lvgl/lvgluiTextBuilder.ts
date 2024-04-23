import { globalTextStyleSegments } from "../altNodes/altConversion";
import { LVglUITextStyle } from "./builderImpl/style/lvgluiTextStyle";
import { LvgluiDefaultBuilder } from "./lvgluiDefaultBuilder";

export class LvgluiTextBuilder extends LvgluiDefaultBuilder {

  buildModifier(node: SceneNode | TextNode, optimizeLayout: boolean): void {
      super.buildModifier(node, optimizeLayout);
      this.setText(node as TextNode);
  }

  protected createNodeStr(): string {
    return `lv_obj_t *${this.currentNodeName} = lv_label_create(${this.parentNodeName});`;
  }

  protected constructStyle(node: SceneNode & LayoutMixin & MinimalBlendMixin & TextNode): LVglUITextStyle {
    return LVglUITextStyle.construct(node)
  }

  private setText = (node: TextNode) => {
    let updatedText = node.characters;
    const textCase = globalTextStyleSegments[node.id][0].textCase;
    if (textCase === "LOWER") {
        updatedText = node.characters.toLowerCase();
    } else if (textCase === "UPPER") {
        updatedText = node.characters.toUpperCase();
    }
    this.pushCustomPrefixModifier([`lv_label_set_text`, `"${updatedText}"`]);
  }
}
