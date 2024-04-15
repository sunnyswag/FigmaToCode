import { lvgluiPadding } from "../lvgluiPadding";
import { lvgluiShadow } from "../lvgluiEffects";
import { blendModeEnum } from "../lvgluiBlend";
import {
  lvgluiBorder,
  lvgluiCornerRadius,
} from "../lvgluiBorder";
import { lvgluiBackground } from "../lvgluiColor";
import { Modifier, pushModifier } from "./styleUtils";
import { IStyle } from "./iStyle";

export class LvglUIStyle implements IStyle {
    prefix = "lv_style_set_";
    readonly currentStyle: Modifier[] = [];

    construct(node: SceneNode & LayoutMixin & MinimalBlendMixin): LvglUIStyle {
        const instance = new LvglUIStyle();
        instance.constructCommonUIStyle(node);
        return instance;
    }

    toString(index: number): string {
        return this.currentStyle.map(([operation, parameter]) => {
            const param = parameter ? `, ${parameter}` : "";
            return `${this.prefix}${operation}(style${index}${param});`;
        }).join("\n");
    }

    equals(other: LvglUIStyle): boolean {
        if (this.currentStyle.length != other.currentStyle.length) {
            return false;
        }
        
        for (let i = 0; i < this.currentStyle.length; i++) {
            if (this.currentStyle[i][0] != other.currentStyle[i][0] 
                || this.currentStyle[i][1] != other.currentStyle[i][1]
            ) return false;
        }

        return true;
    }

    protected constructCommonUIStyle(node: SceneNode & LayoutMixin & MinimalBlendMixin) {
        this.shapeBorder(node);
        this.lvgluiBlendMode(node);
        this.shapeBackground(node);
        this.cornerRadius(node);
        this.effects(node);
        this.layoutPadding(node);
    }

    protected pushModifier(...args: (Modifier | [string | null, string | null]| null)[]) {
        pushModifier(this.currentStyle, ...args);
    }

    protected shapeBorder(node: SceneNode) {
        const borders = lvgluiBorder(node);
        if (borders) {
            this.pushModifier(...borders);
        }
      }

    protected lvgluiBlendMode(node: MinimalBlendMixin) {
        const fromBlendEnum = blendModeEnum(node);
        if (fromBlendEnum) {
            this.pushModifier(["blend_mode", fromBlendEnum]);
        }
    }
    
    protected shapeBackground(node: SceneNode) {
        if ("fills" in node) {
            const background = lvgluiBackground(node.fills);
            if (background) {
                this.pushModifier(...background);
            }
        }
    }
    
    protected cornerRadius(node: SceneNode) {
        const corner = lvgluiCornerRadius(node);
        if (corner) {
            this.pushModifier([`radius`, corner]);
        }
    }
    
    protected effects(node: SceneNode) {
        if (node.type === "GROUP") {
            // TODO why GROUP no need shadow ?
            return ;
        }

        const shadow = lvgluiShadow(node);
        if (shadow) {
            this.pushModifier(...shadow);
        }
    }

    protected layoutPadding(node: SceneNode, optimizeLayout: boolean = true) {
        if ("paddingLeft" in node) {
            const result = lvgluiPadding(
                (optimizeLayout ? node.inferredAutoLayout : null) ?? node
            )
            if (result) {
                this.pushModifier(...result);
            }
        }
      }
}