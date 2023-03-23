import { FlyCamera, HemisphericLight, Mesh, MeshBuilder, Ray, SceneLoader, StandardMaterial, Vector2, Vector3 } from "@babylonjs/core";
import { Engine } from "@babylonjs/core/Engines/engine";
import Character from "../logic/gameobject/character";
import { GameObjectType } from "../logic/gameobject/gameObject";
import Level from "../logic/level/level";
import Time from "../logic/time/time";
import PlayerCamera from "../management/component/playerCamera";
import PlayerInput from "../management/component/playerInput";
import TerrainComponent from "../management/component/terrain";
import Scene from "./scene";

export default class WorldScene extends Scene {
    private static readonly CAMERA_SPEED: number = 10;
    private static readonly CAMERA_OFFSET: Vector3 = new Vector3(0, 21, -20);

    private static readonly WORLD_PRECISION: number = 2;
    private static readonly WORLD_SIZE: Vector2 = new Vector2(100, 100);
    private static readonly WORLD_CENTER_3D: Vector3 = new Vector3(WorldScene.WORLD_SIZE.x / 2, 0, WorldScene.WORLD_SIZE.y / 2);

    private _level: Level;
    private _logicTime: number = 0;

    constructor(engine: Engine) {
        super(engine);
        this._level = new Level(WorldScene.WORLD_SIZE, WorldScene.WORLD_PRECISION);
        this.onDispose = () => {
            this._level.destroy();
        };
    }

    public get level(): Level {
        return this._level;
    }

    public async init(): Promise<void> {
        await super.init();

        this._level.load({
            objects: [
                {
                    type: GameObjectType.Character,
                    config: 1,
                    id: 1,
                    position: WorldScene.WORLD_SIZE.scale(0.5),
                    direction: 0
                }
            ]
        });

        const character = this._level.gameObjectManager.getObject(1) as Character;

        this.addComponent(new PlayerInput(character));
        this.addComponent(new PlayerCamera(this, character, WorldScene.CAMERA_OFFSET, WorldScene.CAMERA_SPEED));

        new HemisphericLight("light", new Vector3(0, 1, 0), this);

        await this.createTerrain();

        this.debugLayer.show();
    }

    private async createTerrain() : Promise<void> {
        const terrain = await SceneLoader.ImportMeshAsync(null, "./assets/models/scenes/", "world.glb", this);
        const ground = terrain.meshes[0] as Mesh;

        ground.position = new Vector3(5, -5.25, 30).add(WorldScene.WORLD_CENTER_3D);
        ground.scaling = new Vector3(-5, 5, 5);

        this.addComponent(new TerrainComponent(this, ground));
    }

    private updateLogic() {
        const delta = this.getEngine().getDeltaTime() / 1000;
        this._logicTime += delta;
        while (this._logicTime > Time.TICK_DELTA_TIME) {
            this._level.update();
            this._logicTime -= Time.TICK_DELTA_TIME;
        }
    }

    public update() {
        this.updateLogic();
        super.update();
    }
}