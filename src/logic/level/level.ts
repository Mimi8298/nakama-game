import { Vector2 } from "@babylonjs/core";
import ConfigTable from "../config/table";
import Character from "../gameobject/character";
import GameObject, { GameObjectType } from "../gameobject/gameObject";

export default class Level {
    private _size: Vector2;
    private _subTiles: number;

    private _objects: Map<number, GameObject>;
    private _passableTiles: Array<boolean>;

    constructor(size: Vector2, subTiles: number) {
        this._objects = new Map();
        this._size = size;
        this._subTiles = subTiles;
        this._passableTiles = new Array<boolean>(size.x * size.y * subTiles * subTiles);
    }

    public getObject(id: number): GameObject {
        return this._objects.get(id);
    }
    
    public destroy() {
        this._objects.forEach((object) => {
            object.destroy();
        });
        this._objects.clear();
    }

    public load(data: any) {
        let objects = data.objects;
        for (let i = 0; i < objects.length; i++) {
            let object = objects[i];
            let config = ConfigTable.getCharacter(object.config);
            let type = object.type;
            let gameObject: GameObject = null;
            switch (type) {
                case GameObjectType.Character:
                    gameObject = new Character(config, this);
                    break;
                default:
                    throw new Error(`Unknown game object type: ${type}`);
            }
            gameObject.load(object);
            this._objects.set(gameObject.id, gameObject);
        }
    }

    public save() : Object {
        let objects = [];
        this._objects.forEach((object) => {
            let save = object.save();
            save.type = object.type;
            save.config = object.config.id;
            objects.push(save);
        });
        return {
            objects: objects
        };
    }

    public setPassableTiles(passableTiles: Array<boolean>) {
        if (passableTiles.length != this._size.x * this._size.y * this._subTiles * this._subTiles) {
            throw new Error("Passable tiles array has wrong size");
        }
        this._passableTiles = passableTiles;
    }

    public isPassableTile(tile: Vector2): boolean {
        const subTile = new Vector2(Math.floor(tile.x * this._subTiles), Math.floor(tile.y * this._subTiles));
        if (subTile.x < 0 || subTile.y < 0 || subTile.x >= this._size.x * this._subTiles || subTile.y >= this._size.y * this._subTiles) {
            return false;
        }
        return this._passableTiles[subTile.x + subTile.y * this._size.x * this._subTiles];
    }

    public update() {
        this._objects.forEach((object) => {
            object.update();
        });
    }
}

export class Collider {
    start: Vector2;
    end: Vector2;

    constructor(start: Vector2, end: Vector2) {
        this.start = start;
        this.end = end;
    }
}