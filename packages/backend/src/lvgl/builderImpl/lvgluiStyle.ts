import { lvgluiPadding } from "./lvgluiPadding";
import { lvgluiShadow } from "./lvgluiEffects";
import { blendModeEnum } from "./lvgluiBlend";
import {
  lvgluiBorder,
  lvgluiCornerRadius,
} from "./lvgluiBorder";
import { lvgluiBackground } from "./lvgluiColor";

export type Modifier = [string, string | Modifier | number];


export class LvglUIStyle {
    static readonly prefix = "lv_style_set_";
    static styleCache: LvglUIStyle[] = [];
    readonly currentStyle: Modifier[] = [];

    static buildModifierAndGetIndex(node: SceneNode & LayoutMixin & MinimalBlendMixin): number {
        const indexOfUsingEquals = (newStyle: LvglUIStyle): number => {
            for (let i = 0; i < LvglUIStyle.styleCache.length; i++) {
                if (newStyle.equals(LvglUIStyle.styleCache[i]))
                    return i;
            }
            return -1;
        }
        
        const newStyle = new LvglUIStyle()
            .shapeBorder(node)
            .lvgluiBlendMode(node)
            .shapeBackground(node)
            .cornerRadius(node)
            .effects(node)
            .layoutPadding(node);
        
        const index = indexOfUsingEquals(newStyle)
        if (index != -1) {
            return index;
        } else {
            LvglUIStyle.styleCache.push(newStyle);
            return LvglUIStyle.styleCache.length - 1;
        }
    }

    static buildAllStyle(): string {
        return LvglUIStyle.styleCache.map((style, index) => {
            return style.buildStyle(index);
        }).join("\n");
    }

    static clearCachedUIModifier() {
        LvglUIStyle.styleCache.splice(0, LvglUIStyle.styleCache.length);
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

    private buildStyle(index: number) {
        return this.currentStyle.map(([operation, parameter]) => {
            const param = parameter ? `, ${parameter}` : "";
            return `${LvglUIStyle.prefix}${operation}(style${index}${param});`;
        }).join("\n");
    }

    equals(other: LvglUIStyle) {
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
}

export const pushModifier = (
    modifierList: Modifier[], 
    ...args: (Modifier | [string | null, string | null] | null)[]
): void => {
    args.forEach((modifier) => {
        if (modifier && modifier[0] !== null && modifier[1] !== null) {
            modifierList.push([modifier[0], modifier[1]]);
          }
    })
};