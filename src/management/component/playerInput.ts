import Character from "../../logic/gameobject/character";
import MovementComponent from "../../logic/gameobject/component/movement";
import InputManager from "../inputmanager";
import ISceneComponent from "./interface";

export default class PlayerInput implements ISceneComponent {
    private static readonly KEY_FORWARD: string = "z";
    private static readonly KEY_BACKWARD: string = "s";
    private static readonly KEY_LEFT: string = "q";
    private static readonly KEY_RIGHT: string = "d";

    private _character: Character;

    constructor(character: Character) {
        this._character = character;
    }
    
    public destroy(): void {
        this._character = null;
    }

    public get character(): Character {
        return this._character;
    }

    public update(): void {
        const movementComponent = this._character.getComponent(MovementComponent);
        if (movementComponent) {
            const axisX = this.getKeyAxis(PlayerInput.KEY_RIGHT) - this.getKeyAxis(PlayerInput.KEY_LEFT);
            const axisY = this.getKeyAxis(PlayerInput.KEY_FORWARD) - this.getKeyAxis(PlayerInput.KEY_BACKWARD);

            const input = movementComponent.input;
            input.axis.x = axisX;
            input.axis.y = axisY;
            input.dash = input.dash || InputManager.isKeyDown("Shift", true);
        }
    }

    private getKeyAxis(key: string): number {
        return InputManager.isKeyDown(key) ? 1 : 0;
    }
}