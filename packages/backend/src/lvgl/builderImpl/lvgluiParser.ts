import { indentString } from "../../common/indentString";

export type Style = [string, string | Style | Style[]];

export class lvglUIElement {
  private readonly element: string;
  private readonly styles: Style[];

  constructor(element: string = "", styles: Style[] = []) {
    this.element = element;
    this.styles = styles;
  }

  addStyleMixed(
    property: string,
    value: string | Style | Style[]
  ): this {
    this.styles.push([property, value]);
    return this;
  }

  addStyle(style: Style | [string | null, string | null]): this {
    if (style && style[0] !== null && style[1] !== null) {
      this.styles.push([style[0], style[1]]);
    }
    return this;
  }

  addChildElement(element: string, ...styles: Style[]): lvglUIElement {
    const childStyles = styles.length === 1 ? styles[0] : styles;
    return this.addStyleMixed(element, childStyles as Style);
  }

  private buildStyleLines(indentLevel: number): string {
    const indent = " ".repeat(indentLevel);
    return this.styles
      .map(([property, value]) =>
        Array.isArray(value)
          ? `${indent}.${property}(${new lvglUIElement(
              property,
              value as Style[]
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
    if (this.styles.length === 0) {
      return this.element;
    }

    const styleLines = this.buildStyleLines(indentLevel + 2);
    return indentString(`${this.element}\n${styleLines}`, 0);
  }
}
