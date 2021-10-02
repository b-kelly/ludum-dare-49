import { TILE_WIDTH } from "../config";
import type { GameScene } from "../scenes/GameScene";
import { Cave, CellState } from "./Cave";
import { Asset, MoveDirection, PlayerState } from "./shared";

export enum PlayerDeathReason {
    None,
    Collapse,
}

export interface DigResults {
    collectedResource: boolean;
    triggeredCollapse: boolean;
    playerDeathReason: PlayerDeathReason;
    spawnedTiles: number;
}

const EMPTY_RESULTS = (): DigResults => ({
    collectedResource: false,
    triggeredCollapse: false,
    playerDeathReason: PlayerDeathReason.None,
    spawnedTiles: 0,
});

const MAX_STABILITY = 8;
const INSTABILITY_MODIFIER = 0.5; // each point of instability has a 50% chance of triggering collapse

export class World extends Phaser.Tilemaps.Tilemap {
    get primaryLayer(): Phaser.Tilemaps.TilemapLayer {
        return this.getLayer(0).tilemapLayer;
    }

    constructor(scene: GameScene, cave: Cave) {
        super(
            scene,
            Phaser.Tilemaps.Parsers.Parse(
                "cave",
                Phaser.Tilemaps.Formats.ARRAY_2D,
                cave.toTilemap(),
                TILE_WIDTH,
                TILE_WIDTH,
                false
            )
        );

        const tiles = this.addTilesetImage(Asset[Asset.Terrain]);
        const layer = this.createLayer(0, tiles, 0, 0);
        layer.setCollision([0], false);
        layer.setCollisionByExclusion([0], true);
    }

    /** Digs in a given direction from origin; returns  */
    dig(state: PlayerState): DigResults {
        const empty = EMPTY_RESULTS();
        const originTile = this.getTileAtWorldXY(
            state.location.x,
            state.location.y
        );

        if (originTile === null) {
            // this really shouldn't happen... log an error and get on with life
            console.error("dig() called with invalid origin", origin);
            return empty;
        }

        const newTileCoords = { x: originTile.x, y: originTile.y };
        switch (state.facing) {
            case MoveDirection.Up:
                newTileCoords.y -= 1;
                break;
            case MoveDirection.Down:
                newTileCoords.y += 1;
                break;
            case MoveDirection.Left:
                newTileCoords.x -= 1;
                break;
            case MoveDirection.Right:
                newTileCoords.x += 1;
                break;
            default:
                // we can't dig in this direction, return early
                return empty;
        }

        const targetTile = this.getTileAt(newTileCoords.x, newTileCoords.y);

        if (targetTile === null) {
            // tile doesn't exist (off the edge of the map, etc)
            return empty;
        }

        // process side effects
        const results = this.digSideEffects(targetTile, originTile);

        // set the tile to be empty
        this.fill(CellState.Open, newTileCoords.x, newTileCoords.y, 1, 1);

        return results;
    }

    private digSideEffects(
        target: Phaser.Tilemaps.Tile,
        origin: Phaser.Tilemaps.Tile
    ): DigResults {
        const results = EMPTY_RESULTS();
        results.collectedResource = target.index === CellState.Resource;

        const instability = this.getTileInstability(target);

        // no stability, no change
        if (instability === -1) {
            return results;
        }

        // the lower the stability of the tile, the higher the chance of a collapse
        results.triggeredCollapse =
            Math.floor(Math.random() * (instability * INSTABILITY_MODIFIER)) >
            0;
        if (results.triggeredCollapse) {
            // CAAAAAVE IIIINNNNN!
            const collapse = this.collapseFromTile(target, instability, origin);
            results.spawnedTiles = collapse.count;
            results.playerDeathReason = collapse.spawnedOnOrigin
                ? PlayerDeathReason.Collapse
                : PlayerDeathReason.None;
        }

        return results;
    }

    /** Gets a tiles instability rating, from 0 (stable) to 8 (unstable) (or -1 for no stability) */
    private getTileInstability(tile: Phaser.Tilemaps.Tile) {
        // open tiles don't have a stability rating
        if (tile.index === CellState.Open) {
            return -1;
        }

        const tiles = this.getTilesWithin(tile.x - 1, tile.y - 1, 1, 1);
        // the more non-open tiles surrounding this tile, the more stable it is
        const stabilityRating = tiles.reduce(
            (p, t) => p + (t.index !== CellState.Open ? 1 : 0),
            0
        );

        // subtract one since we don't count the tile itself
        return MAX_STABILITY - stabilityRating - 1;
    }

    /** Spawns between 0 and stability filled tiles around tile */
    private collapseFromTile(
        tile: Phaser.Tilemaps.Tile,
        instability: number,
        originTile: Phaser.Tilemaps.Tile
    ): { count: number; spawnedOnOrigin: boolean } {
        const maxSpawnCount = instability;

        if (!maxSpawnCount || instability === -1) {
            return { count: 0, spawnedOnOrigin: false };
        }

        let spawnedTiles = 0;
        let spawnedOnOrigin = false;

        // check each square around/including the tile to see if we spawn a new tile
        for (let i = 0; i < 9 && spawnedTiles < maxSpawnCount; i++) {
            const shouldSpawn =
                Math.floor(Math.random() * (instability + 1)) === 0;

            if (!shouldSpawn) {
                continue;
            }

            // don't even check for validity; tiles spawned off the map or in filled locations count towards the total
            spawnedTiles += 1;

            const coords = {
                x: tile.x + (i % 3) - 1,
                y: tile.y + Math.floor(i / 3) - 1,
            };

            // don't spawn off the map or in already filled spaces
            const spawnTile = this.getTileAt(coords.x, coords.y);
            if (spawnTile === null || spawnTile.index !== CellState.Open) {
                continue;
            }

            // keep track of whether we killed the player
            if (spawnTile.x === originTile.x && spawnTile.y === originTile.y) {
                spawnedOnOrigin = true;
            }

            this.fill(CellState.Filled, coords.x, coords.y, 1, 1);
        }

        return {
            count: spawnedTiles,
            spawnedOnOrigin,
        };
    }
}
