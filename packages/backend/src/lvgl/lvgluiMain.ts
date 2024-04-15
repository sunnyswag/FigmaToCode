import { indentString } from "../common/indentString";
import { sliceNum } from "../common/numToAutoFixed";
import { LvgluiTextBuilder } from "./lvgluiTextBuilder";
import { LvgluiDefaultBuilder, resetNodeIndex } from "./lvgluiDefaultBuilder";
import { PluginSettings } from "../code";
import { commonSortChildrenWhenInferredAutoLayout } from "../common/commonChildrenOrder";
import { clearCachedUIStyle, getStyleIndex } from "./builderImpl/style/styleUtils";
import { LvglUIStyle } from "./builderImpl/style/lvgluiStyle";

let localSettings: PluginSettings;

const getPreviewTemplate = (injectCode: string): string =>
  `#include "lvgl/lvgl.h"

  void preview_generated_lvgl_code(void) {
      ${indentString(injectCode, 4).trimStart()};
  }`;

export const lvgluiMain = (
  sceneNode: Array<SceneNode>,
  settings: PluginSettings
): string => {
  localSettings = settings;
  clearCachedUIStyle();
  resetNodeIndex();
  let result = lvgluiWidgetGenerator(sceneNode);

  switch (localSettings.lvglUIGenerationMode) {
    case "snippet":
      return result;
    case "preview":
      // result = generateWidgetCode("Column", { children: [result] });
      return getPreviewTemplate(result);
  }

  // remove the initial \n that is made in Container.
  if (result.length > 0 && result.startsWith("\n")) {
    result = result.slice(1, result.length);
  }

  return result;
};

const lvgluiWidgetGenerator = (
  sceneNode: ReadonlyArray<SceneNode>,
  parentNodeName: string = "lv_screen_active()"
): string => {
  // filter non visible nodes. This is necessary at this step because conversion already happened.
  const visibleSceneNode = sceneNode.filter((d) => d.visible);
  let comp: string[] = [];

  visibleSceneNode.forEach((node) => {
    switch (node.type) {
      case "RECTANGLE":
      case "ELLIPSE":
      case "LINE":
        comp.push(lvgluiContainer(node, parentNodeName));
        break;
      case "GROUP":
      case "SECTION":
        comp.push(lvgluiGroup(node, parentNodeName));
        break;
      case "FRAME":
      case "INSTANCE":
      case "COMPONENT":
      case "COMPONENT_SET":
        comp.push(lvgluiFrame(node, parentNodeName));
        break;
      case "TEXT":
        comp.push(lvgluiText(node, parentNodeName));
        break;
      default:
        break;
    }
  });

  return comp.join("\n");
};

// properties named propSomething always take care of ","
// sometimes a property might not exist, so it doesn't add ","
export const lvgluiContainer = (
  node: SceneNode,
  parentNodeName: string,
  stack: string = ""
): string => {
  // ignore the view when size is zero or less
  // while technically it shouldn't get less than 0, due to rounding errors,
  // it can get to values like: -0.000004196293048153166
  if (node.width < 0 || node.height < 0) {
    return stack;
  }
  
  const result = new LvgluiDefaultBuilder(parentNodeName);
  result.buildModifier(node, localSettings.optimizeLayout);

  return `${stack}\n\n${result.toString()}`;
};

const lvgluiGroup = (
  node: GroupNode | SectionNode,
  parentNodeName: string,
): string => {
  const children = widgetGeneratorWithLimits(node, parentNodeName);
  return lvgluiContainer(node, parentNodeName, children);
};

const lvgluiText = (node: TextNode, parentNodeName: string): string => {
  const result = new LvgluiTextBuilder(parentNodeName);
  result.buildModifier(node, localSettings.optimizeLayout);

  return result.toString();
};

const lvgluiFrame = (
  node: SceneNode & BaseFrameMixin,
  parentNodeName: string
): string => {
  const children = widgetGeneratorWithLimits(node, parentNodeName);

  const anyStack = createDirectionalStack(
    children,
    localSettings.optimizeLayout && node.inferredAutoLayout !== null
      ? node.inferredAutoLayout
      : node
  );
  return lvgluiContainer(node, anyStack);
};

const createDirectionalStack = (
  children: string,
  inferredAutoLayout: InferredAutoLayoutResult
): string => {
  if (inferredAutoLayout.layoutMode !== "NONE") {
    return generatelvglViewCode(
      inferredAutoLayout.layoutMode === "HORIZONTAL" ? "HStack" : "VStack",
      {
        alignment: getLayoutAlignment(inferredAutoLayout),
        spacing: getSpacing(inferredAutoLayout),
      },
      children
    );
  } else {
    return generatelvglViewCode("ZStack", {}, children);
  }
};

const getLayoutAlignment = (
  inferredAutoLayout: InferredAutoLayoutResult
): string => {
  switch (inferredAutoLayout.counterAxisAlignItems) {
    case "MIN":
      return inferredAutoLayout.layoutMode === "VERTICAL" ? ".leading" : ".top";
    case "MAX":
      return inferredAutoLayout.layoutMode === "VERTICAL"
        ? ".trailing"
        : ".bottom";
    case "BASELINE":
      return ".firstTextBaseline";
    case "CENTER":
      return "";
  }
};

const getSpacing = (inferredAutoLayout: InferredAutoLayoutResult): number => {
  const defaultSpacing = 10;
  return Math.round(inferredAutoLayout.itemSpacing) !== defaultSpacing
    ? inferredAutoLayout.itemSpacing
    : defaultSpacing;
};

export const generatelvglViewCode = (
  className: string,
  properties: Record<string, string | number>,
  children: string
): string => {
  const propertiesArray = Object.entries(properties)
    .filter(([, value]) => value !== "")
    .map(
      ([key, value]) =>
        `${key}: ${typeof value === "number" ? sliceNum(value) : value}`
    );

  const compactPropertiesArray = propertiesArray.join(", ");
  if (compactPropertiesArray.length > 60) {
    const formattedProperties = propertiesArray.join(",\n");
    return `${className}(\n${formattedProperties}\n) {${indentString(
      children
    )}\n}`;
  }

  return `${className}(${compactPropertiesArray}) {\n${indentString(
    children
  )}\n}`;
};

const widgetGeneratorWithLimits = (
  node: SceneNode & ChildrenMixin,
  parentNodeName: string,
) => {
  if (node.children.length < 10) {
    // standard way
    return lvgluiWidgetGenerator(
      commonSortChildrenWhenInferredAutoLayout(
        node,
        localSettings.optimizeLayout
      ),
      parentNodeName
    );
  }

  const chunk = 10;
  let strBuilder = "";
  const slicedChildren = commonSortChildrenWhenInferredAutoLayout(
    node,
    localSettings.optimizeLayout
  ).slice(0, 100);

  // I believe no one should have more than 100 items in a single nesting level. If you do, please email me.
  if (node.children.length > 100) {
    strBuilder += `\n// lvglUI has a 10 item limit in Stacks. By grouping them, it can grow even more. 
      // It seems, however, that you have more than 100 items at the same level. Wow!
      // This is not yet supported; Limiting to the first 100 items...`;
  }

  // split node.children in arrays of 10, so that it can be Grouped. I feel so guilty of allowing this.
  for (let i = 0, j = slicedChildren.length; i < j; i += chunk) {
    const chunkChildren = slicedChildren.slice(i, i + chunk);
    const strChildren = lvgluiWidgetGenerator(chunkChildren, parentNodeName);
    strBuilder += `${strChildren}\n\n`;
  }

  return strBuilder;
};
