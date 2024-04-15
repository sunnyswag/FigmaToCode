
export interface IStyle {
    prefix: string;
    construct(node: SceneNode): IStyle;
    toString(index: number): string;
    equals(other: IStyle): boolean;
}