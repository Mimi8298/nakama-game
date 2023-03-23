import { AbstractMesh, Color3, FlyCamera, HemisphericLight, Mesh, MeshBuilder, Ray, SceneLoader, StandardMaterial, Vector2, Vector3 } from "@babylonjs/core";
import { Engine } from "@babylonjs/core/Engines/engine";
import { ComponentType } from "../logic/gameobject/component/component";
import MovementComponent from "../logic/gameobject/component/movement";
import { GameObjectType } from "../logic/gameobject/gameObject";
import Level from "../logic/level/level";
import Time from "../logic/time/time";
import InputManager from "../management/inputmanager";
import Scene from "./scene";

export default class WorldScene extends Scene {
    private static readonly CAMERA_SPEED: number = 10;
    private static readonly CAMERA_OFFSET: Vector3 = new Vector3(0, 7, -10);

    private static readonly WORLD_PRECISION: number = 16;
    private static readonly WORLD_SIZE: Vector2 = new Vector2(50, 50);
    private static readonly WORLD_CENTER_3D: Vector3 = new Vector3(WorldScene.WORLD_SIZE.x / 2, 0, WorldScene.WORLD_SIZE.y / 2);

    private _level: Level;
    private _camera: FlyCamera;
    private _logicTime: number = 0;

    constructor(engine: Engine) {
        super(engine);
        this._level = new Level(WorldScene.WORLD_SIZE, WorldScene.WORLD_PRECISION);
        this.onDispose = () => {
            this._level.destroy();
        };
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

        this.createTerrain();

        this._camera = new FlyCamera("camera", new Vector3(0, 7, -10), this);
        const light = new HemisphericLight("light", new Vector3(0, 1, 0), this);

        // this.debugLayer.show();
    }

    private async createTerrain() : Promise<void> {
        const terrain = await SceneLoader.ImportMeshAsync(null, "./assets/models/scenes/", "world.glb", this);
        const ground = terrain.meshes[0];
        ground.position = new Vector3(5, -5.25, 30).add(WorldScene.WORLD_CENTER_3D);
        ground.scaling = new Vector3(5, 5, 5);
        (ground as Mesh).bakeCurrentTransformIntoVertices();

        const tileColliderRect = MeshBuilder.CreateBox('fakeRect', { width: 1 / WorldScene.WORLD_PRECISION, height: 2, depth: 1 / WorldScene.WORLD_PRECISION }, this);
        tileColliderRect.isVisible = false;
        tileColliderRect.showBoundingBox = true;

        
        const children = ground.getChildMeshes();
        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            if (child.name.indexOf('Circle') !== -1 || child.name.indexOf('Plane') !== -1) {
                // ignore ground
                continue;
            }
            child.showBoundingBox = false;
        }

        const passableTiles = new Array<boolean>(WorldScene.WORLD_SIZE.x * WorldScene.WORLD_SIZE.y * WorldScene.WORLD_PRECISION * WorldScene.WORLD_PRECISION);
        for (let i = 0; i < passableTiles.length; i++) {
            passableTiles[i] = true;
        }

        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            if (child.name.indexOf('Circle') !== -1 || child.name.indexOf('Plane') !== -1) {
                // ignore ground
                continue;
            }

            const boundingInfo = child.getBoundingInfo();
            const min = boundingInfo.boundingBox.minimumWorld;
            const max = boundingInfo.boundingBox.maximumWorld;
            const minTile = new Vector2(Math.floor(min.x * WorldScene.WORLD_PRECISION), Math.floor(min.z * WorldScene.WORLD_PRECISION));
            const maxTile = new Vector2(Math.ceil(max.x * WorldScene.WORLD_PRECISION), Math.ceil(max.z * WorldScene.WORLD_PRECISION));
            for (let x = minTile.x; x < maxTile.x; x++) {
                for (let y = minTile.y; y < maxTile.y; y++) {
                    if (x < 0 || x >= WorldScene.WORLD_SIZE.x * WorldScene.WORLD_PRECISION || y < 0 || y >= WorldScene.WORLD_SIZE.y * WorldScene.WORLD_PRECISION) {
                        continue;
                    }
                    const index = x + y * WorldScene.WORLD_SIZE.x * WorldScene.WORLD_PRECISION;

                    tileColliderRect.position = new Vector3(x / WorldScene.WORLD_PRECISION, 1, y / WorldScene.WORLD_PRECISION);
                    tileColliderRect.computeWorldMatrix(true);

                    passableTiles[index] = !child.intersectsMesh(tileColliderRect, true);
                }
            }
        }

        tileColliderRect.dispose();

        this._level.setPassableTiles(passableTiles);

        /*let sb = "";
        for (let y = WorldScene.WORLD_SIZE.y * WorldScene.WORLD_PRECISION - 1; y >= 0; y--) {
            sb += y + ' ';
            for (let x = 0; x < WorldScene.WORLD_SIZE.x * WorldScene.WORLD_PRECISION; x++) {
                const index = x + y * WorldScene.WORLD_SIZE.x * WorldScene.WORLD_PRECISION;
                sb += passableTiles[index] ? ' ' : '#';
            }
            sb += '\r\n';
        }

        // download the file
        const element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(sb));
        element.setAttribute('download', 'map.txt');
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);*/

    }

    private updateLogic() {
        const delta = this.getEngine().getDeltaTime() / 1000;
        this._logicTime += delta;
        while (this._logicTime > Time.TICK_DELTA_TIME) {
            this._level.update();
            this._logicTime -= Time.TICK_DELTA_TIME;
        }
    }

    private updateCamera() {
        const character = this._level.getObject(1);
        const character3D = new Vector3(character.position.x, 0, character.position.y);
        
        const currentPosition = this._camera.position;
        const targetPosition = character3D.add(WorldScene.CAMERA_OFFSET);
        this._camera.position = Vector3.Lerp(currentPosition, targetPosition, WorldScene.CAMERA_SPEED * Time.TICK_DELTA_TIME);
        
        this._camera.setTarget(character3D);
    }

    public update() {
        super.update();

        const character = this._level.getObject(1);
        const movementComponent = character.getComponent<MovementComponent>(ComponentType.Movement);

        movementComponent.input.axis.x = InputManager.isKeyDown("d") ? 1 : InputManager.isKeyDown("q") ? -1 : 0;
        movementComponent.input.axis.y = InputManager.isKeyDown("z") ? 1 : InputManager.isKeyDown("s") ? -1 : 0;

        this.updateLogic();
        this.updateCamera();

        this.render();
    }
}