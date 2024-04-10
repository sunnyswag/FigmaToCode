import { calculateContrastRatio } from "../../common/retrieveUI/commonUI";
import { lvgluiBlur, lvgluiShadow } from "./lvgluiEffects";
import {
  lvgluiBorder,
  lvgluiCornerRadius,
} from "./lvgluiBorder";
import { lvgluiBackground } from "./lvgluiColor";

export type Modifier = [string, string | Modifier | Modifier[]];


export class LvglUIStyle {
    static styleCache: Modifier[] = []

    static buildModifierAndGetIndex(node: SceneNode): number {
        return 0
    }

    static clearCachedUIModifier() {
        LvglUIStyle.styleCache.splice(0, LvglUIStyle.styleCache.length);
    }

    private shapeBorder(node: SceneNode): this {
        const borders = lvgluiBorder(node);
        if (borders) {
            borders.forEach((border) => {
                this.pushModifier(["overlay", border]);
            });
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
    
    private shapeForeground(node: SceneNode): this {
        if (!("children" in node) || node.children.length === 0) {
            this.pushModifier([`foregroundColor`, ".clear"]);
        }
        return this;
    }
    
    private cornerRadius(node: SceneNode): this {
        const corner = lvgluiCornerRadius(node);
        return this.pushModifier([`cornerRadius`, corner]);
    }
    
    private effects(node: SceneNode): this {
        if (node.type === "GROUP") {
            return this;
        }
        
        return this.pushModifier(lvgluiBlur(node), lvgluiShadow(node));   
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

    pushModifier(...args: (Modifier | [string | null, string | null]| null)[] ): this {
        pushModifier(LvglUIStyle.styleCache, ...args);
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