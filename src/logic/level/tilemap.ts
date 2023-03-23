import { Vector2 } from "@babylonjs/core";

export default class TileMap {
    private static readonly TILE_BITS_SIZE = 4;
    private static readonly TILE_PER_BYTE = 8 / TileMap.TILE_BITS_SIZE;
    private static readonly TILE_STATE_MASK = (1 << TileMap.TILE_BITS_SIZE) - 1;

    private _resolution: number;
    private _size: Vector2;
    private _subSize: Vector2;
    private _states: Uint8Array;

    public constructor(size: Vector2, resolution: number) {
        this._size = size;
        this._subSize = new Vector2(size.x * resolution, size.y * resolution);
        this._states = new Uint8Array(Math.ceil(this._subSize.x * this._subSize.y / TileMap.TILE_PER_BYTE));
        this._resolution = resolution;
    }

    public get size(): Vector2 {
        return this._size;
    }

    public get resolution(): number {
        return this._resolution;
    }

    public get states(): Uint8Array {
        return this._states;
    }

    public get(position: Vector2): TileState {
        const x = Math.floor(position.x * this._resolution);
        const y = Math.floor(position.y * this._resolution);

        return this.getSubTile(x, y);
    }

    public set(position: Vector2, state: TileState) {
        const x = Math.floor(position.x * this._resolution);
        const y = Math.floor(position.y * this._resolution);

        this.setSubTile(x, y, state);
    }

    public getSubTile(x: number, y: number): TileState {
        if (x < 0 || x >= this._subSize.x || y < 0 || y >= this._subSize.y) {
            return TileState.Object;
        }

        const arrayIndex = x + y * this._subSize.x;
        const byteIndex = Math.floor(arrayIndex / TileMap.TILE_PER_BYTE);
        const bitIndex = (arrayIndex % TileMap.TILE_PER_BYTE) * TileMap.TILE_BITS_SIZE;

        return (this._states[byteIndex] >> bitIndex) & TileMap.TILE_STATE_MASK;
    }

    public setSubTile(x: number, y: number, state: TileState) {
        if (x < 0 || x >= this._subSize.x || y < 0 || y >= this._subSize.y) {
            throw new Error("Position out of bounds");
        }

        const arrayIndex = x + y * this._subSize.x;
        const byteIndex = Math.floor(arrayIndex / TileMap.TILE_PER_BYTE);
        const bitIndex = (arrayIndex % TileMap.TILE_PER_BYTE) * TileMap.TILE_BITS_SIZE;
        
        this._states[byteIndex] = (this._states[byteIndex] & ~(TileMap.TILE_STATE_MASK << bitIndex)) | (state << bitIndex);
    }

    public destroy() {
        this._states = new Uint8Array(0);
    }
}

export enum TileState {
    None = 0,
    Terrain = 1 << 0,
    Water = 1 << 1,
    Object = 1 << 2,
}