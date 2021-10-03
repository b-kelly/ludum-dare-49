import type { GameScene } from "../scenes/GameScene";
import { Cave } from "./Cave";
import { PlayerState } from "./shared";
export declare enum PlayerDeathReason {
    None = 0,
    Collapse = 1,
    NoPower = 2
}
export interface DigResults {
    collectedResource: boolean;
    triggeredCollapse: boolean;
    playerDeathReason: PlayerDeathReason;
}
export interface ResourceSearchResults {
    direction: {
        x: number;
        y: number;
    };
    updated: boolean;
    isNear: boolean;
}
export declare class World extends Phaser.Tilemaps.Tilemap {
    private mostRecentSearch;
    get primaryLayer(): Phaser.Tilemaps.TilemapLayer;
    constructor(scene: GameScene, cave: Cave);
    /** Digs in a given direction from origin; returns  */
    dig(state: PlayerState): DigResults;
    getClosestResourceDirection(origin: Phaser.Math.Vector2): ResourceSearchResults;
    private digSideEffects;
    /** Gets a tiles instability rating, from 0 (stable) to 8 (unstable) (or -1 for no stability) */
    private getTileInstability;
    /** Spawns between 0 and stability filled tiles around tile */
    private collapseFromTile;
}
