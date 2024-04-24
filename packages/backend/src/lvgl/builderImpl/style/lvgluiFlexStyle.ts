import { LvglUIStyle } from "./lvgluiStyle";

export class LVglUIFlexStyle extends LvglUIStyle {

    static construct(node: SceneNode): LVglUIFlexStyle {
        const instance = new LVglUIFlexStyle();

        instance.constructCommonUIStyle(node);
        const autoNode = getAutoNode(node);
        if (autoNode) {
            instance.flexPaddingRow(autoNode);
        }

        return instance;
    }

    flexPaddingRow(node: InferredAutoLayoutResult) {
        this.pushModifier([
            "pad_row", Math.round(node.itemSpacing)
        ])
    }
}

export const getAutoNode = (node: SceneNode): InferredAutoLayoutResult | null => {
    if ("itemSpacing" in node) {
        return node.inferredAutoLayout;
    } else return null
}