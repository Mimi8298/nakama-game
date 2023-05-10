import { Vector2 } from "@babylonjs/core";
import Time from "../../time/time";
import { ComponentType } from "./component";
import MovementComponent from "./movement";

export default class MonsterMovementComponent extends MovementComponent {
    public onMove: (speedRate: number) => void = () => { };

    private _path: Vector2[] = [];
    private _pathIndex: number = 0;

    private clearPath() {
        this._path = [];
        this._pathIndex = 0;
        this._velocity = Vector2.Zero();
    }

    public update(): void {
        if (this._path.length === 0) {
            return;
        }

        const speedTick = this._config.speed * Time.TICK_DELTA_TIME;
        this.updatePFMove(speedTick);
        this.updateDirection();
    }

    private updatePFMove(speed: number) {
        const target = this._path[this._pathIndex];
        const distance = Vector2.Distance(this.parent.position, target);
        if (distance < speed) {
            this.parent.position = target;
            this._pathIndex++;
            if (this._pathIndex >= this._path.length) {
                this.clearPath();
            } else {
                this.updatePFMove(speed - distance);
            }
        } else {
            const direction = Vector2.Normalize(target.subtract(this.parent.position));
            this._velocity = direction.scale(speed);
            this.parent.position = this.parent.position.add(this._velocity);
        }
    }

    public get type(): ComponentType {
        return ComponentType.MonsterMovement;
    }
}