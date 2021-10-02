import { TILE_WIDTH } from "../config";
import { Cave } from "../models/Cave";
import { displayMap } from "../models/Chrome";

// enum TileType {
//     Ground,
//     Robot,
//     Resource,
//     Wall,
// }

export class GameScene extends Phaser.Scene {
    private cave: Cave;

    constructor() {
        super({ key: "Game" });
    }

    private get width() {
        return this.physics.world.bounds.width;
    }
    private get height() {
        return this.physics.world.bounds.height;
    }

    init(): void {
        // TODO
    }

    preload(): void {
        // this.load.image(TileType[TileType.Ground], "assets/ground.png");
        // this.load.image(TileType[TileType.Robot], "assets/robot.png");
        // this.load.image(TileType[TileType.Resource], "assets/resource.png");
        // this.load.spritesheet(TileType[TileType.Wall], "assets/walls.png", {
        //     frameWidth: TILE_WIDTH,
        //     frameHeight: TILE_WIDTH,
        // });

        // TODO yeah, this is creating a cave that is roughly ((width * height) * TILE_WIDTH^2) in size...
        this.cave = new Cave(this.width, this.height);
        displayMap(this.cave);
    }

    create(): void {
        this.physics.world.setBounds(0, 0, this.width, this.height);
        // draw the ground layer
        this.add
            .rectangle(0, 0, this.width, this.height, 0x695958)
            .setOrigin(0);

        // draw the robot
        this.add.rectangle(0, 0, TILE_WIDTH, TILE_WIDTH, 0x006d77).setOrigin(0);

        // create the tilemap
        const map = this.make.tilemap({
            data: this.cave.map,
            tileWidth: TILE_WIDTH,
            tileHeight: TILE_WIDTH,
        });
        const tiles = map.addTilesetImage("walls", "walls");
        const layer = map.createLayer(0, tiles, 0, 0);

        // TODO resource 140d4f
        // TODO wall/filled 96ADC8
    }

    update(): void {
        /* TODO */
    }
}
