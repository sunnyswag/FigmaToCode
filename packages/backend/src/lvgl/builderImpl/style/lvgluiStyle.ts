import { lvgluiPadding } from "../lvgluiPadding";
import { lvgluiShadow } from "../lvgluiEffects";
import { blendModeEnum } from "../lvgluiBlend";
import {
  lvgluiBorder,
  lvgluiCornerRadius,
} from "../lvgluiBorder";
import { lvgluiBackground } from "../lvgluiColor";
import { Modifier, pushModifier } from "./styleUtils";
import { IStyle } from "./IStyle";

export class LvglUIStyle implements IStyle {
    prefix = "lv_style_set_";
    readonly currentStyle: Modifier[] = [];

    construct(node: SceneNode & LayoutMixin & MinimalBlendMixin): LvglUIStyle {
        return new LvglUIStyle()
            .shapeBorder(node)
            .lvgluiBlendMode(node)
            .shapeBackground(node)
            .cornerRadius(node)
            .effects(node)
            .layoutPadding(node);
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

    pushModifier(...args: (Modifier | [string | null, string | null]| null)[]): this {
        pushModifier(this.currentStyle, ...args);
        return this;
    }

    private shapeBorder(node: SceneNode): this {
        const borders = lvgluiBorder(node);
        if (borders) {
            this.pushModifier(...borders);
        }
        return this;
      }

    private lvgluiBlendMode(node: MinimalBlendMixin): this {
        const fromBlendEnum = blendModeEnum(node);
        if (fromBlendEnum) {
            return this.pushModifier(["blend_mode", fromBlendEnum]);
        }
        
        return this;
    }
    
    private shapeBackground(node: SceneNode): this {
        if ("fills" in node) {
            const background = lvgluiBackground(node, node.fills);
            if (background) {
                this.pushModifier(...background);
            }
        }
        return this;
    }
    
    private cornerRadius(node: SceneNode): this {
        const corner = lvgluiCornerRadius(node);
        if (corner) {
            this.pushModifier([`radius`, corner]);
        }
        return this;
    }
    
    private effects(node: SceneNode): this {
        if (node.type === "GROUP") {
            // TODO why GROUP no need shadow ?
            return this;
        }

        const shadow = lvgluiShadow(node);
        if (shadow) {
            this.pushModifier(...shadow);
        }
        
        return this;   
    }

    private layoutPadding(node: SceneNode, optimizeLayout: boolean = true): this {
        if ("paddingLeft" in node) {
            const result = lvgluiPadding(
                (optimizeLayout ? node.inferredAutoLayout : null) ?? node
            )
            if (result) {
                this.pushModifier(...result);
            }
        }
        return this;
      }
}