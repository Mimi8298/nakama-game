import { KeyboardEventTypes } from "@babylonjs/core";
import Scene from "../scenes/scene";

export default class InputManager {
    private static _keysDown: { [key: string]: boolean } = {};

    public static init(scene : Scene) : void {
        scene.onKeyboardObservable.add((kbInfo) => {
            if (kbInfo.type === KeyboardEventTypes.KEYDOWN) {
                InputManager._keysDown[kbInfo.event.key] = true;
            } else {
                InputManager._keysDown[kbInfo.event.key] = false;
            }
        });
    }

    public static isKeyDown(key : string) : boolean {
        return InputManager._keysDown[key] || false;
    }

    public static onKeyDown(key : string) : void {
        InputManager._keysDown[key] = true;
    }
}