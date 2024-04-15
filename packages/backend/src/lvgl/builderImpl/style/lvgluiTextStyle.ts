import { LvglUIStyle } from "./lvgluiStyle";

export class LVglUITextStyle extends LvglUIStyle {
    prefix = "lv_style_set_text_";
    
    construct(node: SceneNode & LayoutMixin & MinimalBlendMixin): LVglUITextStyle {
        return super.construct(node)
    }

    
}