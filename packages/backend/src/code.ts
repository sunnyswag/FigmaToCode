import { convertIntoNodes } from "./altNodes/altConversion";
import {
  retrieveGenericSolidUIColors,
  retrieveGenericLinearGradients as retrieveGenericGradients,
} from "./common/retrieveUI/retrieveColors";
import { flutterMain } from "./flutter/flutterMain";
import { htmlMain } from "./html/htmlMain";
import { swiftuiMain } from "./swiftui/swiftuiMain";
import { tailwindMain } from "./tailwind/tailwindMain";
import { lvgluiMain } from "./lvgl/lvgluiMain";

export type FrameworkTypes = "Flutter" | "SwiftUI" | "HTML" | "Tailwind" | "LVGL";

export type PluginSettings = {
  framework: FrameworkTypes;
  jsx: boolean;
  inlineStyle: boolean;
  optimizeLayout: boolean;
  layerName: boolean;
  responsiveRoot: boolean;
  flutterGenerationMode: string;
  swiftUIGenerationMode: string;
  lvglUIGenerationMode: string;
  roundTailwind: boolean;
};

export const run = (settings: PluginSettings) => {
  console.log("figma.currentPage.selection: ", figma.currentPage.selection);
  console.log("figma.root.children: ", figma.root.children);
  figma.root.children.forEach((item) => {
    console.log("figma.children: ", item.children);
  })
  // ignore when nothing was selected
  if (figma.currentPage.selection.length === 0) {
    figma.ui.postMessage({
      type: "empty",
    });
    return;
  }

  const convertedSelection = convertIntoNodes(
    figma.currentPage.selection,
    null
  );
  let result = "";
  switch (settings.framework) {
    case "HTML":
      result = htmlMain(convertedSelection, settings);
      break;
    case "Tailwind":
      result = tailwindMain(convertedSelection, settings);
      break;
    case "Flutter":
      result = flutterMain(convertedSelection, settings);
      break;
    case "SwiftUI":
      result = swiftuiMain(convertedSelection, settings);
      break;
    case "LVGL":
      result = lvgluiMain(convertedSelection, settings)
  }

  figma.ui.postMessage({
    type: "code",
    data: result,
    settings: settings,
    htmlPreview:
      convertedSelection.length > 0
        ? {
            size: convertedSelection.map((node) => ({
              width: node.width,
              height: node.height,
            }))[0],
            content: htmlMain(
              convertedSelection,
              {
                ...settings,
                jsx: false,
              },
              true
            ),
          }
        : null,
    colors: retrieveGenericSolidUIColors(settings.framework),
    gradients: retrieveGenericGradients(settings.framework),
    preferences: settings,
    // text: retrieveTailwindText(convertedSelection),
  });
};
