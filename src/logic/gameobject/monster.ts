import MonsterConfig from "../config/gameobject/monster";
import Level from "../level/level";
import AnimationComponent from "./component/animation";
import MonsterMovementComponent from "./component/monsterMovement";
import RenderComponent from "./component/render";
import GameObject, { GameObjectType } from "./gameObject";

export default class Monster extends GameObject {
    private _direction: number;

    public constructor(config: MonsterConfig, level: Level) {
        super(config, level);
        this._direction = 0;

        this.addComponent(new RenderComponent(this, config.render));
        this.addComponent(new AnimationComponent(this));
        this.addComponent(new MonsterMovementComponent(this, config.movement));
    }

    public get direction(): number {
        return this._direction;
    }

    public set direction(direction: number) {
        this._direction = direction;
    }

    public load(data: any) {
        super.load(data);
        this._direction = data.direction;
    }

    public save(): any {
        let data = super.save();
        data.direction = this._direction;
        return data;
    }

    public get type(): GameObjectType {
        return GameObjectType.Monster;
    }
}