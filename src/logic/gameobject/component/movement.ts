import { Vector2 } from "@babylonjs/core/Maths/math.vector";
import MovementConfig from "../../config/component/movement";
import Time from "../../time/time";
import Character from "../character";
import Component, { ComponentType } from "./component";

class MovementComponent extends Component {
    public onMove: (speedRate: number) => void = () => { };

    private _velocity: Vector2;
    private _config: MovementConfig;

    public input = new MovementInput();

    constructor(parent: Character, config: MovementConfig = null) {
        super(parent);
        this._velocity = Vector2.Zero();
        this._config = config;
    }

    public get type(): ComponentType {
        return ComponentType.Movement;
    }

    public update(): void {
        const level = this._parent.level;
        if (level.isPassableTile(this._parent.position) === false) {
            console.warn("Character is not on passable tile");
            return;
        }

        this.updateMove(this.input);
        this.updateDirection();
    }

    public updateMove(input: MovementInput) {
        let axis = input.axis;
        if (axis.lengthSquared() > 1) {
            axis.normalize();
        }

        let targetVelocity = axis.lengthSquared() !== 0 ? axis.scale(this._config.speed) : Vector2.Zero();

        this._velocity = Vector2.Lerp(this._velocity, targetVelocity, this._config.acceleration * Time.TICK_DELTA_TIME);

        const velocityAtTime = this._velocity.clone().scale(Time.TICK_DELTA_TIME);
        const level = this._parent.level;
        const newPosition = this._parent.position.add(velocityAtTime);
        if (level.isPassableTile(newPosition)) {
            this._parent.position = newPosition;
        } else {
            // found a passable tile in the direction of the velocity
            const precision = velocityAtTime.length();
            let passableTile = this.findPassableTile(this._parent.position, newPosition, precision);
            if (passableTile === null) {
                // TODO
            }
        }

        this.onMove(this._velocity.length() / this._config.speed);
    }

    private findPassableTile(from: Vector2, to: Vector2, precision: number): Vector2 | null {
        const direction = to.subtract(from).normalize();
        const distance = to.subtract(from).length();
        for (let i = 0; i < distance; i += precision) {
            const tmp = from.add(direction.scale(i));
            if (this._parent.level.isPassableTile(tmp)) {
                return tmp;
            }
        }

        return null;
    }

    public updateDirection() {
        let velocity = this._velocity;
        if (velocity.lengthSquared() > 1) {
            velocity = velocity.clone().normalize();
        }

        let direction = Math.atan2(velocity.y, velocity.x);
        this.character.direction = direction + Math.PI / 2;
    }

    public get character(): Character {
        return this._parent as Character;
    }
}

class MovementInput {
    public axis: Vector2 = Vector2.Zero();
}

export default MovementComponent;
export { MovementInput };