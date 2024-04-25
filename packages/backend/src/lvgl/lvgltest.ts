import { className } from "../common/numToAutoFixed";

export const testNodename = (node: SceneNode) => {
    console.log("node.name", className(node.name));
}