import { LvglUIStyle } from "./lvgluiStyle";

export class LVglUIFlexStyle extends LvglUIStyle {

    static construct(node: SceneNode): LVglUIFlexStyle {
        const instance = new LVglUIFlexStyle();

        instance.constructCommonUIStyle(node);
        if ("itemSpacing" in node) {
            const autoNode = node.inferredAutoLayout;
            if (autoNode) {
                instance.flexPaddingRow(node);
            }
        }

        return instance;
    }

    flexPaddingRow(node: InferredAutoLayoutResult) {
        this.pushModifier([
            "pad_row", Math.round(node.itemSpacing)
        ])
    }
}