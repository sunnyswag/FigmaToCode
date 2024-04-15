
export interface IStyle {
    prefix: string;
    toString(index: number): string;
    equals(other: IStyle): boolean;
}