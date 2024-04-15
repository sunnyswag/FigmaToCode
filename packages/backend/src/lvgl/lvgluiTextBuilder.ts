import { LvgluiDefaultBuilder } from "./lvgluiDefaultBuilder";

export class LvgluiTextBuilder extends LvgluiDefaultBuilder {

  buildModifier(node: SceneNode | TextNode, optimizeLayout: boolean): void {
      super.buildModifier(node, optimizeLayout);
      this.setText(node as TextNode);
  }

  protected createNode(): void {
    this.pushModifier([`lv_obj_t *${this.currentNodeName} = lv_label_create`, `${this.parentNodeName}`])
  }

  private setText = (node: TextNode) => {
    // TODO consider move to text builder
    let updatedText = node.characters;
    const textCase = node.getStyledTextSegments(["textCase"])[0].textCase;
    if (textCase === "LOWER") {
        updatedText = node.characters.toLowerCase();
    } else if (textCase === "UPPER") {
        updatedText = node.characters.toUpperCase();
    }
    this.pushModifier([`lv_label_set_text`, updatedText]);
  }
}
