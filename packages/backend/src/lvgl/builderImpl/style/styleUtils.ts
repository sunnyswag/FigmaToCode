import { IStyle } from "./iStyle";

export type Modifier = [string, string | Modifier | number];
const styleCache: IStyle[] = [];

export const getStyleIndex = (iStyle: IStyle): number => {
    const indexOfUsingEquals = (iStyle: IStyle): number => {
        for (let i = 0; i < styleCache.length; i++) {
            if (iStyle.equals(styleCache[i]))
                return i;
        }
        return -1;
    }
    
    const index = indexOfUsingEquals(iStyle)
    if (index != -1) {
        return index;
    } else {
        styleCache.push(iStyle);
        return styleCache.length - 1;
    }
}

export const allStyleToString = (): string => {
    return styleCache.map((style, index) => {
        return style.toString(index);
    }).join("\n");
}

export const clearCachedUIStyle = () => {
    styleCache.splice(0, styleCache.length);
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