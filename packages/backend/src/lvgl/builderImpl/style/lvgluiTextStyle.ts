import { LvglUIStyle } from "./lvgluiStyle";
import { globalTextStyleSegments } from "../../../altNodes/altConversion";
import { lvgluiTextColor } from "../lvgluiColor";
import { commonLetterSpacing, commonLineHeight } from "../../../common/commonTextHeightSpacing";

export class LVglUITextStyle extends LvglUIStyle {
    prefix = "lv_style_set_text_";

    construct(node: SceneNode & LayoutMixin & MinimalBlendMixin & TextNode): LVglUITextStyle {
        const segment = this.getSegemnt(node);
        const instance = new LVglUITextStyle();

        instance.constructCommonUIStyle(node);
        if (segment)
            instance.constructTextUIStyle(node, segment);

        return instance;
    }

    private constructTextUIStyle(node: TextNode, segment: StyledTextSegment) {
        this.textColor(segment);
        this.textDecoration(segment);
        this.letterSpace(segment);
        this.lineSpace(segment);
        this.textAlignment(node);
        this.setFont(segment);
    }

    private getSegemnt(node: TextNode): StyledTextSegment | null {
        const segments = globalTextStyleSegments[node.id];
        if (segments == null) {
            return null;
        }

        return segments[0];
    }

    private textDecoration(segment: StyledTextSegment) {
        let decoration = null;
        switch (segment.textDecoration) {
            case "UNDERLINE":
                decoration = "LV_TEXT_DECOR_UNDERLINE";
                break;
            case "STRIKETHROUGH":
                decoration = "LV_TEXT_DECOR_STRIKETHROUGH";
                break;
        }

        if (decoration)
            this.pushModifier(["decor", decoration]);
    }

    private textColor(segment: StyledTextSegment) {
        const fillColor = lvgluiTextColor(segment.fills);
        if (fillColor) {
            this.pushModifier(...fillColor);
        }
    }

    private letterSpace = (segment: StyledTextSegment) => {
        const value = commonLetterSpacing(segment.letterSpacing, segment.fontSize);
        if (value > 0) {
            this.pushModifier(["letter_space", Math.round(value)]);
        }
    };

    private lineSpace = (segment: StyledTextSegment) => {
        const value = commonLineHeight(segment.lineHeight, segment.fontSize);
        if (value > 0) {
            this.pushModifier(["line_space", Math.round(value)]);
        }
    };

    private textAlignment(node: TextNode) {
        let alignment = null
        switch (node.textAlignHorizontal) {
            case "LEFT":
                alignment = "LV_TEXT_ALIGN_LEFT";
                break;
            case "RIGHT":
                alignment = "LV_TEXT_ALIGN_RIGHT";
                break;
            case "CENTER":
                // TODO check the type is CENTER ?
                alignment = "LV_TEXT_ALIGN_CENTER";
                break;
        }

        if (alignment)
            this.pushModifier(["align", alignment]);
    }

    private setFont(segment: StyledTextSegment) {
        let size = Math.max(14, Math.min(48, Math.round(segment.fontSize)));
        if (size % 2 != 0) 
            size -= 1;
        this.pushModifier(["font", `&lv_font_montserrat_${size}`]);
    }
}