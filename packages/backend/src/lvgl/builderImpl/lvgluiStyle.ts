import { calculateContrastRatio } from "../../common/retrieveUI/commonUI";
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
    private readonly prefix = "lv_style_set_"
    private readonly currentStyle: Modifier[] = []
    static styleCache: Modifier[][] = []

    static buildModifierAndGetIndex(node: SceneNode & LayoutMixin & MinimalBlendMixin): number {
        new LvglUIStyle()
            .shapeBorder(node)
            .lvgluiBlendMode(node)
            .shapeBackground(node)
            .cornerRadius(node)
            .effects(node)
            .layoutPadding(node)
        return 0
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
                this.pushModifier([`background`, background]);
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
            return this;
        }
        
        return this.pushModifier(lvgluiShadow(node));   
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


    private buildModifierLines(indentLevel: number): string {
        const indent = " ".repeat(indentLevel);
        return this.modifiers
        .map(([property, value]) =>
            Array.isArray(value)
            ? `${indent}.${property}(${new LvglUIElement(
                property,
                value as Modifier[]
                )
                .toString()
                .trim()})`
            : value.length > 60
            ? `${indent}.${property}(\n${indentString(
                value,
                indentLevel + 2
                )}\n${indent})`
            : `${indent}.${property}(${value})`
        )
        .join("\n");
    }

    toString(indentLevel = 0): string {
        if (this.modifiers.length === 0) {
            return this.element;
        }

        const modifierLines = this.buildModifierLines(indentLevel + 2);
        return indentString(`${this.element}\n${modifierLines}`, 0);
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