
export interface IStyle {
    construct(node: SceneNode): IStyle;
    toString(index: number): string;
    equals(other: IStyle): boolean;
}