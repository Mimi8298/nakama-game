import "@babylonjs/loaders/glTF";
import "@babylonjs/inspector";

import { Engine } from "@babylonjs/core/Engines/engine"
import WorldScene from "./scenes/world";

const view = document.getElementById("view") as HTMLCanvasElement;
const engine = new Engine(view, true);
const scene = new WorldScene(engine);

scene.init().then(() => {
    engine.runRenderLoop(() => {
        scene.update();
    });
});