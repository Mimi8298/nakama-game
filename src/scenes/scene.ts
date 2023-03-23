import { Engine } from "@babylonjs/core/Engines/engine"
import { Scene as BScene } from "@babylonjs/core/scene"
import InputManager from "../management/inputmanager";
import MeshProvider from "../management/meshprovider";

export default abstract class Scene extends BScene {
    constructor(engine: Engine) {
        super(engine);
    }

    public async init(): Promise<void> {
        await this.whenReadyAsync();
    }

    public update() {
        this.render();

        InputManager.init(this);
        MeshProvider.instance.executeQueue();
    }
}