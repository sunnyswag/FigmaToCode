import { lvgluiPadding } from "../lvgluiPadding";
import { lvgluiShadow } from "../lvgluiEffects";
import { blendModeEnum, lvgluiRotation } from "../lvgluiBlend";
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

    static construct(node: SceneNode): LvglUIStyle {
        const instance = new LvglUIStyle();
        instance.constructCommonUIStyle(node);
        return instance;
    }

    toString(index: number): string {
        return this.currentStyle.length != 0 ? this.initStyle(index)
            + this.currentStyle.map(([operation, parameter]) => {
                const param = parameter.toString() ? `, ${parameter}` : "";
                return `${this.prefix}${operation}(&style${index}${param});`;
            }).join("\n") : "";
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

    protected constructCommonUIStyle(node: SceneNode) {
        this.shapeBorder(node);
        if ("layoutAlign" in node && "opacity" in node) {
            this.lvgluiBlendMode(node);
            this.rotation(node);
        }
        this.shapeBackground(node);
        this.cornerRadius(node);
        this.effects(node);
        this.layoutPadding(node);
    }

    protected pushModifier(...args: (Modifier | [string | null, string | null] | null)[]) {
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
            return;
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

    private rotation(node: SceneNode & LayoutMixin) {
        const rotation = lvgluiRotation(node)
        if (rotation) {
            console.log("rotation: ", rotation);
            this.pushModifier(...rotation);
        }
            
    }

    private initStyle(index: number): string {
        return `static lv_style_t style${index};\n` +
            `lv_style_init(&style${index});\n`
    }
}